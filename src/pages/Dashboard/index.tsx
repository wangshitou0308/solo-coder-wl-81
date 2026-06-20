import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import VisionTrendChart from '@/components/charts/VisionTrendChart';
import RingProgress from '@/components/charts/RingProgress';
import {
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Glasses as GlassesIcon,
  ArrowRight,
} from 'lucide-react';
import { useOptometryStore } from '@/store/optometryStore';
import { useGlassesStore } from '@/store/glassesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDailyLogStore } from '@/store/dailyLogStore';
import {
  getLatestOptometry,
  sortOptometryByDate,
  getGlassesUsageDays,
  getGlassesUsageProgress,
  getGlassesReplacementDate,
  getNextRecommendedCheckupDate,
  getDaysUntilCheckup,
  generateReminders,
} from '@/utils/visionUtils';
import { formatDate, formatSphere, formatCylinder, formatAxis, formatVision } from '@/utils/dateUtils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const records = useOptometryStore((s) => s.records);
  const glasses = useGlassesStore((s) => s.glasses);
  const logs = useDailyLogStore((s) => s.logs);
  const checkupInterval = useSettingsStore((s) => s.recommendedCheckupIntervalMonths);

  const latest = getLatestOptometry(records);
  const sortedRecords = sortOptometryByDate(records);
  const recentRecords = sortedRecords.slice(-6);
  const activeGlasses = glasses.filter((g) => g.status !== 'retired');
  const reminders = generateReminders(records, glasses, checkupInterval);
  const nextCheckupDate = getNextRecommendedCheckupDate(records, checkupInterval);
  const daysUntilCheckup = getDaysUntilCheckup(records, checkupInterval);
  const recentLogs = logs.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-16 -mb-16" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5" strokeWidth={2} />
              <h3 className="font-serif text-lg font-semibold">当前矫正视力</h3>
            </div>
            {latest ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-accent-400" />
                    <span className="text-sm text-white/80">左眼 OS</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-white/60">球镜 (S)</p>
                      <p className="text-3xl font-bold">{formatSphere(latest.leftEye.sphere)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-white/60 text-xs">柱镜 (C)</p>
                        <p className="font-semibold">{formatCylinder(latest.leftEye.cylinder)}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">轴位 (A)</p>
                        <p className="font-semibold">{formatAxis(latest.leftEye.axis)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">矫正视力</p>
                      <p className="font-semibold">{formatVision(latest.leftEye.correctedVision)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-warning-400" />
                    <span className="text-sm text-white/80">右眼 OD</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-white/60">球镜 (S)</p>
                      <p className="text-3xl font-bold">{formatSphere(latest.rightEye.sphere)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-white/60 text-xs">柱镜 (C)</p>
                        <p className="font-semibold">{formatCylinder(latest.rightEye.cylinder)}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">轴位 (A)</p>
                        <p className="font-semibold">{formatAxis(latest.rightEye.axis)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">矫正视力</p>
                      <p className="font-semibold">{formatVision(latest.rightEye.correctedVision)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-white/70">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无验光记录</p>
              </div>
            )}
            {latest && (
              <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Calendar className="w-4 h-4" />
                  <span>最近验光：{formatDate(latest.examDate)}</span>
                </div>
                <span className="text-sm text-white/70">瞳距：{latest.pd}mm</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-700" strokeWidth={2} />
              <h3 className="font-serif text-lg font-semibold text-primary-800">近期度数趋势</h3>
            </div>
            <Link to="/optometry/charts" className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1">
              查看详情 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentRecords.length >= 2 ? (
            <VisionTrendChart records={recentRecords} height={200} showLegend={false} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-primary-400">
              <p>需要至少2条验光记录以显示趋势</p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <GlassesIcon className="w-5 h-5 text-primary-700" strokeWidth={2} />
              <h3 className="font-serif text-lg font-semibold text-primary-800">眼镜使用状态</h3>
            </div>
            <Link to="/glasses" className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1">
              管理眼镜 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {activeGlasses.length > 0 ? (
            <div className="space-y-4">
              {activeGlasses.map((g) => {
                const usageDays = getGlassesUsageDays(g);
                const progress = getGlassesUsageProgress(g);
                const replacementDate = getGlassesReplacementDate(g);
                return (
                  <div key={g.id} className="flex items-center gap-5 p-4 bg-primary-50/50 rounded-xl">
                    <RingProgress
                      progress={progress}
                      size={80}
                      strokeWidth={8}
                      label={`${usageDays}`}
                      sublabel="天"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-primary-800">{g.name}</h4>
                        <Badge variant={g.status === 'active' ? 'success' : 'info'}>
                          {g.status === 'active' ? '使用中' : '备用'}
                        </Badge>
                      </div>
                      <p className="text-sm text-primary-500 mb-2">
                        {g.frameBrand} {g.frameModel} · {g.lens.refractiveIndex}折射率
                        {g.lens.coatings.length > 0 && ` · ${g.lens.coatings.slice(0, 2).join('/')}`}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-primary-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          建议更换：{formatDate(replacementDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-primary-400">
              <GlassesIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无眼镜档案</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-warning-500" strokeWidth={2} />
            <h3 className="font-serif text-lg font-semibold text-primary-800">健康提醒</h3>
          </div>
          <div className="space-y-3">
            {nextCheckupDate && (
              <div className="p-4 bg-warning-50 rounded-xl border border-warning-100">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-warning-800">下次建议验光</p>
                    <p className="text-sm text-warning-600 mt-0.5">
                      {formatDate(nextCheckupDate)}
                      {daysUntilCheckup !== null && (
                        <span className="ml-2">
                          ({daysUntilCheckup > 0 ? `还有${daysUntilCheckup}天` : `已逾期${Math.abs(daysUntilCheckup)}天`})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {reminders.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-xl border ${
                  r.priority === 'high'
                    ? 'bg-red-50 border-red-100'
                    : r.priority === 'medium'
                    ? 'bg-warning-50 border-warning-100'
                    : 'bg-accent-50 border-accent-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {r.priority === 'high' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : r.priority === 'medium' ? (
                    <Clock className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      r.priority === 'high' ? 'text-red-800' : r.priority === 'medium' ? 'text-warning-800' : 'text-accent-800'
                    }`}>
                      {r.title}
                    </p>
                    <p className={`text-sm mt-0.5 ${
                      r.priority === 'high' ? 'text-red-600' : r.priority === 'medium' ? 'text-warning-600' : 'text-accent-600'
                    }`}>
                      {r.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {reminders.length === 0 && !nextCheckupDate && (
              <div className="text-center py-8 text-primary-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无提醒，视力状态良好！</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {recentLogs.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-700" strokeWidth={2} />
              <h3 className="font-serif text-lg font-semibold text-primary-800">近期不适记录</h3>
            </div>
            <Link to="/daily" className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1">
              全部记录 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-4 bg-primary-50/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-primary-500">
                    {formatDate(log.recordDate)} {log.recordTime}
                  </span>
                  <Badge
                    variant={
                      log.severity === 'severe' ? 'danger' : log.severity === 'moderate' ? 'warning' : 'success'
                    }
                  >
                    {log.severity === 'severe' ? '严重' : log.severity === 'moderate' ? '中度' : '轻微'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {log.symptoms.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-white rounded-full text-xs text-primary-600 border border-primary-100"
                    >
                      {s === 'eye_strain'
                        ? '眼疲劳'
                        : s === 'dryness'
                        ? '干涩'
                        : s === 'dizziness'
                        ? '眩晕'
                        : s === 'blurred_vision'
                        ? '视物模糊'
                        : s === 'headache'
                        ? '头痛'
                        : s}
                    </span>
                  ))}
                </div>
                {log.notes && <p className="text-xs text-primary-500 line-clamp-2">{log.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
