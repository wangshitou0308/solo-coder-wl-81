export interface EyeData {
  sphere: number;
  cylinder: number;
  axis: number;
  correctedVision: number;
}

export interface OptometryRecord {
  id: string;
  examDate: string;
  leftEye: EyeData;
  rightEye: EyeData;
  pd: number;
  organization: string;
  optometrist?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LensInfo {
  refractiveIndex: number;
  coatings: string[];
  brand?: string;
  type?: string;
}

export interface Glasses {
  id: string;
  name: string;
  frameBrand?: string;
  frameModel?: string;
  frameColor?: string;
  lens: LensInfo;
  purchaseDate: string;
  price?: number;
  optometryId?: string;
  status: 'active' | 'standby' | 'retired';
  replacementCycleMonths: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SymptomType =
  | 'eye_strain'
  | 'dryness'
  | 'dizziness'
  | 'blurred_vision'
  | 'headache'
  | 'tearing'
  | 'itching'
  | 'other';

export type UsageScene =
  | 'screen_work'
  | 'reading'
  | 'driving'
  | 'outdoor'
  | 'night_use'
  | 'gaming'
  | 'social'
  | 'other';

export type SeverityLevel = 'mild' | 'moderate' | 'severe';

export interface DailyLog {
  id: string;
  recordDate: string;
  recordTime?: string;
  symptoms: SymptomType[];
  severity: SeverityLevel;
  scene: UsageScene;
  durationMinutes?: number;
  glassesId?: string;
  notes?: string;
  createdAt: string;
}

export interface AppSettings {
  recommendedCheckupIntervalMonths: number;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}

export interface Reminder {
  id: string;
  type: 'checkup' | 'lens_replacement' | 'warning';
  title: string;
  description: string;
  date?: string;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string;
}

export const SYMPTOM_LABELS: Record<SymptomType, string> = {
  eye_strain: '眼疲劳',
  dryness: '眼干涩',
  dizziness: '眩晕',
  blurred_vision: '视物模糊',
  headache: '头痛',
  tearing: '流泪',
  itching: '眼痒',
  other: '其他',
};

export const SCENE_LABELS: Record<UsageScene, string> = {
  screen_work: '长时间屏幕',
  reading: '阅读',
  driving: '驾车',
  outdoor: '户外',
  night_use: '夜间使用',
  gaming: '游戏',
  social: '社交',
  other: '其他',
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  mild: '轻微',
  moderate: '中度',
  severe: '严重',
};

export const GLASSES_STATUS_LABELS: Record<Glasses['status'], string> = {
  active: '使用中',
  standby: '备用',
  retired: '已更换',
};

export const LENS_COATINGS_OPTIONS = [
  '防蓝光',
  '防紫外线',
  '抗疲劳',
  '变色',
  '防雾',
  '抗划伤',
  '减反光',
];

export const LENS_TYPES = ['单光', '渐进多焦点', '双光', '防近视控制', '散光定制'];

export const REFRACTIVE_INDEX_OPTIONS = [1.56, 1.61, 1.67, 1.74];
