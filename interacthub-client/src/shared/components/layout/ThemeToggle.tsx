import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

type ThemeToggleProps = {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-ink-200/70 bg-white/70 text-ink-700 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-soft dark:border-ink-700 dark:bg-ink-900/80 dark:text-ink-100"
      aria-label="Toggle dark mode"
    >
      <motion.span
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -50, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 40, scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </motion.span>
    </button>
  )
}
