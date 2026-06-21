export interface EyeData {
  sphere: number;
  cylinder: number;
  axis: number;
  correctedVision: number;
}

export interface OptometryPhoto {
  id: string;
  url: string;
  name: string;
  addedAt: string;
}

export interface OptometryRecord {
  id: string;
  examDate: string;
  leftEye: EyeData;
  rightEye: EyeData;
  pd: number;
  organization: string;
  optometrist?: string;
  photos: OptometryPhoto[];
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LensInfo {
  refractiveIndex: number;
  coatings: string[];
  brand?: string;
  type?: string;
}

export type GlassesRole = 'primary' | 'standby' | 'retired';

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
  role: GlassesRole;
  replacementCycleMonths: number;
  notes?: string;
  tags: string[];
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
  tags: string[];
  createdAt: string;
}

export interface AppSettings {
  recommendedCheckupIntervalMonths: number;
  defaultReplacementCycleMonths: number;
  notificationsEnabled: boolean;
  checkupReminderEnabled: boolean;
  lensReplacementReminderEnabled: boolean;
  degreeChangeReminderEnabled: boolean;
  theme: 'light' | 'dark';
  currentProfileId: string;
}

export interface Reminder {
  id: string;
  type: 'checkup' | 'lens_replacement' | 'degree_change';
  title: string;
  description: string;
  date?: string;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
}

export type PlanStatus = 'planned' | 'in_progress' | 'completed' | 'skipped';

export interface OptometryPlan {
  id: string;
  title: string;
  plannedDate: string;
  organization?: string;
  notes?: string;
  status: PlanStatus;
  completedDate?: string;
  glassesId?: string;
  type: 'checkup' | 'replacement' | 'purchase';
  createdAt: string;
  updatedAt: string;
}

export interface HealthGoal {
  id: string;
  type: 'weekly_discomfort_decrease' | 'consecutive_recording';
  title: string;
  target: number;
  current: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  relation: string;
  createdAt: string;
}

export interface CommonOrganization {
  id: string;
  name: string;
  address?: string;
  useCount: number;
}

export interface PdTemplate {
  id: string;
  name: string;
  pd: number;
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

export const GLASSES_ROLE_LABELS: Record<GlassesRole, string> = {
  primary: '主力佩戴',
  standby: '备用眼镜',
  retired: '已退役',
};

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  planned: '计划中',
  in_progress: '进行中',
  completed: '已完成',
  skipped: '已跳过',
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

export const DEFAULT_TAGS = [
  '医院复查',
  '办公眼镜',
  '夜间明显',
  '户外活动',
  '运动专用',
  '重要提醒',
  '需要关注',
];

export const SUGGESTED_ORGS = [
  '爱尔眼科医院',
  '同仁医院眼科',
  '温州医科大学附属眼视光医院',
  '中山眼科中心',
  '复旦大学附属眼耳鼻喉科医院',
  '本地眼镜店',
];

export const DEFAULT_PD_TEMPLATES: PdTemplate[] = [
  { id: 'pd-1', name: '成人标准远用', pd: 64 },
  { id: 'pd-2', name: '成人标准近用', pd: 61 },
  { id: 'pd-3', name: '青少年标准', pd: 60 },
  { id: 'pd-4', name: '儿童标准', pd: 56 },
];
