import Link from 'next/link'
import type { DebateWithDetails } from '@/lib/types'
import VoteButtons from './VoteButtons'
import ReportButton from './ReportButton'
import { MessageSquare, User, Clock } from 'lucide-react'

export default function DebateCard({
  debate,
  detailed = false,
}: {
  debate: DebateWithDetails
  detailed?: boolean
}) {
  const timeAgo = getTimeAgo(new Date(debate.created_at))

  return (
    <article className="card group hover:border-[var(--color-accent)]/20 transition-all duration-200">
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex-shrink-0">
          <VoteButtons
            targetType="debate"
            targetId={debate.id}
            score={debate.score}
            userVote={debate.user_vote}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              {debate.topic_name && (
                <span className="inline-block px-2 py-0.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold rounded mb-2 border border-[var(--color-accent)]/20">
                  {debate.topic_name}
                </span>
              )}
              {detailed ? (
                <h1 className="text-3xl font-display font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                  {debate.title}
                </h1>
              ) : (
                <Link href={`/debates/${debate.id}`}>
                  <h2 className="text-xl font-display font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {debate.title}
                  </h2>
                </Link>
              )}
            </div>
            <ReportButton targetType="debate" targetId={debate.id} />
          </div>

          {/* Claim */}
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg p-4 mb-4">
            <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Claim
            </p>
            <p className="font-bold">{debate.claim}</p>
          </div>

          {/* Description */}
          {debate.description && (
            <p className={`text-[var(--color-text-muted)] mb-4 ${!detailed && 'line-clamp-3'}`}>
              {debate.description}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-green-400">
                {debate.agree_count}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                {debate.side_a_label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-red-400">
                {debate.disagree_count}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                {debate.side_b_label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display font-bold">
                {debate.total_votes}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Total
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display font-bold">
                {debate.comment_count}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Comments
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>@{debate.author_username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{timeAgo}</span>
            </div>
            {!detailed && (
              <Link
                href={`/debates/${debate.id}`}
                className="ml-auto flex items-center gap-1 text-[var(--color-accent)] hover:underline"
              >
                <MessageSquare size={14} />
                <span>Discuss</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}
