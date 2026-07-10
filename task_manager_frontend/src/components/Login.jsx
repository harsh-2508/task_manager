import React, { useState } from 'react';
import { api } from '../api';
import { Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Login({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(username, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        onAuthSuccess();
      } else {
        const data = await api.register(username, email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        onAuthSuccess();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel animate-fade-in">
        <div style={styles.header}>
          <h1 style={styles.title}>TaskSphere</h1>
          <p style={styles.subtitle}>
            {isLogin ? 'Manage your daily tasks effectively' : 'Create an account to start tracking'}
          </p>
        </div>

        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tabButton,
              borderBottom: isLogin ? '2px solid var(--primary)' : '2px solid transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button
            style={{
              ...styles.tabButton,
              borderBottom: !isLogin ? '2px solid var(--primary)' : '2px solid transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorAlert}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Enter username"
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                style={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.submitButton}
            className="pulse-glow-hover"
          >
            {loading ? 'Please wait...' : isLogin ? (
              <>
                <LogIn size={18} style={{ marginRight: 8 }} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} style={{ marginRight: 8 }} /> Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(to right, #a78bfa, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tabButton: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    transition: 'var(--transition)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  errorAlert: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--danger)',
    fontSize: '14px',
    fontWeight: '500',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '15px',
    transition: 'var(--transition)',
  },
  eyeButton: {
    position: 'absolute',
    right: '16px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '14px',
    background: 'var(--primary)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: '10px',
    boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)',
  },
};
