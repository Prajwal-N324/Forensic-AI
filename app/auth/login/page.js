'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password.trim());
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Access restricted to authorized investigators.');
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
          <span className={styles.logoIcon}>🔬</span>
          <h1 className={styles.title}>ForensicAI <span className={styles.accent}>Query</span></h1>
          <p className={styles.subtitle}>Secure Investigator Portal</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Investigator Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@agency.gov"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Authentication Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <div className="spinner" /> : 'Authorize Access →'}
          </button>
        </form>

        <p className={styles.footer}>
          New investigator? <Link href="/auth/signup">Request Access</Link>
        </p>
      </div>
    </div>
  );
}
