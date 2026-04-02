export const ROUTES = {
  home: '/',
  explore: '/explore',
  friendRequests: '/friend-requests',
  admin: '/admin',
  login: '/login',
  register: '/register',
  stories: '/stories',
  profile: (id: string) => `/profile/${id}`,
} as const
