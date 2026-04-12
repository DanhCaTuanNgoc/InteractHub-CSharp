import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../auth/hooks/useAuth'
import { storyService } from '../../../shared/services/storyService'

type UseStoriesQueryOptions = {
  enabled?: boolean
}

export function useStoriesQuery(options?: UseStoriesQueryOptions) {
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['stories', user?.id ?? 'guest'],
    queryFn: () => storyService.getAll(),
    staleTime: 30_000,
    refetchOnMount: 'always',
    enabled: isAuthenticated && (options?.enabled ?? true),
  })
}
