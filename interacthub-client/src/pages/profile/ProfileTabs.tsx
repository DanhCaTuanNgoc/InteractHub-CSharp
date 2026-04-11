import { motion } from 'framer-motion'
import { Clapperboard, Grid3X3 } from 'lucide-react'

export type ProfileTabKey = 'posts' | 'stories'

type ProfileTabsProps = {
  activeTab: ProfileTabKey
  onChange: (tab: ProfileTabKey) => void
}

const tabs: Array<{ key: ProfileTabKey; label: string; icon: typeof Grid3X3 }> = [
  { key: 'posts', label: 'Posts', icon: Grid3X3 },
  { key: 'stories', label: 'Stories', icon: Clapperboard },
]

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/65 p-1 shadow-sm backdrop-blur-sm">
      <div className="grid grid-cols-2 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              className="relative rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              onClick={() => onChange(tab.key)}
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                <Icon size={16} />
                {tab.label}
              </span>

              {active ? (
                <motion.span
                  layoutId="profile-tab-bg"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                />
              ) : null}

              {active ? (
                <motion.span
                  layoutId="profile-tab-underline"
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-slate-900"
                  transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
