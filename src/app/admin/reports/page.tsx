import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateReportStatus } from '@/lib/actions/reports'
import { hideDebate } from '@/lib/actions/debates'
import { hideComment } from '@/lib/actions/comments'

export const dynamic = 'force-dynamic'

async function ReportActions({
  reportId,
  targetType,
  targetId,
  currentStatus,
}: {
  reportId: string
  targetType: 'debate' | 'comment'
  targetId: string
  currentStatus: string
}) {
  async function handleStatusUpdate(formData: FormData) {
    'use server'
    const status = formData.get('status') as 'open' | 'reviewed' | 'dismissed'
    await updateReportStatus(reportId, status)
  }

  async function handleHide(formData: FormData) {
    'use server'
    if (targetType === 'debate') {
      await hideDebate(targetId, true)
    } else {
      await hideComment(targetId, true)
    }
    await updateReportStatus(reportId, 'reviewed')
  }

  return (
    <div className="flex gap-2 items-center">
      <form action={handleStatusUpdate} className="flex gap-2">
        <select
          name="status"
          defaultValue={currentStatus}
          className="px-3 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded text-sm"
        >
          <option value="open">Open</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <button type="submit" className="px-3 py-1 btn-secondary text-sm">
          Update
        </button>
      </form>
      <form action={handleHide}>
        <button
          type="submit"
          className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-sm hover:bg-red-500/20"
        >
          Hide Content
        </button>
      </form>
    </div>
  )
}

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from<'profiles'>('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  // Fetch all reports
  const { data: reports } = await supabase
    .from('reports')
    .select(
      `
      *,
      reporter:reporter_id (username, display_name)
    `
    )
    .order('created_at', { ascending: false })

  // Fetch reported content details
  const debateIds = reports
    ?.filter((r) => r.target_type === 'debate')
    .map((r) => r.target_id) || []
  const commentIds = reports
    ?.filter((r) => r.target_type === 'comment')
    .map((r) => r.target_id) || []

  const { data: debates } = debateIds.length > 0
    ? await supabase
        .from('debates')
        .select('id, title, claim, is_hidden')
        .in('id', debateIds)
    : { data: [] }

  const { data: comments } = commentIds.length > 0
    ? await supabase
        .from('comments')
        .select('id, body, is_hidden, debate_id')
        .in('id', commentIds)
    : { data: [] }

  const debateMap = new Map(debates?.map((d) => [d.id, d]) || [])
  const commentMap = new Map(comments?.map((c) => [c.id, c]) || [])

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">Admin Reports</h1>
        <p className="text-[var(--color-text-muted)]">
          Manage reported content and moderate the platform
        </p>
      </div>

      <div className="space-y-4">
        {!reports || reports.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-[var(--color-text-muted)] text-lg">
              No reports to review
            </p>
          </div>
        ) : (
          reports.map((report) => {
            const reporter = report.reporter as any
            const content =
              report.target_type === 'debate'
                ? debateMap.get(report.target_id)
                : commentMap.get(report.target_id)

            return (
              <div key={report.id} className="card">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="badge badge-neutral">
                        {report.target_type}
                      </span>
                      <span
                        className={`badge ${
                          report.status === 'open'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : report.status === 'reviewed'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}
                      >
                        {report.status}
                      </span>
                      {content && (content as any).is_hidden && (
                        <span className="badge bg-red-500/10 text-red-400 border-red-500/20">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] mb-2">
                      Reported by{' '}
                      <span className="text-[var(--color-text)]">
                        @{reporter?.username || 'unknown'}
                      </span>{' '}
                      on {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <p className="mb-3">
                      <span className="font-bold">Reason:</span> {report.reason}
                    </p>
                    {content && (
                      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded p-3">
                        <p className="text-sm text-[var(--color-text-muted)] mb-1">
                          Reported Content:
                        </p>
                        {report.target_type === 'debate' ? (
                          <>
                            <p className="font-bold mb-1">{(content as any).title}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {(content as any).claim}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm">{(content as any).body}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <ReportActions
                      reportId={report.id}
                      targetType={report.target_type}
                      targetId={report.target_id}
                      currentStatus={report.status}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
