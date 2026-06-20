import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, Trash2, Edit, Filter, Clock, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useGlassesStore } from '@/store/glassesStore';
import { formatDate, formatDuration } from '@/utils/dateUtils';
import { SYMPTOM_LABELS, SCENE_LABELS, SEVERITY_LABELS, type SymptomType, type UsageScene } from '@/types';

export default function DailyLogList() {
  const { logs, deleteLog } = useDailyLogStore();
  const glasses = useGlassesStore((s) => s.glasses);
  const [symptomFilter, setSymptomFilter] = useState<SymptomType | null>(null);
  const [sceneFilter, setSceneFilter] = useState<UsageScene | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (symptomFilter && !log.symptoms.includes(symptomFilter)) return false;
    if (sceneFilter && log.scene !== sceneFilter) return false;
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'severe':
        return <Badge variant="danger">严重</Badge>;
      case 'moderate':
        return <Badge variant="warning">中度</Badge>;
      case 'mild':
        return <Badge variant="success">轻微</Badge>;
      default:
        return null;
    }
  };

  const getSceneBadge = (scene: UsageScene) => {
    const colors: Record<UsageScene, string> = {
      screen_work: 'bg-blue-100 text-blue-700',
      reading: 'bg-amber-100 text-amber-700',
      driving: 'bg-green-100 text-green-700',
      outdoor: 'bg-cyan-100 text-cyan-700',
      night_use: 'bg-indigo-100 text-indigo-700',
      gaming: 'bg-purple-100 text-purple-700',
      social: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`status-badge ${colors[scene]}`}>
        {SCENE_LABELS[scene]}
      </span>
    );
  };

  const allSymptoms = Object.keys(SYMPTOM_LABELS) as SymptomType[];
  const allScenes = Object.keys(SCENE_LABELS) as UsageScene[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-primary-600">
          共记录 <span className="font-semibold text-primary-800">{logs.length}</span> 条日常数据
        </p>
        <Link to="/daily/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          新增记录
        </Link>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-primary-700">筛选条件</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-primary-500 mb-1.5">按症状筛选</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSymptomFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  symptomFilter === null
                    ? 'bg-gradient-primary text-white'
                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                }`}
              >
                全部
              </button>
              {allSymptoms.map((s) => (
                <button
                  key={s}
                  onClick={() => setSymptomFilter(symptomFilter === s ? null : s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    symptomFilter === s
                      ? 'bg-gradient-primary text-white'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {SYMPTOM_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-primary-500 mb-1.5">按场景筛选</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSceneFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  sceneFilter === null
                    ? 'bg-gradient-accent text-white'
                    : 'bg-accent-50 text-accent-700 hover:bg-accent-100'
                }`}
              >
                全部
              </button>
              {allScenes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSceneFilter(sceneFilter === s ? null : s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    sceneFilter === s
                      ? 'bg-gradient-accent text-white'
                      : 'bg-accent-50 text-accent-700 hover:bg-accent-100'
                  }`}
                >
                  {SCENE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {filteredLogs.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-primary-300" />
          <h3 className="text-lg font-semibold text-primary-700 mb-2">
            {logs.length === 0 ? '暂无日常记录' : '没有符合条件的记录'}
          </h3>
          <p className="text-primary-500 mb-6">
            {logs.length === 0 ? '记录日常眼部感受，帮助分析用眼习惯' : '请尝试调整筛选条件'}
          </p>
          {logs.length === 0 && (
            <Link to="/daily/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              添加第一条记录
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const relatedGlasses = glasses.find((g) => g.id === log.glassesId);
            return (
              <Card key={log.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        log.severity === 'severe'
                          ? 'bg-red-100 text-red-600'
                          : log.severity === 'moderate'
                          ? 'bg-warning-100 text-warning-600'
                          : 'bg-accent-100 text-accent-600'
                      }`}
                    >
                      <AlertCircle className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-primary-800">
                          {formatDate(log.recordDate)}
                          {log.recordTime && <span className="text-sm text-primary-400 ml-2">{log.recordTime}</span>}
                        </h4>
                        {getSeverityBadge(log.severity)}
                        {getSceneBadge(log.scene)}
                      </div>
                      {log.durationMinutes && (
                        <p className="text-xs text-primary-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          持续 {formatDuration(log.durationMinutes)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-2 rounded-lg text-primary-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-primary-400 mb-1.5">症状表现</p>
                  <div className="flex flex-wrap gap-1.5">
                    {log.symptoms.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 bg-primary-50 rounded-full text-sm text-primary-700 font-medium"
                      >
                        {SYMPTOM_LABELS[s]}
                      </span>
                    ))}
                  </div>
                </div>

                {(relatedGlasses || log.notes) && (
                  <div className="pt-3 border-t border-primary-100 flex items-start justify-between gap-4">
                    {relatedGlasses && (
                      <span className="text-xs text-primary-500">
                        佩戴眼镜：<span className="text-primary-700 font-medium">{relatedGlasses.name}</span>
                      </span>
                    )}
                    {log.notes && <p className="text-sm text-primary-600 flex-1">{log.notes}</p>}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
