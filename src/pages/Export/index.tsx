import Card from '@/components/ui/Card';
import { useOptometryStore } from '@/store/optometryStore';
import { useGlassesStore } from '@/store/glassesStore';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useSettingsStore } from '@/store/settingsStore';
import { usePlanStore } from '@/store/planStore';
import { useGoalStore } from '@/store/goalStore';
import { useProfileStore } from '@/store/profileStore';
import { useOrgStore } from '@/store/orgStore';
import { sortOptometryByDate, getSymptomFrequency } from '@/utils/visionUtils';
import { formatDate, getTodayStr } from '@/utils/dateUtils';
import {
  SYMPTOM_LABELS,
  SEVERITY_LABELS,
  SCENE_LABELS,
  GLASSES_STATUS_LABELS,
  GLASSES_ROLE_LABELS,
} from '@/types';
import type { SymptomType } from '@/types';
import { Download, FileText, Printer, FileJson } from 'lucide-react';

function getExportDate() {
  return getTodayStr();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string | number | undefined | null): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvRows(headers: string[], rows: string[][]): string {
  const lines = [headers.join(','), ...rows.map((r) => r.join(','))];
  return lines.join('\n');
}

export default function ExportPage() {
  const records = useOptometryStore((s) => s.records);
  const glasses = useGlassesStore((s) => s.glasses);
  const logs = useDailyLogStore((s) => s.logs);
  const settings = useSettingsStore((s) => s);
  const plans = usePlanStore((s) => s.plans);
  const goals = useGoalStore((s) => s.goals);
  const profiles = useProfileStore((s) => s.profiles);
  const organizations = useOrgStore((s) => s.organizations);

  const handleExportJson = () => {
    const data = {
      optometryRecords: records,
      glasses,
      dailyLogs: logs,
      settings: {
        recommendedCheckupIntervalMonths: settings.recommendedCheckupIntervalMonths,
        defaultReplacementCycleMonths: settings.defaultReplacementCycleMonths,
        notificationsEnabled: settings.notificationsEnabled,
        checkupReminderEnabled: settings.checkupReminderEnabled,
        lensReplacementReminderEnabled: settings.lensReplacementReminderEnabled,
        degreeChangeReminderEnabled: settings.degreeChangeReminderEnabled,
        theme: settings.theme,
        currentProfileId: settings.currentProfileId,
      },
      plans,
      goals,
      profiles,
      organizations,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    triggerDownload(blob, `vision-health-data-${getExportDate()}.json`);
  };

  const handleExportOptometryCsv = () => {
    const headers = [
      '日期', '机构', '左眼球镜', '左眼柱镜', '左眼轴位', '左眼矫正视力',
      '右眼球镜', '右眼柱镜', '右眼轴位', '右眼矫正视力', '瞳距', '备注',
    ];
    const rows = sortOptometryByDate(records).map((r) => [
      escapeCsvField(r.examDate),
      escapeCsvField(r.organization),
      escapeCsvField(r.leftEye.sphere),
      escapeCsvField(r.leftEye.cylinder),
      escapeCsvField(r.leftEye.axis),
      escapeCsvField(r.leftEye.correctedVision),
      escapeCsvField(r.rightEye.sphere),
      escapeCsvField(r.rightEye.cylinder),
      escapeCsvField(r.rightEye.axis),
      escapeCsvField(r.rightEye.correctedVision),
      escapeCsvField(r.pd),
      escapeCsvField(r.notes),
    ]);
    const csv = '\uFEFF' + buildCsvRows(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, `vision-optometry-${getExportDate()}.csv`);
  };

  const handleExportGlassesCsv = () => {
    const headers = ['名称', '镜架品牌', '配镜日期', '状态', '角色', '镜片折射率', '镜片品牌', '价格'];
    const rows = glasses.map((g) => [
      escapeCsvField(g.name),
      escapeCsvField(g.frameBrand),
      escapeCsvField(g.purchaseDate),
      escapeCsvField(GLASSES_STATUS_LABELS[g.status]),
      escapeCsvField(GLASSES_ROLE_LABELS[g.role]),
      escapeCsvField(g.lens.refractiveIndex),
      escapeCsvField(g.lens.brand),
      escapeCsvField(g.price),
    ]);
    const csv = '\uFEFF' + buildCsvRows(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, `vision-glasses-${getExportDate()}.csv`);
  };

  const handleExportDailyLogCsv = () => {
    const headers = ['日期', '时间', '症状', '严重程度', '场景', '持续时长', '佩戴眼镜', '备注'];
    const rows = logs.map((l) => {
      const glassesItem = l.glassesId
        ? glasses.find((g) => g.id === l.glassesId)?.name ?? ''
        : '';
      return [
        escapeCsvField(l.recordDate),
        escapeCsvField(l.recordTime),
        escapeCsvField(l.symptoms.map((s) => SYMPTOM_LABELS[s as SymptomType] ?? s).join('/')),
        escapeCsvField(SEVERITY_LABELS[l.severity]),
        escapeCsvField(SCENE_LABELS[l.scene]),
        escapeCsvField(l.durationMinutes ? `${l.durationMinutes}分钟` : ''),
        escapeCsvField(glassesItem),
        escapeCsvField(l.notes),
      ];
    });
    const csv = '\uFEFF' + buildCsvRows(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, `vision-daily-${getExportDate()}.csv`);
  };

  const handlePrintView = () => {
    const sorted = sortOptometryByDate(records);
    const symptomFreq = getSymptomFrequency(logs);
    const topSymptoms = Object.entries(symptomFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const recentLogs = logs.slice(0, 10);
    const today = formatDate(getTodayStr());

    const optometryRows = sorted
      .map(
        (r) => `<tr>
          <td>${r.examDate}</td>
          <td>${r.organization}</td>
          <td>${r.leftEye.sphere}</td>
          <td>${r.leftEye.cylinder}</td>
          <td>${r.leftEye.axis}</td>
          <td>${r.leftEye.correctedVision}</td>
          <td>${r.rightEye.sphere}</td>
          <td>${r.rightEye.cylinder}</td>
          <td>${r.rightEye.axis}</td>
          <td>${r.rightEye.correctedVision}</td>
          <td>${r.pd}</td>
        </tr>`
      )
      .join('');

    const symptomSummaryRows = topSymptoms
      .map(
        ([key, count]) =>
          `<tr><td>${SYMPTOM_LABELS[key as SymptomType] ?? key}</td><td>${count}</td></tr>`
      )
      .join('');

    const recentLogRows = recentLogs
      .map(
        (l) => `<tr>
          <td>${l.recordDate}</td>
          <td>${l.recordTime ?? ''}</td>
          <td>${l.symptoms.map((s) => SYMPTOM_LABELS[s as SymptomType] ?? s).join(', ')}</td>
          <td>${SEVERITY_LABELS[l.severity]}</td>
          <td>${SCENE_LABELS[l.scene]}</td>
        </tr>`
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>验光历史与症状摘要</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .date { color: #64748b; font-size: 14px; margin-bottom: 32px; }
    h2 { font-size: 18px; margin: 28px 0 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: center; }
    th { background: #f8fafc; font-weight: 600; color: #334155; }
    td { color: #475569; }
    .empty { text-align: center; padding: 24px; color: #94a3b8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>验光历史与症状摘要</h1>
  <p class="date">生成日期：${today}</p>

  <h2>验光历史</h2>
  ${sorted.length > 0 ? `<table>
    <thead>
      <tr><th>日期</th><th>机构</th><th>左眼球镜</th><th>左眼柱镜</th><th>左眼轴位</th><th>左眼矫正视力</th><th>右眼球镜</th><th>右眼柱镜</th><th>右眼轴位</th><th>右眼矫正视力</th><th>瞳距</th></tr>
    </thead>
    <tbody>${optometryRows}</tbody>
  </table>` : '<p class="empty">暂无验光记录</p>'}

  <h2>症状摘要</h2>
  ${topSymptoms.length > 0 ? `<table>
    <thead><tr><th>症状</th><th>出现次数</th></tr></thead>
    <tbody>${symptomSummaryRows}</tbody>
  </table>` : '<p class="empty">暂无症状记录</p>'}

  <h2>近期日常记录</h2>
  ${recentLogs.length > 0 ? `<table>
    <thead><tr><th>日期</th><th>时间</th><th>症状</th><th>严重程度</th><th>场景</th></tr></thead>
    <tbody>${recentLogRows}</tbody>
  </table>` : '<p class="empty">暂无日常记录</p>'}
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-gradient-primary text-white shadow-md">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary-800">数据导出</h1>
          <p className="text-sm text-primary-500">导出您的视力健康数据</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-accent-50 text-accent-600">
            <FileJson className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-primary-800">导出JSON</h2>
        </div>
        <p className="text-sm text-primary-500 mb-4">
          将所有数据（验光记录、眼镜、日常记录、设置、计划、目标、档案、机构）导出为JSON文件
        </p>
        <button
          onClick={handleExportJson}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Download className="w-4 h-4" />
          导出JSON
        </button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-accent-50 text-accent-600">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-primary-800">导出CSV</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary-50/50 rounded-xl">
            <div>
              <p className="font-medium text-primary-800">验光记录</p>
              <p className="text-sm text-primary-500">{records.length} 条记录</p>
            </div>
            <button
              onClick={handleExportOptometryCsv}
              className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              导出验光记录CSV
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-primary-50/50 rounded-xl">
            <div>
              <p className="font-medium text-primary-800">眼镜</p>
              <p className="text-sm text-primary-500">{glasses.length} 条记录</p>
            </div>
            <button
              onClick={handleExportGlassesCsv}
              className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              导出眼镜CSV
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-primary-50/50 rounded-xl">
            <div>
              <p className="font-medium text-primary-800">日常记录</p>
              <p className="text-sm text-primary-500">{logs.length} 条记录</p>
            </div>
            <button
              onClick={handleExportDailyLogCsv}
              className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              导出日常记录CSV
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-accent-50 text-accent-600">
            <Printer className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-primary-800">打印视图</h2>
        </div>
        <p className="text-sm text-primary-500 mb-4">
          生成包含验光历史、症状摘要和近期日常记录的打印友好页面
        </p>
        <button
          onClick={handlePrintView}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" />
          生成打印视图
        </button>
      </Card>
    </div>
  );
}
