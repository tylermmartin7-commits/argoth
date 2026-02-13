'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'

export async function createDebate(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to create a debate' }
  }

  const title = formData.get('title') as string
  const claim = formData.get('claim') as string
  const description = formData.get('description') as string
  const topicId = formData.get('topic_id') as string
  const sideALabel = formData.get('side_a_label') as string
  const sideBLabel = formData.get('side_b_label') as string

  if (!title || !claim) {
    return { error: 'Title and claim are required' }
  }


  const { data, error } = await supabase
    .from('debates')
    .insert({
      author_id: user.id,
      title,
      claim,
      description: description || null,
      topic_id: topicId || null,
      side_a_label: sideALabel || 'Agree',
      side_b_label: sideBLabel || 'Disagree',
    } as any)
    .select()
    .single() as { data: { id: string } | null; error: any }

  if (error || !data) {
    return { error: error?.message || 'Failed to create debate' }
  }

  revalidatePath('/')
  redirect(`/debates/${data.id}`)
}

export async function updateReportStatus(
  reportId: string,
  status: string
) {
  // Implementation placeholder
  return { error: 'Not implemented' }
}

export async function updateDebate(debateId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  const title = formData.get('title') as string
  const claim = formData.get('claim') as string
  const description = formData.get('description') as string
  const topicId = formData.get('topic_id') as string
  const sideALabel = formData.get('side_a_label') as string
  const sideBLabel = formData.get('side_b_label') as string


  type DebateUpdate = {
    title?: string;
    claim?: string;
    description?: string | null;
    topic_id?: string | null;
    side_a_label?: string;
    side_b_label?: string;
  };
  const updateObj: DebateUpdate = {};
  if (title) updateObj.title = title;
  if (claim) updateObj.claim = claim;
  if (description !== undefined) updateObj.description = description;
  if (topicId) updateObj.topic_id = topicId;
  if (sideALabel) updateObj.side_a_label = sideALabel;
  if (sideBLabel) updateObj.side_b_label = sideBLabel;

  const { error } = await supabase
    .from('debates')
    .update(updateObj)
    .eq('id', debateId)
    .eq('author_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/debates/${debateId}`)
  return { success: true }
}

export async function hideDebate(debateId: string, hidden: boolean) {
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

  const { error } = await supabase
    .from('debates')
    .update({ is_hidden: hidden } as any)
    .eq('id', debateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/debates/${debateId}`)
  revalidatePath('/admin/reports')
  return { success: true }
}
