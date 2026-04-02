import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { PasswordStrength } from '../../../shared/components/auth/PasswordStrength'
import { Button } from '../../../shared/components/common/Button'
import { TextInput } from '../../../shared/components/common/TextInput'
import { ROUTES } from '../../../shared/constants/routes'
import { authService } from '../../../shared/services/authService'
import { useAuth } from '../hooks/useAuth'

type RegisterFormValues = {
  userName: string
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export function RegisterPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ mode: 'onTouched' })

  const password = watch('password')

  const passwordRules = useMemo(
    () => ({
      required: 'Mật khẩu là bắt buộc.',
      minLength: { value: 8, message: 'Mật khẩu tối thiểu 8 ký tự.' },
      validate: {
        upper: (value: string) => /[A-Z]/.test(value) || 'Mật khẩu cần 1 chữ in hoa.',
        number: (value: string) => /\d/.test(value) || 'Mật khẩu cần 1 chữ số.',
      },
    }),
    [],
  )

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      const payload = await authService.register({
        userName: values.userName,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      })

      login({
        accessToken: payload.token,
        user: {
          id: payload.user.id,
          username: payload.user.userName,
          fullName: payload.user.fullName,
        },
      })

      navigate(ROUTES.home, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Đăng ký thất bại.')
    }
  })

  return (
    <main className="auth-layout px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="auth-card w-full max-w-xl p-5 sm:p-7 lg:p-8">
        <p className="hero-section__eyebrow">Create account</p>
        <h1>Join InteractHub</h1>
        <p>Bạn chỉ mất một phút để bắt đầu chia sẻ.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <TextInput
            label="Username"
            placeholder="demo_user"
            error={errors.userName?.message}
            {...register('userName', {
              required: 'Username là bắt buộc.',
              minLength: { value: 3, message: 'Username tối thiểu 3 ký tự.' },
            })}
          />

          <TextInput
            label="Họ tên"
            placeholder="Demo User"
            error={errors.fullName?.message}
            {...register('fullName', {
              required: 'Họ tên là bắt buộc.',
              minLength: { value: 2, message: 'Họ tên tối thiểu 2 ký tự.' },
            })}
          />

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
            label="Mật khẩu"
            type="password"
            error={errors.password?.message}
            {...register('password', passwordRules)}
          />

          <PasswordStrength password={password ?? ''} />

          <TextInput
            label="Xác nhận mật khẩu"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Vui lòng xác nhận mật khẩu.',
              validate: (value) => value === password || 'Mật khẩu xác nhận không khớp.',
            })}
          />

          {submitError ? <p className="form-error">{submitError}</p> : null}

          <Button type="submit" fullWidth busy={isSubmitting}>
            Tạo tài khoản
          </Button>
        </form>

        <p className="auth-card__footnote">
          Đã có tài khoản? <Link to={ROUTES.login}>Đăng nhập</Link>
        </p>
      </section>
    </main>
  )
}
