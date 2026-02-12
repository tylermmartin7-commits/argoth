import type { CommentWithDetails } from '@/lib/types'
import VoteButtons from './VoteButtons'
import ReportButton from './ReportButton'
import { User, Clock } from 'lucide-react'

export default function CommentCard({
  comment,
  sideALabel,
  sideBLabel,
}: {
  comment: CommentWithDetails
  sideALabel: string
  sideBLabel: string
}) {
  const timeAgo = getTimeAgo(new Date(comment.created_at))

  const getSideBadge = () => {
    if (comment.side === 'A') {
      return <span className="badge badge-agree">{sideALabel}</span>
    }
    if (comment.side === 'B') {
      return <span className="badge badge-disagree">{sideBLabel}</span>
    }
    return <span className="badge badge-neutral">Neutral</span>
  }

  return (
    <article className="card hover:border-[var(--color-border)] transition-all duration-200">
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex-shrink-0">
          <VoteButtons
            targetType="comment"
            targetId={comment.id}
            score={comment.score}
            userVote={comment.user_vote}
            compact
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-[var(--color-text-muted)]" />
              <span className="font-bold">@{comment.author_username}</span>
            </div>
            {getSideBadge()}
            <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] ml-auto">
              <Clock size={14} />
              <span>{timeAgo}</span>
            </div>
            <ReportButton targetType="comment" targetId={comment.id} />
          </div>

          {/* Body */}
          <p className="text-[var(--color-text)] whitespace-pre-wrap break-words">
            {comment.body}
          </p>

          {/* Vote Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-muted)]">
            <span className="text-green-400">
              {comment.upvote_count} {comment.upvote_count === 1 ? 'upvote' : 'upvotes'}
            </span>
            <span className="text-red-400">
              {comment.downvote_count} {comment.downvote_count === 1 ? 'downvote' : 'downvotes'}
            </span>
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
