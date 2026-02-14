import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DebateCard from '@/components/DebateCard'
import CommentCard from '@/components/CommentCard'
import { createComment } from '@/lib/actions/comments'
import type { DebateWithDetails, CommentWithDetails } from '@/lib/types'

export const dynamic = 'force-dynamic'

"use client";

import { useState } from 'react'

function CommentForm({
  debateId,
  sideALabel,
  sideBLabel,
  onSubmit,
}: {
  debateId: string
  sideALabel: string
  sideBLabel: string
  onSubmit: (formData: FormData) => Promise<void>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
    setIsSubmitting(false);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-8">
      <h3 className="font-display font-bold text-xl mb-4">Add Your Comment</h3>
      <textarea
        name="body"
        placeholder="Share your thoughts..."
        className="textarea mb-4"
        required
        disabled={isSubmitting}
      />
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="side"
              value="A"
              className="w-4 h-4 accent-green-500"
              disabled={isSubmitting}
            />
            <span className="text-sm">{sideALabel}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="side"
              value="B"
              className="w-4 h-4 accent-red-500"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <span className="text-sm">Neutral</span>
          </label>
        </div>
        <button type="submit" className="btn-primary ml-auto" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}
// ...existing code...
// The rest of the file should be updated to pass the correct onSubmit prop to CommentForm
// and handle comment creation and redirect logic outside the form component.
