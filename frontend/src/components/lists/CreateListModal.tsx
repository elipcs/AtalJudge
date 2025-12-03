import { useState, useEffect } from "react";

import { CreateListRequest } from "@/services/lists";
import { fromBrazilianDateTimeLocal, validateNotPastDate, validateEndDateAfterStartDate } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listData: CreateListRequest) => Promise<void>;
  classes: Array<{ id: string; name: string }>;
}

export default function CreateListModal({ isOpen, onClose, onSubmit, classes }: CreateListModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    classIds: [] as string[],
    countTowardScore: false,
    isRestricted: false
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({
    startDate: '',
    endDate: '',
    dateRange: ''
  });

  useEffect(() => {
    if (form.startDate || form.endDate) {
      validateDatesInRealTime();
    }
  }, [form.startDate, form.endDate]);

  const validateDates = () => {
    const newErrors = {
      startDate: '',
      endDate: '',
      dateRange: ''
    };

    if (form.startDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.startDate))) {
      newErrors.startDate = 'A data de início não pode ser no passado';
    }

    if (form.endDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.endDate))) {
      newErrors.endDate = 'A data de fim não pode ser no passado';
    }

    if (form.startDate && form.endDate) {
      const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      
      if (!validateEndDateAfterStartDate(startDateISO, endDateISO)) {
        newErrors.dateRange = 'A data de fim deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return !newErrors.startDate && !newErrors.endDate && !newErrors.dateRange;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    setTimeout(() => {
      validateDatesInRealTime();
    }, 0);
  };

  const validateDatesInRealTime = () => {
    const newErrors = {
      startDate: '',
      endDate: '',
      dateRange: ''
    };

    if (form.startDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.startDate))) {
      newErrors.startDate = 'A data de início não pode ser no passado';
    }

    if (form.endDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.endDate))) {
      newErrors.endDate = 'A data de fim não pode ser no passado';
    }

    if (form.startDate && form.endDate) {
      const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      
      if (!validateEndDateAfterStartDate(startDateISO, endDateISO)) {
        newErrors.dateRange = 'A data de fim deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    if (!form.title.trim()) return false;
    
    if (form.classIds.length === 0) return false;
    
    const tempErrors = {
      startDate: '',
      endDate: '',
      dateRange: ''
    };

    if (form.startDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.startDate))) {
      tempErrors.startDate = 'A data de início não pode ser no passado';
    }

    if (form.endDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.endDate))) {
      tempErrors.endDate = 'A data de fim não pode ser no passado';
    }

    if (form.startDate && form.endDate) {
      const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      
      if (!validateEndDateAfterStartDate(startDateISO, endDateISO)) {
        tempErrors.dateRange = 'A data de fim deve ser posterior à data de início';
      }
    }

    return !tempErrors.startDate && !tempErrors.endDate && !tempErrors.dateRange;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      return;
    }

    if (!validateDates()) {
      return;
    }

    try {
      setLoading(true);
      setSaveSuccess(false);
      
      const now = new Date();
      const defaultEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const listData: CreateListRequest = {
        title: form.title,
        description: form.description,
        startDate: form.startDate ? fromBrazilianDateTimeLocal(form.startDate) : now.toISOString(),
        endDate: form.endDate ? fromBrazilianDateTimeLocal(form.endDate) : defaultEndDate.toISOString(),
        classIds: form.classIds,
        countTowardScore: form.countTowardScore,
        isRestricted: form.isRestricted
      };

      await onSubmit(listData);
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        setForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          classIds: [] as string[],
          countTowardScore: false,
          isRestricted: false
        });
        setErrors({
          startDate: '',
          endDate: '',
          dateRange: ''
        });
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        classIds: [] as string[],
        countTowardScore: false,
        isRestricted: false
      });
      setErrors({
        startDate: '',
        endDate: '',
        dateRange: ''
      });
      setSaveSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Nova Lista</h2>
              <p className="text-sm text-slate-600 mt-0.5">Crie uma nova lista de questões</p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-white/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800 font-semibold">Lista criada com sucesso!</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da lista"
                disabled={loading}
                required
                className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Digite a descrição da lista"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
                rows={3}
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Data de Início
                </label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  disabled={loading}
                  className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 bg-white text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                    errors.startDate 
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' 
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Data de Fim
                </label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  disabled={loading}
                  className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 bg-white text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                    errors.endDate 
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' 
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            {errors.dateRange && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800 flex-1">{errors.dateRange}</p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Turmas *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = Array.isArray(classes) ? classes.map(c => c.id) : [];
                      setForm(prev => ({ ...prev, classIds: allIds }));
                    }}
                    disabled={loading}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selecionar Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, classIds: [] }));
                    }}
                    disabled={loading}
                    className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              
              <div className="border border-slate-300 rounded-xl p-4 max-h-40 overflow-y-auto bg-slate-50">
                {classes.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    Nenhuma turma disponível
                  </div>
                ) : (
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <label key={cls.id} className="flex items-center p-3 hover:bg-white rounded-lg transition-colors cursor-pointer">
                        <Checkbox
                          checked={form.classIds.includes(cls.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm(prev => ({ ...prev, classIds: [...prev.classIds, cls.id] }));
                            } else {
                              setForm(prev => ({ ...prev, classIds: prev.classIds.filter(id => id !== cls.id) }));
                            }
                          }}
                          disabled={loading}
                          className="mr-3"
                          variant="text"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-slate-900">{cls.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {form.classIds.length === 0 && (
                <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-red-800 font-semibold">Selecione pelo menos uma turma</p>
                  </div>
                </div>
              )}

              {form.classIds.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-blue-800">
                      {form.classIds.length} turma{form.classIds.length !== 1 ? 's' : ''} selecionada{form.classIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-700">
                    {form.classIds.map(id => {
                      const cls = classes.find(c => c.id === id);
                      return cls?.name;
                    }).filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
              
              <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={form.countTowardScore}
                    onChange={(e) => setForm(prev => ({ ...prev, countTowardScore: e.target.checked }))}
                    disabled={loading}
                    className="mr-2"
                    variant="text"
                  />
                  <span className="text-sm font-medium text-slate-700">Esta lista conta para a nota</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={form.isRestricted}
                    onChange={(e) => setForm(prev => ({ ...prev, isRestricted: e.target.checked }))}
                    disabled={loading}
                    className="mr-2"
                    variant="text"
                  />
                  <span className="text-sm font-medium text-slate-700">Restringir acesso por IP</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button 
                type="button"
                onClick={handleClose} 
                disabled={loading}
                className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading || !isFormValid() || saveSuccess}
                className={`flex-1 h-12 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed ${
                  saveSuccess
                    ? "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
                }`}
              >
                {saveSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Criada com sucesso!
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Criando...
                  </span>
                ) : (
                  'Criar Lista'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
