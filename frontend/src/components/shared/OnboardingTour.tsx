// src/components/shared/OnboardingTour.tsx
import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'body',
    title: 'Welcome to NetEdu!',
    description: 'Let me show you around. NetEdu helps you learn effectively even with slow internet by measuring your connection and adapting content.',
    position: 'bottom',
  },
  {
    target: '[href="/dashboard"]',
    title: 'Dashboard',
    description: 'See your learning progress, network quality trends, and how your connectivity affects your studies.',
    position: 'right',
  },
  {
    target: '[href="/network"]',
    title: 'Network Testing',
    description: 'Run real speed tests to measure your download, upload, and latency. We use the same methodology as M-Lab!',
    position: 'right',
  },
  {
    target: '[href="/learning"]',
    title: 'Learning',
    description: 'Browse courses and lessons. Content adapts to your network speed - videos when fast, text when slow.',
    position: 'right',
  },
  {
    target: '.theme-toggle',
    title: 'Theme Toggle',
    description: 'Switch between dark and light mode for comfortable viewing anytime.',
    position: 'bottom',
  },
];

export default function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('netedu-tour-completed');
    if (!hasSeenTour) {
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const step = TOUR_STEPS[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      let top = rect.bottom + 10;
      let left = rect.left;

      if (step.position === 'right') {
        top = rect.top;
        left = rect.right + 10;
      } else if (step.position === 'top') {
        top = rect.top - 200;
        left = rect.left;
      }

      setPosition({ top, left });
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('netedu-tour-completed', 'true');
    setIsActive(false);
  };

  const handleSkip = () => {
    localStorage.setItem('netedu-tour-completed', 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9998,
        }}
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <div
        className="card fade-in"
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          maxWidth: '360px',
          zIndex: 9999,
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{step.title}</h3>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '.25rem',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '.875rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {step.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
            {currentStep + 1} / {TOUR_STEPS.length}
          </div>

          <div style={{ display: 'flex', gap: '.5rem' }}>
            {currentStep > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={handlePrev}>
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleNext}>
              {currentStep < TOUR_STEPS.length - 1 ? (
                <>Next <ArrowRight size={14} /></>
              ) : (
                'Got it!'
              )}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '.25rem', marginTop: '1rem', justifyContent: 'center' }}>
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? '24px' : '8px',
                height: '4px',
                borderRadius: '2px',
                background: i === currentStep ? 'var(--brand-500)' : 'var(--border)',
                transition: 'all .3s',
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
