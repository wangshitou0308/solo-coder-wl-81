import { Link } from 'react-router-dom';
import { Plus, Glasses as GlassesIcon, Edit, Trash2, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import RingProgress from '@/components/charts/RingProgress';
import { useGlassesStore } from '@/store/glassesStore';
import { useOptometryStore } from '@/store/optometryStore';
import {
  getGlassesUsageDays,
  getGlassesUsageProgress,
  getGlassesReplacementDate,
  getGlassesDaysUntilReplacement,
} from '@/utils/visionUtils';
import { formatDate, formatPrice } from '@/utils/dateUtils';
import { GLASSES_STATUS_LABELS } from '@/types';

export default function GlassesList() {
  const { glasses, deleteGlasses, updateGlasses } = useGlassesStore();
  const records = useOptometryStore((s) => s.records);
  const sorted = [...glasses].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">使用中</Badge>;
      case 'standby':
        return <Badge variant="info">备用</Badge>;
      case 'retired':
        return <Badge variant="default">已更换</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-primary-600">
          共管理 <span className="font-semibold text-primary-800">{glasses.length}</span> 副眼镜
        </p>
        <Link to="/glasses/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          添加眼镜
        </Link>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-12 text-center">
          <GlassesIcon className="w-16 h-16 mx-auto mb-4 text-primary-300" />
          <h3 className="text-lg font-semibold text-primary-700 mb-2">暂无眼镜档案</h3>
          <p className="text-primary-500 mb-6">添加您的眼镜信息，追踪使用与更换周期</p>
          <Link to="/glasses/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            添加第一副眼镜
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sorted.map((g) => {
            const usageDays = getGlassesUsageDays(g);
            const progress = getGlassesUsageProgress(g);
            const replacementDate = getGlassesReplacementDate(g);
            const daysUntil = getGlassesDaysUntilReplacement(g);
            const relatedOptometry = records.find((r) => r.id === g.optometryId);

            return (
              <Card key={g.id} className="p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg">
                        <GlassesIcon className="w-7 h-7" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-lg font-semibold text-primary-800">{g.name}</h3>
                          {getStatusBadge(g.status)}
                        </div>
                        <p className="text-sm text-primary-500 mt-0.5">
                          {g.frameBrand || '未记录品牌'}
                          {g.frameModel && ` · ${g.frameModel}`}
                          {g.frameColor && ` · ${g.frameColor}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {g.status !== 'retired' && (
                        <button
                          onClick={() => updateGlasses(g.id, { status: 'retired' })}
                          className="p-2 rounded-lg text-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                          title="标记为已更换"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      {g.status === 'retired' && (
                        <button
                          onClick={() => updateGlasses(g.id, { status: 'standby' })}
                          className="p-2 rounded-lg text-accent-400 hover:text-accent-600 hover:bg-accent-50 transition-all"
                          title="恢复为备用"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteGlasses(g.id)}
                        className="p-2 rounded-lg text-primary-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/glasses/${g.id}`}
                        className="p-2 rounded-lg text-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    {g.status !== 'retired' && (
                      <RingProgress
                        progress={progress}
                        size={100}
                        strokeWidth={8}
                        label={`${usageDays}`}
                        sublabel="使用天数"
                      />
                    )}

                    <div className="flex-1 space-y-2.5">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-primary-400 mb-0.5">镜片信息</p>
                          <p className="text-primary-700 font-medium">
                            {g.lens.refractiveIndex}折射率
                            {g.lens.brand && ` · ${g.lens.brand}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-400 mb-0.5">镜片类型</p>
                          <p className="text-primary-700 font-medium">{g.lens.type || '单光'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-400 mb-0.5">功能膜层</p>
                          <p className="text-primary-700 font-medium">
                            {g.lens.coatings.length > 0 ? g.lens.coatings.join('、') : '无'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-400 mb-0.5">配镜价格</p>
                          <p className="text-primary-700 font-medium">{formatPrice(g.price)}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-primary-100 flex items-center gap-4 text-xs text-primary-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          配镜：{formatDate(g.purchaseDate)}
                        </span>
                        {g.status !== 'retired' && (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5" />
                            建议更换：{formatDate(replacementDate)}
                            {daysUntil !== null && (
                              <span className={daysUntil <= 0 ? 'text-red-500 ml-1' : 'ml-1'}>
                                ({daysUntil > 0 ? `${daysUntil}天后` : `已逾期${Math.abs(daysUntil)}天`})
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {relatedOptometry && (
                        <div className="pt-2 text-xs text-accent-600">
                          关联验光：{formatDate(relatedOptometry.examDate)} · {relatedOptometry.organization}
                        </div>
                      )}
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
