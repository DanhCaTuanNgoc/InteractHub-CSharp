export type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
  errors: string[]
}

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
