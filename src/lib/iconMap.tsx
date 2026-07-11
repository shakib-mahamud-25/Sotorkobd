import {
  MessageSquareWarning,
  Volume2,
  Footprints,
  HandMetal,
  EyeOff,
  AlertTriangle,
  Bus,
  Lightbulb,
  CameraOff,
  CircleEllipsis,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquareWarning,
  Volume2,
  Footprints,
  HandMetal,
  EyeOff,
  AlertTriangle,
  Bus,
  Lightbulb,
  CameraOff,
  CircleEllipsis,
};

export function CategoryIcon({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? CircleEllipsis;
  return <Icon size={size} className={className} />;
}
