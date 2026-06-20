import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useOptometryStore } from '@/store/optometryStore';
import type { EyeData, OptometryRecord } from '@/types';
import { getTodayStr } from '@/utils/dateUtils';

interface EyeFormData {
  sphere: string;
  cylinder: string;
  axis: string;
  correctedVision: string;
}

export default function OptometryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addRecord, updateRecord, getRecordById } = useOptometryStore();
  const isEditing = !!id;

  const [examDate, setExamDate] = useState(getTodayStr());
  const [organization, setOrganization] = useState('');
  const [optometrist, setOptometrist] = useState('');
  const [pd, setPd] = useState('64');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [leftEye, setLeftEye] = useState<EyeFormData>({
    sphere: '',
    cylinder: '0',
    axis: '0',
    correctedVision: '1.0',
  });
  const [rightEye, setRightEye] = useState<EyeFormData>({
    sphere: '',
    cylinder: '0',
    axis: '0',
    correctedVision: '1.0',
  });

  useEffect(() => {
    if (isEditing && id) {
      const record = getRecordById(id);
      if (record) {
        setExamDate(record.examDate);
        setOrganization(record.organization);
        setOptometrist(record.optometrist || '');
        setPd(String(record.pd));
        setNotes(record.notes || '');
        setPhotoUrl(record.photoUrl || '');
        setLeftEye({
          sphere: String(record.leftEye.sphere),
          cylinder: String(record.leftEye.cylinder),
          axis: String(record.leftEye.axis),
          correctedVision: String(record.leftEye.correctedVision),
        });
        setRightEye({
          sphere: String(record.rightEye.sphere),
          cylinder: String(record.rightEye.cylinder),
          axis: String(record.rightEye.axis),
          correctedVision: String(record.rightEye.correctedVision),
        });
      }
    }
  }, [isEditing, id, getRecordById]);

  const parseEyeData = (data: EyeFormData): EyeData => ({
    sphere: parseFloat(data.sphere) || 0,
    cylinder: parseFloat(data.cylinder) || 0,
    axis: parseInt(data.axis) || 0,
    correctedVision: parseFloat(data.correctedVision) || 1.0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recordData: Omit<OptometryRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      examDate,
      organization,
      optometrist: optometrist || undefined,
      pd: parseFloat(pd) || 64,
      notes: notes || undefined,
      photoUrl: photoUrl || undefined,
      leftEye: parseEyeData(leftEye),
      rightEye: parseEyeData(rightEye),
    };

    if (isEditing && id) {
      updateRecord(id, recordData);
    } else {
      addRecord(recordData);
    }
    navigate('/optometry');
  };

  const EyeFormSection = ({
    title,
    color,
    data,
    onChange,
  }: {
    title: string;
    color: string;
    data: EyeFormData;
    onChange: (data: EyeFormData) => void;
  }) => (
    <Card className={`p-6 border-l-4 ${color === 'primary' ? 'border-l-primary-600' : 'border-l-accent-500'}`}>
      <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">{title}</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">球镜度数 (S)</label>
          <input
            type="number"
            step="0.25"
            className="input-field"
            placeholder="如 -3.00"
            value={data.sphere}
            onChange={(e) => onChange({ ...data, sphere: e.target.value })}
          />
          <p className="text-xs text-primary-400 mt-1">近视负数，远视正数</p>
        </div>
        <div>
          <label className="form-label">柱镜度数 (C)</label>
          <input
            type="number"
            step="0.25"
            className="input-field"
            placeholder="如 -0.50"
            value={data.cylinder}
            onChange={(e) => onChange({ ...data, cylinder: e.target.value })}
          />
          <p className="text-xs text-primary-400 mt-1">散光度数，无散光填0</p>
        </div>
        <div>
          <label className="form-label">轴位 (A)</label>
          <input
            type="number"
            min="0"
            max="180"
            className="input-field"
            placeholder="0-180"
            value={data.axis}
            onChange={(e) => onChange({ ...data, axis: e.target.value })}
          />
          <p className="text-xs text-primary-400 mt-1">散光轴位角度</p>
        </div>
        <div>
          <label className="form-label">矫正视力</label>
          <input
            type="number"
            step="0.1"
            className="input-field"
            placeholder="如 1.0"
            value={data.correctedVision}
            onChange={(e) => onChange({ ...data, correctedVision: e.target.value })}
          />
          <p className="text-xs text-primary-400 mt-1">最佳矫正视力</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/optometry" className="p-2 rounded-xl bg-white/80 border border-primary-100 text-primary-600 hover:bg-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-primary-800">
            {isEditing ? '编辑验光记录' : '新增验光记录'}
          </h2>
          <p className="text-sm text-primary-500">请填写验光单上的详细数据</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">基本信息</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">验光日期 *</label>
              <input
                type="date"
                className="input-field"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">瞳距 (mm)</label>
              <input
                type="number"
                step="0.5"
                className="input-field"
                placeholder="64"
                value={pd}
                onChange={(e) => setPd(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">验光机构 *</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：爱尔眼科医院"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">验光师</label>
              <input
                type="text"
                className="input-field"
                placeholder="选填"
                value={optometrist}
                onChange={(e) => setOptometrist(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="form-label">验光单照片</label>
            <div className="border-2 border-dashed border-primary-200 rounded-xl p-6 text-center hover:border-accent-400 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-primary-400" />
              <p className="text-sm text-primary-500">点击或拖拽上传验光单照片</p>
              <p className="text-xs text-primary-400 mt-1">支持 JPG、PNG 格式</p>
              {photoUrl && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-accent-50 rounded-full text-sm text-accent-700">
                  已上传
                  <button type="button" onClick={() => setPhotoUrl('')}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="form-label">备注</label>
            <textarea
              className="input-field min-h-[80px] resize-y"
              placeholder="选填，如验光时的特殊情况、医生建议等"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EyeFormSection title="左眼 (OS)" color="primary" data={leftEye} onChange={setLeftEye} />
          <EyeFormSection title="右眼 (OD)" color="accent" data={rightEye} onChange={setRightEye} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/optometry" className="btn-secondary">
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
