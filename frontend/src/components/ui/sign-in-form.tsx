import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SignInFormProps {
  onGoogleSignIn: () => void
}

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.9 6-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6v-5.3H5.9a20 20 0 0 0 0 18.2l6.9-5.3Z" />
      <path fill="#EA4335" d="M24 12c3 0 5.6 1 7.7 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.9 14.9l6.9 5.3C14.4 15.5 18.8 12 24 12Z" />
    </svg>
  )
}

export default function SignInForm({ onGoogleSignIn }: SignInFormProps) {
  return (
    <div className="signin-form">
      <Button type="button" variant="outline" size="lg" onClick={onGoogleSignIn}>
        <GoogleMark />
        Continue with Google
        <ArrowUpRight className="ml-auto h-4 w-4" aria-hidden="true" />
      </Button>

      <div className="signin-note">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="m-0">Your Google account secures this workspace. We never store your Google password.</p>
      </div>
    </div>
  )
}
