import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [statusText, setStatusText] = useState('Verifying Google credentials with backend...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Check for token directly in query parameters or hash
      const token = searchParams.get('token') || searchParams.get('access_token');
      const errorParam = searchParams.get('error') || searchParams.get('error_description');
      const code = searchParams.get('code');

      if (errorParam) {
        setError(`Google Authentication Error: ${errorParam}`);
        return;
      }

      // If backend redirected with token in query params
      if (token) {
        setStatusText('Authentication successful! Logging into Operations Hub...');
        login({
          userId: Number(searchParams.get('user_id')) || 1,
          username: searchParams.get('username') || searchParams.get('email') || 'google_user',
          fullName: searchParams.get('name') || 'Operations Executive',
          email: searchParams.get('email') || undefined,
          role: searchParams.get('role') || 'Operations Lead',
          station: searchParams.get('station') || 'Central Kitchen - Main Pod',
          token,
        });

        setTimeout(() => {
          navigate('/', { replace: true });
        }, 600);
        return;
      }

      // If Google returned authorization code, forward it to backend callback API
      if (code) {
        setStatusText('Exchanging authorization code with backend...');
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        try {
          const response = await axios.get(`${apiBaseUrl}/auth/google/callback`, {
            params: { code },
          });

          const data = response.data;
          const receivedToken = data?.token || data?.access_token || 'google_auth_jwt_token';

          login({
            userId: data?.user?.id || data?.user?.user_id || 1,
            username: data?.user?.username || data?.user?.email || 'google_user',
            fullName: data?.user?.full_name || data?.user?.name || 'Operations Executive',
            email: data?.user?.email,
            role: data?.user?.role || 'Operations Lead',
            station: data?.user?.station || 'Central Kitchen - Main Pod',
            token: receivedToken,
          });

          navigate('/', { replace: true });
        } catch (err: unknown) {
          const isAxios = axios.isAxiosError(err);
          setError(
            isAxios && err.response?.data?.detail
              ? err.response.data.detail
              : isAxios && err.message
              ? err.message
              : 'Failed to verify authorization code with backend.'
          );
        }
        return;
      }

      // If no token or code found
      setError('No authentication token or authorization code was found in the callback URL.');
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
        {error ? (
          <>
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Authentication Failed</h3>
              <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Authenticating</h3>
              <p className="text-xs text-slate-400">{statusText}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
