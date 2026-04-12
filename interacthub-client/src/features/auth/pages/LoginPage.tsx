import { useState } from 'react'
import { Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/common/Button'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../../../shared/constants/routes'
import { authService } from '../../../shared/services/authService'
import { AuthTextField } from '../../../shared/components/auth/AuthTextField'
import { AuthPasswordField } from '../../../shared/components/auth/AuthPasswordField'
import { AuthErrorMessage } from '../../../shared/components/auth/AuthErrorMessage'

type LoginFormValues = {
  email: string
  password: string
  rememberMe: boolean
}

const REMEMBER_EMAIL_KEY = 'interacthub_remembered_email'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onTouched',
    defaultValues: {
      email: localStorage.getItem(REMEMBER_EMAIL_KEY) ?? '',
      password: '',
      rememberMe: Boolean(localStorage.getItem(REMEMBER_EMAIL_KEY)),
    },
  })

  const targetPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    ROUTES.home

  if (isAuthenticated) {
    return <Navigate to={targetPath} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      if (values.rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, values.email)
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }

      const payload = await authService.login({
        email: values.email,
        password: values.password,
      })

      login({
        accessToken: payload.token,
        user: {
          id: payload.user.id,
          username: payload.user.userName,
          fullName: payload.user.fullName,
          avatarUrl: payload.user.avatarUrl,
        },
      })

      navigate(targetPath, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Đăng nhập thất bại.')
    }
  })

  return (
    <motion.main
      className="auth-layout"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <section className="auth-card auth-card--narrow">
        <p className="auth-card__eyebrow">Welcome back</p>
        <h1>Sign in to InteractHub</h1>
        <p>Manage your feed, stories and notifications in one place.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <AuthTextField
            label="Email"
            type="email"
            placeholder="you@interacthub.app"
            autoComplete="email"
            error={errors.email?.message}
            icon={<Mail size={18} aria-hidden="true" />}
            {...register('email', {
              required: 'Email is required.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address.',
              },
            })}
          />

          <AuthPasswordField
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required.',
              minLength: { value: 8, message: 'Password must be at least 8 characters.' },
            })}
          />

          <label className="auth-check">
            <input type="checkbox" {...register('rememberMe')} />
            <span>Remember me</span>
          </label>

          {submitError ? <AuthErrorMessage message={submitError} /> : null}

          <Button type="submit" fullWidth busy={isSubmitting} className="auth-submit-btn">
            Sign In
          </Button>
        </form>

        <p className="auth-card__footnote">
          New here? <Link to={ROUTES.register}>Create an account</Link>
        </p>
      </section>
    </motion.main>
  )
}
