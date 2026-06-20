import { Link } from 'react-router-dom';
import { Plus, Calendar, Building2, Eye, ChevronRight, Trash2, Edit } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useOptometryStore } from '@/store/optometryStore';
import { sortOptometryByDate, calculateSphereChange } from '@/utils/visionUtils';
import { formatDate, formatSphere, formatCylinder, formatAxis, formatVision } from '@/utils/dateUtils';

export default function OptometryList() {
  const { records, deleteRecord } = useOptometryStore();
  const sorted = [...sortOptometryByDate(records)].reverse();

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-primary-600">
          共 <span className="font-semibold text-primary-800">{records.length}</span> 条验光记录
        </p>
        <Link to="/optometry/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          新增验光记录
        </Link>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-12 text-center">
          <Eye className="w-16 h-16 mx-auto mb-4 text-primary-300" />
          <h3 className="text-lg font-semibold text-primary-700 mb-2">暂无验光记录</h3>
          <p className="text-primary-500 mb-6">开始记录您的验光数据，追踪视力变化</p>
          <Link to="/optometry/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            添加第一条记录
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((record, index) => {
            const prevIndex = sorted.length - 1 - index;
            const sortedAsc = sortOptometryByDate(records);
            const prev = prevIndex > 0 ? sortedAsc[prevIndex - 1] : null;
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
    </div>
  );
}
