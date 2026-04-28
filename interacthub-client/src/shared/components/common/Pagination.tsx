type PaginationProps = {
  currentPage: number
  totalPages: number
  onChange: (nextPage: number) => void
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const gotoPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return
    }

    onChange(nextPage)
  }

  return (
    <nav className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm" aria-label="Pagination">
      <button
        type="button"
        onClick={() => gotoPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-xl px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Trước
      </button>
      <span className="font-medium text-slate-700">
        Trang {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => gotoPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-xl px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Sau
      </button>
    </nav>
  )
}
