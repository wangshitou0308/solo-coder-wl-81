import type { OptometryRecord, Glasses, DailyLog, Reminder } from '@/types';
import { getDaysDiff, getMonthsDiff, addMonthsToDate, getTodayStr, generateId, isDateBefore } from './dateUtils';

export const getLatestOptometry = (records: OptometryRecord[]): OptometryRecord | null => {
  if (records.length === 0) return null;
  return [...records].sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())[0];
};

export const sortOptometryByDate = (records: OptometryRecord[]): OptometryRecord[] => {
  return [...records].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
};

export const calculateSphereChange = (
  current: OptometryRecord,
  previous: OptometryRecord | null
): { left: number; right: number } => {
  if (!previous) return { left: 0, right: 0 };
  return {
    left: Number((current.leftEye.sphere - previous.leftEye.sphere).toFixed(2)),
    right: Number((current.rightEye.sphere - previous.rightEye.sphere).toFixed(2)),
  };
};

export const getGlassesUsageDays = (glasses: Glasses): number => {
  return getDaysDiff(glasses.purchaseDate);
};

export const getGlassesUsageMonths = (glasses: Glasses): number => {
  return getMonthsDiff(glasses.purchaseDate);
};

export const getGlassesReplacementDate = (glasses: Glasses): string => {
  return addMonthsToDate(glasses.purchaseDate, glasses.replacementCycleMonths);
};

export const getGlassesDaysUntilReplacement = (glasses: Glasses): number => {
  const replacementDate = getGlassesReplacementDate(glasses);
  return getDaysDiff(getTodayStr(), replacementDate);
};

export const getGlassesUsageProgress = (glasses: Glasses): number => {
  const totalDays = glasses.replacementCycleMonths * 30;
  const usedDays = getGlassesUsageDays(glasses);
  const progress = (usedDays / totalDays) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

export const getNextRecommendedCheckupDate = (
  records: OptometryRecord[],
  intervalMonths: number = 6
): string | null => {
  const latest = getLatestOptometry(records);
  if (!latest) return null;
  return addMonthsToDate(latest.examDate, intervalMonths);
};

export const getDaysUntilCheckup = (
  records: OptometryRecord[],
  intervalMonths: number = 6
): number | null => {
  const nextDate = getNextRecommendedCheckupDate(records, intervalMonths);
  if (!nextDate) return null;
  return getDaysDiff(getTodayStr(), nextDate);
};

export const generateReminders = (
  records: OptometryRecord[],
  glasses: Glasses[],
  checkupIntervalMonths: number = 6
): Reminder[] => {
  const reminders: Reminder[] = [];

  const daysUntilCheckup = getDaysUntilCheckup(records, checkupIntervalMonths);
  const nextCheckupDate = getNextRecommendedCheckupDate(records, checkupIntervalMonths);
  if (daysUntilCheckup !== null && daysUntilCheckup <= 30) {
    reminders.push({
      id: generateId(),
      type: 'checkup',
      title: daysUntilCheckup <= 0 ? '建议尽快验光复查' : '临近验光复查时间',
      description:
        daysUntilCheckup <= 0
          ? `距上次验光已超过${checkupIntervalMonths}个月，建议尽快安排复查`
          : `距离建议验光日期还有${daysUntilCheckup}天`,
      date: nextCheckupDate || undefined,
      priority: daysUntilCheckup <= 0 ? 'high' : daysUntilCheckup <= 14 ? 'medium' : 'low',
    });
  }

  glasses.forEach((g) => {
    if (g.status === 'retired') return;
    const daysUntil = getGlassesDaysUntilReplacement(g);
    if (daysUntil <= 30) {
      reminders.push({
        id: generateId(),
        type: 'lens_replacement',
        title: daysUntil <= 0 ? `${g.name} 镜片建议更换` : `${g.name} 镜片临近更换周期`,
        description:
          daysUntil <= 0
            ? '镜片使用已超过建议周期，及时更换以保证视觉质量'
            : `距离建议更换还有${daysUntil}天`,
        date: getGlassesReplacementDate(g),
        priority: daysUntil <= 0 ? 'high' : daysUntil <= 14 ? 'medium' : 'low',
        relatedId: g.id,
      });
    }
  });

  const sorted = sortOptometryByDate(records);
  if (sorted.length >= 2) {
    const latest = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const change = calculateSphereChange(latest, prev);
    if (Math.abs(change.left) >= 0.5 || Math.abs(change.right) >= 0.5) {
      reminders.push({
        id: generateId(),
        type: 'warning',
        title: '度数变化较大请注意',
        description: `相比上次验光，左眼变化 ${change.left > 0 ? '+' : ''}${change.left}D，右眼变化 ${change.right > 0 ? '+' : ''}${change.right}D`,
        priority: 'medium',
        relatedId: latest.id,
      });
    }
  }

  return reminders.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

export const getDailyLogsByDateRange = (
  logs: DailyLog[],
  startDate: string,
  endDate: string
): DailyLog[] => {
  return logs.filter(
    (log) => !isDateBefore(log.recordDate, startDate) && !isDateBefore(endDate, log.recordDate)
  );
};

export const getSymptomFrequency = (logs: DailyLog[]): Record<string, number> => {
  const freq: Record<string, number> = {};
  logs.forEach((log) => {
    log.symptoms.forEach((s) => {
      freq[s] = (freq[s] || 0) + 1;
    });
  });
  return freq;
};

export const getSceneFrequency = (logs: DailyLog[]): Record<string, number> => {
  const freq: Record<string, number> = {};
  logs.forEach((log) => {
    freq[log.scene] = (freq[log.scene] || 0) + 1;
  });
  return freq;
};
