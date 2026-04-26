'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

type TabType = 'login' | 'register'
type RoleType = 'client' | 'engineer'

interface AuthFormProps {
  defaultTab?: TabType
}

export default function AuthForm({ defaultTab = 'login' }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedRole = searchParams.get('role') as RoleType | null

  const [tab, setTab] = useState<TabType>(defaultTab)
  const [role, setRole] = useState<RoleType>(preSelectedRole === 'engineer' ? 'engineer' : 'client')
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    setTab(defaultTab)
  }, [defaultTab])

  const handleResetPassword = async () => {
    setError(null)
    setSuccessMsg(null)
    if (!email) {
      setError("Enter your email address first.")
      return
    }
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (resetError) {
      setError("Failed to send reset email. Please try again.")
    } else {
      setSuccessMsg("Password reset email sent. Check your inbox.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (tab === 'register') {
        // Register directly via client-side Supabase (works without service role key)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role,
            }
          }
        })

        if (signUpError) {
          if (signUpError.message.toLowerCase().includes('already registered') || signUpError.status === 422) {
            setError('This email is already registered. Try logging in instead.')
          } else {
            throw signUpError
          }
          return
        }

        if (!signUpData.user) {
          throw new Error('Registration failed. Please try again.')
        }

        // Upsert into public.users — handles the case where a Supabase trigger
        // already created a row (possibly with a wrong/default role). This ensures
        // the correct role and name are always saved.
        const { error: upsertError } = await supabase.from('users').upsert({
          id: signUpData.user.id,
          email,
          full_name: name,
          role,
        }, { onConflict: 'id' });
        if (upsertError) {
          console.warn('User profile upsert warning:', upsertError.message);
        }

        // Auto sign in after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError

        if (role === 'client') {
          router.push('/dashboard/client')
        } else {
          router.push('/dashboard/engineer')
        }

      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (signInError) {
           if (signInError.message.includes('Invalid login credentials')) {
              throw new Error('Wrong email or password. Please try again.')
           } else if (signInError.message.includes('Email not confirmed')) {
              throw new Error('Please check your email and confirm your account first.')
           } else {
              throw new Error('Login failed. Please try again.')
           }
        }
        
        if (!authData.user) throw new Error('Login failed. Please try again.')

        // Query public.users for role
        const { data: userData } = await supabase
           .from('users')
           .select('role')
           .eq('id', authData.user.id)
           .single()
        
        // Fallback: read role from user_metadata if DB row doesn't exist yet
        const userRole = (userData?.role as string | undefined) || authData.user.user_metadata?.role

        if (userRole === 'engineer') {
            router.push('/dashboard/engineer')
        } else {
            router.push('/dashboard/client')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDummyLogin = async (dummyRole: 'engineer' | 'client') => {
    const dummyEmail = dummyRole === 'engineer' ? 'engineer@example.com' : 'client@example.com';
    const dummyPass = 'password123';
    const dummyName = dummyRole === 'engineer' ? 'Test Engineer' : 'Test Client';
    
    setLoading(true);
    setError(null);
    try {
      let { error: signInError } = await supabase.auth.signInWithPassword({ email: dummyEmail, password: dummyPass });
      if (signInError) {
         // Try to register if it fails
         const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
           email: dummyEmail, password: dummyPass, options: { data: { full_name: dummyName, role: dummyRole } }
         });
         if (signUpError) throw signUpError;
         if (signUpData.user) {
             await supabase.from('users').upsert({ id: signUpData.user.id, email: dummyEmail, full_name: dummyName, role: dummyRole });
             
             if (dummyRole === 'engineer') {
               await supabase.from('engineer_profiles').upsert({
                 user_id: signUpData.user.id,
                 headline: 'Experienced Dummy Structural Engineer',
                 bio: 'This is a test engineer profile automatically generated for demonstration purposes.',
                 city: 'Quezon City',
                 province: 'Metro Manila',
                 hourly_rate: 800,
                 years_experience: 5,
                 specializations: ['Structural', 'Civil'],
                 project_types: ['Commercial', 'Residential'],
                 skills: ['AutoCAD', 'STAAD.Pro'],
                 prc_verified: true,
                 average_rating: 4.8,
                 total_reviews: 12
               });
             }
         }
         await supabase.auth.signInWithPassword({ email: dummyEmail, password: dummyPass });
      }
      
      router.push(dummyRole === 'engineer' ? '/dashboard/engineer' : '/dashboard/client');
    } catch (err: any) {
      setError(err.message || 'Dummy login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${
              tab === 'register' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${
              tab === 'login' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Log In
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <Link href="/">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-950 rounded-xl shadow-sm mb-4 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-2xl font-bold font-serif text-blue-500">BS</span>
              </div>
            </Link>
            <h2 className="text-2xl font-bold text-slate-900">
              {tab === 'register' ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {tab === 'register' ? 'Join BuildLinkPH and connect with top pros.' : 'Log in to your BuildLinkPH account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      role === 'client' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-semibold text-sm mb-0.5 ${role === 'client' ? 'text-blue-700' : 'text-slate-700'}`}>I want to hire</div>
                    <div className="text-xs text-slate-500">Find an engineer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('engineer')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      role === 'engineer' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-semibold text-sm mb-0.5 ${role === 'engineer' ? 'text-blue-700' : 'text-slate-700'}`}>I am an engineer</div>
                    <div className="text-xs text-slate-500">Find projects</div>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} /> }
              </button>
            </div>

            {tab === 'login' && (
              <div className="flex justify-end pt-1">
                <button type="button" onClick={handleResetPassword} className="text-sm font-medium text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-lg py-3.5 font-semibold hover:bg-blue-700 transition flex items-center justify-center mt-6 disabled:opacity-70"
            >
              {loading ? (
                 <Loader2 className="animate-spin" size={20} />
              ) : (
                tab === 'register' ? 'Create Account' : 'Log In'
              )}
            </button>
            
            {error && (
              <p className="text-red-500 text-sm text-center font-medium mt-2 animate-pulse">
                {error}
              </p>
            )}
            
            {successMsg && (
              <p className="text-emerald-600 text-sm text-center font-medium mt-2 animate-fade-in">
                {successMsg}
              </p>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {tab === 'register' ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')} className="font-semibold text-blue-600 hover:underline">
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => setTab('register')} className="font-semibold text-blue-600 hover:underline">
                  Sign up
                </button>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center font-bold text-slate-400 mb-4 uppercase tracking-wider">For Testing Purposes</p>
            <div className="flex flex-col gap-2">
               <button 
                 type="button" 
                 onClick={() => handleDummyLogin('engineer')}
                 className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
               >
                 Log in as Dummy Engineer
               </button>
               <button 
                 type="button" 
                 onClick={() => handleDummyLogin('client')}
                 className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
               >
                 Log in as Dummy Client
               </button>
            </div>
          </div>
        </div>
      </div>
  )
}
