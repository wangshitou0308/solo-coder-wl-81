import type { EyeData, OptometryRecord, DailyLog, Glasses, Reminder } from '@/types';
import { getDaysDiff, getMonthsDiff, addMonthsToDate, getTodayStr, generateId, isDateBefore, getDateMonthsAgo, getDayOfWeek, getHourFromTime } from './dateUtils';

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
      isRead: false,
      isDismissed: false,
      createdAt: new Date().toISOString(),
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
        isRead: false,
        isDismissed: false,
        createdAt: new Date().toISOString(),
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
        type: 'degree_change',
        title: '度数变化较大请注意',
        description: `相比上次验光，左眼变化 ${change.left > 0 ? '+' : ''}${change.left}D，右眼变化 ${change.right > 0 ? '+' : ''}${change.right}D`,
        priority: 'medium',
        relatedId: latest.id,
        isRead: false,
        isDismissed: false,
        createdAt: new Date().toISOString(),
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

export const calculateSphericalEquivalent = (eye: EyeData): number => {
  return Number((eye.sphere + eye.cylinder / 2).toFixed(2));
};

export const getDegreeChangeSummary = (
  records: OptometryRecord[],
  periodMonths: number
): { leftSphere: number; rightSphere: number; leftSE: number; rightSE: number; leftCylinder: number; rightCylinder: number } | null => {
  const sorted = sortOptometryByDate(records);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];
  const cutoffDate = getDateMonthsAgo(periodMonths);
  const previous = sorted.filter((r) => r.examDate <= cutoffDate);
  if (previous.length === 0) return null;
  const prevRecord = previous[previous.length - 1];
  return {
    leftSphere: Number((latest.leftEye.sphere - prevRecord.leftEye.sphere).toFixed(2)),
    rightSphere: Number((latest.rightEye.sphere - prevRecord.rightEye.sphere).toFixed(2)),
    leftSE: Number((calculateSphericalEquivalent(latest.leftEye) - calculateSphericalEquivalent(prevRecord.leftEye)).toFixed(2)),
    rightSE: Number((calculateSphericalEquivalent(latest.rightEye) - calculateSphericalEquivalent(prevRecord.rightEye)).toFixed(2)),
    leftCylinder: Number((latest.leftEye.cylinder - prevRecord.leftEye.cylinder).toFixed(2)),
    rightCylinder: Number((latest.rightEye.cylinder - prevRecord.rightEye.cylinder).toFixed(2)),
  };
};

export const getAxisFluctuation = (
  records: OptometryRecord[]
): { leftMin: number; leftMax: number; rightMin: number; rightMax: number; leftRange: number; rightRange: number; isLeftAbnormal: boolean; isRightAbnormal: boolean } => {
  const sorted = sortOptometryByDate(records);
  const leftAxes = sorted.map((r) => r.leftEye.axis);
  const rightAxes = sorted.map((r) => r.rightEye.axis);
  const leftMin = Math.min(...leftAxes);
  const leftMax = Math.max(...leftAxes);
  const rightMin = Math.min(...rightAxes);
  const rightMax = Math.max(...rightAxes);
  const leftRange = leftMax - leftMin;
  const rightRange = rightMax - rightMin;
  return {
    leftMin,
    leftMax,
    rightMin,
    rightMax,
    leftRange,
    rightRange,
    isLeftAbnormal: leftRange > 30,
    isRightAbnormal: rightRange > 30,
  };
};

export const getSymptomHeatmapData = (
  logs: DailyLog[]
): { dayOfWeek: number; hour: number; count: number }[] => {
  const map: Record<string, number> = {};
  logs.forEach((log) => {
    if (!log.recordTime) return;
    const dayOfWeek = getDayOfWeek(log.recordDate);
    const hour = getHourFromTime(log.recordTime);
    const key = `${dayOfWeek}-${hour}`;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([key, count]) => {
    const [dayOfWeek, hour] = key.split('-').map(Number);
    return { dayOfWeek, hour, count };
  });
};

export const getGlassesDiscomfortStats = (
  logs: DailyLog[],
  glasses: Glasses[]
): { glassesId: string; glassesName: string; count: number; topScene: string; topSymptom: string }[] => {
  return glasses.map((g) => {
    const gLogs = logs.filter((l) => l.glassesId === g.id);
    const count = gLogs.length;
    const sceneFreq: Record<string, number> = {};
    const symptomFreq: Record<string, number> = {};
    gLogs.forEach((l) => {
      sceneFreq[l.scene] = (sceneFreq[l.scene] || 0) + 1;
      l.symptoms.forEach((s) => {
        symptomFreq[s] = (symptomFreq[s] || 0) + 1;
      });
    });
    const topScene = Object.entries(sceneFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const topSymptom = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    return { glassesId: g.id, glassesName: g.name, count, topScene, topSymptom };
  });
};

export const getConsecutiveRecordingDays = (logs: DailyLog[]): number => {
  if (logs.length === 0) return 0;
  const dates = [...new Set(logs.map((l) => l.recordDate))].sort().reverse();
  const today = getTodayStr();
  if (dates[0] !== today) return 0;
  let count = 1;
  for (let i = 1; i < dates.length; i++) {
    if (getDaysDiff(dates[i], dates[i - 1]) === 1) {
      count++;
    } else {
      break;
    }
  }
  return count;
};

export const getWeeklyDiscomfortCount = (logs: DailyLog[], weeksAgo: number = 0): number => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() - weeksAgo * 7);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startStr = startOfWeek.toISOString().split('T')[0];
  const endStr = endOfWeek.toISOString().split('T')[0];
  return logs.filter((l) => l.recordDate >= startStr && l.recordDate <= endStr).length;
};
