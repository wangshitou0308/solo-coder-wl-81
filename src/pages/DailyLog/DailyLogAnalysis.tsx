import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useOptometryStore } from '@/store/optometryStore';
import { getSymptomFrequency, getSceneFrequency, sortOptometryByDate } from '@/utils/visionUtils';
import { SYMPTOM_LABELS, SCENE_LABELS, SEVERITY_LABELS } from '@/types';
import { Sparkles, TrendingUp, AlertTriangle, Target, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

const COLORS = ['#1e3a5f', '#2dd4bf', '#fb923c', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#64748b'];

export default function DailyLogAnalysis() {
  const logs = useDailyLogStore((s) => s.logs);
  const records = useOptometryStore((s) => s.records);
  const sortedRecords = sortOptometryByDate(records);

  const symptomFreq = useMemo(() => {
    const freq = getSymptomFrequency(logs);
    return Object.entries(freq)
      .map(([key, value]) => ({
        name: SYMPTOM_LABELS[key as keyof typeof SYMPTOM_LABELS] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  const sceneFreq = useMemo(() => {
    const freq = getSceneFrequency(logs);
    return Object.entries(freq)
      .map(([key, value]) => ({
        name: SCENE_LABELS[key as keyof typeof SCENE_LABELS] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  const severityData = useMemo(() => {
    const counts = { mild: 0, moderate: 0, severe: 0 };
    logs.forEach((log) => {
      counts[log.severity]++;
    });
    return [
      { name: '轻微', value: counts.mild, color: '#2dd4bf' },
      { name: '中度', value: counts.moderate, color: '#fb923c' },
      { name: '严重', value: counts.severe, color: '#ef4444' },
    ].filter((d) => d.value > 0);
  }, [logs]);

  const topSymptom = symptomFreq[0];
  const topScene = sceneFreq[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-800">{logs.length}</p>
              <p className="text-sm text-primary-500">总记录数</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning-700">
                {topSymptom ? topSymptom.name : '-'}
              </p>
              <p className="text-sm text-primary-500">最高发症状</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-700">{topScene ? topScene.name : '-'}</p>
              <p className="text-sm text-primary-500">最高发场景</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {logs.filter((l) => l.severity === 'severe').length}
              </p>
              <p className="text-sm text-primary-500">严重不适次数</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary-700" strokeWidth={2} />
            <h3 className="font-serif text-lg font-semibold text-primary-800">症状分布统计</h3>
          </div>
          {symptomFreq.length > 0 ? (
            <div style={{ height: 320 }}>
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
          ) : (
            <div className="h-[320px] flex items-center justify-center text-primary-400">
              <p>暂无数据</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-5 h-5 text-primary-700" strokeWidth={2} />
            <h3 className="font-serif text-lg font-semibold text-primary-800">场景分布统计</h3>
          </div>
          {sceneFreq.length > 0 ? (
            <div style={{ height: 320 }}>
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
                    width={100}
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
          ) : (
            <div className="h-[320px] flex items-center justify-center text-primary-400">
              <p>暂无数据</p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-primary-700" strokeWidth={2} />
            <h3 className="font-serif text-lg font-semibold text-primary-800">严重程度分布</h3>
          </div>
          {severityData.length > 0 ? (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
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
          ) : (
            <div className="h-[280px] flex items-center justify-center text-primary-400">
              <p>暂无数据</p>
            </div>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-primary-700" strokeWidth={2} />
            <h3 className="font-serif text-lg font-semibold text-primary-800">症状与验光时间关联</h3>
            <span className="text-xs text-primary-400 ml-2">观察症状高发时段与度数变化的潜在关联</span>
          </div>
          {sortedRecords.length > 0 && logs.length > 0 ? (
            <div className="space-y-3">
              {sortedRecords.slice(-4).map((record, idx) => {
                const recordTime = new Date(record.examDate).getTime();
                const prevTime = idx > 0 ? new Date(sortedRecords[sortedRecords.length - 4 + idx - 1].examDate).getTime() : 0;
                const logsInPeriod = logs.filter((log) => {
                  const logTime = new Date(log.recordDate).getTime();
                  return logTime > prevTime && logTime <= recordTime;
                });
                const symptomList = [...new Set(logsInPeriod.flatMap((l) => l.symptoms))];
                return (
                  <div key={record.id} className="flex items-start gap-4 p-4 bg-primary-50/50 rounded-xl">
                    <div className="flex-shrink-0 w-28">
                      <p className="text-sm font-semibold text-primary-800">{formatDate(record.examDate)}</p>
                      <p className="text-xs text-primary-500 mt-0.5">验光</p>
                    </div>
                    <div className="w-px h-full bg-primary-200 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-primary-500">
                          期间记录 {logsInPeriod.length} 条不适
                        </span>
                        {symptomList.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {symptomList.slice(0, 4).map((s) => (
                              <Badge key={s} variant="warning">
                                {SYMPTOM_LABELS[s as keyof typeof SYMPTOM_LABELS]}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-primary-500">
                        左眼球镜 {record.leftEye.sphere > 0 ? '+' : ''}
                        {record.leftEye.sphere}D · 右眼 {record.rightEye.sphere > 0 ? '+' : ''}
                        {record.rightEye.sphere}D
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-primary-400">
              <p>需要验光记录和日常记录以进行关联分析</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-5 h-5 text-primary-700" strokeWidth={2} />
          <h3 className="font-serif text-lg font-semibold text-primary-800">健康建议</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topScene && topScene.name === '长时间屏幕' && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="font-semibold text-blue-800 mb-1">💻 屏幕使用建议</p>
              <p className="text-sm text-blue-600">
                建议遵循 20-20-20 原则：每用眼20分钟，远眺20英尺外20秒。考虑使用防蓝光镜片。
              </p>
            </div>
          )}
          {topScene && topScene.name === '夜间使用' && (
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="font-semibold text-indigo-800 mb-1">🌙 夜间用眼建议</p>
              <p className="text-sm text-indigo-600">
                夜间使用电子设备时，建议开启设备夜间模式，保持环境光线充足，避免在黑暗中长时间看屏幕。
              </p>
            </div>
          )}
          {topSymptom && topSymptom.name === '眼疲劳' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="font-semibold text-amber-800 mb-1">😌 缓解眼疲劳</p>
              <p className="text-sm text-amber-600">
                定时闭目休息，热敷眼部促进血液循环，确保工作环境光线适宜，避免眩光。
              </p>
            </div>
          )}
          {topSymptom && topSymptom.name === '眼干涩' && (
            <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
              <p className="font-semibold text-cyan-800 mb-1">💧 缓解眼干涩</p>
              <p className="text-sm text-cyan-600">
                保持室内适宜湿度，有意识地多眨眼，必要时使用人工泪液。长时间处于空调环境可使用加湿器。
              </p>
            </div>
          )}
          <div className="p-4 bg-accent-50 rounded-xl border border-accent-100">
            <p className="font-semibold text-accent-800 mb-1">📅 定期复查</p>
            <p className="text-sm text-accent-600">
              建议每6个月进行一次全面的眼科检查，及时发现视力变化，调整矫正方案。
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="font-semibold text-purple-800 mb-1">🥗 营养补充</p>
            <p className="text-sm text-purple-600">
              适当补充叶黄素、玉米黄质、Omega-3 等营养素，多吃深色蔬菜和鱼类，有助于维护眼部健康。
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
