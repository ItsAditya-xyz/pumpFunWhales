import React from 'react';

const Loader = ({ size = 'md', color = 'purple' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorClasses = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-ping`}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full absolute animate-pulse`}></div>
    </div>
  );
};

export default Loader;