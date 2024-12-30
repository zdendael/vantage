import * as Icons from 'lucide-react';

export const getIconComponent = (iconName: string) => {
  const icon = (Icons as Record<string, React.ComponentType>)[iconName];
  if (!icon) {
    console.warn(`Icon ${iconName} not found, using default`);
    return Icons.Circle;
  }
  return icon;
};
