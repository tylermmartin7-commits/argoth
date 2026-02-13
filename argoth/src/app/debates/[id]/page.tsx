import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DebateCard from '@/components/DebateCard'
import CommentCard from '@/components/CommentCard'
import { createComment } from '@/lib/actions/comments'
import type { DebateWithDetails, CommentWithDetails } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function CommentForm({
  debateId,
  sideALabel,
  sideBLabel,
}: {
  debateId: string
  sideALabel: string
  sideBLabel: string
}) {
  async function handleSubmit(formData: FormData) {
    'use server'
    const body = formData.get('body') as string
    const side = formData.get('side') as 'A' | 'B' | 'N'
    await createComment(debateId, body, side)
  }

  return (
    <form action={handleSubmit} className="card mb-8">
      <h3 className="font-display font-bold text-xl mb-4">Add Your Comment</h3>
      <textarea
        name="body"
        placeholder="Share your thoughts..."
        className="textarea mb-4"
        required
      />
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="side"
              value="A"
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm">{sideALabel}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="side"
              value="B"
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-sm">{sideBLabel}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="side"
              value="N"
              defaultChecked
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-sm">Neutral</span>
          </label>
        </div>
        <button type="submit" className="btn-primary ml-auto">
          Post Comment
        </button>
      </div>
    </form>
  )
}

export default async function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch debate with details
  const { data, error: debateError } = await supabase
    .from('debates_feed_new')
    .select('*')
    .eq('id', id)
    .single()

  if (debateError || !data) {
    notFound()
  }

  const debate = data as DebateWithDetails

  // Get user vote on debate
  let userDebateVote = null
  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('value')
      .eq('user_id', user.id)
      .eq('target_type', 'debate')
      .eq('target_id', id)
      .single<{ value: number | null }>()

    userDebateVote = vote?.value ?? null
  }

  const debateWithVote: DebateWithDetails = {
    ...debate,
    user_vote: userDebateVote,
  }

  // Fetch comments with author info and scores
  const { data: comments } = await supabase
    .from('comments')
    .select(
      `
      *,
      profiles:author_id (username, display_name)
    `
    )
    .eq('debate_id', id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false }) as { data: any[] }

  // Get comment scores and user votes
  const commentIds = comments?.map((c) => c.id) || []
  const { data: commentScores } = await supabase
    .from('comment_scores')
    .select('*')
    .in('comment_id', commentIds) as { data: { comment_id: string; score?: number; upvote_count?: number; downvote_count?: number }[] }

  let userCommentVotes: Record<string, number> = {}
  if (user && commentIds.length > 0) {

    const { data: votes } = await supabase
      .from('votes')
      .select('target_id, value')
      .eq('user_id', user.id)
      .eq('target_type', 'comment')
      .in('target_id', commentIds);

    if (votes) {
      userCommentVotes = (votes as { target_id: string; value: number }[]).reduce(
        (acc, vote) => ({
          ...acc,
          [vote.target_id]: vote.value,
        }),
        {}
      )
    }
  }

  const commentsWithDetails: CommentWithDetails[] =
    comments?.map((comment: any) => {
      const profile = comment.profiles
      const score = (commentScores as { comment_id: string; score?: number; upvote_count?: number; downvote_count?: number }[] | undefined)?.find((s) => s.comment_id === comment.id)

      return {
        ...comment,
        author_username: profile?.username || 'unknown',
        author_display_name: profile?.display_name || null,
        score: score?.score || 0,
        upvote_count: score?.upvote_count || 0,
        downvote_count: score?.downvote_count || 0,
        user_vote: userCommentVotes[comment.id] || null,
      }
    }) || []

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <DebateCard debate={debateWithVote} detailed />

      <div className="mt-8">
        <h2 className="font-display font-bold text-2xl mb-6">
          Discussion ({commentsWithDetails.length})
        </h2>

        {user && (
          <CommentForm
            debateId={id}
            sideALabel={debate.side_a_label}
            sideBLabel={debate.side_b_label}
          />
        )}

        {!user && (
          <div className="card mb-8 text-center py-8">
            <p className="text-[var(--color-text-muted)]">
              Sign in to join the discussion
            </p>
          </div>
        )}

        <div className="space-y-4">
          {commentsWithDetails.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-[var(--color-text-muted)]">
                No comments yet. Be the first to share your perspective!
              </p>
            </div>
          ) : (
            commentsWithDetails.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                sideALabel={debate.side_a_label}
                sideBLabel={debate.side_b_label}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
