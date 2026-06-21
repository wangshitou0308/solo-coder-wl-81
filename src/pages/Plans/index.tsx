import { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { usePlanStore } from '@/store/planStore';
import { useGlassesStore } from '@/store/glassesStore';
import { PLAN_STATUS_LABELS } from '@/types';
import type { OptometryPlan, PlanStatus } from '@/types';
import { formatDate, getTodayStr } from '@/utils/dateUtils';
import {
  Plus,
  Calendar,
  ClipboardList,
  Trash2,
  RotateCcw,
  Play,
  CheckCircle,
  SkipForward,
  Glasses,
  ShoppingCart,
  X,
} from 'lucide-react';

type FilterTab = 'all' | PlanStatus;

const TYPE_LABELS: Record<OptometryPlan['type'], string> = {
  checkup: '验光复查',
  replacement: '镜片更换',
  purchase: '新购眼镜',
};

const TYPE_BADGE_VARIANT: Record<OptometryPlan['type'], 'info' | 'warning' | 'accent'> = {
  checkup: 'info',
  replacement: 'warning',
  purchase: 'accent',
};

const STATUS_ACCENT: Record<PlanStatus, string> = {
  planned: 'border-l-blue-400 bg-blue-50/30',
  in_progress: 'border-l-amber-400 bg-amber-50/30',
  completed: 'border-l-green-400 bg-green-50/30',
  skipped: 'border-l-gray-300 bg-gray-50/30',
};

const STATUS_TEXT: Record<PlanStatus, string> = {
  planned: 'text-blue-700',
  in_progress: 'text-amber-700',
  completed: 'text-green-700',
  skipped: 'text-gray-500',
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'planned', label: '计划中' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'skipped', label: '已跳过' },
];

