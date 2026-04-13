import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { postService } from '../../../shared/services/postService'
import type { PagedResult } from '../../../shared/types/api'
import type { Post } from '../../../shared/types/post'

const PAGE_SIZE = 6

type FeedInfiniteData = InfiniteData<PagedResult<Post>, number>

function updatePostInFeedData(
  data: FeedInfiniteData | undefined,
  postId: string,
  updater: (post: Post) => Post,
): FeedInfiniteData | undefined {
  if (!data) {
    return data
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((post) => (post.id === postId ? updater(post) : post)),
    })),
  }
}

export function usePosts() {
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
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      const previousEntries = queryClient.getQueriesData<FeedInfiniteData>({ queryKey: ['feed'] })

      previousEntries.forEach(([queryKey, data]) => {
        queryClient.setQueryData<FeedInfiniteData>(queryKey, () =>
          updatePostInFeedData(data, postId, (post) => ({
            ...post,
            isLikedByCurrentUser: !post.isLikedByCurrentUser,
            likeCount: Math.max(0, post.likeCount + (post.isLikedByCurrentUser ? -1 : 1)),
          })),
        )
      })

      return { previousEntries }
    },
    onError: (_error, _postId, context) => {
      if (!context?.previousEntries) {
        return
      }

      context.previousEntries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSuccess: (updatedPost, postId) => {
      queryClient.setQueriesData<FeedInfiniteData>({ queryKey: ['feed'] }, (data) =>
        updatePostInFeedData(data, postId, () => updatedPost),
      )
    },
    onSettled: () => {
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

  const sharePostMutation = useMutation({
    mutationFn: (postId: string) => postService.share(postId),
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
    sharePost: sharePostMutation,
  }
}
