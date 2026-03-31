# InteractHub Frontend Component Hierarchy

## App Flow

- main.tsx
  - AppProviders
    - AuthProvider
      - AppRouter
        - Public Routes
          - LoginPage
            - TextInput
            - Button
          - RegisterPage
            - TextInput
            - PasswordStrength
            - Button
        - ProtectedRoute
          - AppShell
            - Navbar
              - NotificationBell
                - Button
            - Outlet (lazy routes)
              - HomePage
                - PostForm
                  - TextInput
                  - FileInput
                  - Button
                - LoadingSkeleton
                - PostCard
                  - Avatar
                  - Button
                - Pagination
              - ExplorePage
                - TextInput
                - LoadingSkeleton
                - UserCard
                  - Avatar
              - ProfilePage
                - TextInput
                - FileInput
                - LoadingSkeleton
                - Button
              - StoriesPage
                - TextInput
                - Button
              - NotFoundPage

## Reusable Components

1. Button
2. TextInput
3. FileInput
4. LoadingSkeleton
5. Pagination
6. UserCard
7. Avatar
8. Modal
9. PasswordStrength
10. PostCard
11. PostForm
12. NotificationBell
13. Navbar
14. ProtectedRoute
15. AppShell
