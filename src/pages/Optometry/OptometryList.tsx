import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Building2, Eye, ChevronRight, Trash2, Edit, Filter, X, Image } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useOptometryStore } from '@/store/optometryStore';
import { sortOptometryByDate, calculateSphereChange } from '@/utils/visionUtils';
import { formatDate, formatSphere, formatCylinder, formatAxis, formatVision } from '@/utils/dateUtils';
import type { OptometryPhoto, OptometryRecord } from '@/types';

export default function OptometryList() {
  const { records, deleteRecord } = useOptometryStore();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [changeFilter, setChangeFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; name: string } | null>(null);

  const sorted = [...sortOptometryByDate(records)].reverse();
  const sortedAsc = sortOptometryByDate(records);

  const uniqueOrgs = [...new Set(records.map((r) => r.organization))].sort();

  const getChangeMagnitude = (record: OptometryRecord, idx: number): number => {
    const ascIdx = sortedAsc.findIndex((r) => r.id === record.id);
    const prev = ascIdx > 0 ? sortedAsc[ascIdx - 1] : null;
    if (!prev) return 0;
    const change = calculateSphereChange(record, prev);
    return Math.max(Math.abs(change.left), Math.abs(change.right));
  };

  const filtered = sorted.filter((record, index) => {
    if (dateFrom && record.examDate < dateFrom) return false;
    if (dateTo && record.examDate > dateTo) return false;
    if (orgFilter && record.organization !== orgFilter) return false;
    if (changeFilter !== 'all') {
      const magnitude = getChangeMagnitude(record, index);
      if (changeFilter === 'small' && magnitude >= 0.25) return false;
      if (changeFilter === 'medium' && (magnitude < 0.25 || magnitude > 0.5)) return false;
      if (changeFilter === 'large' && magnitude <= 0.5) return false;
    }
    return true;
  });

  const hasActiveFilters = dateFrom || dateTo || orgFilter || changeFilter !== 'all';

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setOrgFilter('');
    setChangeFilter('all');
  };

  const getChangeBadge = (change: number) => {
    if (change === 0) return <Badge variant="success">无变化</Badge>;
    if (Math.abs(change) < 0.5) {
      return (
        <Badge variant={change > 0 ? 'warning' : 'info'}>
          {change > 0 ? '+' : ''}
          {change.toFixed(2)}D
        </Badge>
      );
    }
    return (
      <Badge variant="danger">
        {change > 0 ? '+' : ''}
        {change.toFixed(2)}D
      </Badge>
    );
  };

  const changeFilterOptions: { value: 'all' | 'small' | 'medium' | 'large'; label: string }[] = [
    { value: 'all', label: '全部变化' },
    { value: 'small', label: '轻微变化(<0.25D)' },
    { value: 'medium', label: '中度变化(0.25-0.5D)' },
    { value: 'large', label: '明显变化(>0.5D)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-primary-600">
          共 <span className="font-semibold text-primary-800">{filtered.length}</span> 条验光记录
          {hasActiveFilters && (
            <span className="text-primary-400 text-sm ml-1">（已筛选，共 {records.length} 条）</span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`btn-primary ${filterOpen ? 'bg-primary-700' : ''}`}
          >
            <Filter className="w-4 h-4" />
            筛选
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 rounded-full bg-accent-400 inline-block" />
            )}
          </button>
          <Link to="/optometry/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            新增验光记录
          </Link>
        </div>
      </div>

      {filterOpen && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-primary-700">筛选条件</span>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-primary-400 hover:text-primary-700 flex items-center gap-1 transition-all">
                <X className="w-3.5 h-3.5" />
                清除筛选
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="form-label">开始日期</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">结束日期</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">机构</label>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="input-field"
              >
                <option value="">全部机构</option>
                {uniqueOrgs.map((org) => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label mb-2">度数变化幅度</label>
            <div className="flex flex-wrap gap-2">
              {changeFilterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setChangeFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    changeFilter === opt.value
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Eye className="w-16 h-16 mx-auto mb-4 text-primary-300" />
          <h3 className="text-lg font-semibold text-primary-700 mb-2">
            {hasActiveFilters ? '没有匹配的记录' : '暂无验光记录'}
          </h3>
          <p className="text-primary-500 mb-6">
            {hasActiveFilters ? '尝试调整筛选条件查看更多记录' : '开始记录您的验光数据，追踪视力变化'}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="btn-primary">
              <X className="w-4 h-4" />
              清除筛选
            </button>
          ) : (
            <Link to="/optometry/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              添加第一条记录
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((record) => {
            const ascIdx = sortedAsc.findIndex((r) => r.id === record.id);
            const prev = ascIdx > 0 ? sortedAsc[ascIdx - 1] : null;
            const change = calculateSphereChange(record, prev);

            return (
              <Card key={record.id} className="p-6 hover:shadow-glass-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg">
                      <Calendar className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-primary-800">
                        {formatDate(record.examDate)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-primary-400" />
                        <span className="text-sm text-primary-500">{record.organization}</span>
                        {record.optometrist && (
                          <span className="text-sm text-primary-400">· {record.optometrist}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {prev && (
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs text-primary-400">变化</span>
                        {getChangeBadge(change.left)}
                        {getChangeBadge(change.right)}
                      </div>
                    )}
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="p-2 rounded-lg text-primary-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/optometry/${record.id}`}
                      className="p-2 rounded-lg text-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/optometry/charts"
                      className="p-2 rounded-lg text-primary-400 hover:text-accent-600 hover:bg-accent-50 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary-50/70 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-primary-600" />
                      <span className="text-sm font-medium text-primary-700">左眼 (OS)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div>
                        <p className="text-xs text-primary-400 mb-1">球镜</p>
                        <p className="font-bold text-primary-800">{formatSphere(record.leftEye.sphere)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-400 mb-1">柱镜</p>
                        <p className="font-bold text-primary-800">{formatCylinder(record.leftEye.cylinder)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-400 mb-1">轴位</p>
                        <p className="font-bold text-primary-800">{formatAxis(record.leftEye.axis)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-400 mb-1">矫正视力</p>
                        <p className="font-bold text-primary-800">{formatVision(record.leftEye.correctedVision)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-accent-50/70 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-accent-500" />
                      <span className="text-sm font-medium text-accent-700">右眼 (OD)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div>
                        <p className="text-xs text-accent-500 mb-1">球镜</p>
                        <p className="font-bold text-accent-800">{formatSphere(record.rightEye.sphere)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-accent-500 mb-1">柱镜</p>
                        <p className="font-bold text-accent-800">{formatCylinder(record.rightEye.cylinder)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-accent-500 mb-1">轴位</p>
                        <p className="font-bold text-accent-800">{formatAxis(record.rightEye.axis)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-accent-500 mb-1">矫正视力</p>
                        <p className="font-bold text-accent-800">{formatVision(record.rightEye.correctedVision)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {record.photos.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                    <Image className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    {record.photos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setLightboxPhoto({ url: photo.url, name: photo.name })}
                        className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 border-primary-100 hover:border-primary-400 transition-all"
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {record.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {record.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-primary-100 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-primary-500">
                    <span>瞳距: {record.pd}mm</span>
                    {record.notes && <span className="line-clamp-1">备注: {record.notes}</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 hover:text-primary-900 transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.name}
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            />
            <p className="text-center text-white/80 text-sm mt-3">{lightboxPhoto.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
