import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute() {
  const { session, loading } = useAuth()
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Carregando...</div>
  }
  return session ? <Outlet /> : <Navigate to="/login" replace />
}