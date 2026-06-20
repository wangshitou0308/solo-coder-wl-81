import { useState } from 'react';
import Card from '@/components/ui/Card';
import VisionTrendChart from '@/components/charts/VisionTrendChart';
import AstigmatismChart from '@/components/charts/AstigmatismChart';
import { useOptometryStore } from '@/store/optometryStore';
import { sortOptometryByDate, calculateSphereChange } from '@/utils/visionUtils';
import { TrendingUp, Target, BarChart3, Calendar, ArrowRight, ArrowLeft, Minus } from 'lucide-react';
import { formatDate, formatSphere } from '@/utils/dateUtils';

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

  const rec1 = selected1 ? sorted.find((r) => r.id === selected1) : null;
  const rec2 = selected2 ? sorted.find((r) => r.id === selected2) : null;
  const change = rec1 && rec2 ? calculateSphereChange(rec2, rec1) : null;

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
