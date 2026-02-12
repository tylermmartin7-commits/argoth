'use client'

import { useState } from 'react'
import { createReport } from '@/lib/actions/reports'
import { Flag, X } from 'lucide-react'

export default function ReportButton({
  targetType,
  targetId,
}: {
  targetType: 'debate' | 'comment'
  targetId: string
}) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await createReport(targetType, targetId, reason)

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        setShowModal(false)
        setSuccess(false)
        setReason('')
      }, 1500)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors p-1"
        title="Report"
      >
        <Flag size={16} />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display font-bold">
                Report {targetType === 'debate' ? 'Debate' : 'Comment'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-4 text-center">
                Report submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-bold mb-2">
                    Why are you reporting this?
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="textarea"
                    placeholder="Please explain why this content violates our guidelines..."
                    required
                    rows={4}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="spinner" />
                        Submitting...
                      </span>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
