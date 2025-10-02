import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Wrench, User, Store, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UserRole } from '../../types';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'customer' as UserRole,
    phone: '',
  });

  const roles = [
    {
      value: 'customer' as UserRole,
      label: 'Customer',
      icon: User,
      description: 'Buy parts and request services',
    },
    {
      value: 'vendor' as UserRole,
      label: 'Vendor',
      icon: Store,
      description: 'Sell parts and manage inventory',
    },
    {
      value: 'mechanic' as UserRole,
      label: 'Mechanic',
      icon: Settings,
      description: 'Provide repair services',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
      });

      toast.success('Account created successfully!');
      navigate('/profile-setup');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Wrench className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">Join AutoServe today</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  1
                </div>
                <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  2
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 px-4">
              <span className="text-sm text-gray-600">Choose Role</span>
              <span className="text-sm text-gray-600">Your Details</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
                How would you like to use AutoServe?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.value })}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        formData.role === role.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon
                        className={`h-12 w-12 mx-auto mb-3 ${
                          formData.role === role.value ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      />
                      <h4 className="font-semibold text-gray-900 mb-1">{role.label}</h4>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </button>
                  );
                })}
              </div>
              <Button type="button" onClick={() => setStep(2)} className="w-full mt-6">
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />

              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />

              <Input
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                helperText="At least 8 characters"
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                  Back
                </Button>
                <Button type="submit" className="w-full" loading={loading}>
                  Create Account
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
