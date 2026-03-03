// src/components/shared/Skeleton.tsx
import { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

export default function Skeleton({ width = '100%', height = '1rem', borderRadius = '4px', className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <Skeleton width="60%" height="1.5rem" style={{ marginBottom: '1rem' }} />
      <Skeleton width="100%" height="1rem" style={{ marginBottom: '.5rem' }} />
      <Skeleton width="80%" height="1rem" style={{ marginBottom: '1rem' }} />
      <Skeleton width="40%" height="2rem" borderRadius="8px" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '.75rem 0', borderBottom: '1px solid var(--border)' }}>
          <Skeleton width="30%" height="1rem" />
          <Skeleton width="20%" height="1rem" />
          <Skeleton width="25%" height="1rem" />
          <Skeleton width="25%" height="1rem" />
        </div>
      ))}
    </div>
  );
}
