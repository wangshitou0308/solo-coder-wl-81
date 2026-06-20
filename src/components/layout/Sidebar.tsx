import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Eye,
  Glasses,
  ClipboardList,
  LineChart,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '数据看板' },
  { to: '/optometry', icon: Eye, label: '验光记录' },
  { to: '/optometry/charts', icon: LineChart, label: '趋势图表' },
  { to: '/glasses', icon: Glasses, label: '眼镜管理' },
  { to: '/daily', icon: ClipboardList, label: '日常记录' },
  { to: '/daily/analysis', icon: Sparkles, label: '关联分析' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-white/50 h-screen fixed left-0 top-0 flex flex-col shadow-lg">
      <div className="p-6 border-b border-primary-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-primary-800">视界</h1>
            <p className="text-xs text-primary-500">视力健康管理</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-100/50">
        <div className="glass-card p-4 bg-gradient-accent/10">
          <p className="text-xs text-primary-600 font-medium mb-1">护眼小贴士</p>
          <p className="text-sm text-primary-700 leading-relaxed">
            遵循 20-20-20 原则：每用眼20分钟，远眺20英尺外20秒
          </p>
        </div>
      </div>
    </aside>
  );
}
