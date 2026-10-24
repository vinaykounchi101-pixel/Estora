import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'content' | 'reading';
}

export function Container({ className, size = 'content', children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-5 sm:px-8 lg:px-14',
        size === 'content' ? 'max-w-[1440px]' : 'max-w-[760px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
