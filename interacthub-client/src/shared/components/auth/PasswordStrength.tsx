type PasswordStrengthProps = {
  password: string
}

const rules = [
  (value: string) => value.length >= 8,
  (value: string) => /[A-Z]/.test(value),
  (value: string) => /[a-z]/.test(value),
  (value: string) => /\d/.test(value),
  (value: string) => /[^A-Za-z0-9]/.test(value),
]

function getStrength(password: string): { label: 'Weak' | 'Medium' | 'Strong'; score: number } {
  const score = rules.reduce((sum, check) => (check(password) ? sum + 1 : sum), 0)

  if (score <= 2) {
    return { label: 'Weak', score }
  }

  if (score <= 4) {
    return { label: 'Medium', score }
  }

  return { label: 'Strong', score }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { label, score } = getStrength(password)

  return (
    <div className="password-strength" aria-live="polite">
      <div className="password-strength__bars">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={index < score ? 'password-strength__bar password-strength__bar--active' : 'password-strength__bar'}
          />
        ))}
      </div>
      <p>Password strength: {password ? label : 'N/A'}</p>
    </div>
  )
}
