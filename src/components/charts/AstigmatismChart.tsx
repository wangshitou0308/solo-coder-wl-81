import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import type { OptometryRecord } from '@/types';
import { formatDateShort } from '@/utils/dateUtils';
import { sortOptometryByDate } from '@/utils/visionUtils';

interface Props {
  records: OptometryRecord[];
  height?: number;
}

export default function AstigmatismChart({ records, height = 320 }: Props) {
  const sorted = sortOptometryByDate(records);
  const leftData = sorted.map((r) => ({
    date: formatDateShort(r.examDate),
    axis: r.leftEye.axis,
    cylinder: Math.abs(r.leftEye.cylinder),
    label: '左眼',
  }));
  const rightData = sorted.map((r) => ({
    date: formatDateShort(r.examDate),
    axis: r.rightEye.axis,
    cylinder: Math.abs(r.rightEye.cylinder),
    label: '右眼',
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="axis"
            name="轴位"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 180]}
            unit="°"
            label={{ value: '轴位 (°)', position: 'bottom', offset: 0, style: { fontSize: 12, fill: '#64748b' } }}
          />
          <YAxis
            type="number"
            dataKey="cylinder"
            name="散光度数"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            unit="D"
            label={{ value: '散光 (D)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#64748b' } }}
          />
          <ZAxis type="number" range={[60, 200]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
            formatter={(value: number, name: string) => {
              if (name === '轴位') return [`${value}°`, name];
              if (name === '散光度数') return [`${value.toFixed(2)}D`, name];
              return [value, name];
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="circle"
            formatter={(value) => <span className="text-sm text-primary-700">{value}</span>}
          />
          <Scatter name="左眼" data={leftData} fill="#1e3a5f" fillOpacity={0.7} />
          <Scatter name="右眼" data={rightData} fill="#2dd4bf" fillOpacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
