'use client';
import { useState, useEffect } from 'react';
import styles from './ParsingAnimation.module.css';

const STEPS = [
  { id: 1, label: 'Initializing Secure Environment', layer: 0 },
  { id: 2, label: 'Unzipping UFDR Metadata', layer: 1 },
  { id: 3, label: 'Running Naive Bayes Intent Engine', layer: 1 },
  { id: 4, label: 'Mapping Entity Relationships', layer: 2 },
  { id: 5, label: 'Calculating Suspicion Scores', layer: 3 },
  { id: 6, label: 'Building Interactive Timeline', layer: 4 },
  { id: 7, label: 'Preparing Network Discovery Graph', layer: 5 },
  { id: 8, label: 'Finalizing Investigation Suite', layer: 6 },
];

export default function ParsingAnimation({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep < STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setProgress((currentStep + 1) * (100 / STEPS.length));
      }, 800 + Math.random() * 1200);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(onComplete, 1000);
      return () => clearTimeout(finishTimer);
    }
  }, [currentStep, onComplete]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.scanner} />
        <h2 className={styles.title}>AI Investigation Intelligence <span className={styles.layer}>Layer {STEPS[currentStep]?.layer || 6}</span></h2>
        
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.stepList}>
          {STEPS.map((step, idx) => (
            <div 
              key={step.id} 
              className={`${styles.step} ${idx === currentStep ? styles.active : idx < currentStep ? styles.completed : ''}`}
            >
              <div className={styles.statusDot} />
              <span className={styles.stepLabel}>{step.label}</span>
              {idx < currentStep && <span className={styles.check}>✓</span>}
            </div>
          ))}
        </div>

        <div className={styles.footerNote}>
          Automating the analysis of 15,204 forensic artifacts...
        </div>
      </div>
    </div>
  );
}
