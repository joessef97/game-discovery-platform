import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const strength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s; // 0-4
  };

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const s = strength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setStatus('loading');
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setStatus('success');
      setMessage(res.data.message);
      // Auto-login the user with the returned token
      if (res.data.token && res.data.user) {
        setSession({ token: res.data.token, user: res.data.user });
        setTimeout(() => navigate('/'), 1800);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Reset failed. The link may have expired.');
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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--accent-dim)', border: '1px solid rgba(212,245,60,0.2)',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)',
            fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--text-primary)', margin: 0,
          }}>
            New Password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 8 }}>
            Choose a strong password for your account
          </p>
        </div>

        {status === 'success' ? (
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 'var(--r-lg)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
            <p style={{ color: '#22c55e', fontWeight: 700, margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>
              Password Reset!
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Redirecting you to GameHub…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {status === 'error' && (
              <div className="error" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: 'var(--text-sm)' }}>
                {message}
              </div>
            )}

            {/* New password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--text-primary)',
                    padding: '10px 40px 10px 14px',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: 0, display: 'flex',
                  }}
                >
                  {showPw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {[0,1,2,3].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 4,
                        background: i < s ? strengthColor[s - 1] : 'rgba(255,255,255,0.08)',
                        transition: 'background 300ms ease',
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: strengthColor[s - 1] || 'var(--text-muted)', marginTop: 4 }}>
                    {s > 0 ? strengthLabel[s - 1] : 'Too weak'}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${confirm && confirm !== password ? '#ef4444' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)',
                    color: 'var(--text-primary)',
                    padding: '10px 40px 10px 14px',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = confirm && confirm !== password ? '#ef4444' : 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: 0, display: 'flex',
                  }}
                >
                  {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <span style={{ fontSize: 'var(--text-xs)', color: '#ef4444' }}>Passwords don't match</span>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || (confirm && confirm !== password)}
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
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
