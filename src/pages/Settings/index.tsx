import Card from '@/components/ui/Card';
import { useSettingsStore } from '@/store/settingsStore';
import {
  Settings,
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react';

interface ToggleProps {
  enabled: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function Toggle({ enabled, disabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer'
      } ${enabled && !disabled ? 'bg-accent-500' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
          enabled && !disabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

const CHECKUP_INTERVALS = [3, 6, 12, 24] as const;
const REPLACEMENT_CYCLES = [6, 12, 18, 24] as const;

export default function SettingsPage() {
  const {
    recommendedCheckupIntervalMonths,
    checkupReminderEnabled,
    defaultReplacementCycleMonths,
    lensReplacementReminderEnabled,
    degreeChangeReminderEnabled,
    notificationsEnabled,
    updateSettings,
  } = useSettingsStore();

  const effectiveCheckup = notificationsEnabled && checkupReminderEnabled;
  const effectiveLens = notificationsEnabled && lensReplacementReminderEnabled;
  const effectiveDegree = notificationsEnabled && degreeChangeReminderEnabled;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-gradient-primary text-white shadow-md">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary-800">设置中心</h1>
          <p className="text-sm text-primary-500">管理您的提醒与偏好设置</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-accent-50 text-accent-600">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-primary-800">验光复查设置</h2>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-400" />
              <label className="form-label">复查间隔</label>
            </div>
            <select
              className="input-field w-28 text-center"
              value={recommendedCheckupIntervalMonths}
              onChange={(e) =>
                updateSettings({ recommendedCheckupIntervalMonths: Number(e.target.value) })
              }
            >
              {CHECKUP_INTERVALS.map((m) => (
                <option key={m} value={m}>
                  {m} 个月
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-400" />
              <label className="form-label">验光复查提醒</label>
            </div>
            <Toggle
              enabled={checkupReminderEnabled}
              disabled={!notificationsEnabled}
              onChange={(v) => updateSettings({ checkupReminderEnabled: v })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-accent-50 text-accent-600">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-primary-800">镜片更换设置</h2>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-400" />
              <label className="form-label">默认更换周期</label>
            </div>
            <select
              className="input-field w-28 text-center"
              value={defaultReplacementCycleMonths}
              onChange={(e) =>
                updateSettings({ defaultReplacementCycleMonths: Number(e.target.value) })
              }
            >
              {REPLACEMENT_CYCLES.map((m) => (
                <option key={m} value={m}>
                  {m} 个月
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-400" />
              <label className="form-label">镜片更换提醒</label>
            </div>
            <Toggle
              enabled={lensReplacementReminderEnabled}
              disabled={!notificationsEnabled}
              onChange={(v) => updateSettings({ lensReplacementReminderEnabled: v })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-warning-50 text-warning-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-primary-800">度数变化提醒设置</h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-400" />
            <label className="form-label">度数变化提醒</label>
          </div>
          <Toggle
            enabled={degreeChangeReminderEnabled}
            disabled={!notificationsEnabled}
            onChange={(v) => updateSettings({ degreeChangeReminderEnabled: v })}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <Bell className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-primary-800">通知总开关</h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary-400" />
            <label className="form-label">启用通知</label>
          </div>
          <Toggle
            enabled={notificationsEnabled}
            onChange={(v) => updateSettings({ notificationsEnabled: v })}
          />
        </div>

        {!notificationsEnabled && (
          <div className="mt-4 p-3 rounded-xl bg-warning-50 border border-warning-100">
            <p className="text-sm text-warning-700">
              通知已关闭，所有提醒功能将暂停生效
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-serif text-base font-semibold text-primary-800 mb-3">当前提醒状态</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-primary-50">
            <span className="text-sm text-primary-700">验光复查提醒</span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              effectiveCheckup
                ? 'bg-accent-100 text-accent-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {effectiveCheckup ? '已开启' : '已关闭'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-primary-50">
            <span className="text-sm text-primary-700">镜片更换提醒</span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              effectiveLens
                ? 'bg-accent-100 text-accent-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {effectiveLens ? '已开启' : '已关闭'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-primary-50">
            <span className="text-sm text-primary-700">度数变化提醒</span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              effectiveDegree
                ? 'bg-accent-100 text-accent-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {effectiveDegree ? '已开启' : '已关闭'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
