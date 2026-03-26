import { Badge } from "@/components/ui/badge";
import { MOTION_TYPE_LABELS, type MotionType } from "@/lib/types";

interface MotionBadgeProps {
  type: MotionType;
  label?: string | null;
}

const iconMap: Record<MotionType, string> = {
  linear_uniform: "➡️",
  linear_accelerated: "🚀",
  circular: "🔄",
  projectile: "🏹",
  oscillation: "〰️",
  free_fall: "⬇️",
  other: "🔬",
};

export function MotionBadge({ type, label }: MotionBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm font-medium">
      <span>{iconMap[type] || "🔬"}</span>
      {label || MOTION_TYPE_LABELS[type]}
    </Badge>
  );
}