export default function Plans() {
  const { plans, addPlan, updateStatus, deletePlan } = usePlanStore();
  const glasses = useGlassesStore((s) => s.glasses);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [plannedDate, setPlannedDate] = useState(getTodayStr());
  const [organization, setOrganization] = useState('');
  const [planType, setPlanType] = useState<OptometryPlan['type']>('checkup');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const activeGlasses = glasses.filter((g) => g.status === 'active' || g.status === 'standby');

  const filteredPlans = activeTab === 'all'
    ? plans
    : plans.filter((p) => p.status === activeTab);

  const grouped = FILTER_TABS.filter((t) => t.key !== 'all').reduce<
    Record<PlanStatus, OptometryPlan[]>
  >((acc, tab) => {
    const key = tab.key as PlanStatus;
    acc[key] = filteredPlans.filter((p) => p.status === key);
    return acc;
  }, { planned: [], in_progress: [], completed: [], skipped: [] });

  const resetForm = () => {
    setTitle('');
    setPlannedDate(getTodayStr());
    setOrganization('');
    setPlanType('checkup');
    setNotes('');
    setShowForm(false);
  };

  const handleSave = () => {
    if (!title.trim() || !plannedDate) return;
    addPlan({
      title: title.trim(),
      plannedDate,
      organization: organization.trim() || undefined,
      type: planType,
      notes: notes.trim() || undefined,
      status: 'planned',
    });
    resetForm();
  };

  const handleQuickCreate = (glassesId: string, glassesName: string, type: 'replacement' | 'purchase') => {
    addPlan({
      title: `${glassesName} ${type === 'replacement' ? '更换计划' : '采购计划'}`,
      plannedDate: getTodayStr(),
      type,
      glassesId,
      status: 'planned',
    });
  };

  const renderActions = (plan: OptometryPlan) => {
    switch (plan.status) {
      case 'planned':
        return (
          <>
            <button
              onClick={() => updateStatus(plan.id, 'in_progress')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              开始
            </button>
            <button
              onClick={() => updateStatus(plan.id, 'skipped')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              跳过
            </button>
          </>
        );
      case 'in_progress':
        return (
          <>
            <button
              onClick={() => updateStatus(plan.id, 'completed')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              完成
            </button>
            <button
              onClick={() => updateStatus(plan.id, 'skipped')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              跳过
            </button>
          </>
        );
      case 'completed':
      case 'skipped':
        return (
          <button
            onClick={() => updateStatus(plan.id, 'planned')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重新计划
          </button>
        );
    }
  };

  const renderPlanCard = (plan: OptometryPlan) => {
    const isFaded = plan.status === 'completed' || plan.status === 'skipped';
    return (
      <div
        key={plan.id}
        className={`border-l-4 rounded-xl p-4 ${STATUS_ACCENT[plan.status]} transition-all`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`flex-1 min-w-0 ${isFaded ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className={`font-semibold ${STATUS_TEXT[plan.status]} ${plan.status === 'completed' ? 'line-through' : ''}`}>
                {plan.title}
              </h4>
              <Badge variant={TYPE_BADGE_VARIANT[plan.type]}>
                {TYPE_LABELS[plan.type]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-primary-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(plan.plannedDate)}
              </span>
              {plan.organization && (
                <span>{plan.organization}</span>
              )}
            </div>
            {plan.notes && (
              <p className="mt-1.5 text-sm text-primary-500 line-clamp-2">{plan.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {renderActions(plan)}
            <button
              onClick={() => deletePlan(plan.id)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const statusOrder: PlanStatus[] = ['planned', 'in_progress', 'completed', 'skipped'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-primary-600">
          共 <span className="font-semibold text-primary-800">{plans.length}</span> 个计划
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          新建计划
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 border border-white/50">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-primary-800">新建计划</h3>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="form-label">计划标题</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：半年复查"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">计划日期</label>
              <input
                type="date"
                className="input-field"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">机构（可选）</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：爱尔眼科医院"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">计划类型</label>
              <div className="flex gap-2">
                {(['checkup', 'replacement', 'purchase'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPlanType(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                      planType === t
                        ? t === 'checkup'
                          ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                          : t === 'replacement'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-accent-600 text-white border-accent-600 shadow-sm'
                        : 'bg-white text-primary-600 border-primary-200 hover:border-primary-300'
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">备注（可选）</label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="添加备注..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!title.trim() || !plannedDate}
              className={`w-full py-3 rounded-xl font-medium text-white shadow-md transition-all ${
                !title.trim() || !plannedDate
                  ? 'bg-primary-200 cursor-not-allowed'
                  : 'bg-accent-600 hover:bg-accent-700 hover:shadow-lg'
              }`}
            >
              保存计划
            </button>
          </div>
        </div>
      )}

      {activeGlasses.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Glasses className="w-5 h-5 text-primary-700" strokeWidth={2} />
            <h3 className="font-serif text-lg font-semibold text-primary-800">从当前眼镜生成计划</h3>
          </div>
          <div className="space-y-3">
            {activeGlasses.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-3 bg-primary-50/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-primary-800">{g.name}</span>
                  <Badge variant={g.status === 'active' ? 'success' : 'info'}>
                    {g.status === 'active' ? '使用中' : '备用'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickCreate(g.id, g.name, 'replacement')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    更换计划
                  </button>
                  <button
                    onClick={() => handleQuickCreate(g.id, g.name, 'purchase')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-accent-700 bg-accent-100 hover:bg-accent-200 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    采购计划
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-center gap-1 p-1 bg-primary-100/50 rounded-xl overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-white text-primary-800 shadow-sm'
                : 'text-primary-500 hover:text-primary-700'
            }`}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1.5 text-xs">
                ({plans.filter((p) => p.status === tab.key).length})
              </span>
            )}
            {tab.key === 'all' && (
              <span className="ml-1.5 text-xs">({plans.length})</span>
            )}
          </button>
        ))}
      </div>

      {filteredPlans.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-primary-300" />
          <h3 className="text-lg font-semibold text-primary-700 mb-2">暂无计划</h3>
          <p className="text-primary-500 mb-6">创建验光复查、镜片更换或新购眼镜计划</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            新建计划
          </button>
        </Card>
      ) : activeTab !== 'all' ? (
        <div className="space-y-3">
          {filteredPlans
            .sort((a, b) => new Date(b.plannedDate).getTime() - new Date(a.plannedDate).getTime())
            .map(renderPlanCard)}
        </div>
      ) : (
        <div className="space-y-6">
          {statusOrder.map((status) => {
            const group = grouped[status];
            if (group.length === 0) return null;
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={`font-serif text-base font-semibold ${STATUS_TEXT[status]}`}>
                    {PLAN_STATUS_LABELS[status]}
                  </h3>
                  <span className="text-sm text-primary-400">({group.length})</span>
                </div>
                <div className="space-y-3">
                  {group
                    .sort((a, b) => new Date(b.plannedDate).getTime() - new Date(a.plannedDate).getTime())
                    .map(renderPlanCard)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
