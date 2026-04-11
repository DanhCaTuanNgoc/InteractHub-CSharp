import { useQuery } from '@tanstack/react-query'
import { storyService } from '../../../shared/services/storyService'

type UseStoriesQueryOptions = {
  enabled?: boolean
}

export function useStoriesQuery(options?: UseStoriesQueryOptions) {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => storyService.getAll(),
    staleTime: 30_000,
    refetchOnMount: 'always',
    enabled: options?.enabled,
  })
}
