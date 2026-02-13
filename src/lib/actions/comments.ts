'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'

export async function createComment(
  debateId: string,
  body: string,
  side: 'A' | 'B' | 'N'
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to comment' }
  }

  if (!body.trim()) {
    return { error: 'Comment cannot be empty' }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([{
      debate_id: debateId,
      author_id: user.id,
      body: body.trim(),
      side,
    }] as any)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/debates/${debateId}`)
  return { success: true, data }
}

export async function updateComment(
  commentId: string,
  body: string,
  side: 'A' | 'B' | 'N'
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  if (!body.trim()) {
    return { error: 'Comment cannot be empty' }
  }

  const { error } = await supabase
    .from('comments')
    .update({
      body: body.trim(),
      side: side,
    } as any)
    .eq('id', commentId)
    .eq('author_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Get debate_id for revalidation

  const { data: comment } = await supabase
    .from('comments')
    .select('debate_id')
    .eq('id', commentId)
    .single() as { data: { debate_id: string } | null };

  if (comment && comment.debate_id) {
    revalidatePath(`/debates/${comment.debate_id}`)
  }

  return { success: true }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Get debate_id before deleting
  const { data: comment } = await supabase
    .from('comments')
    .select('debate_id')
    .eq('id', commentId)
    .single() as { data: { debate_id: string } | null };

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', user.id)

  if (error) {
    return { error: error.message }
  }

  if (comment && comment.debate_id) {
    revalidatePath(`/debates/${comment.debate_id}`)
  }

  return { success: true }
}

export async function hideComment(commentId: string, hidden: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin =
    (profile as { is_admin: boolean } | null)?.is_admin === true

  if (!isAdmin) {
    return { error: 'You must be an admin to perform this action' }
  }

  // Get debate_id for revalidation
  const { data: comment } = await supabase
    .from('comments')
    .select('debate_id')
    .eq('id', commentId)
    .single() as { data: { debate_id: string } | null };

  const { error } = await supabase
    .from('comments')
    .update({ is_hidden: hidden })
    .eq('id', commentId)

  if (error) {
    return { error: error.message }
  }

  if (comment && comment.debate_id) {
    revalidatePath(`/debates/${comment.debate_id}`)
  }
  revalidatePath('/admin/reports')

  return { success: true }
}
