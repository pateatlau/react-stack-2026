/**
 * Signup Page
 * User registration with name, email, password, and role selection
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Input } from './Input';
import { Select } from './Select';
import Button from './Button';
import { UserPlus, AlertCircle, Info } from 'lucide-react';
import type { Role } from '../types/auth.types';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STARTER' as Role,
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Navigate to home when signup succeeds
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    // Name validation
    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 100) {
      errors.password = 'Password must be less than 100 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Call signup - it will update state (either success or error)
    // Navigation is handled by useEffect when isAuthenticated becomes true
    await signup({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // Don't clear general API error here - let user read it
    // Error will be cleared when they submit the form again
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join us and get started</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* Name Field */}
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              placeholder="John Doe"
              autoComplete="name"
              required
              disabled={isLoading}
            />

            {/* Email Field */}
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isLoading}
            />

            {/* Password Field */}
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              placeholder="••••••••"
              helperText="Must be at least 8 characters"
              autoComplete="new-password"
              required
              disabled={isLoading}
            />

            {/* Confirm Password Field */}
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={isLoading}
            />

            {/* Role Selection */}
            <div>
              <Select
                label="Account Type"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                options={[
                  { value: 'STARTER', label: 'Starter (REST API Only)' },
                  { value: 'PRO', label: 'Pro (REST + GraphQL)' },
                ]}
              />
              <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>Starter:</strong> Access to REST API for basic features. <br />
                  <strong>Pro:</strong> Full access including GraphQL API for advanced features.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full mt-6">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
            <Link to="/" className="inline-block text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
