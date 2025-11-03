'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PATIENT' as 'DOCTOR' | 'PATIENT',
  });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center">Create Account</h2>
        </div>
        {error && (
          <p className="text-red-600 text-center bg-red-50 p-2 rounded">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value as 'DOCTOR' | 'PATIENT',
                }))
              }
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Sign Up
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}