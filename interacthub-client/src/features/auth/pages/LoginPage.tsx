import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/common/Button'
import { TextInput } from '../../../shared/components/common/TextInput'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../../../shared/constants/routes'
import { authService } from '../../../shared/services/authService'

type LoginFormValues = {
  email: string
  password: string
}

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: 'onTouched' })

  const targetPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    ROUTES.home

  if (isAuthenticated) {
    return <Navigate to={targetPath} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      const payload = await authService.login(values)

      login({
        accessToken: payload.token,
        user: {
          id: payload.user.id,
          username: payload.user.userName,
          fullName: payload.user.fullName,
        },
      })

      navigate(targetPath, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Đăng nhập thất bại.')
    }
  })

  return (
    <main className="auth-layout px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="auth-card w-full max-w-xl p-5 sm:p-7 lg:p-8">
        <p className="hero-section__eyebrow">Welcome back</p>
        <h1>Sign in to InteractHub</h1>
        <p>Đăng nhập bằng tài khoản thật từ backend API.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <TextInput
            label="Email"
            type="email"
            placeholder="you@interacthub.app"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email là bắt buộc.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email không hợp lệ.',
              },
            })}
          />

          <TextInput
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password là bắt buộc.',
              minLength: { value: 8, message: 'Password tối thiểu 8 ký tự.' },
            })}
          />

          {submitError ? <p className="form-error">{submitError}</p> : null}

          <Button type="submit" fullWidth busy={isSubmitting}>
            Continue
          </Button>
        </form>

        <p className="auth-card__footnote">
          Chưa có tài khoản? <Link to={ROUTES.register}>Tạo tài khoản mới</Link>
        </p>
      </section>
    </main>
  )
}
