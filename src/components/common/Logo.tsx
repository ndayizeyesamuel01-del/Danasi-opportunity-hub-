/**
 * DANASI OPPORTUNITY HUB — Brand Mark
 * Founder: NDAYIZEYE Samuel
 */

import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark', size = 'md' }) => {
  const isLight = variant === 'light';
  
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-base tracking-tight',
    md: 'text-lg font-bold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original DANASI Geometric Portal Symbol: Intersecting diamond and global portal vectors */}
      <svg
        className={`${iconSizes[size]} shrink-0`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="8" fill={isLight ? '#FFFFFF' : '#0B192C'} />
        {/* Outer shield pathway in royal blue */}
        <path
          d="M20 7L32 14V26L20 33L8 26V14L20 7Z"
          stroke={isLight ? '#1E40AF' : '#3B82F6'}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Inner golden diamond portal representing opportunity gateway */}
        <path
          d="M20 14L26 20L20 26L14 20L20 14Z"
          fill="#D97706"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Core meridian bridge representing Rwanda to Global connection */}
        <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
      </svg>

      <div className="flex flex-col">
        <span
          className={`font-display uppercase leading-none ${textSizes[size]} ${
            isLight ? 'text-white' : 'text-slate-900'
          }`}
        >
          DANASI
        </span>
        <span
          className={`text-[9px] font-semibold tracking-wider uppercase leading-tight ${
            isLight ? 'text-amber-400' : 'text-blue-700'
          }`}
        >
          Opportunity Hub
        </span>
      </div>
    </div>
  );
};
