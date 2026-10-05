'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, LoginFormData } from '../schemas/login-schema';
import { useAuth } from '@/providers/auth-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, EyeSlash, ArrowRight } from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@tewba.com',
      pin: '123456',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    try {
      await signin(data.email, data.pin);
      router.push(returnUrl);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.email || err.fieldErrors.phone) {
          setError('email', { message: err.fieldErrors.email || err.fieldErrors.phone });
        }
        if (err.fieldErrors.pin) {
          setError('pin', { message: err.fieldErrors.pin });
        }
        setFormError(err.message || 'Invalid credentials. Please verify your email and PIN.');
      } else {
        setFormError('Authentication failed. Please check network connectivity.');
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-200/80">
      {/* Brand Icon Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#1e4634] flex items-center justify-center text-white shadow-md mb-4">
          <BookOpen className="w-7 h-7" weight="fill" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h2>
      </div>

      {formError && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Input
            label="Email"
            type="email"
            placeholder="e.g. admin@tewba.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Security PIN / Password <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => alert('Please contact the system administrator to reset your credentials.')}
              className="text-xs font-medium text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              Forgot PIN?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full h-10 px-3.5 pr-10 py-2 text-sm text-slate-900 bg-[#f8fafc] border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
              {...register('pin')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide PIN' : 'Show PIN'}
              title={showPassword ? 'Hide PIN' : 'Show PIN'}
            >
              {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.pin?.message && (
            <p className="text-xs text-red-600 font-medium mt-1">{errors.pin.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2 font-semibold shadow-md bg-[#1e4634] hover:bg-[#153426]"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" weight="bold" />}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}
