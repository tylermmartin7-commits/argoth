'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'

export async function toggleVote(
  targetType: 'debate' | 'comment',
  targetId: string,
  value: 1 | -1
) {
  const supabase: any = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to vote' }
  }

  // Use the atomic toggle_vote function
  const { data, error } = await supabase.rpc('toggle_vote', {
    p_user_id: user.id,
    p_target_type: targetType,
    p_target_id: targetId,
    p_new_value: value,
  })

  if (error) {
    return { error: error.message }
  }

  // Revalidate appropriate paths
  if (targetType === 'debate') {
    revalidatePath('/')
    revalidatePath(`/debates/${targetId}`)
  } else {
    // For comments, we need to get the debate_id
    const { data: comment } = await supabase
      .from('comments')
      .select('debate_id')
      .eq('id', targetId)
      .single()

    if (comment) {
      revalidatePath(`/debates/${comment.debate_id}`)
    }
  }

  return {
    success: true,
    action: data?.[0]?.action,
    newValue: data?.[0]?.new_value,
  }
}
