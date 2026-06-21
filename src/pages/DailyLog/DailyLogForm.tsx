import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Tag, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useGlassesStore } from '@/store/glassesStore';
import type { DailyLog, SymptomType, UsageScene, SeverityLevel } from '@/types';
import { SYMPTOM_LABELS, SCENE_LABELS, SEVERITY_LABELS, DEFAULT_TAGS } from '@/types';
import { getTodayStr } from '@/utils/dateUtils';

export default function DailyLogForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addLog, updateLog, getLogById } = useDailyLogStore();
  const glasses = useGlassesStore((s) => s.glasses);
  const activeGlasses = glasses.filter((g) => g.status !== 'retired');
  const isEditing = !!id;

  const [recordDate, setRecordDate] = useState(getTodayStr());
  const [recordTime, setRecordTime] = useState('');
  const [symptoms, setSymptoms] = useState<SymptomType[]>([]);
  const [severity, setSeverity] = useState<SeverityLevel>('mild');
  const [scene, setScene] = useState<UsageScene>('screen_work');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [glassesId, setGlassesId] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      const log = getLogById(id);
      if (log) {
        setRecordDate(log.recordDate);
        setRecordTime(log.recordTime || '');
        setSymptoms(log.symptoms);
        setSeverity(log.severity);
        setScene(log.scene);
        setDurationMinutes(log.durationMinutes ? String(log.durationMinutes) : '');
        setGlassesId(log.glassesId || '');
        setNotes(log.notes || '');
        setTags(log.tags || []);
      }
    }
  }, [isEditing, id, getLogById]);

  const toggleSymptom = (symptom: SymptomType) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setCustomTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.length === 0) {
      alert('请至少选择一个症状');
      return;
    }
    const logData: Omit<DailyLog, 'id' | 'createdAt'> = {
      recordDate,
      recordTime: recordTime || undefined,
      symptoms,
      severity,
      scene,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
      glassesId: glassesId || undefined,
      notes: notes || undefined,
      tags,
    };

    if (isEditing && id) {
      updateLog(id, logData);
    } else {
      addLog(logData);
    }
    navigate('/daily');
  };

  const allSymptoms = Object.keys(SYMPTOM_LABELS) as SymptomType[];
  const allScenes = Object.keys(SCENE_LABELS) as UsageScene[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/daily" className="p-2 rounded-xl bg-white/80 border border-primary-100 text-primary-600 hover:bg-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-primary-800">
            {isEditing ? '编辑日常记录' : '新增日常记录'}
          </h2>
          <p className="text-sm text-primary-500">记录您的眼部不适和用眼场景</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">基本信息</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">记录日期 *</label>
              <input
                type="date"
                className="input-field"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">记录时间</label>
              <input
                type="time"
                className="input-field"
                value={recordTime}
                onChange={(e) => setRecordTime(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">严重程度 *</label>
              <div className="flex gap-2">
                {(['mild', 'moderate', 'severe'] as SeverityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      severity === level
                        ? level === 'severe'
                          ? 'bg-red-500 text-white shadow-md'
                          : level === 'moderate'
                          ? 'bg-warning-500 text-white shadow-md'
                          : 'bg-accent-500 text-white shadow-md'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                  >
                    {SEVERITY_LABELS[level]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">
            症状表现 <span className="text-red-500">*（至少选择一项）</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allSymptoms.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={`p-4 rounded-xl text-left transition-all ${
                  symptoms.includes(s)
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}
              >
                <p className="font-medium text-sm">{SYMPTOM_LABELS[s]}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">发生场景</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allScenes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScene(s)}
                className={`p-4 rounded-xl text-left transition-all ${
                  scene === s
                    ? 'bg-gradient-accent text-white shadow-lg'
                    : 'bg-accent-50 text-accent-700 hover:bg-accent-100'
                }`}
              >
                <p className="font-medium text-sm">{SCENE_LABELS[s]}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">补充信息</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">持续时长（分钟）</label>
              <input
                type="number"
                className="input-field"
                placeholder="如：30"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">佩戴的眼镜</label>
              <select
                className="input-field"
                value={glassesId}
                onChange={(e) => setGlassesId(e.target.value)}
              >
                <option value="">未记录</option>
                {activeGlasses.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="form-label">备注</label>
            <textarea
              className="input-field min-h-[80px] resize-y"
              placeholder="详细描述症状或当时的情况..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-accent-500" />
            标签
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {DEFAULT_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tags.includes(tag)
                    ? 'bg-gradient-accent text-white shadow-md'
                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-50 text-accent-700 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button type="button" onClick={() => toggleTag(tag)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="添加自定义标签..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="btn-secondary"
            >
              添加
            </button>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/daily" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" />
            {isEditing ? '保存修改' : '保存记录'}
          </button>
        </div>
      </form>
    </div>
  );
}
