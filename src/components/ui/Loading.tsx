
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

export function Loading({ size = 'md', fullScreen = false, text }: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn('animate-spin text-blue-600', sizes[size])} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
