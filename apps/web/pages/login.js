import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState('email'); // 'email', 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, signInWithGoogle, signInWithPhone, setupRecaptcha, currentUser } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/maps');
    }
  }, [currentUser, router]);

  // Setup reCAPTCHA for phone auth
  useEffect(() => {
    if (authMethod === 'phone') {
      setupRecaptcha('recaptcha-container');
    }
  }, [authMethod, setupRecaptcha]);

  async function handleEmailAuth(e) {
    e.preventDefault();

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);

      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          return setError('Please enter your name');
        }
        await signup(email, password, displayName);
      }

      router.push('/maps');
    } catch (error) {
      console.error('Auth error:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        default:
          setError('Failed to ' + (isLogin ? 'sign in' : 'create account'));
      }
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      router.push('/maps');
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google');
      setLoading(false);
    }
  }

  async function handlePhoneSignIn(e) {
    e.preventDefault();

    if (!confirmationResult) {
      // Send verification code
      try {
        setError('');
        setLoading(true);

        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
        const recaptchaVerifier = window.recaptchaVerifier;

        const result = await signInWithPhone(formattedPhone, recaptchaVerifier);
        setConfirmationResult(result);
        setError('Verification code sent!');
        setLoading(false);
      } catch (error) {
        console.error('Phone auth error:', error);
        setError('Failed to send verification code. Please check your phone number.');
        setLoading(false);
      }
    } else {
      // Verify code
      try {
        setError('');
        setLoading(true);

        await confirmationResult.confirm(verificationCode);
        router.push('/maps');
      } catch (error) {
        console.error('Code verification error:', error);
        setError('Invalid verification code');
        setLoading(false);
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d9f99d 0%, #bbf7d0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#16a34a',
            marginBottom: '8px'
          }}>
            FoodieMaps
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1rem'
          }}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: error.includes('sent') ? '#d1fae5' : '#fee',
            color: error.includes('sent') ? '#065f46' : '#c33',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Auth Method Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setError('');
              setConfirmationResult(null);
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: authMethod === 'email' ? '2px solid #16a34a' : 'none',
              color: authMethod === 'email' ? '#16a34a' : '#999',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setError('');
              setConfirmationResult(null);
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: authMethod === 'phone' ? '2px solid #16a34a' : 'none',
              color: authMethod === 'phone' ? '#16a34a' : '#999',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Phone
          </button>
        </div>

        {/* Email/Password Form */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuth}>
            {/* Name field (only for signup) */}
            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                placeholder="Enter your email"
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                placeholder="Enter your password"
              />
              <p style={{
                fontSize: '0.8rem',
                color: '#999',
                marginTop: '4px'
              }}>
                Must be at least 6 characters
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#ccc' : '#16a34a',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                marginBottom: '16px'
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.backgroundColor = '#15803d';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.backgroundColor = '#16a34a';
              }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        )}

        {/* Phone Number Form */}
        {authMethod === 'phone' && (
          <form onSubmit={handlePhoneSignIn}>
            {!confirmationResult ? (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    placeholder="+1234567890"
                  />
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Include country code (e.g., +1 for US)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: loading ? '#ccc' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s',
                    marginBottom: '16px'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.target.style.backgroundColor = '#15803d';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) e.target.style.backgroundColor = '#16a34a';
                  }}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    placeholder="Enter 6-digit code"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: loading ? '#ccc' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s',
                    marginBottom: '16px'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.target.style.backgroundColor = '#15803d';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) e.target.style.backgroundColor = '#16a34a';
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </>
            )}
          </form>
        )}

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
          <span style={{ padding: '0 12px', color: '#999', fontSize: '0.9rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: 'white',
            color: '#333',
            border: '2px solid #e0e0e0',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.borderColor = '#16a34a';
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.borderColor = '#e0e0e0';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Toggle between login/signup (only for email) */}
        {authMethod === 'email' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setDisplayName('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#16a34a',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        )}

        {/* Back to landing */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Back to home
          </button>
        </div>

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
