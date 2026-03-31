import { useCallback, useEffect, useMemo, useState } from 'react'
import { postService } from '../../../shared/services/postService'
import type { Post } from '../../../shared/types/post'

const PAGE_SIZE = 5

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)

  const fetchPosts = useCallback(async (page: number) => {
    setLoading(true)
    setError(null)

    try {
      const feed = await postService.getFeed(page, PAGE_SIZE)
      setPosts(feed.items)
      setCurrentPage(feed.page)
      setTotalPages(feed.totalPages)
      setTotalPosts(feed.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải feed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPosts(currentPage)
  }, [currentPage, fetchPosts])

  const createPost = useCallback(async (content: string, imageUrl?: string) => {
    setSaving(true)
    setError(null)

    try {
      await postService.create({ content, imageUrl })
      setCurrentPage(1)
      await fetchPosts(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo bài viết.')
      throw err
    } finally {
      setSaving(false)
    }
  }, [fetchPosts])

  const toggleLike = useCallback(async (postId: string) => {
    try {
      const updated = await postService.toggleLike(postId)
      setPosts((current) => current.map((post) => (post.id === postId ? updated : post)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật lượt thích.')
    }
  }, [])

  const hasPosts = useMemo(() => posts.length > 0, [posts.length])

  return {
    posts,
    totalPosts,
    totalPages,
    currentPage,
    loading,
    saving,
    hasPosts,
    error,
    setCurrentPage,
    fetchPosts,
    createPost,
    toggleLike,
  }
}
