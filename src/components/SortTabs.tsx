'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { SortOption } from '@/lib/types'
import { Flame, TrendingUp, Clock, Calendar } from 'lucide-react'

const sortOptions: { value: SortOption; label: string; icon: any }[] = [
  { value: 'new', label: 'New', icon: Clock },
  { value: 'top_24h', label: 'Top 24h', icon: TrendingUp },
  { value: 'top_7d', label: 'Top 7d', icon: Calendar },
  { value: 'trending', label: 'Trending', icon: Flame },
]

export default function SortTabs({ currentSort }: { currentSort: SortOption }) {
  return (
    <div className="flex gap-2 border-b border-[var(--color-border)] overflow-x-auto pb-px">
      {sortOptions.map(({ value, label, icon: Icon }) => {
        const isActive = currentSort === value
        return (
          <Link
            key={value}
            href={`/?sort=${value}`}
            className={`
              flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all duration-200
              border-b-2 whitespace-nowrap
              ${
                isActive
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
              }
            `}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
