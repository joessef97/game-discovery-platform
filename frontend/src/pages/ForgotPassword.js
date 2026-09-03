import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setStatus('success');
      setMessage(res.data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,245,60,0.06) 0%, transparent 70%)',
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-2xl)',
        padding: '40px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.3s ease-out',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--accent-dim)', border: '1px solid rgba(212,245,60,0.2)',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔑</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)',
            fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--text-primary)', margin: 0,
          }}>
            Forgot Password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 8 }}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {status === 'success' ? (
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 'var(--r-lg)',
            padding: '20px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>✉️</div>
            <p style={{ color: '#22c55e', fontWeight: 600, margin: '0 0 8px' }}>Check your inbox!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              {message}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 16, opacity: 0.7 }}>
              (Dev mode: check your backend console for the reset link)
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {status === 'error' && (
              <div className="error" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: 'var(--text-sm)' }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                marginTop: 4,
                padding: '11px 0',
                background: status === 'loading' ? 'rgba(212,245,60,0.5)' : 'var(--accent)',
                color: '#0a0a0f',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'var(--text-sm)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                border: 'none',
                borderRadius: 'var(--r-md)',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease',
              }}
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
