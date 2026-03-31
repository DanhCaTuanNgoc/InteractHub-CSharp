import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'

export function AppShell() {
  return (
    <div className="shell">
      <Navbar />

      <main className="shell__main">
        <div className="shell__content-grid">
          <section>
            <Outlet />
          </section>
          <aside className="shell__sidebar-card">
            <h3>Phase 2 Tracker</h3>
            <p>F1-F4 đang được triển khai theo lộ trình InteractHub-Markdown.</p>
            <ul>
              <li>Forms với React Hook Form</li>
              <li>API services + interceptor JWT</li>
              <li>Debounce search + pagination</li>
              <li>SignalR notification channel</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  )
}
