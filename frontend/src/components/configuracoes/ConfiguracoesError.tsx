interface ConfiguracoesErrorProps {
  error: string | null;
  onClose: () => void;
}

export default function ConfiguracoesError({ error, onClose }: ConfiguracoesErrorProps) {
  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 bg-slate-700 text-white px-6 py-3 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
        <button onClick={onClose} className="ml-4 hover:bg-slate-600 rounded p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
