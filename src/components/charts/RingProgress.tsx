import { cn } from '@/lib/utils';

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export default function RingProgress({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  color,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = () => {
    if (color) return color;
    if (progress >= 90) return '#ef4444';
    if (progress >= 70) return '#fb923c';
    return '#2dd4bf';
  };

  const strokeColor = getColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className={cn('font-bold text-primary-800', size > 100 ? 'text-2xl' : 'text-lg')}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-primary-500 mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
