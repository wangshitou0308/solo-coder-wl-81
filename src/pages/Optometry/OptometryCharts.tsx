import { useState } from 'react';
import Card from '@/components/ui/Card';
import VisionTrendChart from '@/components/charts/VisionTrendChart';
import AstigmatismChart from '@/components/charts/AstigmatismChart';
import { useOptometryStore } from '@/store/optometryStore';
import {
  sortOptometryByDate,
  calculateSphereChange,
  getDegreeChangeSummary,
  calculateSphericalEquivalent,
  getAxisFluctuation,
} from '@/utils/visionUtils';
import { formatDate, formatSphere, formatDateShort } from '@/utils/dateUtils';
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
import {
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Minus,
  AlertTriangle,
  Activity,
} from 'lucide-react';

export default function OptometryCharts() {
  const records = useOptometryStore((s) => s.records);
  const sorted = sortOptometryByDate(records);
  const [compareMode, setCompareMode] = useState(false);
  const [selected1, setSelected1] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowRight className="w-4 h-4 text-warning-500 rotate-45" />;
    if (value < 0) return <ArrowLeft className="w-4 h-4 text-accent-500 -rotate-45" />;
    return <Minus className="w-4 h-4 text-primary-400" />;
  };

  const getChangeColor = (value: number) => {
    if (Math.abs(value) >= 0.5) return 'text-red-600';
    if (Math.abs(value) > 0) return 'text-warning-600';
    return 'text-primary-500';
  };

  const getDegreeChangeBg = (value: number) => {
    if (Math.abs(value) >= 0.5) return 'bg-red-50 border-red-200';
    if (Math.abs(value) > 0) return 'bg-amber-50 border-amber-200';
    return 'bg-emerald-50 border-emerald-200';
  };

  const getDegreeChangeText = (value: number) => {
    if (Math.abs(value) >= 0.5) return 'text-red-700';
    if (Math.abs(value) > 0) return 'text-amber-700';
    return 'text-emerald-700';
  };

  const getDegreeChangeLabel = (value: number) => {
    if (Math.abs(value) >= 0.5) return '变化较大';
    if (Math.abs(value) > 0) return '轻微变化';
    return '基本稳定';
  };

  const rec1 = selected1 ? sorted.find((r) => r.id === selected1) : null;
  const rec2 = selected2 ? sorted.find((r) => r.id === selected2) : null;
  const change = rec1 && rec2 ? calculateSphereChange(rec2, rec1) : null;

  const latestChange =
    sorted.length >= 2
      ? (() => {
          const latest = sorted[sorted.length - 1];
          const prev = sorted[sorted.length - 2];
          const sphereChange = calculateSphereChange(latest, prev);
          return {
            leftSphere: sphereChange.left,
            rightSphere: sphereChange.right,
            leftSE: Number((calculateSphericalEquivalent(latest.leftEye) - calculateSphericalEquivalent(prev.leftEye)).toFixed(2)),
            rightSE: Number((calculateSphericalEquivalent(latest.rightEye) - calculateSphericalEquivalent(prev.rightEye)).toFixed(2)),
            leftCylinder: Number((latest.leftEye.cylinder - prev.leftEye.cylinder).toFixed(2)),
            rightCylinder: Number((latest.rightEye.cylinder - prev.rightEye.cylinder).toFixed(2)),
          };
        })()
      : null;

  const halfYearSummary = getDegreeChangeSummary(records, 6);
  const yearSummary = getDegreeChangeSummary(records, 12);

  const seChartData = sorted.map((r) => ({
    date: formatDateShort(r.examDate),
    左眼SE: calculateSphericalEquivalent(r.leftEye),
    右眼SE: calculateSphericalEquivalent(r.rightEye),
    左眼球镜: r.leftEye.sphere,
    右眼球镜: r.rightEye.sphere,
  }));

  const axisData = sorted.length >= 2 ? getAxisFluctuation(sorted) : null;

  const formatChangeValue = (v: number) => {
    return `${v > 0 ? '+' : ''}${v.toFixed(2)}D`;
  };

  const renderDegreeCard = (
    label: string,
    data: { leftSphere: number; rightSphere: number; leftSE: number; rightSE: number; leftCylinder: number; rightCylinder: number } | null,
    periodLabel: string,
  ) => {
    if (!data) {
      return (
        <div className="flex-1 min-w-[260px] glass-card p-5 border border-primary-100">
          <p className="text-sm font-medium text-primary-600 mb-1">{label}</p>
          <p className="text-xs text-primary-400">{periodLabel}内暂无对比数据</p>
        </div>
      );
    }

    return (
      <div className="flex-1 min-w-[260px] glass-card p-5 border border-primary-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-primary-600">{label}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${getDegreeChangeBg(Math.max(Math.abs(data.leftSphere), Math.abs(data.rightSphere), Math.abs(data.leftSE), Math.abs(data.rightSE)))} ${getDegreeChangeText(Math.max(Math.abs(data.leftSphere), Math.abs(data.rightSphere), Math.abs(data.leftSE), Math.abs(data.rightSE)))}`}>
            {getDegreeChangeLabel(Math.max(Math.abs(data.leftSphere), Math.abs(data.rightSphere), Math.abs(data.leftSE), Math.abs(data.rightSE)))}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary-500">左眼球镜</span>
            <span className={`text-sm font-semibold ${getChangeColor(data.leftSphere)}`}>
              {formatChangeValue(data.leftSphere)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary-500">右眼球镜</span>
            <span className={`text-sm font-semibold ${getChangeColor(data.rightSphere)}`}>
              {formatChangeValue(data.rightSphere)}
            </span>
          </div>
          <div className="border-t border-primary-100 my-1" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary-500">左眼等效球镜</span>
            <span className={`text-sm font-semibold ${getChangeColor(data.leftSE)}`}>
              {formatChangeValue(data.leftSE)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary-500">右眼等效球镜</span>
            <span className={`text-sm font-semibold ${getChangeColor(data.rightSE)}`}>
              {formatChangeValue(data.rightSE)}
            </span>
          </div>
          <div className="border-t border-primary-100 my-1" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary-500">左眼柱镜</span>
            <span className={`text-sm font-semibold ${getChangeColor(data.leftCylinder)}`}>
              {formatChangeValue(data.leftCylinder)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary-500">右眼柱镜</span>
            <span className={`text-sm font-semibold ${getChangeColor(data.rightCylinder)}`}>
              {formatChangeValue(data.rightCylinder)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderAxisBar = (min: number, max: number, range: number, isAbnormal: boolean) => {
    const fullRange = 180;
    const leftPercent = (min / fullRange) * 100;
    const widthPercent = (range / fullRange) * 100;
    return (
      <div className="w-full h-6 bg-primary-100 rounded-full relative mt-1">
        <div
          className={`absolute h-full rounded-full ${isAbnormal ? 'bg-red-400' : 'bg-primary-400'}`}
          style={{ left: `${leftPercent}%`, width: `${Math.max(widthPercent, 1)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-primary-700">
          {min}° — {max}°
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary-700" />
          <p className="text-primary-600">
            基于 <span className="font-semibold text-primary-800">{records.length}</span> 条验光记录的分析结果
          </p>
        </div>
        <button
          onClick={() => {
            setCompareMode(!compareMode);
            setSelected1(null);
            setSelected2(null);
          }}
          className={compareMode ? 'btn-accent' : 'btn-secondary'}
        >
          <Target className="w-4 h-4" />
          {compareMode ? '退出对比' : '对比两次验光'}
        </button>
      </div>

      {compareMode && (
        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">选择两次验光进行对比</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">基准验光</label>
              <select
                className="input-field"
                value={selected1 || ''}
                onChange={(e) => setSelected1(e.target.value || null)}
              >
                <option value="">请选择...</option>
                {sorted.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatDate(r.examDate)} - {r.organization}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">对比验光</label>
              <select
                className="input-field"
                value={selected2 || ''}
                onChange={(e) => setSelected2(e.target.value || null)}
              >
                <option value="">请选择...</option>
                {sorted.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatDate(r.examDate)} - {r.organization}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {change && rec1 && rec2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-primary-50/70 rounded-xl">
              <div>
                <p className="text-sm text-primary-500 mb-2">左眼变化</p>
                <div className="flex items-center gap-3">
                  {getChangeIcon(change.left)}
                  <span className={`text-2xl font-bold ${getChangeColor(change.left)}`}>
                    {change.left > 0 ? '+' : ''}
                    {change.left.toFixed(2)}D
                  </span>
                  <span className="text-sm text-primary-500">
                    {formatSphere(rec1.leftEye.sphere)} → {formatSphere(rec2.leftEye.sphere)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-primary-500 mb-2">右眼变化</p>
                <div className="flex items-center gap-3">
                  {getChangeIcon(change.right)}
                  <span className={`text-2xl font-bold ${getChangeColor(change.right)}`}>
                    {change.right > 0 ? '+' : ''}
                    {change.right.toFixed(2)}D
                  </span>
                  <span className="text-sm text-primary-500">
                    {formatSphere(rec1.rightEye.sphere)} → {formatSphere(rec2.rightEye.sphere)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-5 h-5 text-primary-700" strokeWidth={2} />
          <h3 className="font-serif text-lg font-semibold text-primary-800">度数变化概要</h3>
          <span className="text-xs text-primary-400 ml-2">各时间段度数变化对比</span>
        </div>
        <div className="flex flex-wrap gap-4">
          {renderDegreeCard('最近一次', latestChange, '最近两次记录')}
          {renderDegreeCard('近半年', halfYearSummary, '近6个月')}
          {renderDegreeCard('近一年', yearSummary, '近12个月')}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-primary-700" strokeWidth={2} />
          <h3 className="font-serif text-lg font-semibold text-primary-800">度数变化趋势</h3>
        </div>
        {sorted.length >= 2 ? (
          <VisionTrendChart records={sorted} height={350} />
        ) : (
          <div className="h-[350px] flex items-center justify-center text-primary-400">
            <p>需要至少2条验光记录以显示趋势图</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-primary-700" strokeWidth={2} />
          <h3 className="font-serif text-lg font-semibold text-primary-800">等效球镜趋势</h3>
        </div>
        <p className="text-xs text-primary-400 mb-4">
          等效球镜 = 球镜 + 柱镜/2，直观展示整体屈光变化
        </p>
        {sorted.length >= 2 ? (
          <div className="w-full" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="seLeftGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1e3a5f" />
                    <stop offset="100%" stopColor="#3870a1" />
                  </linearGradient>
                  <linearGradient id="seRightGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  <linearGradient id="sphereLeftGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                  <linearGradient id="sphereRightGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
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
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-primary-700">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="左眼SE"
                  stroke="url(#seLeftGrad)"
                  strokeWidth={3}
                  dot={{ fill: '#1e3a5f', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#1e3a5f' }}
                />
                <Line
                  type="monotone"
                  dataKey="右眼SE"
                  stroke="url(#seRightGrad)"
                  strokeWidth={3}
                  dot={{ fill: '#2dd4bf', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#2dd4bf' }}
                />
                <Line
                  type="monotone"
                  dataKey="左眼球镜"
                  stroke="url(#sphereLeftGrad)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#6366f1', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 5, fill: '#6366f1' }}
                />
                <Line
                  type="monotone"
                  dataKey="右眼球镜"
                  stroke="url(#sphereRightGrad)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#f59e0b', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 5, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-primary-400">
            <p>需要至少2条验光记录以显示趋势图</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-primary-700" strokeWidth={2} />
          <h3 className="font-serif text-lg font-semibold text-primary-800">散光变化分布</h3>
          <span className="text-xs text-primary-400 ml-2">横轴为轴位，纵轴为散光度数，散点大小代表时间远近</span>
        </div>
        {sorted.length >= 2 ? (
          <AstigmatismChart records={sorted} height={380} />
        ) : (
          <div className="h-[380px] flex items-center justify-center text-primary-400">
            <p>需要至少2条验光记录以显示散点图</p>
          </div>
        )}
      </Card>

      {axisData && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-primary-700" strokeWidth={2} />
            <h3 className="font-serif text-lg font-semibold text-primary-800">散光轴位波动分析</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-primary-600 mb-2">左眼轴位范围</p>
              <p className="text-xs text-primary-400 mb-1">
                [{axisData.leftMin}° — {axisData.leftMax}°]　波动范围 {axisData.leftRange}°
              </p>
              {renderAxisBar(axisData.leftMin, axisData.leftMax, axisData.leftRange, axisData.isLeftAbnormal)}
            </div>
            <div>
              <p className="text-sm font-medium text-primary-600 mb-2">右眼轴位范围</p>
              <p className="text-xs text-primary-400 mb-1">
                [{axisData.rightMin}° — {axisData.rightMax}°]　波动范围 {axisData.rightRange}°
              </p>
              {renderAxisBar(axisData.rightMin, axisData.rightMax, axisData.rightRange, axisData.isRightAbnormal)}
            </div>
          </div>
          {(axisData.isLeftAbnormal || axisData.isRightAbnormal) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  {axisData.isLeftAbnormal && (
                    <p className="text-sm text-red-700 font-medium">
                      ⚠️ 左眼散光轴位波动较大(&gt;30°)，建议咨询眼科医生
                    </p>
                  )}
                  {axisData.isRightAbnormal && (
                    <p className="text-sm text-red-700 font-medium">
                      ⚠️ 右眼散光轴位波动较大(&gt;30°)，建议咨询眼科医生
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {sorted.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-primary-700" strokeWidth={2} />
            <h3 className="font-serif text-lg font-semibold text-primary-800">历次验光数据</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary-100">
                  <th className="text-left py-3 px-4 font-medium text-primary-600">日期</th>
                  <th className="text-center py-3 px-4 font-medium text-primary-600" colSpan={2}>
                    左眼球镜
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-primary-600" colSpan={2}>
                    右眼球镜
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-primary-600">机构</th>
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((r, idx, arr) => {
                  const prev = arr[idx + 1];
                  const c = prev ? calculateSphereChange(r, prev) : null;
                  return (
                    <tr key={r.id} className="border-b border-primary-50 hover:bg-primary-50/30">
                      <td className="py-3 px-4 text-primary-700 font-medium">{formatDate(r.examDate)}</td>
                      <td className="py-3 px-4 text-center font-semibold text-primary-800">
                        {formatSphere(r.leftEye.sphere)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {c && (
                          <span className={`text-xs ${getChangeColor(c.left)}`}>
                            {c.left > 0 ? '+' : ''}
                            {c.left.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-accent-700">
                        {formatSphere(r.rightEye.sphere)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {c && (
                          <span className={`text-xs ${getChangeColor(c.right)}`}>
                            {c.right > 0 ? '+' : ''}
                            {c.right.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-primary-500">{r.organization}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
