"use client";

interface PageLoadingProps {
  message?: string;
  description?: string;
}

export default function PageLoading({ 
  message = "Carregando...", 
  description
}: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{message}</h1>
          {description && (
            <p className="text-slate-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function InlineLoading({ 
  message = "Carregando...", 
  size = 'md' 
}: { 
  message?: string; 
  size?: 'sm' | 'md' | 'lg' 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 ${sizeClasses[size]} mb-4`}></div>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
}

export function ButtonLoading({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5"
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${sizeClasses[size]}`}></div>
  );
}
