import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useGlassesStore } from '@/store/glassesStore';
import { useOptometryStore } from '@/store/optometryStore';
import type { Glasses, LensInfo } from '@/types';
import { LENS_COATINGS_OPTIONS, LENS_TYPES, REFRACTIVE_INDEX_OPTIONS } from '@/types';
import { getTodayStr, formatDate } from '@/utils/dateUtils';

interface LensFormData {
  refractiveIndex: string;
  coatings: string[];
  brand: string;
  type: string;
}

export default function GlassesForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addGlasses, updateGlasses, getGlassesById } = useGlassesStore();
  const records = useOptometryStore((s) => s.records);
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [frameBrand, setFrameBrand] = useState('');
  const [frameModel, setFrameModel] = useState('');
  const [frameColor, setFrameColor] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(getTodayStr());
  const [price, setPrice] = useState('');
  const [optometryId, setOptometryId] = useState('');
  const [status, setStatus] = useState<Glasses['status']>('active');
  const [replacementCycleMonths, setReplacementCycleMonths] = useState('12');
  const [notes, setNotes] = useState('');
  const [lens, setLens] = useState<LensFormData>({
    refractiveIndex: '1.61',
    coatings: [],
    brand: '',
    type: '单光',
  });

  useEffect(() => {
    if (isEditing && id) {
      const glasses = getGlassesById(id);
      if (glasses) {
        setName(glasses.name);
        setFrameBrand(glasses.frameBrand || '');
        setFrameModel(glasses.frameModel || '');
        setFrameColor(glasses.frameColor || '');
        setPurchaseDate(glasses.purchaseDate);
        setPrice(glasses.price ? String(glasses.price) : '');
        setOptometryId(glasses.optometryId || '');
        setStatus(glasses.status);
        setReplacementCycleMonths(String(glasses.replacementCycleMonths));
        setNotes(glasses.notes || '');
        setLens({
          refractiveIndex: String(glasses.lens.refractiveIndex),
          coatings: glasses.lens.coatings,
          brand: glasses.lens.brand || '',
          type: glasses.lens.type || '单光',
        });
      }
    }
  }, [isEditing, id, getGlassesById]);

  const toggleCoating = (coating: string) => {
    setLens((prev) => ({
      ...prev,
      coatings: prev.coatings.includes(coating)
        ? prev.coatings.filter((c) => c !== coating)
        : [...prev.coatings, coating],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lensData: LensInfo = {
      refractiveIndex: parseFloat(lens.refractiveIndex) || 1.56,
      coatings: lens.coatings,
      brand: lens.brand || undefined,
      type: lens.type || undefined,
    };

    const glassesData: Omit<Glasses, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      frameBrand: frameBrand || undefined,
      frameModel: frameModel || undefined,
      frameColor: frameColor || undefined,
      lens: lensData,
      purchaseDate,
      price: price ? parseFloat(price) : undefined,
      optometryId: optometryId || undefined,
      status,
      replacementCycleMonths: parseInt(replacementCycleMonths) || 12,
      notes: notes || undefined,
    };

    if (isEditing && id) {
      updateGlasses(id, glassesData);
    } else {
      addGlasses(glassesData);
    }
    navigate('/glasses');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/glasses" className="p-2 rounded-xl bg-white/80 border border-primary-100 text-primary-600 hover:bg-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-primary-800">
            {isEditing ? '编辑眼镜档案' : '新增眼镜档案'}
          </h2>
          <p className="text-sm text-primary-500">记录眼镜的详细信息和使用周期</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">基本信息</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">眼镜昵称 *</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：日常通勤款"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">配镜日期 *</label>
              <input
                type="date"
                className="input-field"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">使用状态</label>
              <select
                className="input-field"
                value={status}
                onChange={(e) => setStatus(e.target.value as Glasses['status'])}
              >
                <option value="active">使用中</option>
                <option value="standby">备用</option>
                <option value="retired">已更换</option>
              </select>
            </div>
            <div>
              <label className="form-label">建议更换周期（月）</label>
              <select
                className="input-field"
                value={replacementCycleMonths}
                onChange={(e) => setReplacementCycleMonths(e.target.value)}
              >
                <option value="6">6 个月</option>
                <option value="12">12 个月</option>
                <option value="18">18 个月</option>
                <option value="24">24 个月</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="form-label">价格（元）</label>
            <input
              type="number"
              className="input-field"
              placeholder="如：1580"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="form-label">关联验光记录</label>
            <select
              className="input-field"
              value={optometryId}
              onChange={(e) => setOptometryId(e.target.value)}
            >
              <option value="">无关联</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {formatDate(r.examDate)} - {r.organization}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">镜架信息</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">镜架品牌</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：雷朋"
                value={frameBrand}
                onChange={(e) => setFrameBrand(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">镜架型号</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：RB5154"
                value={frameModel}
                onChange={(e) => setFrameModel(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">镜架颜色</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：黑色"
                value={frameColor}
                onChange={(e) => setFrameColor(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">镜片信息</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="form-label">折射率 *</label>
              <select
                className="input-field"
                value={lens.refractiveIndex}
                onChange={(e) => setLens({ ...lens, refractiveIndex: e.target.value })}
              >
                {REFRACTIVE_INDEX_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">镜片类型</label>
              <select
                className="input-field"
                value={lens.type}
                onChange={(e) => setLens({ ...lens, type: e.target.value })}
              >
                {LENS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">镜片品牌</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：依视路、蔡司"
                value={lens.brand}
                onChange={(e) => setLens({ ...lens, brand: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="form-label">功能膜层（可多选）</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {LENS_COATINGS_OPTIONS.map((coating) => (
                <button
                  key={coating}
                  type="button"
                  onClick={() => toggleCoating(coating)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    lens.coatings.includes(coating)
                      ? 'bg-gradient-accent text-white shadow-md'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {coating}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-serif text-lg font-semibold text-primary-800 mb-4">备注</h4>
          <textarea
            className="input-field min-h-[80px] resize-y"
            placeholder="选填，关于这副眼镜的其他信息..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Card>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/glasses" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" />
            {isEditing ? '保存修改' : '保存档案'}
          </button>
        </div>
      </form>
    </div>
  );
}
