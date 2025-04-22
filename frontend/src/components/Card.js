import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 dark:text-gray-200 dark:border dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
