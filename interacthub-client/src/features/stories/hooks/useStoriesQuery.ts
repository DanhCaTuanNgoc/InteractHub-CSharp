import { useQuery } from '@tanstack/react-query'
import { storyService } from '../../../shared/services/storyService'

export function useStoriesQuery() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => storyService.getAll(),
    staleTime: 30_000,
  })
}
