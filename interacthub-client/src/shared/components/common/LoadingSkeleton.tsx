type LoadingSkeletonProps = {
  lines?: number
  variant?: 'post' | 'user'
}

export function LoadingSkeleton({ lines = 3, variant = 'post' }: LoadingSkeletonProps) {
  const containerClasses = variant === 'user' ? 'space-y-2' : 'space-y-3'
  const lineClasses = variant === 'user' ? 'h-3.5' : 'h-4'

  return (
    <div className={containerClasses} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span key={index} className={`block animate-pulse rounded-full bg-slate-200 ${lineClasses}`} />
      ))}
    </div>
  )
}
