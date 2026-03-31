export const ROUTES = {
  home: '/',
  explore: '/explore',
  login: '/login',
  register: '/register',
  stories: '/stories',
  profile: (id: string) => `/profile/${id}`,
} as const
