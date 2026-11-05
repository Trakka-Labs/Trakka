import { Component } from 'react'
import Button from './Button'
import Logo from './Logo'

/**
 * Last-resort error boundary. Public customer pages (order intake, tracking)
 * must never render an empty screen if a route chunk throws, so this renders a
 * friendly recovery panel, and in development exposes the component stack on
 * `window.__trakkaLastError` to make diagnosing render crashes trivial.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      window.__trakkaLastError = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        componentStack: info?.componentStack,
      }
    }
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/order')) {
      console.error(error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-dvh place-items-center bg-[var(--color-ink)] px-4">
          <div className="max-w-sm space-y-4 text-center">
            <Logo size={36} className="mx-auto" />
            <div className="dashboard-panel rounded-lg p-6">
              <h1 className="text-lg font-semibold text-[var(--color-paper)]">Something went wrong</h1>
              <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
                This page hit an unexpected error. Reload to try again — if it keeps happening, contact the business you ordered from.
              </p>
              <Button type="button" className="mt-4" onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
