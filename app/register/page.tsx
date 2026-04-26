import { Suspense } from 'react'
import AuthForm from '@/components/auth/AuthForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <Suspense fallback={<div className="text-center text-slate-500 font-medium">Loading auth...</div>}>
         <AuthForm defaultTab="register" />
      </Suspense>
    </div>
  )
}
