/**
 * UFDR Service - Orchestrates the simulated upload and analysis of UFDR files.
 * Tracks forensic history via Firestore.
 */

import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { generateCase } from './CaseFactory';

/**
 * Simulate "parsing" a UFDR file and generating a Sector-specific case.
 */
export async function analyzeNewUFDR(sectorKey = 'NARCOTICS') {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required for forensic analysis.');

  // 1. Generate the Mimicked Case Data
  const caseData = generateCase(sectorKey);

  // 2. Persist to Firestore for history
  const caseRef = await addDoc(collection(db, `users/${user.uid}/cases`), {
    ...caseData,
    creatorUid: user.uid,
    analyzedAt: serverTimestamp(),
    fileName: `UFDR_EXPORT_${caseData.metadata.id}.zip`,
    sector: sectorKey
  });

  return { id: caseRef.id, ...caseData };
}

/**
 * Fetch investigator's case history.
 */
export async function getCaseHistory() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, `users/${user.uid}/cases`),
    orderBy('analyzedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
