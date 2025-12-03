"use client";

import { ReactNode } from "react";

import { Card } from "./ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  className = "",
  trend 
}: StatsCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center">
        {icon && (
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {value}
            </div>
            {trend && (
              <div className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-1">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}