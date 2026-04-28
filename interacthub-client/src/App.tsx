import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="relative h-[210px] w-[210px]">
          <img src={heroImg} className="absolute inset-0 m-auto h-[179px] w-[170px]" alt="" />
          <img src={reactLogo} className="absolute left-1/2 top-9 h-7 -translate-x-1/2 rotate-[300deg]" alt="React logo" />
          <img src={viteLogo} className="absolute left-1/2 top-[107px] h-[26px] -translate-x-1/2 rotate-[300deg] scale-80" alt="Vite logo" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">InteractHub</h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:text-base">
            React, Vite và Tailwind đã sẵn sàng. Đây chỉ còn là màn hình demo nếu bạn mở trực tiếp file App.
          </p>
        </div>
        <button className="rounded-2xl border border-cyan-400/30 bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-400" onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
      </section>
    </main>
  )
}

export default App
