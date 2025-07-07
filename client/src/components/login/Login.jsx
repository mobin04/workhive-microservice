import React, { useContext, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Briefcase, Sun, Moon, ArrowRight, Send } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

const Login = () => {
  const {isDark} = useContext(ThemeContext)
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordlessEmail, setPasswordlessEmail] = useState('');
  const [isPasswordlessMode, setIsPasswordlessMode] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const handleLogin = () => {
    // Login logic will be handled by parent component
    console.log('Login attempt:', { email, password });
  };

  const handlePasswordlessLogin = () => {
    // Passwordless login logic will be handled by parent component
    console.log('Passwordless login attempt:', { email: passwordlessEmail });
    setLinkSent(true);
  };

  const resetPasswordlessState = () => {
    setIsPasswordlessMode(false);
    setLinkSent(false);
    setPasswordlessEmail('');
  };

  const LoginthemeClasses = isDark 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-50 text-gray-900';

  const cardClasses = isDark 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  const inputClasses = isDark 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500';

  return (
    <div className={`min-h-screen ${LoginthemeClasses} transition-colors duration-300`}>
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden m-15 rounded-3xl">
          <div className="relative z-10 flex flex-col mx-auto justify-center items-center text-white p-12">
            <div className=" bg-opacity-20 backdrop-blur-sm p-4 rounded-2xl mb-8">
              <Briefcase className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6 text-center">WorkHive</h1>
            <p className="text-xl text-center text-blue-100 max-w-md leading-relaxed">
              Your gateway to endless career opportunities. Connect with top employers and find your dream job today.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-blue-200">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl font-bold">25K+</div>
                <div className="text-blue-200">Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold">100K+</div>
                <div className="text-blue-200">Job Seekers</div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white opacity-5 rounded-full"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  WorkHive
                </h1>
              </div>
            </div>

            <div className={`${cardClasses} rounded-2xl shadow-xl border p-8 transition-all duration-300`}>
              {!isPasswordlessMode ? (
                /* Regular Login Form */
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sign in to your WorkHive account
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-10 pr-12 py-3 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Login Button */}
                    <button
                      onClick={handleLogin}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    {/* Passwordless Login */}
                    <div className="text-center">
                      <button
                        onClick={() => setIsPasswordlessMode(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Login without password
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Passwordless Login Mode */
                <>
                  {!linkSent ? (
                    /* Email Input for Passwordless */
                    <>
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Login Without Password</h2>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Enter your email to receive a secure login link
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="email"
                              value={passwordlessEmail}
                              onChange={(e) => setPasswordlessEmail(e.target.value)}
                              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handlePasswordlessLogin}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>Send Login Link</span>
                        </button>

                        <div className="text-center">
                          <button
                            onClick={resetPasswordlessState}
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Back to password login
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Link Sent Confirmation */
                    <div className="text-center py-8">
                      <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                        We've sent a secure login link to <span className="font-medium">{passwordlessEmail}</span>
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-6`}>
                        Click the link in your email to complete your login. The link will expire in 15 minutes.
                      </p>
                      <button
                        onClick={resetPasswordlessState}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Divider and Sign Up Link - Only show in regular login mode */}
              {!isPasswordlessMode && (
                <>
                  <div className="my-8 flex items-center">
                    <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <span className={`px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      or
                    </span>
                    <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  </div>

                  <div className="text-center">
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Don't have an account?{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        Sign up for free
                      </a>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;