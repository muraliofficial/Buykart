import React from 'react';

/**
 * Standardized Material Icon component
 * Ensures consistent rendering, sizing, alignment, and optical styles across all portals.
 */
const MaterialIcon = ({
  name,
  className = '',
  size = null,
  filled = false,
  style = {},
  ...props
}) => {
  const customStyle = {
    fontVariationSettings: filled ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    lineHeight: 1,
    fontSize: size ? (typeof size === 'number' ? `${size}px` : size) : undefined,
    ...style,
  };

  return (
    <span
      className={`material-symbols-outlined select-none shrink-0 ${className}`}
      style={customStyle}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
