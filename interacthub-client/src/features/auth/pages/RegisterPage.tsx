import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AtSign, CheckCircle2, CircleAlert, Mail, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { PasswordStrength } from '../../../shared/components/auth/PasswordStrength'
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
      required: 'Password is required.',
      minLength: { value: 10, message: 'Password must be at least 10 characters.' },
      maxLength: { value: 64, message: 'Password must be at most 64 characters.' },
      validate: {
        upper: (value: string) => /[A-Z]/.test(value) || 'Include at least one uppercase letter.',
        lower: (value: string) => /[a-z]/.test(value) || 'Include at least one lowercase letter.',
        number: (value: string) => /\d/.test(value) || 'Include at least one number.',
        special: (value: string) => /[^A-Za-z0-9]/.test(value) || 'Include at least one special character.',
        noWhitespace: (value: string) => !/\s/.test(value) || 'Password cannot contain whitespace.',
        noUserName: (value: string) =>
          !normalizedUserName || !value.toLowerCase().includes(normalizedUserName) || 'Password cannot include your username.',
        noEmailLocalPart: (value: string) => {
          const localPart = normalizedEmail.split('@')[0]
          if (!localPart || localPart.length < 3) {
            return true
          }
          return !value.toLowerCase().includes(localPart) || 'Password should not include the email local-part.'
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
    <motion.main
      className="auth-layout"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <section className="auth-card">
        <p className="auth-card__eyebrow">Create account</p>
        <h1>Join InteractHub</h1>
        <p>Create your account to start connecting, posting and sharing stories.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <AuthTextField
            label="Username"
            placeholder="demo_user"
            autoComplete="username"
            error={errors.userName?.message}
            icon={<AtSign size={18} aria-hidden="true" />}
            {...register('userName', {
              required: 'Username is required.',
              pattern: {
                value: USERNAME_PATTERN,
                message:
                  'Use 4-20 characters with letters, numbers, dots or underscores.',
              },
              setValueAs: (value: string) => value.trim().toLowerCase(),
            })}
          />

          <AuthTextField
            label="Full name"
            placeholder="Demo User"
            autoComplete="name"
            error={errors.fullName?.message}
            icon={<UserRound size={18} aria-hidden="true" />}
            {...register('fullName', {
              required: 'Full name is required.',
              pattern: {
                value: FULLNAME_PATTERN,
                message: 'Only letters and valid spaces are allowed, up to 60 characters.',
              },
              validate: (value) => !/\s{2,}/.test(value.trim()) || 'Please avoid repeated spaces.',
              setValueAs: (value: string) => value.trim().replace(/\s+/g, ' '),
            })}
          />

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
                value: EMAIL_PATTERN,
                message: 'Please enter a valid email address.',
              },
              setValueAs: (value: string) => value.trim().toLowerCase(),
            })}
          />

          <AuthPasswordField
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', passwordRules)}
          />

          <PasswordStrength password={password ?? ''} />

          <section className="register-quality-panel" aria-live="polite">
            <h3>Password requirements</h3>
            <ul>
              <li className={passwordChecks.minLen ? 'is-valid' : ''}>
                {passwordChecks.minLen ? <CheckCircle2 size={14} aria-hidden="true" /> : <CircleAlert size={14} aria-hidden="true" />}
                At least 10 characters
              </li>
              <li className={passwordChecks.hasUpper && passwordChecks.hasLower ? 'is-valid' : ''}>
                {passwordChecks.hasUpper && passwordChecks.hasLower ? (
                  <CheckCircle2 size={14} aria-hidden="true" />
                ) : (
                  <CircleAlert size={14} aria-hidden="true" />
                )}
                Include uppercase and lowercase letters
              </li>
              <li className={passwordChecks.hasNumber ? 'is-valid' : ''}>
                {passwordChecks.hasNumber ? <CheckCircle2 size={14} aria-hidden="true" /> : <CircleAlert size={14} aria-hidden="true" />}
                Include at least one number
              </li>
              <li className={passwordChecks.hasSpecial ? 'is-valid' : ''}>
                {passwordChecks.hasSpecial ? (
                  <CheckCircle2 size={14} aria-hidden="true" />
                ) : (
                  <CircleAlert size={14} aria-hidden="true" />
                )}
                Include at least one special character
              </li>
              <li className={passwordChecks.noWhitespace ? 'is-valid' : ''}>
                {passwordChecks.noWhitespace ? (
                  <CheckCircle2 size={14} aria-hidden="true" />
                ) : (
                  <CircleAlert size={14} aria-hidden="true" />
                )}
                No whitespace
              </li>
            </ul>
          </section>

          <AuthPasswordField
            label="Confirm password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password.',
              validate: (value) => value === password || 'Passwords do not match.',
            })}
          />

          <label className="auth-check">
            <input
              type="checkbox"
              {...register('acceptTerms', {
                validate: (value) => value || 'You must accept the terms to continue.',
              })}
            />
            <span>
              I agree to InteractHub Terms of Use and Privacy Policy.
            </span>
          </label>
          {errors.acceptTerms?.message ? <p className="auth-field__error">{errors.acceptTerms.message}</p> : null}

          {!errors.confirmPassword?.message && confirmPassword && password !== confirmPassword ? (
            <p className="auth-field__error">Passwords do not match.</p>
          ) : null}

          {!isValid && (Object.keys(touchedFields).length > 0 || isSubmitting) ? (
            <p className="register-validation-hint">Please fix validation errors before submitting.</p>
          ) : null}

          {submitError ? <AuthErrorMessage message={submitError} /> : null}

          <Button type="submit" fullWidth busy={isSubmitting} disabled={!isValid || !acceptTerms} className="auth-submit-btn">
            Create account
          </Button>
        </form>

        <p className="auth-card__footnote">
          Already have an account? <Link to={ROUTES.login}>Sign in</Link>
        </p>
      </section>
    </motion.main>
  )
}
