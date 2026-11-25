import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Home, LogOut, Target } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const items = [
  { to: '/', label: 'Início / Hoje', short: 'Hoje', icon: Home, end: true },
  { to: '/concluidos', label: 'Histórico & Ritmo', short: 'Histórico', icon: BarChart3, end: false },
]

export default function Layout() {
  const { session } = useAuth()
  const email = session?.user.email ?? ''
  const initials = email.slice(0, 2).toUpperCase() || 'BF'
  const logout = () => supabase.auth.signOut()

  return (
    <div className="min-h-screen">
      {/* Sidebar: >= 768px */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-slate-800 bg-slate-950 md:flex">
        <div className="flex items-center gap-3 border-b border-slate-800/70 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
            <Target className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">BlocoFoco</p>
            <p className="text-xs text-emerald-400">Rotina & Metas</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[48px] items-center gap-3 rounded-xl border px-4 text-sm font-semibold transition ${
                  isActive
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:bg-slate-900'
                }`
              }
            >
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="m-4 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-sm font-bold text-slate-950">
            {initials}
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-medium" title={email}>{email}</p>
          <button onClick={logout} aria-label="Sair" className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-50">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Header: < 768px */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:hidden">
        <span className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Target className="h-5 w-5 text-slate-950" />
          </span>
          BlocoFoco
        </span>
        <button onClick={logout} aria-label="Sair" className="btn-ghost !px-3">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <div className="md:pl-72">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav: < 768px */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-slate-800 bg-slate-950 pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map(({ to, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                isActive ? 'text-emerald-400' : 'text-slate-400'
              }`
            }
          >
            <Icon className="h-5 w-5" /> {short}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}