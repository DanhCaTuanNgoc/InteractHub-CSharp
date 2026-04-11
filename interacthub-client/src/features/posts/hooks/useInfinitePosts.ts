import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postService } from '../../../shared/services/postService'

const PAGE_SIZE = 6

export function useInfinitePosts() {
  const queryClient = useQueryClient()

  const feedQuery = useInfiniteQuery({
    queryKey: ['feed', PAGE_SIZE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => postService.getFeed(pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.totalPages) {
        return undefined
      }
      return lastPage.page + 1
    },
  })

  const createPostMutation = useMutation({
    mutationFn: ({ content, imageUrl }: { content: string; imageUrl?: string }) =>
      postService.create({ content, imageUrl }),
    onSuccess: () => {
      postService.invalidateFeedCache()
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => postService.toggleLike(postId),
    onSuccess: () => {
      postService.invalidateFeedCache()
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      postService.addComment(postId, content),
    onSuccess: () => {
      postService.invalidateFeedCache()
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  const posts = feedQuery.data?.pages.flatMap((page) => page.items) ?? []

  return {
    ...feedQuery,
    posts,
    createPost: createPostMutation,
    toggleLike: toggleLikeMutation,
    addComment: addCommentMutation,
  }
}
