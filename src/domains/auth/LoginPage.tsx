import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChefHat, AlertCircle, ArrowRight, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithDemo, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to main overview
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const redirectUri = `${window.location.origin}/auth/callback`;
  const backendLoginEndpoint = `${apiBaseUrl}/auth/google/login`;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Try querying backend login endpoint via API request first
      // Some backends return JSON: { "url": "https://accounts.google.com/..." } or direct token
      const response = await axios.get(backendLoginEndpoint, {
        params: {
          redirect_uri: redirectUri,
          client_id: googleClientId,
        },
        timeout: 4000,
        headers: {
          Accept: 'application/json',
        },
      });

      // If backend returns a redirect or authorization URL
      if (response.data?.url || response.data?.authorization_url || response.data?.redirect_url) {
        const targetUrl = response.data.url || response.data.authorization_url || response.data.redirect_url;
        window.location.href = targetUrl;
        return;
      }

      // If backend directly returned an access token
      if (response.data?.token || response.data?.access_token) {
        const token = response.data.token || response.data.access_token;
        useAuthStore.getState().login({
          userId: response.data.user?.id || response.data.user?.user_id || 1,
          username: response.data.user?.username || response.data.user?.email || 'google_user',
          fullName: response.data.user?.full_name || response.data.user?.name || 'Operations Executive',
          email: response.data.user?.email,
          role: response.data.user?.role || 'Operations Lead',
          station: response.data.user?.station || 'Central Kitchen - Main Pod',
          token,
        });
        navigate('/', { replace: true });
        return;
      }

      // If response received without specific field, redirect directly to the endpoint in browser
      window.location.href = `${backendLoginEndpoint}?redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(googleClientId)}`;
    } catch (err: unknown) {
      // If the backend returned a network error or is expected to handle direct browser redirect (e.g. 302 redirect),
      // we can either redirect the browser directly or report the status if the server is offline.
      const isAxiosErr = axios.isAxiosError(err);

      // If it's a 302 or redirect or browser CORS on redirect
      if (isAxiosErr && err.response?.status === 302) {
        window.location.href = `${backendLoginEndpoint}?redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(googleClientId)}`;
        return;
      }

      setIsLoading(false);
      const detail = isAxiosErr && err.response?.data?.detail
        ? err.response.data.detail
        : isAxiosErr && err.message
        ? err.message
        : 'Failed to connect to backend login API.';

      setErrorMessage(
        `Unable to reach ${backendLoginEndpoint}. (${detail}) Make sure your backend service is running, or test direct redirect / demo mode below.`
      );
    }
  };

  const handleDirectRedirect = () => {
    const url = `${backendLoginEndpoint}?redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(googleClientId)}`;
    window.location.href = url;
  };

  const handleDemoLogin = () => {
    loginWithDemo();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 shadow-xl shadow-brand-500/20 text-white text-2xl font-black mb-2">
            🍽️
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            TSM OpsHub
            <span className="text-xs font-bold text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-full border border-brand-500/30">
              PRO
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Cloud Kitchen Operations & Supply Chain Management Hub
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-base font-bold text-slate-100">Operations Console Login</h2>
            <p className="text-xs text-slate-400">
              Sign in with your corporate Google Workspace account to access kitchen indents, order boards, inventory, and dispatch.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-start gap-2 text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <p className="leading-snug">{errorMessage}</p>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDirectRedirect}
                  className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 underline flex items-center gap-1"
                >
                  <span>Try Direct Browser Navigation</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Google Sign-in Button */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          </div>

          {/* Operational Target Box */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-[11px] space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Backend API Target:</span>
              <span className="text-brand-400 font-semibold">{backendLoginEndpoint}</span>
            </div>
            {googleClientId && (
              <div className="flex items-center justify-between text-slate-400 truncate">
                <span>Google Client ID:</span>
                <span className="text-slate-300 truncate max-w-[190px]">
                  {googleClientId.substring(0, 18)}...
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-emerald-400 pt-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>OAuth 2.0 Corporate Access</span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Testing Mode
            </span>
          </div>

          {/* Demo Bypass button for instant local verification */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition-all group"
          >
            <ChefHat className="h-4 w-4 text-brand-400" />
            <span>Quick Demo Login (Operations Lead)</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5" />
          <span>Internal Cloud Kitchen System • Authorized Personnel Only</span>
        </div>
      </div>
    </div>
  );
};
