import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { DEFAULT_USER_AVATAR } from '@/lib/default-avatar';

interface AdminUserProfile {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: AdminUserProfile | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user
}: UserAvatarProfileProps) {
  const name = user?.name ?? '';
  const email = user?.email ?? '';
  const avatarUrl = user?.avatarUrl || DEFAULT_USER_AVATAR;
  const initials = getInitials(name || email, 'AD');

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={avatarUrl} alt={name || email || 'User'} />
        <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{name || 'Admin'}</span>
          <span className='truncate text-xs'>
            {email || 'admin@example.com'}
          </span>
        </div>
      )}
    </div>
  );
}
