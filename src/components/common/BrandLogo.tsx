import React from 'react';

interface BrandLogoProps {
  variant?: 'horizontal' | 'vector' | 'premium';
  className?: string;
  height?: number | string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  className = '',
  height,
}) => {
  // Official Variation 1: Horizontal Header Logo
  // Official Variation 2: Flat Vector-Style Logo
  // Official Variation 3: Premium PNG Logo
  let src = '/assets/branding/logo-horizontal.png';
  let alt = 'SRCova — NSUK Student Representative Selection System';

  if (variant === 'vector') {
    src = '/assets/branding/logo-vector.png';
    alt = 'SRCova Vector Shield Icon';
  } else if (variant === 'premium') {
    src = '/assets/branding/logo-premium.png';
    alt = 'SRCova Official Premium Emblem';
  }

  const style = height ? { height: typeof height === 'number' ? `${height}px` : height } : undefined;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={src}
        alt={alt}
        style={style}
        className="object-contain max-h-full transition-transform duration-200"
        loading="eager"
      />
    </div>
  );
};
