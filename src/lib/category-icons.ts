import {
  Clapperboard,
  Compass,
  FileText,
  Gamepad2,
  LayoutDashboard,
  Lock,
  MessageCircle,
  ShoppingCart,
  type LucideIcon,
  Waypoints,
} from "lucide-react";
import { createElement } from "react";

const categoryIconBySlug: Record<string, LucideIcon> = {
  commerce: ShoppingCart,
  dashboards: LayoutDashboard,
  forms: FileText,
  gaming: Gamepad2,
  media: Clapperboard,
  navigation: Waypoints,
  paywall: Lock,
  social: MessageCircle,
};

export function getCategoryIcon(slug?: string | null): LucideIcon {
  if (!slug) {
    return Compass;
  }

  return categoryIconBySlug[slug.toLowerCase()] ?? Compass;
}

export function CategoryIcon({
  slug,
  className,
}: {
  slug?: string | null;
  className?: string;
}) {
  return createElement(getCategoryIcon(slug), {
    className,
    "aria-hidden": true,
  });
}
