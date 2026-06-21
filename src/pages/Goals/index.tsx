import { useState } from 'react';
import { Target, TrendingDown, CalendarDays, Plus, RefreshCw, CheckCircle2, Trash2, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { HealthGoal } from '@/types';
import { useGoalStore } from '@/store/goalStore';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { getWeeklyDiscomfortCount, getConsecutiveRecordingDays } from '@/utils/visionUtils';

type GoalType = HealthGoal['type'];

const TYPE_OPTIONS: { value: GoalType; label: string; title: string; unit: string }[] = [
  { value: 'weekly_discomfort_decrease', label: '每周屏幕不适次数降低', title: '周不适记录减少', unit: '次/周' },
  { value: 'consecutive_recording', label: '连续记录天数', title: '连续记录天数', unit: '天' },
];

const TYPE_ICON: Record<GoalType, React.ReactNode> = {
  weekly_discomfort_decrease: <TrendingDown className="w-5 h-5" />,
  consecutive_recording: <CalendarDays className="w-5 h-5" />,
};

function getProgressColor(percent: number): string {
  if (percent >= 100) return 'bg-emerald-500';
  if (percent >= 60) return 'bg-amber-400';
  return 'bg-red-400';
}

function getProgressTextColor(percent: number): string {
  if (percent >= 100) return 'text-emerald-600';
  if (percent >= 60) return 'text-amber-600';
  return 'text-red-500';
}

export default function Goals() {
  const { goals, addGoal, updateProgress, updateGoal, deleteGoal } = useGoalStore();
  const logs = useDailyLogStore((s) => s.logs);

  const [formType, setFormType] = useState<GoalType>('weekly_discomfort_decrease');
  const [formTarget, setFormTarget] = useState<number>(3);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);

  const activeGoals = goals.filter((g) => g.isActive);
  const inactiveGoals = goals.filter((g) => !g.isActive);

  const selectedOption = TYPE_OPTIONS.find((o) => o.value === formType)!;

  const handleTypeChange = (type: GoalType) => {
    setFormType(type);
    const opt = TYPE_OPTIONS.find((o) => o.value === type)!;
    if (type === 'weekly_discomfort_decrease') setFormTarget(3);
    else setFormTarget(7);
  };

  const handleSave = () => {
    if (formTarget <= 0) return;
    const opt = TYPE_OPTIONS.find((o) => o.value === formType)!;
    addGoal({
      type: formType,
      title: opt.title,
      target: formTarget,
      current: 0,
      unit: opt.unit,
      isActive: true,
    });
  };

  const handleRefreshProgress = () => {
    activeGoals.forEach((goal) => {
      const current = calcCurrent(goal.type);
      updateProgress(goal.id, current);
    });
  };

  const calcCurrent = (type: GoalType): number => {
    if (type === 'weekly_discomfort_decrease') return getWeeklyDiscomfortCount(logs);
    if (type === 'consecutive_recording') return getConsecutiveRecordingDays(logs);
    return 0;
  };

  const startEdit = (goal: HealthGoal) => {
    setEditingId(goal.id);
    setEditValue(String(goal.current));
  };

  const saveEdit = (id: string) => {
    const val = Number(editValue);
    if (!isNaN(val) && val >= 0) {
      updateProgress(id, val);
    }
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-primary-600" />
          <h3 className="font-serif text-lg font-semibold text-primary-800">新建目标</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">目标类型</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleTypeChange(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    formType === opt.value
                      ? 'bg-gradient-primary text-white shadow-md'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">目标标题</label>
            <input
              type="text"
              value={selectedOption.title}
              readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-primary-50/50 text-primary-800 text-sm"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-primary-700 mb-1">目标值</label>
              <input
                type="number"
                min={1}
                value={formTarget}
                onChange={(e) => setFormTarget(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-white text-primary-800 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
              />
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium text-primary-700 mb-1">单位</label>
              <input
                type="text"
                value={selectedOption.unit}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-primary-50/50 text-primary-800 text-sm"
              />
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary">
            <Plus className="w-4 h-4" />
            保存目标
          </button>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          <h3 className="font-serif text-lg font-semibold text-primary-800">进行中的目标</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-600">
            {activeGoals.length}
          </span>
        </div>
        <button onClick={handleRefreshProgress} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" />
          刷新进度
        </button>
      </div>

      {activeGoals.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-primary-300" />
          <h3 className="text-lg font-semibold text-primary-700 mb-2">暂无进行中的目标</h3>
          <p className="text-primary-500">创建一个健康目标，追踪你的护眼进展</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeGoals.map((goal) => {
            const percent = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
            return (
              <Card key={goal.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        goal.type === 'weekly_discomfort_decrease'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-teal-100 text-teal-600'
                      }`}
                    >
                      {TYPE_ICON[goal.type]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-800">{goal.title}</h4>
                      <p className="text-xs text-primary-400">
                        {goal.type === 'weekly_discomfort_decrease' ? '每周不适不超过' : '连续记录达'} {goal.target} {goal.unit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-primary-500">进度</span>
                    <span className={`text-sm font-semibold ${getProgressTextColor(percent)}`}>{percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-primary-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percent)}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm text-primary-700 font-medium">
                      当前 <span className="text-lg">{goal.current}</span> {goal.unit}
                    </span>
                    <span className="text-sm text-primary-400">
                      目标 {goal.target} {goal.unit}
                    </span>
                  </div>
                </div>

                {editingId === goal.id ? (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary-100">
                    <input
                      type="number"
                      min={0}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-primary-200 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(goal.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <button onClick={() => saveEdit(goal.id)} className="px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium">
                      保存
                    </button>
                    <button onClick={cancelEdit} className="px-4 py-2 rounded-xl bg-primary-100 text-primary-600 text-sm font-medium">
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary-100">
                    <button onClick={() => startEdit(goal)} className="btn-secondary text-sm">
                      <Pencil className="w-3.5 h-3.5" />
                      更新进度
                    </button>
                    <button
                      onClick={() => updateGoal(goal.id, { isActive: false })}
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium hover:bg-emerald-100 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      完成
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {inactiveGoals.length > 0 && (
        <div>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-700 transition-all"
          >
            {showInactive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            已完成/已停用的目标 ({inactiveGoals.length})
          </button>

          {showInactive && (
            <div className="mt-3 space-y-3">
              {inactiveGoals.map((goal) => {
                const percent = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
                return (
                  <Card key={goal.id} className="p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            goal.type === 'weekly_discomfort_decrease'
                              ? 'bg-amber-100 text-amber-500'
                              : 'bg-teal-100 text-teal-500'
                          }`}
                        >
                          {TYPE_ICON[goal.type]}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-primary-700 line-through">{goal.title}</h4>
                          <p className="text-xs text-primary-400">
                            {goal.current} / {goal.target} {goal.unit} ({percent}%)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 rounded-lg text-primary-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
