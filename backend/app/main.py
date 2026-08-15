from pathlib import Path

from fastapi import FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from itsdangerous import BadSignature, URLSafeSerializer

from app.api import api_router
from app.config import settings
from app.core.users import authenticate, get_user
from app.models import trainer

trainer.init()

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

app.include_router(api_router)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))
_sessions = URLSafeSerializer(settings.SESSION_SECRET)


def _current_user(request: Request) -> dict | None:
    token = request.cookies.get("session")
    if not token:
        return None
    try:
        username = _sessions.loads(token)
    except BadSignature:
        return None
    return get_user(username)


def _page(request: Request, name: str, context: dict) -> HTMLResponse:
    context.setdefault("user", _current_user(request))
    return templates.TemplateResponse(request, name, context)


# ---------------------------------------------------------------- public pages
@app.get("/", response_class=HTMLResponse)
def landing(request: Request):
    return _page(request, "landing.html", {"active": "landing"})


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    if _current_user(request):
        return RedirectResponse("/dashboard", status_code=303)
    return _page(request, "login.html", {"active": "login"})


@app.post("/login")
async def login_post(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    user = authenticate(username.strip(), password)
    if not user:
        return _page(
            request,
            "login.html",
            {
                "active": "login",
                "error": "Invalid credentials. Try: karneish / pass123",
                "username": username.strip(),
            },
        )
    response = RedirectResponse("/dashboard", status_code=303)
    response.set_cookie(
        "session",
        _sessions.dumps(user["username"]),
        max_age=settings.SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
    )
    return response


@app.get("/logout")
def logout():
    response = RedirectResponse("/", status_code=303)
    response.delete_cookie("session")
    return response


# ---------------------------------------------------------------- app pages
def _require_user(request: Request) -> tuple[dict | None, RedirectResponse | None]:
    user = _current_user(request)
    if not user:
        return None, RedirectResponse("/login", status_code=303)
    return user, None


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):
    user, redirect = _require_user(request)
    if redirect:
        return redirect
    return _page(request, "dashboard.html", {"active": "dashboard", "user": user})


@app.get("/simulate", response_class=HTMLResponse)
def simulate(request: Request):
    user, redirect = _require_user(request)
    if redirect:
        return redirect
    return _page(request, "simulate.html", {"active": "simulate", "user": user})


@app.get("/models", response_class=HTMLResponse)
def models_page(request: Request):
    user, redirect = _require_user(request)
    if redirect:
        return redirect
    return _page(request, "models.html", {"active": "models", "user": user})
