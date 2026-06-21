import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Image, Tag } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useOptometryStore } from '@/store/optometryStore';
import { useOrgStore } from '@/store/orgStore';
import type { EyeData, OptometryRecord, OptometryPhoto } from '@/types';
import { DEFAULT_TAGS, SUGGESTED_ORGS, DEFAULT_PD_TEMPLATES } from '@/types';
import { getTodayStr, generateId } from '@/utils/dateUtils';

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
  const { organizations, add: addOrg, incrementUseCount } = useOrgStore();
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [examDate, setExamDate] = useState(getTodayStr());
  const [organization, setOrganization] = useState('');
  const [optometrist, setOptometrist] = useState('');
  const [pd, setPd] = useState('64');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<OptometryPhoto[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<OptometryPhoto | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
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
        setPhotos(record.photos || []);
        setTags(record.tags || []);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const photo: OptometryPhoto = {
          id: generateId(),
          url,
          name: file.name,
          addedAt: new Date().toISOString(),
        };
        setPhotos((prev) => [...prev, photo]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (lightboxPhoto?.id === photoId) {
      setLightboxPhoto(null);
    }
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
    }
    setCustomTag('');
  };

  const handleOrgSelect = (orgName: string) => {
    setOrganization(orgName);
  };

  const handlePdTemplateSelect = (pdValue: number) => {
    setPd(String(pdValue));
  };

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
      photos,
      tags,
      leftEye: parseEyeData(leftEye),
      rightEye: parseEyeData(rightEye),
    };

    const existingOrg = organizations.find((o) => o.name === organization);
    if (existingOrg) {
      incrementUseCount(existingOrg.id);
    } else if (organization.trim()) {
      addOrg({ name: organization.trim() });
    }

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
              <div className="flex flex-wrap gap-1.5 mt-2">
                {DEFAULT_PD_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      pd === String(tpl.pd)
                        ? 'bg-accent-500 text-white border-accent-500'
                        : 'bg-white/80 text-primary-600 border-primary-200 hover:border-accent-400'
                    }`}
                    onClick={() => handlePdTemplateSelect(tpl.pd)}
                  >
                    {tpl.name} {tpl.pd}mm
                  </button>
                ))}
              </div>
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
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTED_ORGS.map((orgName) => (
                  <button
                    key={orgName}
                    type="button"
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      organization === orgName
                        ? 'bg-accent-500 text-white border-accent-500'
                        : 'bg-white/80 text-primary-600 border-primary-200 hover:border-accent-400'
                    }`}
                    onClick={() => handleOrgSelect(orgName)}
                  >
                    {orgName}
                  </button>
                ))}
                {organizations
                  .filter((o) => !SUGGESTED_ORGS.includes(o.name))
                  .slice(0, 5)
                  .map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        organization === org.name
                          ? 'bg-accent-500 text-white border-accent-500'
                          : 'bg-white/80 text-primary-600 border-primary-200 hover:border-accent-400'
                      }`}
                      onClick={() => handleOrgSelect(org.name)}
                    >
                      {org.name}
                    </button>
                  ))}
              </div>
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
            <div
              className="border-2 border-dashed border-primary-200 rounded-xl p-6 text-center hover:border-accent-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-primary-400" />
              <p className="text-sm text-primary-500">点击上传验光单照片</p>
              <p className="text-xs text-primary-400 mt-1">支持 JPG、PNG 格式，可多选</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-lg overflow-hidden border border-primary-100 aspect-square cursor-pointer"
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photo.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

          <div className="mt-4">
            <label className="form-label flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              标签
            </label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {DEFAULT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-accent-500 text-white border-accent-500'
                      : 'bg-white/80 text-primary-600 border-primary-200 hover:border-accent-400'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-accent-50 text-accent-700 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      className="hover:text-red-500 transition-colors"
                      onClick={() => toggleTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="添加自定义标签"
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
                className="btn-secondary text-sm"
                onClick={addCustomTag}
              >
                添加
              </button>
            </div>
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

      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-primary-600 hover:text-red-500 transition-colors z-10"
              onClick={() => setLightboxPhoto(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <p className="text-center text-white/80 text-sm mt-2">{lightboxPhoto.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
