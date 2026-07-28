import { useRef, useState } from 'react'
import { Building2, Upload, X } from 'lucide-react'

const MAX_SIZE_BYTES = 2 * 1024 * 1024

export default function LogoUploader({ value, onChange, error = false }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleFiles = (files) => {
    const file = files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLocalError('Please upload a PNG or JPG image.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError('Image must be smaller than 2MB.')
      return
    }

    setLocalError('')
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`flex items-center gap-4 rounded-2xl border border-dashed p-4 transition-colors duration-200 ${
          dragOver
            ? 'border-[var(--color-route-cyan)] bg-white/[0.04]'
            : error || localError
              ? 'border-[var(--color-dispatch-orange)]'
              : 'border-[var(--color-border-subtle)]'
        }`}
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-white/[0.03]">
          {value ? (
            <img src={value} alt="Company logo preview" className="h-full w-full object-cover" />
          ) : (
            <Building2 size={24} className="text-[var(--color-paper-faint)]" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm text-[var(--color-paper)]">Company logo</p>
          <p className="mt-0.5 text-xs text-[var(--color-paper-faint)]">PNG or JPG, up to 2MB. Optional — add it anytime later.</p>
          <div className="mt-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-paper)] transition-colors hover:border-[var(--color-paper-dim)] hover:bg-white/5"
            >
              <Upload size={13} /> {value ? 'Replace' : 'Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-paper-faint)] hover:text-[var(--color-dispatch-orange-bright)]"
              >
                <X size={13} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Upload company logo"
      />

      {localError && (
        <p role="alert" className="mt-1.5 text-xs text-[var(--color-dispatch-orange-bright)]">
          {localError}
        </p>
      )}
    </div>
  )
}
