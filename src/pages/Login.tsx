import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import {
  AlertCircle, ArrowRight, BookOpen, CheckCircle2, Dumbbell, Eye, EyeOff,
  Lock, Mail, Moon, Rocket, Sparkles, Target, Timer,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Msg { type: 'error' | 'ok'; text: string }
type Mode = 'login' | 'signup'

const BLOCKS = [
  {
    label: 'Estudos', title: 'Revisar capítulo 3', min: 50, pct: 70, icon: BookOpen,
    card: 'border-sky-500/30 bg-sky-500/10', text: 'text-sky-300', bar: 'from-sky-400 to-cyan-400',
    chip: 'border-sky-500/30 bg-sky-500/10 text-sky-300', offset: 'lg:ml-0', delay: '0s',
  },
  {
    label: 'Projeto', title: 'Montar a tela inicial', min: 90, pct: 40, icon: Rocket,
    card: 'border-violet-500/30 bg-violet-500/10', text: 'text-violet-300', bar: 'from-violet-400 to-fuchsia-400',
    chip: 'border-violet-500/30 bg-violet-500/10 text-violet-300', offset: 'lg:ml-12', delay: '0.6s',
  },
  {
    label: 'Treino', title: 'Peito e tríceps', min: 45, pct: 100, icon: Dumbbell,
    card: 'border-amber-500/30 bg-amber-500/10', text: 'text-amber-300', bar: 'from-amber-400 to-orange-400',
    chip: 'border-amber-500/30 bg-amber-500/10 text-amber-300', offset: 'lg:ml-4', delay: '1.2s',
  },
  {
    label: 'Descanso', title: 'Respirar e alongar', min: 15, pct: 20, icon: Moon,
    card: 'border-teal-500/30 bg-teal-500/10', text: 'text-teal-300', bar: 'from-teal-400 to-emerald-400',
    chip: 'border-teal-500/30 bg-teal-500/10 text-teal-300', offset: 'lg:ml-16', delay: '1.8s',
  },
]

function translate(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Este e-mail já tem uma conta. Tente entrar.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Muitas tentativas. Aguarde um pouco e tente de novo.'
  if (m.includes('failed to fetch') || m.includes('network'))
    return 'Sem conexão. Verifique sua internet.'
  return message
}

const CSS = `
@keyframes bf-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
@keyframes bf-rise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
.bf-float { animation: bf-float 6s ease-in-out infinite; }
.bf-rise { animation: bf-rise .6s ease-out both; }
@media (prefers-reduced-motion: reduce) { .bf-float, .bf-rise { animation: none; } }
`

export default function Login() {
  const { session, loading } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Msg | null>(null)

  if (!loading && session) return <Navigate to="/" replace />

  function switchMode(next: Mode) {
    setMode(next)
    setMsg(null)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg({ type: 'error', text: 'Informe um e-mail válido.' })
    if (password.length < 6) return setMsg({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' })

    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (!data.session) {
          setMsg({ type: 'ok', text: 'Conta criada! Confirme o e-mail que enviamos para entrar.' })
        }
      }
    } catch (err) {
      setMsg({ type: 'error', text: translate((err as Error).message) })
    } finally {
      setBusy(false)
    }
  }

  const tab = (active: boolean) =>
    `min-h-[44px] flex-1 rounded-lg text-sm font-semibold transition ${
      active
        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
        : 'text-slate-400 hover:text-slate-50'
    }`

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <style>{CSS}</style>

      {/* Fundo: brilhos coloridos + grade */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[26rem] w-[26rem] rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* LADO ESQUERDO: marca e blocos */}
        <section className="bf-rise space-y-8">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
                <Target className="h-7 w-7 text-slate-950" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" /> Foco sem lista infinita
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                BlocoFoco
              </span>
            </h1>
            <p className="mt-3 max-w-md text-base text-slate-300">
              Organize seu dia em blocos de estudos, projetos, treino e descanso. Menos tarefas soltas, mais foco no que importa.
            </p>
          </div>

          {/* Mobile: etiquetas coloridas */}
          <div className="flex flex-wrap gap-2 lg:hidden" aria-hidden="true">
            {BLOCKS.map((b) => (
              <span key={b.label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${b.chip}`}>
                <b.icon className="h-3.5 w-3.5" /> {b.label}
              </span>
            ))}
          </div>

          {/* Desktop: cartões flutuantes */}
          <div className="hidden space-y-3 lg:block" aria-hidden="true">
            {BLOCKS.map((b) => (
              <div
                key={b.label}
                className={`bf-float max-w-sm rounded-2xl border p-4 backdrop-blur ${b.card} ${b.offset}`}
                style={{ animationDelay: b.delay }}
              >
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-2 text-sm font-semibold ${b.text}`}>
                    <b.icon className="h-4 w-4" /> {b.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Timer className="h-3.5 w-3.5" /> {b.min} min
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-200">{b.title}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-950/60">
                  <div className={`h-full rounded-full bg-gradient-to-r ${b.bar}`} style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LADO DIREITO: formulário */}
        <section className="bf-rise mx-auto w-full max-w-sm" style={{ animationDelay: '0.15s' }}>
          <div className="rounded-3xl bg-gradient-to-br from-emerald-400/40 via-sky-400/20 to-violet-400/40 p-px shadow-2xl shadow-emerald-500/10">
            <form onSubmit={submit} className="space-y-5 rounded-3xl bg-slate-900/90 p-6 backdrop-blur-xl">
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {mode === 'login' ? 'Entre para ver os blocos de hoje.' : 'Comece a montar sua rotina em blocos.'}
                </p>
              </div>

              <div className="flex gap-1 rounded-xl bg-slate-950 p-1" role="tablist">
                <button type="button" role="tab" aria-selected={mode === 'login'} className={tab(mode === 'login')} onClick={() => switchMode('login')}>
                  Entrar
                </button>
                <button type="button" role="tab" aria-selected={mode === 'signup'} className={tab(mode === 'signup')} onClick={() => switchMode('signup')}>
                  Criar conta
                </button>
              </div>

              <label className="block space-y-1.5">
                <span className="text-sm text-slate-400">E-mail</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400/70" />
                  <input
                    className="input pl-10"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm text-slate-400">Senha</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400/70" />
                  <input
                    className="input pl-10 pr-12"
                    type={show ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShow(!show)}
                    className="absolute right-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center text-slate-500 hover:text-slate-50"
                  >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {msg && (
                <div
                  role="alert"
                  className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                    msg.type === 'error'
                      ? 'border-red-900 bg-red-950/50 text-red-300'
                      : 'border-emerald-900 bg-emerald-950/50 text-emerald-300'
                  }`}
                >
                  {msg.type === 'error' ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  {msg.text}
                </div>
              )}

              <button
                disabled={busy}
                className="btn w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110"
              >
                {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar minha conta'}
                {!busy && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            Seus blocos ficam salvos na sua conta e só você tem acesso.
          </p>
        </section>
      </div>
    </div>
  )
}