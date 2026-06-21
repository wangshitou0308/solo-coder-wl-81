import { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useReminderStore } from '@/store/reminderStore';
import { useOptometryStore } from '@/store/optometryStore';
import { useGlassesStore } from '@/store/glassesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { generateReminders } from '@/utils/visionUtils';
import { formatDate } from '@/utils/dateUtils';
import type { Reminder } from '@/types';

type FilterTab = 'all' | 'checkup' | 'lens_replacement' | 'degree_change';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'checkup', label: '验光复查' },
  { key: 'lens_replacement', label: '镜片更换' },
  { key: 'degree_change', label: '度数变化' },
];

const TYPE_ICON: Record<string, typeof Calendar> = {
  checkup: Calendar,
  lens_replacement: Clock,
  degree_change: AlertTriangle,
};

const PRIORITY_BADGE: Record<string, { variant: 'danger' | 'warning' | 'info'; label: string }> = {
  high: { variant: 'danger', label: '高' },
  medium: { variant: 'warning', label: '中' },
  low: { variant: 'info', label: '低' },
};

function matchesFilter(reminder: Reminder, tab: FilterTab): boolean {
  if (tab === 'all') return true;
  if (tab === 'degree_change') return reminder.type === 'degree_change';
  return reminder.type === tab;
}

export default function Reminders() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const reminders = useReminderStore((s) => s.reminders);
  const addReminder = useReminderStore((s) => s.addReminder);
  const markRead = useReminderStore((s) => s.markRead);
  const dismiss = useReminderStore((s) => s.dismiss);

  const records = useOptometryStore((s) => s.records);
  const glasses = useGlassesStore((s) => s.glasses);
  const checkupInterval = useSettingsStore((s) => s.recommendedCheckupIntervalMonths);

  const visibleReminders = reminders.filter((r) => !r.isDismissed && matchesFilter(r, activeTab));

  const handleGenerate = () => {
    const generated = generateReminders(records, glasses, checkupInterval);
    generated.forEach((r) => {
      const { id: _id, ...rest } = r;
      addReminder(rest as Omit<Reminder, 'id' | 'createdAt'>);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-primary-800">提醒中心</h1>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          生成提醒
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-700 text-white'
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visibleReminders.length === 0 ? (
        <div className="text-center py-16 text-primary-400">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无提醒</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleReminders.map((reminder) => {
            const Icon = TYPE_ICON[reminder.type] || AlertTriangle;
            const badge = PRIORITY_BADGE[reminder.priority] || PRIORITY_BADGE.low;
            return (
              <Card key={reminder.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 ${
                      reminder.priority === 'high'
                        ? 'bg-red-100 text-red-600'
                        : reminder.priority === 'medium'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-teal-100 text-teal-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!reminder.isRead && (
                        <span className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0" />
                      )}
                      <h3 className="font-medium text-primary-800 truncate">{reminder.title}</h3>
                      <Badge variant={badge.variant} className="flex-shrink-0">
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-primary-500 mb-2">{reminder.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {reminder.date && (
                          <span className="text-xs text-primary-400">{formatDate(reminder.date)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!reminder.isRead && (
                          <button
                            onClick={() => markRead(reminder.id)}
                            className="text-xs px-3 py-1 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
                          >
                            标记已读
                          </button>
                        )}
                        <button
                          onClick={() => dismiss(reminder.id)}
                          className="text-xs px-3 py-1 rounded-lg bg-primary-100 text-primary-400 hover:bg-primary-200 hover:text-primary-600 transition-colors"
                        >
                          忽略
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
