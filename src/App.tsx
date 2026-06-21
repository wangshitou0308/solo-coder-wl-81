import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import OptometryList from '@/pages/Optometry/OptometryList';
import OptometryForm from '@/pages/Optometry/OptometryForm';
import OptometryCharts from '@/pages/Optometry/OptometryCharts';
import GlassesList from '@/pages/Glasses/GlassesList';
import GlassesForm from '@/pages/Glasses/GlassesForm';
import DailyLogList from '@/pages/DailyLog/DailyLogList';
import DailyLogForm from '@/pages/DailyLog/DailyLogForm';
import DailyLogAnalysis from '@/pages/DailyLog/DailyLogAnalysis';
import Settings from '@/pages/Settings';
import Reminders from '@/pages/Reminders';
import Plans from '@/pages/Plans';
import Goals from '@/pages/Goals';
import Report from '@/pages/Report';
import Export from '@/pages/Export';
import Profiles from '@/pages/Profiles';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/optometry" element={<OptometryList />} />
          <Route path="/optometry/new" element={<OptometryForm />} />
          <Route path="/optometry/:id" element={<OptometryForm />} />
          <Route path="/optometry/charts" element={<OptometryCharts />} />
          <Route path="/glasses" element={<GlassesList />} />
          <Route path="/glasses/new" element={<GlassesForm />} />
          <Route path="/glasses/:id" element={<GlassesForm />} />
          <Route path="/daily" element={<DailyLogList />} />
          <Route path="/daily/new" element={<DailyLogForm />} />
          <Route path="/daily/:id" element={<DailyLogForm />} />
          <Route path="/daily/analysis" element={<DailyLogAnalysis />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/report" element={<Report />} />
          <Route path="/export" element={<Export />} />
          <Route path="/profiles" element={<Profiles />} />
        </Route>
      </Routes>
    </Router>
  );
}
