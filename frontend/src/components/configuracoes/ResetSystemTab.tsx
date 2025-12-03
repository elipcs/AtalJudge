import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

interface SystemReset {
  resetSubmissions: boolean;
  resetStudents: boolean;
  resetClasses: boolean;
  resetLists: boolean;
  resetMonitors: boolean;
  resetProfessors: boolean;
  resetInvites: boolean;
  resetAllowedIPs: boolean;
  confirmationText: string;
}

interface ResetSystemTabProps {
  systemReset: SystemReset;
  saving: boolean;
  buttonSuccess: boolean;
  onFieldChange: (field: keyof SystemReset, value: boolean | string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onExecuteReset: () => void;
}

export default function ResetSystemTab({
  systemReset,
  saving,
  buttonSuccess,
  onFieldChange,
  onSelectAll,
  onClearAll,
  onExecuteReset,
}: ResetSystemTabProps) {
  const resetItems = [
    { key: 'resetSubmissions', label: 'Submissões', description: 'Remove todas as submissões dos estudantes' },
    { key: 'resetStudents', label: 'Estudantes', description: 'Remove todos os estudantes cadastrados' },
    { key: 'resetClasses', label: 'Turmas', description: 'Remove todas as turmas criadas' },
    { key: 'resetLists', label: 'Listas de Exercícios', description: 'Remove todas as listas de exercícios, questões e casos de teste relacionados' },
    { key: 'resetMonitors', label: 'Monitores', description: 'Remove todos os monitores cadastrados' },
    { key: 'resetProfessors', label: 'Outros Professores', description: 'Remove todos os outros professores (exceto você)' },
    { key: 'resetInvites', label: 'Convites', description: 'Remove todos os convites pendentes e expirados' },
    { key: 'resetAllowedIPs', label: 'IPs Permitidos', description: 'Remove todas as configurações de IPs permitidos' }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Reset do Sistema
      </h3>
      
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-slate-800 font-semibold">Atenção: Esta operação não pode ser desfeita!</span>
        </div>
        <p className="text-slate-700">
          O reset do sistema irá remover permanentemente os dados selecionados. 
          Certifique-se de ter um backup antes de continuar.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">
          Selecione os dados que deseja remover do sistema.
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onSelectAll}
            className="text-xs"
          >
            Reset completo do sistema
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-xs"
          >
            Limpar seleção
          </Button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {resetItems.map(item => (
          <div key={item.key} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4">
            <label className="flex items-center space-x-4 cursor-pointer">
              <Checkbox
                variant="danger"
                checked={systemReset[item.key as keyof SystemReset] as boolean}
                onChange={e => onFieldChange(item.key as keyof SystemReset, e.target.checked)}
                className=""
              />
              <div>
                <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-900 mb-3">
          Confirmação: Digite &quot;RESETAR&quot; para confirmar
        </label>
        <input
          type="text"
          value={systemReset.confirmationText}
          onChange={e => onFieldChange('confirmationText', e.target.value)}
          className="w-full h-12 px-4 bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
          placeholder="Digite RESETAR para confirmar"
        />
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onExecuteReset}
          disabled={saving || systemReset.confirmationText !== 'RESETAR'}
          variant={buttonSuccess ? "default" : "secondary"}
          size="lg"
          className={`gap-3 ${!buttonSuccess && !saving ? 'bg-slate-800 hover:bg-slate-700 text-white' : ''}`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Executando Reset...
            </>
          ) : buttonSuccess ? (
            <>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Reset Concluído!
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="white" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Executar Reset do Sistema
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
