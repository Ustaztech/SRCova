import React from 'react';

interface CandidateAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CandidateAvatar: React.FC<CandidateAvatarProps> = ({
  src,
  name = 'Candidate',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  const getInitials = (n: string) => {
    return (
      n
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'C'
    );
  };

  if (src && (src.startsWith('data:image') || src.startsWith('http') || src.startsWith('/assets'))) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-xl object-cover border border-[#075B40]/40 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#003B2B] to-[#075B40] text-[#D5AC49] flex items-center justify-center font-bold border border-[#D5AC49]/40 shrink-0 shadow-xs select-none ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
