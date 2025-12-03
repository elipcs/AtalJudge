import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ListsFiltersProps {
  search: string;
  userRole: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  isSearching?: boolean;
}

export default function ListsFilters({
  search,
  userRole: _userRole,
  onSearchChange,
  onClearFilters,
  isSearching = false
}: ListsFiltersProps) {
  const hasActiveFilters = search;

  return (
    <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Buscar</h3>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClearFilters}
            className="text-sm border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
          >
            Limpar Busca
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="relative">
          <Input
            placeholder="Buscar listas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`h-10 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl transition-all duration-200 ${isSearching ? 'pr-10' : ''}`}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-r-transparent"/>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
