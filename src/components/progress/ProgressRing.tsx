import { useState, useEffect } from 'react';

interface Props {
  spotted: number;
  total: number;
  size: number;
  color: string;
  children?: React.ReactNode;
}

export default function ProgressRing({ spotted, total, size, color, children }: Props) {
  const [mounted, setMounted] = useState(false);
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total ? spotted / total : 0;
  const offset = mounted ? circ * (1 - pct) : circ;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="dash-ring-svg" style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--w06)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      {children && <div className="dash-ring-icon">{children}</div>}
    </div>
  );
}
