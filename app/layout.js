import './globals.css';

import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export const metadata = {
  title: 'ForensicAI Query — AI-Powered Mobile Forensic Analysis',
  description: 'Analyze mobile forensic data from UFDR files using natural language queries. AI-powered intent detection, cross-data correlation, and automated suspicion scoring.',
  keywords: 'forensic analysis, UFDR, Cellebrite, mobile forensics, digital investigation, NLP, AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
