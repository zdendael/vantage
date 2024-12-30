import React from 'react';
import * as LucideIcons from 'lucide-react';

interface StatusIconProps {
  icon: string;
  color: string;
  className?: string;
}

export function StatusIcon({ icon, color, className = "h-5 w-5" }: StatusIconProps) {
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Circle;
  
  return <IconComponent className={className} color={color} />;
}
