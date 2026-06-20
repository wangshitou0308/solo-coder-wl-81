import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { OptometryRecord } from '@/types';
import { formatDateShort } from '@/utils/dateUtils';
import { sortOptometryByDate } from '@/utils/visionUtils';

interface Props {
  records: OptometryRecord[];
  height?: number;
  showLegend?: boolean;
}

export default function VisionTrendChart({ records, height = 300, showLegend = true }: Props) {
  const sorted = sortOptometryByDate(records);
  const data = sorted.map((r) => ({
    date: formatDateShort(r.examDate),
    左眼: r.leftEye.sphere,
    右眼: r.rightEye.sphere,
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="leftGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#3870a1" />
            </linearGradient>
            <linearGradient id="rightGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}D`}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
            formatter={(value: number) => [`${value.toFixed(2)}D`]}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
              formatter={(value) => <span className="text-sm text-primary-700">{value}</span>}
            />
          )}
          <Line
            type="monotone"
            dataKey="左眼"
            stroke="url(#leftGradient)"
            strokeWidth={3}
            dot={{ fill: '#1e3a5f', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, fill: '#1e3a5f' }}
          />
          <Line
            type="monotone"
            dataKey="右眼"
            stroke="url(#rightGradient)"
            strokeWidth={3}
            dot={{ fill: '#2dd4bf', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, fill: '#2dd4bf' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
