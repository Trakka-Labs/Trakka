import { useEffect, useRef, useState } from 'react'
import Loader from '../ui/Loader'
import { authenticateWithGoogle, getGoogleAuthenticationConfig } from '../../lib/api'

let googleScriptPromise

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-trakka-google-identity]')
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.dataset.trakkaGoogleIdentity = 'true'
    script.onload = resolve
    script.onerror = () => reject(new Error('Google Identity Services could not load.'))
    document.head.appendChild(script)
  })
  return googleScriptPromise
}

export default function GoogleIdentityButton({ intent, onSuccess, onError }) {
  const containerRef = useRef(null)
  const intentRef = useRef(intent)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const initializedRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [configurationError, setConfigurationError] = useState('')

  intentRef.current = intent
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    let cancelled = false

    Promise.all([getGoogleAuthenticationConfig(), loadGoogleIdentityScript()])
      .then(([configuration]) => {
        if (cancelled) return
        if (!configuration.enabled || !configuration.clientId) {
          setConfigurationError('Configure GOOGLE_CLIENT_ID, then start the backend with npm run start:env.')
          return
        }
        if (!initializedRef.current) {
          window.google.accounts.id.initialize({
            client_id: configuration.clientId,
            ux_mode: 'popup',
            use_fedcm_for_prompt: true,
            callback: async ({ credential }) => {
              if (!credential) {
                onErrorRef.current('Google did not return a sign-in credential.')
                return
              }
              setLoading(true)
              onErrorRef.current('')
              try {
                const account = await authenticateWithGoogle({
                  credential,
                  intent: intentRef.current,
                })
                onSuccessRef.current(account)
              } catch (error) {
                onErrorRef.current(error.message || 'Google authentication failed.')
              } finally {
                setLoading(false)
              }
            },
          })
          initializedRef.current = true
        }
        setReady(true)
      })
      .catch((error) => {
        if (!cancelled) setConfigurationError(error.message || 'Google authentication is unavailable.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready || !containerRef.current || !window.google?.accounts?.id) return
    containerRef.current.replaceChildren()
    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'filled_black',
      size: 'large',
      text: intent === 'signup' ? 'signup_with' : 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.min(400, Math.max(240, containerRef.current.clientWidth || 400)),
    })
  }, [intent, ready])

  if (configurationError) {
    return (
      <div className="rounded border border-[var(--color-border-subtle)] px-4 py-3 text-center text-xs text-[var(--color-paper-faint)]">
        {configurationError}
      </div>
    )
  }

  return (
    <div className="relative flex min-h-11 w-full justify-center">
      <div ref={containerRef} className={loading ? 'pointer-events-none opacity-40' : ''} />
      {(!ready || loading) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader size={17} />
        </div>
      )}
    </div>
  )
}
