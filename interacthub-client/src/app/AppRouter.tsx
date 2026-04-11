import { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ROUTES } from '../shared/constants/routes'
import { AppShell } from '../shared/layouts/AppShell'
import { ProtectedRoute } from './ProtectedRoute'

const HomePage = lazy(() => import('../pages/HomePage').then((module) => ({ default: module.HomePage })))
const ExplorePage = lazy(() => import('../pages/ExplorePage').then((module) => ({ default: module.ExplorePage })))
const FriendRequestsPage = lazy(() => import('../pages/FriendRequestsPage').then((module) => ({ default: module.FriendRequestsPage })))
const AdminPage = lazy(() => import('../pages/AdminPage').then((module) => ({ default: module.AdminPage })))
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const StoriesPage = lazy(() => import('../pages/StoriesPage').then((module) => ({ default: module.StoriesPage })))

export function AppRouter() {
  const location = useLocation()

  return (
    <Suspense fallback={<p className="route-loading">Loading page...</p>}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.register} element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<HomePage />} />
                <Route path={ROUTES.explore} element={<ExplorePage />} />
                <Route path={ROUTES.friendRequests} element={<FriendRequestsPage />} />
                <Route path={ROUTES.stories} element={<StoriesPage />} />
                <Route path={ROUTES.profile(':id')} element={<ProfilePage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute requiredRoles={['Admin']} />}>
              <Route element={<AppShell />}>
                <Route path={ROUTES.admin} element={<AdminPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
            <Route path="" element={<Navigate to={ROUTES.home} replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  )
}
