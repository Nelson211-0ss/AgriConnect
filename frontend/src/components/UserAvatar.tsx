import { cn, initials } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 'h-8 w-8 text-xs rounded-lg',
  md: 'h-9 w-9 text-sm rounded-lg',
  lg: 'h-16 w-16 text-xl rounded-2xl',
  xl: 'h-20 w-20 text-2xl rounded-2xl',
};

export function UserAvatar({ name, avatarUrl, size = 'md', className }: UserAvatarProps) {
  const sizeClass = SIZES[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn('shrink-0 object-cover bg-slate-100', sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-forest font-semibold text-white',
        sizeClass,
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
