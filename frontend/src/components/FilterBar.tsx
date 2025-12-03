"use client";

import { ReactNode } from "react";

import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dropdown } from "./ui/dropdown";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  label: string;
  value: string;
  type: 'text' | 'select' | 'date';
  placeholder?: string;
  options?: FilterOption[];
  onChange: (value: string) => void;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onClear?: () => void;
  className?: string;
  children?: ReactNode;
}

export default function FilterBar({ 
  filters, 
  onClear, 
  className = "",
  children 
}: FilterBarProps) {
  const gridCols = Math.min(filters.length + (children ? 1 : 0) + (onClear ? 1 : 0), 6);
  
  return (
    <Card className={`p-4 mb-6 ${className}`}>
      <div className={`grid grid-cols-1 gap-4 md:grid-cols-${gridCols}`}>
        {filters.map((filter, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            {filter.type === 'text' && (
              <Input
                placeholder={filter.placeholder || filter.label}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
              />
            )}
            {filter.type === 'select' && (
              <Dropdown
                value={filter.value}
                onChange={filter.onChange}
                options={filter.options || []}
                placeholder={filter.placeholder || filter.label}
                className="w-full"
              />
            )}
            {filter.type === 'date' && (
              <Input
                type="date"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
              />
            )}
          </div>
        ))}
        
        {children}
        
        {onClear && (
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={onClear}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}