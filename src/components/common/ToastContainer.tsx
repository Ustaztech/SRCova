import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-l-4 border-l-[#075B40]';
        let bgClass = 'bg-white';
        let icon = <CheckCircle2 className="w-5 h-5 text-[#075B40] shrink-0" />;

        if (toast.type === 'danger') {
          borderClass = 'border-l-4 border-l-red-600';
          icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-l-4 border-l-[#D5AC49]';
          icon = <AlertCircle className="w-5 h-5 text-[#D5AC49] shrink-0" />;
        } else if (toast.type === 'info') {
          borderClass = 'border-l-4 border-l-blue-600';
          icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border border-gray-100 ${bgClass} ${borderClass} transition-all duration-300 animate-slide-in`}
          >
            {icon}
            <div className="flex-1 pr-2">
              <h4 className="text-sm font-semibold text-gray-900">{toast.title}</h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
