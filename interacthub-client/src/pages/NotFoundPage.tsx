import { Link } from 'react-router-dom'
import { ROUTES } from '../shared/constants/routes'

export function NotFoundPage() {
  return (
    <section className="grid grid-cols-1 gap-4">
      <article className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Page Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you are looking for does not exist.</p>
        <Link className="mt-4 inline-flex rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500" to={ROUTES.home}>
          Back to home
        </Link>
      </article>
    </section>
  )
}
