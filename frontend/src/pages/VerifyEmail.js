import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import authService from '../services/authService';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    let active = true;
    authService.verifyEmail(token)
      .then((result) => { if (active) { setMessage(result.message); setStatus('success'); } })
      .catch((error) => {
        if (active) {
          setMessage(error.response?.data?.message || 'Could not verify this email link.');
          setStatus('error');
        }
      });
    return () => { active = false; };
  }, [token]);

  return (
    <div style={{ width: '100%', maxWidth: 440, padding: 36, borderRadius: 'var(--r-2xl)', background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Email verification</h1>
      <p role={status === 'error' ? 'alert' : 'status'} style={{ color: status === 'error' ? '#ef4444' : 'var(--text-secondary)' }}>{message}</p>
      {status === 'success' && <Link to="/login" className="inline-block px-5 py-3 rounded-lg font-bold" style={{ background: 'var(--accent)', color: 'var(--bg-root)' }}>Sign in</Link>}
      {status === 'error' && <Link to="/" style={{ color: 'var(--text-secondary)' }}>Return to GameHub</Link>}
    </div>
  );
};

export default VerifyEmail;
