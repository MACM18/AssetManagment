"use client";

import { useState } from "react";
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

export default function RegisterForm({
  onSwitchToLogin,
  onClose,
}: RegisterFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail(email, password, displayName);
      onClose?.();
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      onClose?.();
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to sign up with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto p-8 rounded-2xl shadow-2xl border backdrop-blur-lg'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold'>
          Create Your Account
        </h2>
        <p className='mt-2'>
          Join to start tracking your investments
        </p>
      </div>

      {error && (
        <div className='mb-4 p-4 border rounded-lg text-sm flex items-start gap-2'>
          <span className='text-lg'>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className='space-y-5'>
        <div>
          <label
            htmlFor='displayName'
            className='block text-sm font-semibold mb-2'
          >
            Display Name
          </label>
          <input
            id='displayName'
            type='text'
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className='w-full px-4 py-3 border rounded-lg focus:outline-none transition-all'
            placeholder='John Doe'
          />
        </div>

        <div>
          <label
            htmlFor='email'
            className='block text-sm font-semibold mb-2'
          >
            Email Address
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-4 py-3 border rounded-lg focus:outline-none transition-all'
            placeholder='you@example.com'
          />
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-semibold mb-2'
          >
            Password
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full px-4 py-3 border rounded-lg focus:outline-none transition-all'
            placeholder='••••••••'
          />
        </div>

        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-semibold mb-2'
          >
            Confirm Password
          </label>
          <input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className='w-full px-4 py-3 border rounded-lg focus:outline-none transition-all'
            placeholder='••••••••'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full py-3 px-4 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]'
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-3 font-medium'>
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className='mt-4 w-full flex items-center justify-center gap-3 border py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md transition-all'
        >
          <svg className='w-5 h-5' viewBox='0 0 24 24'>
            <path fill='currentColor' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
            <path fill='currentColor' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
            <path fill='currentColor' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
            <path fill='currentColor' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
          </svg>
          Sign up with Google
        </button>
      </div>

      <p className='mt-6 text-center text-sm'>
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className='font-medium underline'
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
