"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconColor?: 'blue' | 'indigo' | 'slate' | 'gray' | 'green' | 'purple' | 'red' | 'yellow';
  children?: ReactNode;
}

export default function PageHeader({ 
  title, 
  description, 
  icon, 
  iconColor = 'blue', 
  children 
}: PageHeaderProps) {
  const getIconClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      slate: 'bg-slate-100 text-slate-600',
      gray: 'bg-gray-100 text-gray-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`p-3 rounded-xl ${getIconClasses(iconColor)}`}>
            <div className="w-8 h-8">
              {icon}
            </div>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}