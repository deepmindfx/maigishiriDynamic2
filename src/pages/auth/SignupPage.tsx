import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle, Gift, CreditCard, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import { supabase } from '../../lib/supabase';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const { siteName, siteLogoUrl } = useAppSettingsStore();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCode || '',
    bvn: '',
    createVirtualAccount: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  useEffect(() => {
    if (referralCode) {
      setFormData(prev => ({ ...prev, referralCode }));
      verifyReferralCode(referralCode);
    }
  }, [referralCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Reset verification status when referral code changes
    if (name === 'referralCode') {
      setCodeVerified(false);
    }
  };

  const verifyReferralCode = async (code: string) => {
    if (!code.trim()) return;
    
    setIsVerifyingCode(true);
    try {
      // Check if the referral code exists in the database
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('referral_code', code.trim())
        .maybeSingle();
      
      if (error) throw error;
      
      setCodeVerified(!!data);
      
      if (!data) {
        setErrors(prev => ({ 
          ...prev, 
          referralCode: 'Invalid referral code. Please check and try again.' 
        }));
      } else {
        // Clear any previous error
        setErrors(prev => ({ 
          ...prev, 
          referralCode: '' 
        }));
      }
    } catch (error) {
      console.error('Error verifying referral code:', error);
      setCodeVerified(false);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^(\+234|0)[789]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Nigerian phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate referral code if provided
    if (formData.referralCode && !codeVerified) {
      newErrors.referralCode = 'Please verify the referral code first';
    }

    // Validate BVN if virtual account creation is selected
    if (formData.createVirtualAccount) {
      if (!formData.bvn) {
        newErrors.bvn = 'BVN is required for virtual account creation';
      } else if (!/^\d{11}$/.test(formData.bvn)) {
        newErrors.bvn = 'BVN must be 11 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Only pass BVN if virtual account creation is selected
      const bvn = formData.createVirtualAccount ? formData.bvn : undefined;
      
      await signup(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.phone, 
        formData.referralCode,
        bvn
      );
      navigate('/');
    } catch (error: any) {
      // Check if the error is specifically about user already existing
      if (error.message?.includes('User already registered') || 
          error.message?.includes('user_already_exists')) {
        setErrors({ 
          general: 'An account with this email already exists. Please sign in instead or use a different email address.' 
        });
      } else if (error.message?.includes('Invalid referral code')) {
        setErrors({ 
          referralCode: 'Invalid referral code. Please check and try again.',
          general: 'Invalid referral code. Please check and try again.'
        });
      } else {
        setErrors({ general: error.message || 'An error occurred during signup. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C204D] to-[#3A2B61] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            {siteLogoUrl ? (
              <img src={siteLogoUrl} alt={siteName} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-[#2C204D] font-bold text-2xl">{siteName.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-300">Join thousands of users enjoying seamless digital services</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/10 backdrop-blur-sm py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {/* Referral Code Notice */}
          {formData.referralCode && codeVerified && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-start gap-3">
              <Gift className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-green-300 text-sm mb-1">
                  🎉 You're invited!
                </h4>
                <p className="text-green-300 text-sm">
                  You'll earn bonus rewards when you complete your first deposit using referral code: <strong>{formData.referralCode}</strong>
                </p>
              </div>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <span className="text-red-300 text-sm">{errors.general}</span>
                {errors.general.includes('already exists') && (
                  <div className="mt-2">
                    <Link
                      to="/login"
                      className="text-white hover:text-gray-200 font-medium text-sm underline"
                    >
                      Go to Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-300">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-300">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., +234 801 234 5678"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-300">{errors.phone}</p>
              )}
            </div>

            {/* Referral Code Field */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-300 mb-2">
                Referral Code <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={handleChange}
                  onBlur={() => {
                    if (formData.referralCode && !codeVerified) {
                      verifyReferralCode(formData.referralCode);
                    }
                  }}
                  className={`w-full pl-10 pr-10 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 ${
                    errors.referralCode ? 'border-red-500/50' : codeVerified ? 'border-green-500/50' : 'border-white/20'
                  }`}
                  placeholder="Enter referral code (if any)"
                />
                {codeVerified && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="text-green-400" size={18} />
                  </div>
                )}
              </div>
              {errors.referralCode && (
                <p className="mt-1 text-sm text-red-300">{errors.referralCode}</p>
              )}
              {formData.referralCode && !codeVerified && !errors.referralCode && (
                <button
                  type="button"
                  onClick={() => verifyReferralCode(formData.referralCode)}
                  className="mt-2 text-sm text-blue-300 font-medium"
                  disabled={isVerifyingCode}
                >
                  {isVerifyingCode ? 'Verifying...' : 'Verify Code'}
                </button>
              )}
            </div>

            {/* Virtual Account Option */}
            <div className="bg-blue-500/20 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <input
                  id="createVirtualAccount"
                  name="createVirtualAccount"
                  type="checkbox"
                  checked={formData.createVirtualAccount}
                  onChange={(e) => setFormData({...formData, createVirtualAccount: e.target.checked})}
                  className="h-4 w-4 text-[#2C204D] focus:ring-[#2C204D] border-gray-300 rounded"
                />
                <label htmlFor="createVirtualAccount" className="ml-2 block text-sm font-medium text-gray-300">
                  Create Virtual Account for Wallet Funding
                </label>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Get a dedicated bank account number for easy wallet funding via bank transfer.
              </p>
              
              {formData.createVirtualAccount && (
                <div className="mt-3">
                  <label htmlFor="bvn" className="block text-sm font-medium text-gray-300 mb-2">
                    Bank Verification Number (BVN)
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="bvn"
                      name="bvn"
                      type="text"
                      value={formData.bvn}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 ${
                        errors.bvn ? 'border-red-500/50' : 'border-white/20'
                      }`}
                      placeholder="Enter your 11-digit BVN"
                      maxLength={11}
                    />
                  </div>
                  {errors.bvn && (
                    <p className="mt-1 text-sm text-red-300">{errors.bvn}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Your BVN is required by Flutterwave to create a permanent virtual account. Your data is secure and will not be shared with third parties.
                  </p>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-300">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-300">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-300 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-300 hover:underline">Privacy Policy</Link>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-[#2C204D] py-3 px-4 rounded-xl font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2C204D] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#2C204D] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-white hover:text-gray-200 font-semibold transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;