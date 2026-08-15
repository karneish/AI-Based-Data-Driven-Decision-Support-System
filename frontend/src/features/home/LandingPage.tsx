import { useState, useEffect } from 'react'
import {
  Brain, BarChart3, ShieldCheck, Zap, ArrowRight, TrendingUp,
  Users, BookOpen, Target, ChevronRight, Cpu, Activity
} from 'lucide-react'

interface Props { onGetStarted: () => void }

const features = [
  { icon: Brain, title: 'ML-Powered Predictions', desc: 'Logistic Regression model trained on academic behavioral data to forecast student performance with high accuracy.' },
  { icon: BarChart3, title: 'Academic Stability Index', desc: 'Composite ASI metric combining ML probability, attendance, and study habits into a single actionable score.' },
  { icon: ShieldCheck, title: 'Risk Classification', desc: 'Instantly classify students as Stable, Monitor Closely, or Intervention Required with color-coded indicators.' },
  { icon: Target, title: 'What-If Simulation', desc: 'Interactive sliders let you explore how changes in study hours or attendance would shift the ASI score in real time.' },
  { icon: TrendingUp, title: 'Visual Analytics', desc: 'Spider charts, bar graphs, and feature importance plots turn complex ML outputs into easy-to-read dashboards.' },
  { icon: Zap, title: 'Instant Recommendations', desc: 'Get ranked, actionable academic interventions tailored to each student\'s specific weak points.' },
]

const stats = [
  { value: '8+', label: 'Behavioral Indicators', icon: Activity },
  { value: '3', label: 'Risk Categories', icon: ShieldCheck },
  { value: '95%', label: 'Accuracy Target', icon: Target },
  { value: '∞', label: 'Simulations Possible', icon: Cpu },
]

const credentials = [
  { user: 'karneish', pass: 'pass123', role: 'Student' },
  { user: 'admin', pass: 'admin123', role: 'Advisor' },
  { user: 'student1', pass: 'pass123', role: 'Student' },
]

function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / 60
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 20)
    return () => clearInterval(timer)
  }, [end])
  return <>{count}{suffix}</>
}

export default function LandingPage({ onGetStarted }: Props) {
  const [showCreds, setShowCreds] = useState(false)

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-hero-glow pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-surface-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">DSS<span className="text-brand-400">-MIP</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreds(!showCreds)}
            className="text-xs text-slate-400 hover:text-brand-400 transition-colors font-mono border border-surface-border px-3 py-1.5 rounded-lg hover:border-brand-500/50"
          >
            demo creds
          </button>
          <button onClick={onGetStarted} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
            Launch App <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Demo creds tooltip */}
      {showCreds && (
        <div className="relative z-20 max-w-md mt-4 glass-card p-4 border-brand-500/30 mx-6 md:mx-auto">
          <p className="text-xs text-slate-400 mb-3 font-mono uppercase tracking-widest">Demo Credentials</p>
          <div className="space-y-2">
            {credentials.map(c => (
              <div key={c.user} className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-400">{c.user}</span>
                <span className="text-slate-500">/ {c.pass}</span>
                <span className="text-xs bg-surface px-2 py-0.5 rounded text-slate-400">{c.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-24 pb-20 max-w-5xl mx-auto">
        <div className="section-tag mb-6 mx-auto w-fit animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
          AI-Based Decision Support System
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.05] text-white mb-6 animate-slide-up">
          Predict. Analyze.
          <br />
          <span className="text-gradient">Intervene Early.</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body leading-relaxed animate-fade-in">
          A machine-learning-powered platform that evaluates student academic stability, classifies risk levels, and generates personalized intervention strategies — built for modern education.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <button onClick={onGetStarted} className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4">
            Get Started <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-4"
          >
            Explore Features
          </button>
        </div>

        {/* Floating badge */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {['Python FastAPI', 'React + TypeScript', 'Tailwind CSS', 'Scikit-learn', 'Recharts'].map(tag => (
            <span key={tag} className="text-xs font-mono text-slate-500 bg-surface-card border border-surface-border px-3 py-1.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="stat-card text-center items-center glow-brand hover:border-brand-500/40 transition-all duration-300">
              <Icon className="w-5 h-5 text-brand-400 mb-2" />
              <div className="font-display font-bold text-3xl text-white">{value}</div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <div className="section-tag mb-4 mx-auto w-fit">Core Capabilities</div>
          <h2 className="font-display font-bold text-4xl text-white">Everything you need for <br /><span className="text-gradient">data-driven academic decisions</span></h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-6 hover:border-brand-500/40 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-600/25 transition-colors">
                <Icon className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-body">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <div className="section-tag mb-4 mx-auto w-fit">System Architecture</div>
          <h2 className="font-display font-bold text-4xl text-white">How it <span className="text-gradient">works</span></h2>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {[
            { step: '01', title: 'Input Data', desc: 'Enter student academic & behavioral indicators' },
            { step: '02', title: 'ML Prediction', desc: 'Logistic Regression computes performance probability' },
            { step: '03', title: 'ASI Scoring', desc: 'Weighted formula calculates stability index' },
            { step: '04', title: 'Risk & Report', desc: 'Visual dashboard with recommendations generated' },
          ].map((item, i) => (
            <div key={item.step} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1">
              <div className="glass-card p-5 text-center flex-1 w-full hover:border-brand-500/40 transition-all">
                <div className="font-mono text-xs text-brand-400 mb-2">{item.step}</div>
                <div className="font-display font-semibold text-white mb-1">{item.title}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
              {i < 3 && <ChevronRight className="w-5 h-5 text-surface-border hidden md:block flex-shrink-0" />}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="glass-card p-12 border-brand-500/20 glow-brand">
          <BookOpen className="w-10 h-10 text-brand-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-3xl text-white mb-4">Ready to analyze academic performance?</h2>
          <p className="text-slate-400 mb-8">Login with demo credentials and run a live analysis in under 60 seconds.</p>
          <button onClick={onGetStarted} className="btn-primary text-base px-10 py-4 flex items-center gap-2 mx-auto">
            Start Analysis <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-border px-6 py-6 text-center">
        <p className="text-slate-600 text-xs font-mono">
          DSS-MIP — AI-Based Data-Driven Decision Support System · Mini Project · Built with Python + React + TypeScript
        </p>
      </footer>
    </div>
  )
}
