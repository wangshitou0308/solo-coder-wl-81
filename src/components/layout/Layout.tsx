import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useOptometryStore } from '@/store/optometryStore';
import { useGlassesStore } from '@/store/glassesStore';
import { useDailyLogStore } from '@/store/dailyLogStore';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: '数据看板', subtitle: '一览您的视力健康状态' },
  '/optometry': { title: '验光记录', subtitle: '管理您的历史验光数据' },
  '/optometry/new': { title: '新增验光记录', subtitle: '录入最新验光数据' },
  '/optometry/charts': { title: '视力趋势分析', subtitle: '可视化度数变化轨迹' },
  '/glasses': { title: '眼镜管理', subtitle: '追踪每副眼镜的使用状态' },
  '/glasses/new': { title: '新增眼镜档案', subtitle: '记录新配眼镜信息' },
  '/daily': { title: '日常记录', subtitle: '记录佩戴感受与眼部症状' },
  '/daily/new': { title: '新增日常记录', subtitle: '记录今日眼部状态' },
  '/daily/analysis': { title: '症状关联分析', subtitle: '探索症状与用眼习惯的关联' },
};

export default function Layout() {
  const location = useLocation();
  const initOptometry = useOptometryStore((s) => s.initMockData);
  const initGlasses = useGlassesStore((s) => s.initMockData);
  const initDailyLogs = useDailyLogStore((s) => s.initMockData);

  useEffect(() => {
    initOptometry();
    initGlasses();
    initDailyLogs();
  }, [initOptometry, initGlasses, initDailyLogs]);

  const getPageInfo = () => {
    for (const [path, info] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path) && path !== '/') {
        return info;
      }
    }
    return pageTitles['/'] || { title: '视界', subtitle: '视力健康管理' };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
