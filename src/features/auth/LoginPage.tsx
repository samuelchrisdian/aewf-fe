import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Loader, Eye, EyeOff, GraduationCap, BookOpen, Users, Shield } from 'lucide-react';
import { useAuth } from './hooks';

const LoginPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent | React.MouseEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      setValidationError('');
      setError('');

      // Validation
      if (!username || !password) {
        setValidationError('Username dan password harus diisi');
        return;
      }

      if (username.length < 3) {
        setValidationError('Username minimal 3 karakter');
        return;
      }

      try {
        setIsLoading(true);
        await authLogin({ email: username, password }); // AuthProvider will map email to username
        navigate('/', { replace: true });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login gagal';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [username, password, navigate, authLogin]
  );

  const fillDemoCredentials = useCallback((type: 'teacher' | 'admin') => {
    if (type === 'teacher') {
      setUsername('teacher1');
      setPassword('password123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex">
      {/* Left Side - Branding (Full Height) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-32 right-20 w-48 h-48 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 right-32 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-1/4 left-32 w-24 h-24 border-4 border-white rounded-full"></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <GraduationCap className="w-9 h-9 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Sekolah Kristen Pelita Kasih Lawang</h2>
              <p className="text-blue-100 text-sm mt-1">Sistem Informasi Akademik</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Platform Terpadu untuk Pendidikan</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                Kelola administrasi sekolah, pantau perkembangan siswa, dan tingkatkan kolaborasi tim dengan sistem informasi yang modern dan efisien.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">Manajemen Pembelajaran</h4>
                  <p className="text-blue-100">Pantau perkembangan akademik siswa secara real-time dengan laporan yang komprehensif</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">Kolaborasi Tim</h4>
                  <p className="text-blue-100">Komunikasi yang efektif antara guru, admin, dan stakeholder sekolah</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">Keamanan Data</h4>
                  <p className="text-blue-100">Sistem keamanan berlapis untuk melindungi data siswa dan institusi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-blue-100 text-sm">
            © Sekolah Kristen Pelita Kasih Lawang. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form (Full Height) */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sekolah Kristen Pelita Kasih Lawang</h2>
            </div>
          </div>
          <div className="hidden lg:block text-sm text-gray-600">
            Butuh bantuan? <span className="text-blue-600 font-semibold cursor-pointer">Hubungi Admin</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Selamat Datang
              </h1>
              <p className="text-gray-600 text-lg">Silakan masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {/* Username Field */}
            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit();
                      }
                    }}
                    placeholder="Masukkan username"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-base"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit();
                      }
                    }}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-base"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Messages */}
              {(error || validationError) && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error || validationError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={() => handleSubmit()}
                type="button"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md text-base"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk ke Sistem'
                )}
              </button>

              {/* Demo Credentials */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-4">
                  Akun Demo untuk Testing
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('teacher')}
                    className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left"
                    disabled={isLoading}
                  >
                    <p className="text-sm font-semibold text-blue-900 mb-2">👨‍🏫 Guru</p>
                    <p className="text-xs text-blue-700 mb-1">Username: teacher1</p>
                    <p className="text-xs text-blue-600">Password: password123</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('admin')}
                    className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
                    disabled={isLoading}
                  >
                    <p className="text-sm font-semibold text-gray-900 mb-2">👤 Admin</p>
                    <p className="text-xs text-gray-700 mb-1">Username: admin</p>
                    <p className="text-xs text-gray-600">Password: admin123</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 text-center">
          <p className="text-sm text-gray-600">
            Dilindungi dengan enkripsi tingkat enterprise • <span className="text-blue-600 font-semibold">Sistem Aman</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;