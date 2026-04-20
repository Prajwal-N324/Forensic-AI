'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './auth.module.css';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    setError('');
    try {
      await signup(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.ambientGlow} />
      <div className={styles.authCard}>
        <div className={styles.header}>
          <span className={styles.logoIcon}>📑</span>
          <h1 className={styles.title}>Register <span className={styles.accent}>Credential</span></h1>
          <p className={styles.subtitle}>Institutional Forensic Access</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Establish Investigator Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="e.g. j.doe@interpol.int"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Master Security Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Confirm Master Key</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <div className="spinner" /> : 'Create Investigator Profile →'}
          </button>
        </form>

        <p className={styles.footer}>
          Already registered? <Link href="/auth/login">Access Vault</Link>
        </p>
      </div>
    </div>
  );
}
