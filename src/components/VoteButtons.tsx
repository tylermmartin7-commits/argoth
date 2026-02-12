'use client'

import { useState, useTransition } from 'react'
import { toggleVote } from '@/lib/actions/votes'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export default function VoteButtons({
  targetType,
  targetId,
  score,
  userVote,
  compact = false,
}: {
  targetType: 'debate' | 'comment'
  targetId: string
  score: number
  userVote?: number | null
  compact?: boolean
}) {
  const [optimisticScore, setOptimisticScore] = useState(score)
  const [optimisticVote, setOptimisticVote] = useState(userVote || null)
  const [isPending, startTransition] = useTransition()

  const handleVote = async (value: 1 | -1) => {
    // Calculate optimistic update
    let newScore = optimisticScore
    let newVote: number | null = value

    if (optimisticVote === value) {
      // Remove vote
      newScore -= value
      newVote = null
    } else if (optimisticVote === null) {
      // Add new vote
      newScore += value
    } else {
      // Switch vote
      newScore = newScore - optimisticVote + value
    }

    // Apply optimistic update
    setOptimisticScore(newScore)
    setOptimisticVote(newVote)

    // Perform server action
    startTransition(async () => {
      const result = await toggleVote(targetType, targetId, value)

      if (result.error) {
        // Revert on error
        setOptimisticScore(score)
        setOptimisticVote(userVote || null)
        alert(result.error)
      }
    })
  }

  const agreeActive = optimisticVote === 1
  const disagreeActive = optimisticVote === -1

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => handleVote(1)}
          disabled={isPending}
          className={`
            p-1.5 rounded transition-all duration-200 disabled:opacity-50
            ${
              agreeActive
                ? 'bg-green-500/20 text-green-400'
                : 'text-[var(--color-text-muted)] hover:bg-green-500/10 hover:text-green-400'
            }
          `}
          title="Upvote"
        >
          <ThumbsUp size={16} />
        </button>
        <span
          className={`
          text-sm font-bold tabular-nums
          ${optimisticScore > 0 ? 'text-green-400' : optimisticScore < 0 ? 'text-red-400' : ''}
        `}
        >
          {optimisticScore}
        </span>
        <button
          onClick={() => handleVote(-1)}
          disabled={isPending}
          className={`
            p-1.5 rounded transition-all duration-200 disabled:opacity-50
            ${
              disagreeActive
                ? 'bg-red-500/20 text-red-400'
                : 'text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400'
            }
          `}
          title="Downvote"
        >
          <ThumbsDown size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`
          p-2 rounded-lg transition-all duration-200 disabled:opacity-50
          ${
            agreeActive
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'text-[var(--color-text-muted)] hover:bg-green-500/10 hover:text-green-400 border border-transparent'
          }
        `}
        title="Agree"
      >
        <ThumbsUp size={20} />
      </button>
      <div className="text-center">
        <div
          className={`
          text-2xl font-display font-bold tabular-nums
          ${optimisticScore > 0 ? 'text-green-400' : optimisticScore < 0 ? 'text-red-400' : ''}
        `}
        >
          {optimisticScore > 0 ? '+' : ''}
          {optimisticScore}
        </div>
        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
          Score
        </div>
      </div>
      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`
          p-2 rounded-lg transition-all duration-200 disabled:opacity-50
          ${
            disagreeActive
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400 border border-transparent'
          }
        `}
        title="Disagree"
      >
        <ThumbsDown size={20} />
      </button>
    </div>
  )
}
