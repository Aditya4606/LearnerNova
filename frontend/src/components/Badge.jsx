import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const variantStyles = {
    default: "border-[#FB460D]/40 text-[#FB460D]",
    muted: "border-[#8A817C] text-[#8A817C]",
    success: "border-[#10B981]/40 text-[#10B981]",
    warning: "border-[#F59E0B]/40 text-[#F59E0B]",
    danger: "border-[#EF4444]/40 text-[#EF4444]",
  };

  return (
    <span className={`inline-flex items-center border ${variantStyles[variant] || variantStyles.default} text-[10px] uppercase tracking-[0.1em] px-3 py-1 font-semibold rounded-none select-none ${className}`}>
      {children}
    </span>
  );
}
