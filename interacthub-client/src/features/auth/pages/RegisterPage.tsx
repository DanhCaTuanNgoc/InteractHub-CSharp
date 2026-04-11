import { useMemo, useState } from 'react'
import { CheckCircle2, CircleAlert } from 'lucide-react'
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
  acceptTerms: boolean
}

const USERNAME_PATTERN = /^(?=.{4,20}$)(?![._])(?!.*[._]{2})[a-zA-Z0-9._]+(?<![._])$/
const FULLNAME_PATTERN = /^(?=.{2,60}$)[A-Za-zÀ-ỹ\s'-]+$/u
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

  const userName = watch('userName')
  const email = watch('email')
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const acceptTerms = watch('acceptTerms')

  const passwordChecks = useMemo(() => {
    const safePassword = password ?? ''
    return {
      minLen: safePassword.length >= 10,
      hasUpper: /[A-Z]/.test(safePassword),
      hasLower: /[a-z]/.test(safePassword),
      hasNumber: /\d/.test(safePassword),
      hasSpecial: /[^A-Za-z0-9]/.test(safePassword),
      noWhitespace: !/\s/.test(safePassword),
    }
  }, [password])

  const normalizedUserName = (userName ?? '').trim().toLowerCase()
  const normalizedEmail = (email ?? '').trim().toLowerCase()

  const passwordRules = useMemo(
    () => ({
      required: 'Mật khẩu là bắt buộc.',
      minLength: { value: 10, message: 'Mật khẩu tối thiểu 10 ký tự.' },
      maxLength: { value: 64, message: 'Mật khẩu tối đa 64 ký tự.' },
      validate: {
        upper: (value: string) => /[A-Z]/.test(value) || 'Mật khẩu cần ít nhất 1 chữ in hoa.',
        lower: (value: string) => /[a-z]/.test(value) || 'Mật khẩu cần ít nhất 1 chữ thường.',
        number: (value: string) => /\d/.test(value) || 'Mật khẩu cần ít nhất 1 chữ số.',
        special: (value: string) => /[^A-Za-z0-9]/.test(value) || 'Mật khẩu cần ít nhất 1 ký tự đặc biệt.',
        noWhitespace: (value: string) => !/\s/.test(value) || 'Mật khẩu không được chứa khoảng trắng.',
        noUserName: (value: string) =>
          !normalizedUserName || !value.toLowerCase().includes(normalizedUserName) || 'Mật khẩu không được chứa username.',
        noEmailLocalPart: (value: string) => {
          const localPart = normalizedEmail.split('@')[0]
          if (!localPart || localPart.length < 3) {
            return true
          }
          return !value.toLowerCase().includes(localPart) || 'Mật khẩu không nên chứa phần đầu email.'
        },
      },
    }),
    [normalizedEmail, normalizedUserName],
  )

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      const sanitizedUserName = values.userName.trim().toLowerCase()
      const sanitizedFullName = values.fullName.trim().replace(/\s+/g, ' ')
      const sanitizedEmail = values.email.trim().toLowerCase()

      const payload = await authService.register({
        userName: sanitizedUserName,
        fullName: sanitizedFullName,
        email: sanitizedEmail,
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
    <main className="auth-layout px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="auth-card w-full max-w-xl p-5 sm:p-7 lg:p-8">
        <p className="hero-section__eyebrow">Create account</p>
        <h1>Join InteractHub</h1>
        <p>Tạo tài khoản với tiêu chuẩn bảo mật cao để bắt đầu chia sẻ an toàn.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <TextInput
            label="Username"
            placeholder="demo_user"
            autoComplete="username"
            error={errors.userName?.message}
            {...register('userName', {
              required: 'Username là bắt buộc.',
              pattern: {
                value: USERNAME_PATTERN,
                message:
                  'Username 4-20 ký tự, chỉ gồm chữ/số/dấu chấm/gạch dưới, không bắt đầu hoặc kết thúc bằng dấu.',
              },
              setValueAs: (value: string) => value.trim().toLowerCase(),
            })}
          />

          <TextInput
            label="Họ tên"
            placeholder="Demo User"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register('fullName', {
              required: 'Họ tên là bắt buộc.',
              pattern: {
                value: FULLNAME_PATTERN,
                message: 'Họ tên chỉ nên gồm chữ cái và khoảng trắng hợp lệ, tối đa 60 ký tự.',
              },
              validate: (value) => !/\s{2,}/.test(value.trim()) || 'Họ tên không được chứa nhiều khoảng trắng liên tiếp.',
              setValueAs: (value: string) => value.trim().replace(/\s+/g, ' '),
            })}
          />

          <TextInput
            label="Email"
            type="email"
            placeholder="you@interacthub.app"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email là bắt buộc.',
              pattern: {
                value: EMAIL_PATTERN,
                message: 'Email không hợp lệ.',
              },
              setValueAs: (value: string) => value.trim().toLowerCase(),
            })}
          />

          <TextInput
            label="Mật khẩu"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', passwordRules)}
          />

          <PasswordStrength password={password ?? ''} />

          <section className="register-quality-panel" aria-live="polite">
            <h3>Yêu cầu mật khẩu</h3>
            <ul>
              <li className={passwordChecks.minLen ? 'is-valid' : ''}>
                {passwordChecks.minLen ? <CheckCircle2 size={14} aria-hidden="true" /> : <CircleAlert size={14} aria-hidden="true" />}
                Tối thiểu 10 ký tự
              </li>
              <li className={passwordChecks.hasUpper && passwordChecks.hasLower ? 'is-valid' : ''}>
                {passwordChecks.hasUpper && passwordChecks.hasLower ? (
                  <CheckCircle2 size={14} aria-hidden="true" />
                ) : (
                  <CircleAlert size={14} aria-hidden="true" />
                )}
                Có cả chữ hoa và chữ thường
              </li>
              <li className={passwordChecks.hasNumber ? 'is-valid' : ''}>
                {passwordChecks.hasNumber ? <CheckCircle2 size={14} aria-hidden="true" /> : <CircleAlert size={14} aria-hidden="true" />}
                Có ít nhất 1 chữ số
              </li>
              <li className={passwordChecks.hasSpecial ? 'is-valid' : ''}>
                {passwordChecks.hasSpecial ? (
                  <CheckCircle2 size={14} aria-hidden="true" />
                ) : (
                  <CircleAlert size={14} aria-hidden="true" />
                )}
                Có ít nhất 1 ký tự đặc biệt
              </li>
              <li className={passwordChecks.noWhitespace ? 'is-valid' : ''}>
                {passwordChecks.noWhitespace ? (
                  <CheckCircle2 size={14} aria-hidden="true" />
                ) : (
                  <CircleAlert size={14} aria-hidden="true" />
                )}
                Không chứa khoảng trắng
              </li>
            </ul>
          </section>

          <TextInput
            label="Xác nhận mật khẩu"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Vui lòng xác nhận mật khẩu.',
              validate: (value) => value === password || 'Mật khẩu xác nhận không khớp.',
            })}
          />

          <label className="register-terms">
            <input
              type="checkbox"
              {...register('acceptTerms', {
                validate: (value) => value || 'Bạn cần đồng ý điều khoản để tiếp tục.',
              })}
            />
            <span>
              Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của InteractHub.
            </span>
          </label>
          {errors.acceptTerms?.message ? <p className="form-error">{errors.acceptTerms.message}</p> : null}

          {!errors.confirmPassword?.message && confirmPassword && password !== confirmPassword ? (
            <p className="form-error">Mật khẩu xác nhận chưa khớp.</p>
          ) : null}

          {!isValid && (Object.keys(touchedFields).length > 0 || isSubmitting) ? (
            <p className="register-validation-hint">Vui lòng kiểm tra lại các trường đang báo lỗi trước khi gửi.</p>
          ) : null}

          {submitError ? <p className="form-error">{submitError}</p> : null}

          <Button type="submit" fullWidth busy={isSubmitting} disabled={!isValid || !acceptTerms}>
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
