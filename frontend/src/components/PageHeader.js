import React from 'react';

const PageHeader = ({ title, subtitle, className = '', children }) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      {children}
    </div>
  );
};

export default PageHeader;
