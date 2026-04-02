import { Outlet } from 'react-router-dom'
import { Bot, LayoutDashboard, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'

export function AppShell() {
  return (
    <div className="shell min-h-screen">
      <Navbar />

      <main className="shell__main px-1 sm:px-0">
        <div className="shell__content">
          <section className="order-2 xl:order-1">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  )
}
