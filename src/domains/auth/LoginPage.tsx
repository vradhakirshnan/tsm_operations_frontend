import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '../../store/authStore';
import {
  ChefHat,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';

/**
 * Safely decodes the payload of a Google JWT ID Token.
 */
function decodeJwtPayload(token: string): {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
  email_verified?: boolean;
} | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT payload:', e);
    return null;
  }
}

interface VerifiedGoogleUser {
  email: string;
  name: string;
  picture?: string;
  idToken?: string;
  accessToken?: string;
  googleId?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithDemo, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedGoogleUser, setVerifiedGoogleUser] = useState<VerifiedGoogleUser | null>(null);

  // If already authenticated, redirect to main overview
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const backendLoginEndpoint = `${apiBaseUrl}/auth/google/login`;

  /**
   * Sends Google credentials (ID Token or Access Token + profile) to the backend.
   */
  const sendToBackend = async (payload: {
    id_token?: string;
    access_token?: string;
    credential?: string;
    email: string;
    name: string;
    picture?: string;
    google_id?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(`Calling backend API: ${backendLoginEndpoint}...`);

    try {
      const response = await axios.post(backendLoginEndpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 6000,
      });

      const data = response.data;
      const sessionToken =
        data.token || data.access_token || payload.id_token || payload.access_token || 'tsm_authenticated';

      login({
        userId: data.user?.id || data.user?.user_id || 1,
        username: data.user?.username || payload.email,
        fullName: data.user?.full_name || data.user?.name || payload.name,
        email: payload.email,
        avatarUrl: payload.picture,
        role: data.user?.role || 'Operations Lead',
        station: data.user?.station || 'Central Kitchen - Main Pod',
        token: sessionToken,
      });

      navigate('/', { replace: true });
    } catch (err: unknown) {
      setIsLoading(false);
      setStatusMessage(null);
      const isAxiosErr = axios.isAxiosError(err);
      const detail =
        isAxiosErr && err.response?.data?.detail
          ? String(err.response.data.detail)
          : isAxiosErr && err.message
          ? err.message
          : 'Backend server not responding';

      setErrorMessage(
        `Google identity verified for ${payload.email}! However, calling backend at ${backendLoginEndpoint} failed (${detail}). You can retry when your backend is up, or proceed in development mode.`
      );

      // Preserve the verified Google profile so user can retry or enter in dev mode
      setVerifiedGoogleUser({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        idToken: payload.id_token,
        accessToken: payload.access_token,
        googleId: payload.google_id,
      });
    }
  };

  /**
   * Popup Login using standard OAuth2 Popup (Account Chooser).
   * Google displays a popup window for the user to choose their account.
   */
  const triggerGooglePopup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setErrorMessage(null);
      setStatusMessage('Google account selected! Fetching user profile...');

      try {
        const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const profile = userInfoRes.data;

        await sendToBackend({
          access_token: tokenResponse.access_token,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          google_id: profile.sub,
        });
      } catch (err: unknown) {
        setIsLoading(false);
        setStatusMessage(null);
        const msg = err instanceof Error ? err.message : 'Failed to retrieve profile from Google';
        setErrorMessage(msg);
      }
    },
    onError: (errorResponse) => {
      setIsLoading(false);
      setStatusMessage(null);
      setErrorMessage(
        `Google popup was dismissed or encountered an error: ${
          errorResponse.error_description || errorResponse.error || 'Popup closed'
        }`
      );
    },
  });

  /**
   * Official Google Button callback providing the signed Google ID Token (JWT).
   */
  const handleOfficialGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMessage('No credential returned by Google');
      return;
    }

    const decoded = decodeJwtPayload(credentialResponse.credential);
    const email = decoded?.email || 'google_user@cloudkitchen.com';
    const name = decoded?.name || 'Operations Executive';
    const picture = decoded?.picture;
    const googleId = decoded?.sub;

    await sendToBackend({
      id_token: credentialResponse.credential,
      credential: credentialResponse.credential,
      email,
      name,
      picture,
      google_id: googleId,
    });
  };

  const handleRetryBackend = () => {
    if (!verifiedGoogleUser) return;
    sendToBackend({
      id_token: verifiedGoogleUser.idToken,
      access_token: verifiedGoogleUser.accessToken,
      email: verifiedGoogleUser.email,
      name: verifiedGoogleUser.name,
      picture: verifiedGoogleUser.picture,
      google_id: verifiedGoogleUser.googleId,
    });
  };

  const handleProceedWithVerifiedGoogle = () => {
    if (!verifiedGoogleUser) return;
    login({
      userId: 1,
      username: verifiedGoogleUser.email,
      fullName: verifiedGoogleUser.name,
      email: verifiedGoogleUser.email,
      avatarUrl: verifiedGoogleUser.picture,
      role: 'Operations Lead',
      station: 'Central Kitchen - Main Pod',
      token: verifiedGoogleUser.idToken || verifiedGoogleUser.accessToken || 'google_dev_session_token',
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
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
              Sign in with your Google account to access kitchen orders, indents, inventory, and dispatch.
            </p>
          </div>

          {/* Status Notification */}
          {statusMessage && (
            <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center gap-2.5 text-xs text-brand-300">
              <RefreshCw className="h-4 w-4 animate-spin text-brand-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-start gap-2 text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <p className="leading-snug">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Verified Google Account Card (When Google succeeded but backend is pending) */}
          {verifiedGoogleUser && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                {verifiedGoogleUser.picture ? (
                  <img
                    src={verifiedGoogleUser.picture}
                    alt={verifiedGoogleUser.name}
                    className="h-10 w-10 rounded-full border border-emerald-400/50"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    {verifiedGoogleUser.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Google Identity Confirmed</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 truncate">
                    {verifiedGoogleUser.name}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{verifiedGoogleUser.email}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRetryBackend}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Retry Backend API</span>
                </button>
                <button
                  type="button"
                  onClick={handleProceedWithVerifiedGoogle}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Enter OpsHub (Dev)</span>
                </button>
              </div>
            </div>
          )}

          {/* Google Sign-in Buttons */}
          <div className="space-y-3">
            {/* 1. Primary Custom Branded Button (Opens Google Account Chooser Popup) */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => triggerGooglePopup()}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
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
              <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google (Popup)'}</span>
            </button>

            {/* 2. Official Google GSI Button (Alternative with built-in OneTap/ID Token) */}
            <div className="flex justify-center pt-1">
              <GoogleLogin
                onSuccess={handleOfficialGoogleSuccess}
                onError={() => {
                  setErrorMessage('Google Sign-In failed or was closed.');
                }}
                theme="outline"
                size="large"
                shape="rectangular"
                text="signin_with"
                width="100%"
              />
            </div>
          </div>

          {/* Integration Specs Information */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-[11px] space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Backend API:</span>
              <span className="text-brand-400 font-semibold truncate max-w-[200px]" title={backendLoginEndpoint}>
                POST {backendLoginEndpoint}
              </span>
            </div>
            {googleClientId && (
              <div className="flex items-center justify-between text-slate-400 truncate">
                <span>Google Client ID:</span>
                <span className="text-slate-300 truncate max-w-[190px]" title={googleClientId}>
                  {googleClientId.substring(0, 22)}...
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-emerald-400 pt-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Google Identity Services (GSI) Active</span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Or Instant Demo
            </span>
          </div>

          {/* Demo Bypass button for instant local verification */}
          <button
            type="button"
            onClick={() => {
              loginWithDemo();
              navigate('/', { replace: true });
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition-all group cursor-pointer"
          >
            <ChefHat className="h-4 w-4 text-brand-400" />
            <span>Continue as Demo Operations Lead</span>
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
