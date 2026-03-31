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
    <nav className="pagination" aria-label="Pagination">
      <button type="button" onClick={() => gotoPage(currentPage - 1)} disabled={currentPage === 1}>
        Trước
      </button>
      <span>
        Trang {currentPage} / {totalPages}
      </span>
      <button type="button" onClick={() => gotoPage(currentPage + 1)} disabled={currentPage === totalPages}>
        Sau
      </button>
    </nav>
  )
}
