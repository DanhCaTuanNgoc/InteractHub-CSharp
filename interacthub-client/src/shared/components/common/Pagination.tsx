type PaginationProps = {
  currentPage: number
  totalPages: number
  onChange: (nextPage: number) => void
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1}>
        Trước
      </button>
      <span>
        Trang {currentPage} / {totalPages}
      </span>
      <button type="button" onClick={() => onChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Sau
      </button>
    </nav>
  )
}
