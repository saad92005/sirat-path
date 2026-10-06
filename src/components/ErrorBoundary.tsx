import { Component, type ReactNode } from 'react'

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { console.error('[noor]', error) }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-lg font-semibold">Something went wrong on this page.</p>
        <p className="mt-2 text-sm text-muted">{this.state.error.message}</p>
        <button className="btn mt-4" onClick={() => location.reload()}>Reload</button>
      </div>
    )
  }
}
