/**
 * Shared icon resolver utility.
 * Maps icon name strings (from industry vocabulary configs) to Lucide React components.
 */
import {
  GraduationCap,
  Users,
  Heart,
  Briefcase,
  User,
  Building2,
  Globe,
  ShoppingCart,
  Target,
  Handshake,
  Star,
  UserCheck,
  Stethoscope,
  Baby,
  HeartPulse,
  Building,
  Landmark,
  PiggyBank,
  Shield,
  Award,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'graduation-cap': GraduationCap,
  'users': Users,
  'heart': Heart,
  'briefcase': Briefcase,
  'user': User,
  'building-2': Building2,
  'building2': Building2,
  'building': Building,
  'globe': Globe,
  'shopping-cart': ShoppingCart,
  'target': Target,
  'handshake': Handshake,
  'star': Star,
  'user-check': UserCheck,
  'stethoscope': Stethoscope,
  'baby': Baby,
  'heart-pulse': HeartPulse,
  'landmark': Landmark,
  'piggy-bank': PiggyBank,
  'shield': Shield,
  'award': Award,
};

/**
 * Resolves a kebab-case icon name string to a Lucide icon component.
 * Falls back to the User icon for unknown names.
 */
export function resolveIcon(name?: string | null): LucideIcon {
  if (!name) return User;
  return iconMap[name] || User;
}
