'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'

export async function toggleVote(
  targetType: 'debate' | 'comment',
  targetId: string,
  value: 1 | -1
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to vote' }
  }

  // Use the atomic toggle_vote function

  type ToggleVoteResult = { action: string; new_value: number }


  const { data, error } = await supabase.rpc<ToggleVoteResult | null>('toggle_vote', {
    p_user_id: user.id,
    p_target_type: targetType,
    p_target_id: targetId,
    p_new_value: value,
  } as any)

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
      .single<{ debate_id: string }>()

    if (comment) {
      revalidatePath(`/debates/${comment.debate_id}`)
    }
  }

  const result = Array.isArray(data)
    ? (data[0] as unknown as ToggleVoteResult | null)
    : (data as unknown as ToggleVoteResult | null);
  return {
    success: true,
    action: result?.action,
    newValue: result?.new_value,
  }
}
