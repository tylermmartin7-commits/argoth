'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'

export async function createReport(
  targetType: 'debate' | 'comment',
  targetId: string,
  reason: string
) {
  const supabase: any = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to report content' }
  }

  if (!reason.trim()) {
    return { error: 'Please provide a reason for the report' }
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

export async function updateReportStatus(
  reportId: string,
  status: 'open' | 'reviewed' | 'dismissed'
) {
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
    .from('reports')
    .update({ status })
    .eq('id', reportId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/reports')
  return { success: true }
}
