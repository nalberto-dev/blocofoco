import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State { error: Error | null }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro na interface:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-bold">Algo deu errado</h1>
        <p className="max-w-sm break-words text-sm text-slate-400">{this.state.error.message}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Recarregar
        </button>
      </div>
    )
  }
}