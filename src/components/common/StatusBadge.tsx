import React from 'react';
import { NominationStatus } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Send, 
  Award, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface StatusBadgeProps {
  status: NominationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  let bg = 'bg-gray-100 text-gray-700 border-gray-200';
  let icon = <Clock className="w-3.5 h-3.5" />;

  switch (status) {
    case 'Draft':
      bg = 'bg-slate-100 text-slate-700 border-slate-300';
      icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;
      break;

    case 'Submitted':
    case 'Awaiting Faculty Verification':
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      icon = <Send className="w-3.5 h-3.5 text-amber-600" />;
      break;

    case 'Returned for Correction':
      bg = 'bg-orange-50 text-orange-800 border-orange-300';
      icon = <RotateCcw className="w-3.5 h-3.5 text-orange-600" />;
      break;

    case 'Faculty Verified':
    case 'Pending Student Affairs Review':
      bg = 'bg-blue-50 text-blue-800 border-blue-300';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />;
      break;

    case 'Faculty Rejected':
    case 'Rejected':
    case 'Not Selected':
      bg = 'bg-rose-50 text-rose-800 border-rose-300';
      icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      break;

    case 'Approved':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      break;

    case 'Recommended for Selection':
    case 'Pending Final Approval':
      bg = 'bg-purple-50 text-purple-800 border-purple-300';
      icon = <Award className="w-3.5 h-3.5 text-purple-600" />;
      break;

    case 'Selected':
      bg = 'bg-[#075B40]/10 text-[#075B40] border-[#D5AC49] font-semibold';
      icon = <Sparkles className="w-3.5 h-3.5 text-[#D5AC49]" />;
      break;

    default:
      bg = 'bg-gray-100 text-gray-700 border-gray-200';
      icon = <AlertCircle className="w-3.5 h-3.5 text-gray-500" />;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${bg} ${sizeClasses}`}
    >
      {showIcon && icon}
      <span>{status}</span>
    </span>
  );
};
