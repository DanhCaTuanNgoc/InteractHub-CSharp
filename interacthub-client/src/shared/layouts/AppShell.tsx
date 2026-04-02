import { Outlet } from 'react-router-dom'
import { Bot, LayoutDashboard, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'

export function AppShell() {
  return (
    <div className="shell min-h-screen">
      <Navbar />

      <main className="shell__main px-1 sm:px-0">
        <div className="shell__content-grid grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="order-2 xl:order-1">
            <Outlet />
          </section>
          <aside className="shell__sidebar-card order-1 xl:order-2">
            <h3>
              <LayoutDashboard size={16} aria-hidden="true" />
              <span>Phase 2 Tracker</span>
            </h3>
            <p>F1-F4 đang được triển khai theo lộ trình InteractHub-Markdown.</p>
            <ul>
              <li>
                <Bot size={14} aria-hidden="true" />
                <span>Forms với React Hook Form</span>
              </li>
              <li>
                <ShieldCheck size={14} aria-hidden="true" />
                <span>API services + interceptor JWT</span>
              </li>
              <li>
                <Search size={14} aria-hidden="true" />
                <span>Debounce search + pagination</span>
              </li>
              <li>
                <Sparkles size={14} aria-hidden="true" />
                <span>SignalR notification channel</span>
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  )
}
