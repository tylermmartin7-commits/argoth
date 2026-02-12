import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createDebate } from '@/lib/actions/debates'

export default async function CreateDebatePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .order('name')

  return (
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">
          Create New Debate
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Present a claim and let the community weigh in
        </p>
      </div>

      <form action={createDebate} className="card space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="A concise title for your debate"
            className="input"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="claim" className="block text-sm font-bold mb-2">
            Claim Statement
          </label>
          <input
            type="text"
            id="claim"
            name="claim"
            placeholder="The core claim or proposition to debate"
            className="input"
            required
            maxLength={300}
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            This should be a clear, debatable statement
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Provide context, evidence, or reasoning..."
            className="textarea"
            rows={6}
            maxLength={5000}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="side_a_label" className="block text-sm font-bold mb-2">
              Side A Label
            </label>
            <input
              type="text"
              id="side_a_label"
              name="side_a_label"
              placeholder="Agree"
              defaultValue="Agree"
              className="input"
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="side_b_label" className="block text-sm font-bold mb-2">
              Side B Label
            </label>
            <input
              type="text"
              id="side_b_label"
              name="side_b_label"
              placeholder="Disagree"
              defaultValue="Disagree"
              className="input"
              maxLength={50}
            />
          </div>
        </div>

        <div>
          <label htmlFor="topic_id" className="block text-sm font-bold mb-2">
            Topic Category
          </label>
          <select id="topic_id" name="topic_id" className="input">
            <option value="">Select a topic...</option>
            {topics?.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-4 border-t border-[var(--color-border)]">
          <button type="submit" className="btn-primary flex-1">
            Create Debate
          </button>
          <a href="/" className="btn-secondary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
