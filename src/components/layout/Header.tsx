import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Calendar, X, Clock, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { formatDate, getTodayStr } from '@/utils/dateUtils';
import { useOptometryStore } from '@/store/optometryStore';
import { useGlassesStore } from '@/store/glassesStore';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useSettingsStore } from '@/store/settingsStore';
import { generateReminders } from '@/utils/visionUtils';
import { useNavigate } from 'react-router-dom';
import { SYMPTOM_LABELS } from '@/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const records = useOptometryStore((s) => s.records);
  const glasses = useGlassesStore((s) => s.glasses);
  const logs = useDailyLogStore((s) => s.logs);
  const checkupInterval = useSettingsStore((s) => s.recommendedCheckupIntervalMonths);

  const reminders = generateReminders(records, glasses, checkupInterval);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRecords = records.filter(
    (r) =>
      searchQuery &&
      (r.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredGlasses = glasses.filter(
    (g) =>
      searchQuery &&
      (g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.frameBrand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.lens.brand?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLogs = logs.filter(
    (l) =>
      searchQuery &&
      (l.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.symptoms.some((s) => SYMPTOM_LABELS[s].includes(searchQuery)))
  );

  const hasSearchResults =
    filteredRecords.length > 0 || filteredGlasses.length > 0 || filteredLogs.length > 0;

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'checkup':
        return <Calendar className="w-4 h-4" />;
      case 'lens_replacement':
        return <Clock className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getReminderColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-warning-500 bg-warning-50';
      default:
        return 'text-accent-500 bg-accent-50';
    }
  };

  return (
    <header className="bg-white/60 backdrop-blur-xl border-b border-white/50 sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-primary-800">{title}</h2>
          {subtitle && <p className="text-sm text-primary-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-primary-100">
            <Calendar className="w-4 h-4 text-primary-500" strokeWidth={2} />
            <span className="text-sm text-primary-700 font-medium">
              {formatDate(getTodayStr())}
            </span>
          </div>

          <div className="relative" ref={searchRef}>
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                setShowNotifications(false);
                setSearchQuery('');
              }}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                showSearch
                  ? 'bg-gradient-primary text-white border-primary-600 shadow-md'
                  : 'bg-white/80 border-primary-100 text-primary-600 hover:bg-white hover:text-primary-800'
              }`}
            >
              {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" strokeWidth={2} />}
            </button>

            {showSearch && (
              <div className="absolute right-0 top-12 w-96 glass-card p-4 animate-slide-in-right z-50">
                <input
                  type="text"
                  className="input-field mb-4"
                  placeholder="搜索验光记录、眼镜、症状..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {searchQuery === '' ? (
                    <p className="text-sm text-primary-400 text-center py-4">输入关键词开始搜索</p>
                  ) : !hasSearchResults ? (
                    <p className="text-sm text-primary-400 text-center py-4">未找到匹配的结果</p>
                  ) : (
                    <>
                      {filteredRecords.length > 0 && (
                        <div>
                          <p className="text-xs text-primary-400 mb-2 font-medium">验光记录</p>
                          {filteredRecords.slice(0, 3).map((r) => (
                            <button
                              key={r.id}
                              onClick={() => {
                                navigate(`/optometry/${r.id}`);
                                setShowSearch(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left p-3 rounded-xl hover:bg-primary-50 transition-colors mb-2"
                            >
                              <p className="font-medium text-primary-800 text-sm">
                                {formatDate(r.examDate)}
                              </p>
                              <p className="text-xs text-primary-500">{r.organization}</p>
                            </button>
                          ))}
                        </div>
                      )}
                      {filteredGlasses.length > 0 && (
                        <div>
                          <p className="text-xs text-primary-400 mb-2 font-medium">眼镜</p>
                          {filteredGlasses.slice(0, 3).map((g) => (
                            <button
                              key={g.id}
                              onClick={() => {
                                navigate(`/glasses/${g.id}`);
                                setShowSearch(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left p-3 rounded-xl hover:bg-primary-50 transition-colors mb-2"
                            >
                              <p className="font-medium text-primary-800 text-sm">{g.name}</p>
                              <p className="text-xs text-primary-500">
                                {g.frameBrand} {g.frameModel}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                      {filteredLogs.length > 0 && (
                        <div>
                          <p className="text-xs text-primary-400 mb-2 font-medium">日常记录</p>
                          {filteredLogs.slice(0, 3).map((l) => (
                            <button
                              key={l.id}
                              onClick={() => {
                                navigate(`/daily/${l.id}`);
                                setShowSearch(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left p-3 rounded-xl hover:bg-primary-50 transition-colors mb-2"
                            >
                              <p className="font-medium text-primary-800 text-sm">
                                {formatDate(l.recordDate)}
                              </p>
                              <p className="text-xs text-primary-500 line-clamp-1">
                                {l.notes || l.symptoms.map((s) => SYMPTOM_LABELS[s]).join('、')}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSearch(false);
              }}
              className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                showNotifications
                  ? 'bg-gradient-primary text-white border-primary-600 shadow-md'
                  : 'bg-white/80 border-primary-100 text-primary-600 hover:bg-white hover:text-primary-800'
              }`}
            >
              <Bell className="w-4 h-4" strokeWidth={2} />
              {reminders.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning-500 rounded-full animate-pulse-soft" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 glass-card p-4 animate-slide-in-right z-50">
                <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  健康提醒
                  {reminders.length > 0 && (
                    <span className="ml-auto text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full">
                      {reminders.length} 条
                    </span>
                  )}
                </h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {reminders.length === 0 ? (
                    <div className="text-center py-8">
                      <Eye className="w-10 h-10 mx-auto mb-2 text-accent-400" />
                      <p className="text-sm text-primary-500">暂无提醒</p>
                      <p className="text-xs text-primary-400 mt-1">您的视力状态良好！</p>
                    </div>
                  ) : (
                    reminders.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-white/60 hover:bg-white transition-colors border border-primary-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg ${getReminderColor(r.priority)}`}>
                            {getReminderIcon(r.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-primary-800 text-sm">{r.title}</p>
                            <p className="text-xs text-primary-500 mt-0.5">{r.description}</p>
                            {r.date && (
                              <p className="text-xs text-primary-400 mt-1">{formatDate(r.date)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-md">
            视
          </div>
        </div>
      </div>
    </header>
  );
}
