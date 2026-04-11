export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <article
          key={index}
          className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/70"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-ink-200 dark:bg-ink-700" />
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-ink-200 dark:bg-ink-700" />
              <div className="h-3 w-36 animate-pulse rounded-full bg-ink-100 dark:bg-ink-800" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-ink-100 dark:bg-ink-800" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-ink-100 dark:bg-ink-800" />
          </div>
          <div className="mt-4 h-56 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
        </article>
      ))}
    </div>
  )
}
