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

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const feed = await postService.getFeed()
      setPosts(feed)
      setCurrentPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải feed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

  const createPost = useCallback(async (content: string, imageUrl?: string) => {
    setSaving(true)
    setError(null)

    try {
      const created = await postService.create({ content, imageUrl })
      setPosts((current) => [created, ...current])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo bài viết.')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const toggleLike = useCallback(async (postId: string) => {
    try {
      const updated = await postService.toggleLike(postId)
      setPosts((current) => current.map((post) => (post.id === postId ? updated : post)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật lượt thích.')
    }
  }, [])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(posts.length / PAGE_SIZE)), [posts.length])

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return posts.slice(start, start + PAGE_SIZE)
  }, [currentPage, posts])

  return {
    posts: paginatedPosts,
    totalPosts: posts.length,
    totalPages,
    currentPage,
    loading,
    saving,
    error,
    setCurrentPage,
    fetchPosts,
    createPost,
    toggleLike,
  }
}
