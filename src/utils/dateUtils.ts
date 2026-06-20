import {
  format,
  differenceInDays,
  differenceInMonths,
  addMonths,
  parseISO,
  isAfter,
  isBefore,
} from 'date-fns';

export const formatDate = (dateStr: string, fmt: string = 'yyyy年MM月dd日'): string => {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
};

export const formatDateShort = (dateStr: string): string => {
  return formatDate(dateStr, 'MM/dd');
};

export const getTodayStr = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getDaysDiff = (startDate: string, endDate: string = getTodayStr()): number => {
  return differenceInDays(parseISO(endDate), parseISO(startDate));
};

export const getMonthsDiff = (startDate: string, endDate: string = getTodayStr()): number => {
  return differenceInMonths(parseISO(endDate), parseISO(startDate));
};

export const addMonthsToDate = (dateStr: string, months: number): string => {
  return format(addMonths(parseISO(dateStr), months), 'yyyy-MM-dd');
};

export const isDateAfter = (dateA: string, dateB: string): boolean => {
  return isAfter(parseISO(dateA), parseISO(dateB));
};

export const isDateBefore = (dateA: string, dateB: string): boolean => {
  return isBefore(parseISO(dateA), parseISO(dateB));
};

export const formatDuration = (minutes?: number): string => {
  if (!minutes) return '未记录';
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

export const formatSphere = (value: number): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}D`;
};

export const formatCylinder = (value: number): string => {
  if (value === 0) return '无散光';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}D`;
};

export const formatAxis = (value: number): string => {
  return `${value}°`;
};

export const formatVision = (value: number): string => {
  return value.toFixed(1);
};

export const formatPrice = (value?: number): string => {
  if (!value) return '未记录';
  return `¥${value.toFixed(0)}`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const getDateMonthsAgo = (months: number): string => {
  return format(addMonths(new Date(), -months), 'yyyy-MM-dd');
};
