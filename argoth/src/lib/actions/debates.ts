'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'

export async function createDebate(formData: FormData) {
  const supabase: any = await createClient()

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
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  redirect(`/debates/${data.id}`)
}

export async function updateDebate(debateId: string, formData: FormData) {
  const supabase: any = await createClient()

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

  const { error } = await supabase
    .from('debates')
    .update({
      title,
      claim,
      description: description || null,
      topic_id: topicId || null,
      side_a_label: sideALabel || 'Agree',
      side_b_label: sideBLabel || 'Disagree',
    })
    .eq('id', debateId)
    .eq('author_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/debates/${debateId}`)
  return { success: true }
}

export async function hideDebate(debateId: string, hidden: boolean) {
  const supabase: any = await createClient()

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

  if (!profile?.is_admin) {
    return { error: 'You must be an admin to perform this action' }
  }

  const { error } = await supabase
    .from('debates')
    .update({ is_hidden: hidden })
    .eq('id', debateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/debates/${debateId}`)
  revalidatePath('/admin/reports')
  return { success: true }
}
