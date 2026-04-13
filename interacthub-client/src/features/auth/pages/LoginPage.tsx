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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<LoginFormValues>({
    mode: 'onChange',
    defaultValues: {
      email: localStorage.getItem(REMEMBER_EMAIL_KEY) ?? '',
      password: '',
      rememberMe: Boolean(localStorage.getItem(REMEMBER_EMAIL_KEY)),
    },
  })

  const identifier = watch('email') ?? ''
  const password = watch('password') ?? ''
  const normalizedIdentifier = identifier.trim()

  const isIdentifierValid =
    normalizedIdentifier.includes('@')
      ? EMAIL_PATTERN.test(normalizedIdentifier)
      : normalizedIdentifier.length >= 4

  const isPasswordValid = password.length >= 8

  const targetPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
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
        <p className="auth-card__eyebrow">Chào mừng bạn quay lại</p>
        <h1>Đăng nhập vào InteractHub</h1>
        <p>Quản lý bảng tin, tin và thông báo của bạn tại một nơi.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <AuthTextField
            label="Email hoặc tên người dùng"
            type="text"
            placeholder="vd: you@email.com hoặc username"
            autoComplete="username"
            error={errors.email?.message}
            hint="Nhập email hoặc tên người dùng của bạn."
            successMessage="Hợp lệ"
            isValid={Boolean(touchedFields.email) && !errors.email && normalizedIdentifier.length > 0 && isIdentifierValid}
            icon={<Mail size={18} />}
            {...register('email', {
              required: 'Vui lòng nhập email hoặc tên người dùng.',
              validate: (value) => {
                const v = value.trim()
                if (!v) return 'Vui lòng nhập email hoặc tên người dùng.'
                if (v.includes('@')) {
                  return EMAIL_PATTERN.test(v) || 'Email không hợp lệ.'
                }
                return v.length >= 4 || 'Tên người dùng phải có ít nhất 4 ký tự.'
              },
            })}
          />

          <AuthPasswordField
            label="Mật khẩu"
            autoComplete="current-password"
            error={errors.password?.message}
            hint="Ít nhất 8 ký tự."
            successMessage="Hợp lệ"
            isValid={Boolean(touchedFields.password) && !errors.password && isPasswordValid}
            {...register('password', {
              required: 'Vui lòng nhập mật khẩu.',
              minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự.' },
            })}
          />

          <label className="auth-check">
            <input type="checkbox" {...register('rememberMe')} />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          {submitError ? <AuthErrorMessage message={submitError} /> : null}

          <Button
            type="submit"
            fullWidth
            busy={isSubmitting}
            disabled={!isValid || isSubmitting}
            className="auth-submit-btn"
          >
            Đăng nhập
          </Button>
        </form>

        <p className="auth-card__footnote">
          Chưa có tài khoản? <Link to={ROUTES.register}>Đăng ký ngay</Link>
        </p>
      </section>
    </motion.main>
  )
}