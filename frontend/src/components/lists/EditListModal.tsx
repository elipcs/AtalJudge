import { useState, useEffect } from "react";

import { CreateListRequest } from "@/services/lists";
import { createBrazilianDate, toBrazilianDateTimeLocal, fromBrazilianDateTimeLocal, validateNotPastDate, validateEndDateAfterStartDate } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listData: CreateListRequest) => Promise<void>;
  onRefresh?: () => Promise<void>;
  classes: Array<{ id: string; name: string }>;
  listData?: {
    id: string;
    title: string;
    description: string;
    startDate?: string;
    endDate?: string;
    classIds: string[];
    isRestricted?: boolean;
    countTowardScore?: boolean;
    calculatedStatus?: 'scheduled' | 'open' | 'closed';
  };
}

export default function EditListModal({ isOpen, onClose, onSubmit, onRefresh, classes, listData }: EditListModalProps) {
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({
    startDate: '',
    endDate: '',
    dateRange: ''
  });

  useEffect(() => {
    if (isOpen && listData) {
      setForm({
        title: listData.title,
        description: listData.description,
        startDate: toBrazilianDateTimeLocal(listData.startDate),
        endDate: toBrazilianDateTimeLocal(listData.endDate),
        classIds: listData.classIds || [],
        countTowardScore: listData.countTowardScore ?? false,
        isRestricted: listData.isRestricted ?? false
      });
      setErrors({
        startDate: '',
        endDate: '',
        dateRange: ''
      });
      setShowSuccessMessage(false);
    }
  }, [isOpen, listData]);

  useEffect(() => {
    if (form.startDate || form.endDate) {
      const timeoutId = setTimeout(() => {
        validateDatesInRealTime();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setErrors({
        startDate: '',
        endDate: '',
        dateRange: ''
      });
    }
  }, [form.startDate, form.endDate]);

  const hasStarted = listData ? !createBrazilianDate(listData.startDate) || new Date() >= createBrazilianDate(listData.startDate)! : false;
  const isClosed = listData ? (listData.calculatedStatus === 'closed' || (!!listData.endDate && new Date() >= createBrazilianDate(listData.endDate)!)) : false;

  const validateDates = () => {
    const newErrors = {
      startDate: '',
      endDate: '',
      dateRange: ''
    };

    if (!hasStarted && form.startDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.startDate))) {
      newErrors.startDate = 'A data de início não pode ser no passado';
    }

    if (form.endDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.endDate))) {
      newErrors.endDate = 'A data de fim não pode ser no passado';
    }

    if (form.startDate && form.endDate) {
      const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      
      if (startDateISO && endDateISO) {
        const startDate = new Date(startDateISO);
        const endDate = new Date(endDateISO);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          newErrors.dateRange = 'Datas inválidas';
        } else if (endDate <= startDate) {
          newErrors.dateRange = 'A data de fim deve ser posterior à data de início';
        }
      }
    }

    setErrors(newErrors);
    return !newErrors.startDate && !newErrors.endDate && !newErrors.dateRange;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateDatesInRealTime = () => {
    const newErrors = {
      startDate: '',
      endDate: '',
      dateRange: ''
    };

    if (!hasStarted && form.startDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.startDate))) {
      newErrors.startDate = 'A data de início não pode ser no passado';
    }

    if (!hasStarted && form.endDate && !validateNotPastDate(fromBrazilianDateTimeLocal(form.endDate))) {
      newErrors.endDate = 'A data de fim não pode ser no passado';
    }

    if (form.startDate && form.endDate) {
      const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      
      if (startDateISO && endDateISO) {
        const startDate = new Date(startDateISO);
        const endDate = new Date(endDateISO);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          newErrors.dateRange = 'Datas inválidas';
        } else if (endDate <= startDate) {
          newErrors.dateRange = 'A data de fim deve ser posterior à data de início';
        }
      }
    }
    setErrors(newErrors);
  };

  const isFormValid = () => {
    if (!form.title.trim()) return false;
    
    if (form.classIds.length === 0) return false;
    
    if (hasStarted) {
      if (!form.endDate) return false;
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      if (!validateNotPastDate(endDateISO)) return false;
      if (form.startDate) {
        const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
        if (!validateEndDateAfterStartDate(startDateISO, endDateISO)) return false;
      }
      return true;
    } else {
      if (!form.startDate || !form.endDate) return false;
      const startDateISO = fromBrazilianDateTimeLocal(form.startDate);
      const endDateISO = fromBrazilianDateTimeLocal(form.endDate);
      if (!validateNotPastDate(startDateISO) || !validateNotPastDate(endDateISO)) return false;
      if (!validateEndDateAfterStartDate(startDateISO, endDateISO)) return false;
      return true;
    }
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
      setErrorMessage('');
      
      const now = new Date();
      const defaultEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const startDate = hasStarted
        ? (listData?.startDate || now.toISOString())
        : (form.startDate ? fromBrazilianDateTimeLocal(form.startDate) : now.toISOString());

      const classIds = hasStarted
        ? (listData?.classIds || form.classIds)
        : form.classIds;

      const payload: CreateListRequest = {
        title: form.title,
        description: form.description,
        startDate,
        endDate: form.endDate ? fromBrazilianDateTimeLocal(form.endDate) : defaultEndDate.toISOString(),
        classIds,
        countTowardScore: form.countTowardScore,
        isRestricted: form.isRestricted
      };

      await onSubmit(payload);
      
      setShowSuccessMessage(true);
      
      setTimeout(async () => {
        setForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          classIds: [],
          countTowardScore: false,
          isRestricted: false
        });
        
        onClose();
        
        if (onRefresh) {
          await onRefresh();
        }
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao atualizar lista');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Editar Lista</h2>
              <p className="text-sm text-slate-600 mt-0.5">Atualize as informações da lista</p>
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
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-800 font-semibold">Lista atualizada com sucesso!</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800 flex-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {isClosed && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">Lista Fechada</p>
                  <p className="text-xs text-red-700">
                    Esta lista está fechada e não pode mais ser editada. Apenas visualização permitida.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da lista"
                disabled={loading || isClosed}
                required
                className={`w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                  isClosed ? 'bg-slate-100' : 'bg-white'
                }`}
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
                className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none ${
                  isClosed ? 'bg-slate-100' : 'bg-white'
                }`}
                rows={3}
                disabled={loading || isClosed}
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
                  disabled={loading || hasStarted || isClosed}
                  className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                    errors.startDate 
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' 
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } ${hasStarted || isClosed ? 'bg-slate-100' : 'bg-white'}`}
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
                  disabled={loading || isClosed}
                  className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                    errors.endDate 
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' 
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } ${isClosed ? 'bg-slate-100' : 'bg-white'}`}
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

            {hasStarted && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700">
                    A data de início não pode ser editada porque a lista já foi iniciada. Apenas a data de fim pode ser alterada.
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Turmas
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = Array.isArray(classes) ? classes.map(c => c.id) : [];
                      setForm(prev => ({ ...prev, classIds: allIds }));
                    }}
                    disabled={loading || hasStarted || isClosed}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selecionar Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, classIds: [] }));
                    }}
                    disabled={loading || hasStarted || isClosed}
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
                          disabled={loading || hasStarted || isClosed}
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
              
              {hasStarted && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700">As turmas não podem ser alteradas porque a lista já começou. Só é possível editar título, descrição e data de término.</p>
                </div>
              )}

              {!hasStarted && form.classIds.length === 0 && (
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
                    disabled={loading || isClosed}
                    className="mr-2"
                    variant="text"
                  />
                  <span className={`text-sm font-medium ${isClosed ? 'text-slate-500' : 'text-slate-700'}`}>Esta lista conta para a nota</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={form.isRestricted}
                    onChange={(e) => setForm(prev => ({ ...prev, isRestricted: e.target.checked }))}
                    disabled={loading || isClosed}
                    className="mr-2"
                    variant="text"
                  />
                  <span className={`text-sm font-medium ${isClosed ? 'text-slate-500' : 'text-slate-700'}`}>Restringir acesso por IP</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button 
                type="button"
                onClick={handleClose} 
                disabled={loading || showSuccessMessage}
                className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              
              <button 
                type="submit"
                disabled={loading || !isFormValid() || showSuccessMessage || isClosed}
                className={`flex-1 h-12 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed ${
                  showSuccessMessage
                    ? "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
                }`}
              >
                {showSuccessMessage ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Atualizada com sucesso!
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Atualizando...
                  </span>
                ) : isClosed ? (
                  'Lista Fechada - Não Pode Ser Editada'
                ) : (
                  'Atualizar Lista'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
