export interface AnalysisSession {
  id: string;
  video_url: string;
  video_name: string;
  video_size: number | null;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  motion_type: MotionType | null;
  motion_type_label: string | null;
  confidence: number | null;
  ai_description: string | null;
  parameters: MotionParameters | null;
  trajectory_data: TrajectoryPoint[] | null;
  position_time_data: PositionTimePoint[] | null;
  velocity_time_data: VelocityTimePoint[] | null;
  acceleration_time_data: AccelerationTimePoint[] | null;
  created_at: string;
  updated_at: string;
}

export type MotionType =
  | 'linear_uniform'
  | 'linear_accelerated'
  | 'circular'
  | 'projectile'
  | 'oscillation'
  | 'free_fall'
  | 'other';

export interface MotionParameters {
  velocity?: string | null;
  acceleration?: string | null;
  period?: string | null;
  amplitude?: string | null;
  distance?: string | null;
  duration?: string | null;
  initial_velocity?: string | null;
  angle?: string | null;
  radius?: string | null;
  angular_velocity?: string | null;
  equation?: string | null;
}

export interface TrajectoryPoint { x: number; y: number; }
export interface PositionTimePoint { t: number; s: number; }
export interface VelocityTimePoint { t: number; v: number; }
export interface AccelerationTimePoint { t: number; a: number; }

export const MOTION_TYPE_LABELS: Record<MotionType, string> = {
  linear_uniform: 'Chuyển động thẳng đều',
  linear_accelerated: 'Chuyển động thẳng biến đổi đều',
  circular: 'Chuyển động tròn',
  projectile: 'Chuyển động ném xiên/ngang',
  oscillation: 'Dao động',
  free_fall: 'Rơi tự do',
  other: 'Khác',
};

export const MOTION_TYPE_COLORS: Record<MotionType, string> = {
  linear_uniform: 'hsl(199, 89%, 48%)',
  linear_accelerated: 'hsl(217, 71%, 35%)',
  circular: 'hsl(142, 71%, 45%)',
  projectile: 'hsl(38, 92%, 50%)',
  oscillation: 'hsl(280, 65%, 60%)',
  free_fall: 'hsl(0, 72%, 51%)',
  other: 'hsl(215, 14%, 46%)',
};
