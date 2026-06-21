import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useOptometryStore } from '@/store/optometryStore';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useGlassesStore } from '@/store/glassesStore';
import {
  sortOptometryByDate,
  getSymptomFrequency,
  getSceneFrequency,
  calculateSphericalEquivalent,
} from '@/utils/visionUtils';
import { formatDate, formatSphere } from '@/utils/dateUtils';
import { SYMPTOM_LABELS, SCENE_LABELS } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  Activity,
  Glasses,
  FileText,
  TrendingUp,
  AlertTriangle,
  Target,
} from 'lucide-react';

const COLORS = ['#1e3a5f', '#2dd4bf', '#fb923c', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#64748b'];

function getMonthRange(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  return { start, end };
}

function shiftMonth(monthStr: string, delta: number): string {
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatMonthDisplay(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  return `${year}年${month}月`;
}

export default function Report() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );

  const records = useOptometryStore((s) => s.records);
  const logs = useDailyLogStore((s) => s.logs);
  const glasses = useGlassesStore((s) => s.glasses);

  const monthRecords = useMemo(() => {
    const { start, end } = getMonthRange(selectedMonth);
    return records.filter((r) => r.examDate >= start && r.examDate < end);
  }, [records, selectedMonth]);

  const monthLogs = useMemo(() => {
    const { start, end } = getMonthRange(selectedMonth);
    return logs.filter((l) => l.recordDate >= start && l.recordDate < end);
  }, [logs, selectedMonth]);

  const sortedAllRecords = useMemo(() => sortOptometryByDate(records), [records]);

  const optometryWithPrev = useMemo(() => {
    return monthRecords.map((rec) => {
      const idx = sortedAllRecords.findIndex((r) => r.id === rec.id);
      const prev = idx > 0 ? sortedAllRecords[idx - 1] : null;
      return { record: rec, prev };
    });
  }, [monthRecords, sortedAllRecords]);

  const symptomFreq = useMemo(() => {
    const freq = getSymptomFrequency(monthLogs);
    return Object.entries(freq)
      .map(([key, value]) => ({
        name: SYMPTOM_LABELS[key as keyof typeof SYMPTOM_LABELS] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthLogs]);

  const sceneFreq = useMemo(() => {
    const freq = getSceneFrequency(monthLogs);
    return Object.entries(freq)
      .map(([key, value]) => ({
        name: SCENE_LABELS[key as keyof typeof SCENE_LABELS] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthLogs]);

  const severityData = useMemo(() => {
    const counts = { mild: 0, moderate: 0, severe: 0 };
    monthLogs.forEach((log) => {
      counts[log.severity]++;
    });
    return [
      { name: '轻微', value: counts.mild, color: '#2dd4bf' },
      { name: '中度', value: counts.moderate, color: '#fb923c' },
      { name: '严重', value: counts.severe, color: '#ef4444' },
    ].filter((d) => d.value > 0);
  }, [monthLogs]);

  const activeGlasses = useMemo(
    () => glasses.filter((g) => g.status === 'active' || g.status === 'standby'),
    [glasses]
  );

  const glassesUsage = useMemo(() => {
    return activeGlasses.map((g) => {
      const usageLogs = monthLogs.filter((l) => l.glassesId === g.id);
      const usageDays = new Set(usageLogs.map((l) => l.recordDate)).size;
      const sceneCounts: Record<string, number> = {};
      usageLogs.forEach((l) => {
        sceneCounts[l.scene] = (sceneCounts[l.scene] || 0) + 1;
      });
      const topSceneEntry = Object.entries(sceneCounts).sort((a, b) => b[1] - a[1])[0];
      const discomfortCount = usageLogs.length;
      return {
        glasses: g,
        usageDays,
        topScene: topSceneEntry
          ? SCENE_LABELS[topSceneEntry[0] as keyof typeof SCENE_LABELS] || topSceneEntry[0]
          : null,
        discomfortCount,
      };
    });
  }, [activeGlasses, monthLogs]);

  const maxDiscomfortGlasses = useMemo(() => {
    const withDiscomfort = glassesUsage.filter((g) => g.discomfortCount > 0);
    if (withDiscomfort.length === 0) return null;
    return withDiscomfort.reduce((a, b) => (a.discomfortCount > b.discomfortCount ? a : b));
  }, [glassesUsage]);

  const summary = useMemo(() => {
    const optometryCount = monthRecords.length;
    let degreeChange = '无变化';
    if (optometryWithPrev.length > 0) {
      const latest = optometryWithPrev[optometryWithPrev.length - 1];
      if (latest.prev) {
        const leftChange = latest.record.leftEye.sphere - latest.prev.leftEye.sphere;
        const rightChange = latest.record.rightEye.sphere - latest.prev.rightEye.sphere;
        const leftSign = leftChange > 0 ? '+' : '';
        const rightSign = rightChange > 0 ? '+' : '';
        degreeChange = `左${leftSign}${leftChange.toFixed(2)}D 右${rightSign}${rightChange.toFixed(2)}D`;
      }
    }
    const discomfortCount = monthLogs.length;
    const topSymptom = symptomFreq[0]?.name || '无';
    const topScene = sceneFreq[0]?.name || '无';
    return `本月验光${optometryCount}次，度数变化${degreeChange}，不适记录${discomfortCount}条，最高发症状${topSymptom}，最高发场景${topScene}`;
  }, [monthRecords, optometryWithPrev, monthLogs, symptomFreq, sceneFreq]);

  const formatChange = (curr: number, prev: number) => {
    const diff = curr - prev;
    if (diff === 0) return '—';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(2)}`;
  };

  const getChangeColor = (curr: number, prev: number) => {
    const diff = curr - prev;
    if (diff === 0) return 'text-primary-500';
    return diff < 0 ? 'text-accent-600' : 'text-red-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
          className="p-2 rounded-xl bg-white/80 border border-primary-100 text-primary-600 hover:bg-white hover:shadow-md transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-primary text-white shadow-lg">
          <Calendar className="w-5 h-5" />
          <span className="font-serif text-lg font-semibold">{formatMonthDisplay(selectedMonth)}</span>
        </div>
        <button
          onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
          className="p-2 rounded-xl bg-white/80 border border-primary-100 text-primary-600 hover:bg-white hover:shadow-md transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Eye className="w-5 h-5 text-primary-700" strokeWidth={2} />
          <h3 className="font-serif text-lg font-semibold text-primary-800">验光变化摘要</h3>
        </div>
        {monthRecords.length > 0 ? (
          <div className="space-y-4">
            {optometryWithPrev.map(({ record, prev }) => (
              <div key={record.id} className="p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary-800">{formatDate(record.examDate)}</span>
                    <Badge variant="info">{record.organization}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/70 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                      <span className="text-sm font-medium text-primary-700">左眼 (OS)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="text-primary-400 text-xs">球镜</p>
                        <p className="font-bold text-primary-800">{formatSphere(record.leftEye.sphere)}</p>
                        {prev && (
                          <p className={`text-xs font-medium ${getChangeColor(record.leftEye.sphere, prev.leftEye.sphere)}`}>
                            {formatChange(record.leftEye.sphere, prev.leftEye.sphere)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-primary-400 text-xs">柱镜</p>
                        <p className="font-bold text-primary-800">{record.leftEye.cylinder.toFixed(2)}D</p>
                        {prev && (
                          <p className={`text-xs font-medium ${getChangeColor(record.leftEye.cylinder, prev.leftEye.cylinder)}`}>
                            {formatChange(record.leftEye.cylinder, prev.leftEye.cylinder)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-primary-400 text-xs">轴位</p>
                        <p className="font-bold text-primary-800">{record.leftEye.axis}°</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-primary-100 text-center">
                      <p className="text-primary-400 text-xs">等效球镜</p>
                      <p className="font-semibold text-primary-700">
                        {formatSphere(calculateSphericalEquivalent(record.leftEye))}
                      </p>
                      {prev && (
                        <p className={`text-xs font-medium ${getChangeColor(calculateSphericalEquivalent(record.leftEye), calculateSphericalEquivalent(prev.leftEye))}`}>
                          {formatChange(calculateSphericalEquivalent(record.leftEye), calculateSphericalEquivalent(prev.leftEye))}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-white/70 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-accent-500" />
                      <span className="text-sm font-medium text-accent-700">右眼 (OD)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="text-primary-400 text-xs">球镜</p>
                        <p className="font-bold text-primary-800">{formatSphere(record.rightEye.sphere)}</p>
                        {prev && (
                          <p className={`text-xs font-medium ${getChangeColor(record.rightEye.sphere, prev.rightEye.sphere)}`}>
                            {formatChange(record.rightEye.sphere, prev.rightEye.sphere)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-primary-400 text-xs">柱镜</p>
                        <p className="font-bold text-primary-800">{record.rightEye.cylinder.toFixed(2)}D</p>
                        {prev && (
                          <p className={`text-xs font-medium ${getChangeColor(record.rightEye.cylinder, prev.rightEye.cylinder)}`}>
                            {formatChange(record.rightEye.cylinder, prev.rightEye.cylinder)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-primary-400 text-xs">轴位</p>
                        <p className="font-bold text-primary-800">{record.rightEye.axis}°</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-primary-100 text-center">
                      <p className="text-primary-400 text-xs">等效球镜</p>
                      <p className="font-semibold text-primary-700">
                        {formatSphere(calculateSphericalEquivalent(record.rightEye))}
                      </p>
                      {prev && (
                        <p className={`text-xs font-medium ${getChangeColor(calculateSphericalEquivalent(record.rightEye), calculateSphericalEquivalent(prev.rightEye))}`}>
                          {formatChange(calculateSphericalEquivalent(record.rightEye), calculateSphericalEquivalent(prev.rightEye))}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Eye className="w-12 h-12 mx-auto mb-3 text-primary-300" />
            <p className="text-primary-500">本月无验光记录</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-primary-700" strokeWidth={2} />
          <h3 className="font-serif text-lg font-semibold text-primary-800">症状趋势</h3>
        </div>
        <p className="text-sm text-primary-400 mb-5">
          本月不适记录 <span className="font-semibold text-primary-700">{monthLogs.length}</span> 条
        </p>
        {monthLogs.length > 0 ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">症状频次</span>
              </div>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomFreq} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="value" name="出现次数" radius={[8, 8, 0, 0]}>
                      {symptomFreq.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">严重程度分布</span>
                </div>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">场景分布</span>
                </div>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sceneFreq}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Bar dataKey="value" name="出现次数" radius={[0, 8, 8, 0]} fill="#2dd4bf" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-3 text-primary-300" />
            <p className="text-primary-500">本月无不适记录</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Glasses className="w-5 h-5 text-primary-700" strokeWidth={2} />
          <h3 className="font-serif text-lg font-semibold text-primary-800">眼镜使用情况</h3>
        </div>
        {glassesUsage.length > 0 ? (
          <div className="space-y-4">
            {glassesUsage.map(({ glasses: g, usageDays, topScene, discomfortCount }) => (
              <div
                key={g.id}
                className={`p-4 rounded-xl border ${
                  maxDiscomfortGlasses && maxDiscomfortGlasses.glasses.id === g.id && discomfortCount > 0
                    ? 'bg-red-50 border-red-200'
                    : 'bg-primary-50/50 border-primary-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary-800">{g.name}</span>
                    <Badge variant={g.status === 'active' ? 'success' : 'info'}>
                      {g.status === 'active' ? '使用中' : '备用'}
                    </Badge>
                    {maxDiscomfortGlasses && maxDiscomfortGlasses.glasses.id === g.id && discomfortCount > 0 && (
                      <Badge variant="danger">不适最多</Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-primary-400 text-xs">使用天数</p>
                    <p className="text-lg font-bold text-primary-800">{usageDays}</p>
                  </div>
                  <div>
                    <p className="text-primary-400 text-xs">最常见场景</p>
                    <p className="text-sm font-semibold text-primary-700">{topScene || '—'}</p>
                  </div>
                  <div>
                    <p className="text-primary-400 text-xs">不适记录</p>
                    <p className={`text-lg font-bold ${discomfortCount > 0 ? 'text-warning-700' : 'text-primary-800'}`}>
                      {discomfortCount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Glasses className="w-12 h-12 mx-auto mb-3 text-primary-300" />
            <p className="text-primary-500">暂无活跃眼镜</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-700" strokeWidth={2} />
          <h3 className="font-serif text-lg font-semibold text-primary-800">月度总结</h3>
        </div>
        <div className="p-5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
          <p className="text-primary-700 leading-relaxed">{summary}</p>
        </div>
        {maxDiscomfortGlasses && maxDiscomfortGlasses.discomfortCount > 0 && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">不适最多的眼镜</span>
            </div>
            <p className="text-sm text-red-600">
              {maxDiscomfortGlasses.glasses.name} 本月共 {maxDiscomfortGlasses.discomfortCount} 条不适记录
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
