import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AtSign, Mail, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/common/Button'
import { ROUTES } from '../../../shared/constants/routes'
import { authService } from '../../../shared/services/authService'
import { useAuth } from '../hooks/useAuth'
import { AuthErrorMessage } from '../../../shared/components/auth/AuthErrorMessage'
import { AuthPasswordField } from '../../../shared/components/auth/AuthPasswordField'
import { AuthTextField } from '../../../shared/components/auth/AuthTextField'

type RegisterFormValues = {
  userName: string
  fullName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<RegisterFormValues>({
    mode: 'onChange',
    defaultValues: {
      userName: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const userName = watch('userName') ?? ''
  const fullName = watch('fullName') ?? ''
  const email = watch('email') ?? ''
  const password = watch('password') ?? ''
  const confirmPassword = watch('confirmPassword') ?? ''
  const acceptTerms = watch('acceptTerms')

  const checks = useMemo(() => ({
    userName: userName.trim().length >= 4,
    fullName: fullName.trim().length >= 2,
    email: EMAIL_PATTERN.test(email.trim()),
    password: password.length >= 8,
    match: password.length > 0 && password === confirmPassword,
    terms: !!acceptTerms,
  }), [userName, fullName, email, password, confirmPassword, acceptTerms])

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      const payload = await authService.register({
        userName: values.userName.trim().toLowerCase(),
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
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

      navigate(ROUTES.home, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Đăng ký thất bại.')
    }
  })

  return (
    <motion.main
      className="auth-layout"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <section className="auth-card">
        <p className="auth-card__eyebrow">Tạo tài khoản</p>
        <h1>Tham gia InteractHub</h1>
        <p>Bắt đầu kết nối, đăng bài và chia sẻ câu chuyện của bạn.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <AuthTextField
            label="Tên người dùng"
            placeholder="username"
            error={errors.userName?.message}
            hint="Ít nhất 4 ký tự."
            isValid={Boolean(touchedFields.userName) && !errors.userName && checks.userName}
            icon={<AtSign size={18} />}
            {...register('userName', {
              required: 'Vui lòng nhập tên người dùng.',
              validate: (v) => v.trim().length >= 4 || 'Ít nhất 4 ký tự.',
            })}
          />

          <AuthTextField
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            error={errors.fullName?.message}
            hint="Ít nhất 2 ký tự."
            isValid={Boolean(touchedFields.fullName) && !errors.fullName && checks.fullName}
            icon={<UserRound size={18} />}
            {...register('fullName', {
              required: 'Vui lòng nhập họ tên.',
              validate: (v) => v.trim().length >= 2 || 'Họ tên không hợp lệ.',
            })}
          />

          <AuthTextField
            label="Email"
            type="email"
            placeholder="you@email.com"
            error={errors.email?.message}
            hint="Nhập email hợp lệ."
            isValid={Boolean(touchedFields.email) && !errors.email && checks.email}
            icon={<Mail size={18} />}
            {...register('email', {
              required: 'Vui lòng nhập email.',
              pattern: {
                value: EMAIL_PATTERN,
                message: 'Email không hợp lệ.',
              },
            })}
          />

          <AuthPasswordField
            label="Mật khẩu"
            error={errors.password?.message}
            hint="Ít nhất 8 ký tự."
            isValid={Boolean(touchedFields.password) && !errors.password && checks.password}
            {...register('password', {
              required: 'Vui lòng nhập mật khẩu.',
              minLength: { value: 8, message: 'Ít nhất 8 ký tự.' },
            })}
          />

          <AuthPasswordField
            label="Nhập lại mật khẩu"
            error={errors.confirmPassword?.message}
            isValid={Boolean(touchedFields.confirmPassword) && !errors.confirmPassword && checks.match}
            {...register('confirmPassword', {
              required: 'Vui lòng nhập lại mật khẩu.',
              validate: (v) => v === password || 'Mật khẩu không khớp.',
            })}
          />

          <label className={`auth-check ${errors.acceptTerms ? 'is-error' : ''}`}>
            <input
              type="checkbox"
              {...register('acceptTerms', {
                validate: (v) => v || 'Bạn cần đồng ý điều khoản.',
              })}
            />
            <span>Tôi đồng ý với điều khoản sử dụng</span>
          </label>

          {errors.acceptTerms && <p className="auth-field__error">{errors.acceptTerms.message}</p>}

          {submitError && <AuthErrorMessage message={submitError} />}

          <Button
            type="submit"
            fullWidth
            busy={isSubmitting}
            disabled={!isValid || !acceptTerms}
            className="auth-submit-btn"
          >
            Đăng ký
          </Button>
        </form>

        <p className="auth-card__footnote">
          Đã có tài khoản? <Link to={ROUTES.login}>Đăng nhập</Link>
        </p>
      </section>
    </motion.main>
  )
}