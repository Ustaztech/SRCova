import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { FinalSelectionManagement } from '../selection/FinalSelectionManagement';
import { Nomination, Student, Faculty, Selection, SRCExercise } from '../../types';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  FileCheck,
  Printer,
} from 'lucide-react';

interface ManagementDashboardProps {
  onNavigateToReports: () => void;
  onOpenNominationDetail: (nomination: Nomination) => void;
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  onNavigateToReports,
  onOpenNominationDetail,
}) => {
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [exercises, setExercises] = useState<SRCExercise[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);

  useEffect(() => {
    setNominations(DatabaseService.getNominations());
    setExercises(DatabaseService.getExercises());
    setSelections(DatabaseService.getSelections());
  }, []);

  // Management metrics
  const pendingFinalApproval = nominations.filter((n) =>
    ['Recommended for Selection', 'Approved'].includes(n.status)
  ).length;

  const recommendedCandidates = nominations.filter(
    (n) => n.status === 'Recommended for Selection'
  ).length;

  const approvedMembers = nominations.filter((n) => n.status === 'Selected').length;
  const completedExercises = exercises.filter((e) => e.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#003B2B] via-[#075B40] to-[#B88F28] rounded-2xl p-6 text-white shadow-brand-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D5AC49]/20 text-[#D5AC49] text-xs font-bold border border-[#D5AC49]/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>University Management Executive Ratification</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white">
              Office of the Vice-Chancellor / Approving Authority
            </h1>
            <p className="text-xs text-amber-100 mt-1 max-w-2xl leading-relaxed">
              Final executive review of recommended candidates submitted by the Dean of Student Affairs for formal confirmation into the Nasarawa State University Student Representative Council.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToReports}
              className="px-4 py-2 text-xs font-bold text-[#003B2B] bg-[#D5AC49] hover:bg-[#B88F28] rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Gazetted List</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Management Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Pending Final Approval"
          value={pendingFinalApproval}
          subtitle="DSA recommendations"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          badge={pendingFinalApproval > 0 ? { text: 'Awaiting Ratification', variant: 'gold' } : undefined}
        />
        <StatCard
          title="Recommended Candidates"
          value={recommendedCandidates}
          subtitle="Pre-cleared candidates"
          icon={<Award className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <StatCard
          title="Approved SRC Members"
          value={approvedMembers}
          subtitle="Ratified Council Members"
          icon={<Sparkles className="w-5 h-5 text-[#D5AC49]" />}
          iconBgColor="bg-[#D5AC49]/15"
          badge={{ text: 'Officially Confirmed', variant: 'success' }}
        />
        <StatCard
          title="Active Exercises"
          value={exercises.filter((e) => e.status === 'Active').length}
          subtitle="Under current session"
          icon={<FileCheck className="w-5 h-5 text-[#075B40]" />}
          iconBgColor="bg-[#075B40]/10"
        />
      </div>

      {/* Embedded Final Selection Module */}
      <FinalSelectionManagement
        onNavigateToReports={onNavigateToReports}
        onOpenDetail={onOpenNominationDetail}
      />
    </div>
  );
};
