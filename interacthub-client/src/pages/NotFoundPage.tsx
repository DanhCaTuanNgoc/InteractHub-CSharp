import { Link } from 'react-router-dom'
import { ROUTES } from '../shared/constants/routes'

export function NotFoundPage() {
  return (
    <section className="cards-section cards-section--single">
      <article className="status-card">
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link className="shell__button shell__button--inline" to={ROUTES.home}>
          Back to home
        </Link>
      </article>
    </section>
  )
}
