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
      className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_5%_5%,rgba(10,147,150,0.2),transparent_36%),radial-gradient(circle_at_90%_12%,rgba(238,155,0,0.18),transparent_34%),linear-gradient(145deg,#f8f4ea_0%,#efe7d7_100%)] px-4 py-10 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-30" />

      <section className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">Chào mừng bạn quay lại</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Đăng nhập vào InteractHub</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Quản lý bảng tin, tin và thông báo của bạn tại một nơi.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
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
            className="mt-2 cursor-pointer"
          >
            Đăng nhập
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Chưa có tài khoản? <Link to={ROUTES.register}>Đăng ký ngay</Link>
        </p>
      </section>
    </motion.main>
  )
}