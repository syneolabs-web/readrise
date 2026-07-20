'use client';

import { Header } from '@/components/header';
import Link from 'next/link';
import { ReadriseLogo } from '@/components/marketing/ReadriseLogo';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  /**
   * An invite link sends people here with ?next=/join/CODE so the code isn't
   * lost in the sign-in round trip.
   *
   * Read at submit time from window.location rather than useSearchParams():
   * that hook forces a Suspense boundary during static prerender and fails
   * the build for a page that is otherwise perfectly static.
   *
   * Only same-origin paths are honoured — an open redirect is a phishing gift.
   */
  function nextPath() {
    if (typeof window === 'undefined') return '/circles';
    const raw = new URLSearchParams(window.location.search).get('next');
    return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/circles';
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || name.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }
      router.push(nextPath());
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper flex flex-col relative overflow-hidden transition-colors duration-700">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-24">
        <div className="w-full max-w-md">
          <div className="bg-raised rounded-3xl p-8 sm:p-12 shadow-2xl shadow-ink/5 border border-rule/50 backdrop-blur-xl">
            <div className="flex justify-center mb-8">
              <Link href="/" className="flex flex-col items-center gap-3 group hover:opacity-80 transition-opacity">
                <ReadriseLogo />
              </Link>
            </div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-ink mb-2">Create an account</h1>
              <p className="text-ink-soft text-sm">Enter your details to get started</p>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate={false}>
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-ink block">Name</label>
                <input 
                  id="name"
                  name="name"
                  type="text" 
                  placeholder="John Doe" 
                  required
                  minLength={2}
                  maxLength={50}
                  autoComplete="name"
                  className="w-full px-4 py-3 bg-paper border border-rule rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all invalid:focus:ring-red-500/50 invalid:focus:border-red-500"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-ink block">Email</label>
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="name@example.com" 
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-paper border border-rule rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all invalid:focus:ring-red-500/50 invalid:focus:border-red-500"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-ink block">Password</label>
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  title="Must contain at least 8 characters"
                  className="w-full px-4 py-3 bg-paper border border-rule rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all invalid:focus:ring-red-500/50 invalid:focus:border-red-500"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-ink text-paper hover:bg-ink/90 font-medium rounded-xl shadow-lg shadow-ink/10 transition-all active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-paper" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing up...
                  </>
                ) : 'Sign up'}
              </button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-sm text-ink-soft">
                Already have an account? <Link href="/login" className="font-medium text-amber-600 hover:text-amber-500 transition-colors">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
