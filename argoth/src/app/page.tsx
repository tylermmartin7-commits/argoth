import { createClient } from '@/lib/supabase/server'
import DebateCard from '@/components/DebateCard'
import SortTabs from '@/components/SortTabs'
import type { SortOption, DebateWithDetails } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const params = await searchParams
  const sort = (params.sort as SortOption) || 'new'

  const supabase = await createClient()

  // Get current user for vote status
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Determine which view to query based on sort
  const viewName =
    sort === 'new'
      ? 'debates_feed_new'
      : sort === 'top_24h'
      ? 'debates_feed_top_24h'
      : sort === 'top_7d'
      ? 'debates_feed_top_7d'
      : 'debates_feed_trending'


  const { data: debates, error } = await supabase
    .from(viewName)
    .select('*')
    .limit(50)

  if (error) {
    console.error('Error fetching debates:', error)
    return (
      <div className="container mx-auto px-4 max-w-4xl">
        <p className="text-red-400">Error loading debates. Please try again.</p>
      </div>
    )
  }

  // Get user votes if logged in
  let userVotes: Record<string, number> = {}
  if (user && debates) {
    const debateIds = (debates as DebateWithDetails[]).map((d) => d.id)
    const { data: votes } = await supabase
      .from('votes')
      .select('target_id, value')
      .eq('user_id', user.id)
      .eq('target_type', 'debate')
      .in('target_id', debateIds)

    type Vote = { target_id: string; value: number }
    if (votes) {
      userVotes = (votes as Vote[]).reduce(
        (acc, vote) => ({
          ...acc,
          [vote.target_id]: vote.value,
        }),
        {}
      )
    }
  }

  const debatesWithVotes: DebateWithDetails[] =
    (debates as DebateWithDetails[] | undefined)?.map((debate) => ({
      ...debate,
      user_vote: userVotes[debate.id] || null,
    })) || []

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="mb-12 text-center animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-white via-[var(--color-accent)] to-white bg-clip-text text-transparent">
          Argoth
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          A structured platform for civil debate. Explore perspectives, vote on claims, and engage with ideas.
        </p>
      </div>

      <SortTabs currentSort={sort} />

      <div className="space-y-6 mt-8">
        {debatesWithVotes.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-[var(--color-text-muted)] text-lg">
              No debates yet. Be the first to start one!
            </p>
          </div>
        ) : (
          debatesWithVotes.map((debate, index) => (
            <div
              key={debate.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <DebateCard debate={debate} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
