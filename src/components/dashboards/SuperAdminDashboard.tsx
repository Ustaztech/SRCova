import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { Nomination, Student, Faculty, User } from '../../types';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  GraduationCap,
  Building2,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface SuperAdminDashboardProps {
  onNavigate: (view: string) => void;
  onOpenNomination: (nomination: Nomination) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onNavigate,
  onOpenNomination,
}) => {
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);

  const loadData = () => {
    setCandidates(DatabaseService.getStudents());
    setNominations(DatabaseService.getNominations());
    setFaculties(DatabaseService.getFaculties());
    setStaffUsers(DatabaseService.getUsers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('srcova:data_changed', handleUpdate);
    return () => window.removeEventListener('srcova:data_changed', handleUpdate);
  }, []);

  // Compute live metrics
  const totalCandidates = candidates.length;
  const totalNominations = nominations.length;
  const pendingVerification = nominations.filter((n) =>
    ['Submitted', 'Awaiting Faculty Verification'].includes(n.status)
  ).length;
  const verifiedCandidates = nominations.filter((n) =>
    ['Faculty Verified', 'Pending Student Affairs Review', 'Recommended for Selection', 'Approved', 'Selected'].includes(n.status)
  ).length;
  const approvedNominations = nominations.filter((n) =>
    ['Approved', 'Recommended for Selection', 'Selected'].includes(n.status)
  ).length;
  const rejectedNominations = nominations.filter((n) =>
    ['Faculty Rejected', 'Rejected'].includes(n.status)
  ).length;
  const selectedMembers = nominations.filter((n) => n.status === 'Selected').length;
  const activeStaff = staffUsers.filter((u) => u.isActive).length;

  // Chart data: Distribution by faculty
  const facultyChartData = faculties.map((f) => {
    const count = nominations.filter((n) => n.facultyId === f.id).length;
    const selected = nominations.filter((n) => n.facultyId === f.id && n.status === 'Selected').length;
    return {
      name: f.code,
      fullName: f.name,
      Nominations: count,
      Selected: selected,
    };
  });

  // Chart data: Status breakdown
  const statusCounts: Record<string, number> = {};
  nominations.forEach((n) => {
    statusCounts[n.status] = (statusCounts[n.status] || 0) + 1;
  });

  const statusPieData = Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
  }));

  const COLORS = ['#075B40', '#D5AC49', '#138A63', '#3B82F6', '#8B5CF6', '#F97316', '#EF4444'];

  const recentNominations = [...nominations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const studentMap = new Map(candidates.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#003B2B] via-[#075B40] to-[#138A63] rounded-2xl p-6 text-white shadow-brand-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D5AC49]/20 text-[#D5AC49] text-xs font-bold border border-[#D5AC49]/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Super Administrator Command Centre</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              SRCova Institutional Overview
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-1 leading-relaxed">
              Monitoring university-wide nominations, academic verification ledgers, Senate eligibility checks, and final Council selections for Nasarawa State University, Keffi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('staff-management')}
              className="px-3.5 py-2 text-xs font-bold bg-white text-[#003B2B] rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
            >
              Manage Staff
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-3.5 py-2 text-xs font-bold bg-[#D5AC49] text-[#003B2B] rounded-xl hover:bg-[#B88F28] transition-colors shadow-sm"
            >
              System Reports
            </button>
          </div>
        </div>
      </div>

      {/* 8 System Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Candidates"
          value={totalCandidates}
          subtitle="Enrolled student pool"
          icon={<Users className="w-5 h-5 text-[#075B40]" />}
          iconBgColor="bg-[#075B40]/10"
        />
        <StatCard
          title="Total Nominations"
          value={totalNominations}
          subtitle="Across all departments"
          icon={<FileText className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Awaiting Verification"
          value={pendingVerification}
          subtitle="In Faculty Officers' queues"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
        />
        <StatCard
          title="Verified Candidates"
          value={verifiedCandidates}
          subtitle="Academic records validated"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
        <StatCard
          title="Approved Nominations"
          value={approvedNominations}
          subtitle="DSA / Approver cleared"
          icon={<Award className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <StatCard
          title="Rejected Nominations"
          value={rejectedNominations}
          subtitle="Failed criteria or returned"
          icon={<XCircle className="w-5 h-5 text-rose-600" />}
          iconBgColor="bg-rose-50"
        />
        <StatCard
          title="Confirmed SRC Members"
          value={selectedMembers}
          subtitle="Ratified Council seats"
          icon={<Sparkles className="w-5 h-5 text-[#D5AC49]" />}
          iconBgColor="bg-[#D5AC49]/15"
          badge={{ text: 'Active Council', variant: 'gold' }}
        />
        <StatCard
          title="Active Staff Accounts"
          value={activeStaff}
          subtitle="Role-based officers"
          icon={<GraduationCap className="w-5 h-5 text-[#075B40]" />}
          iconBgColor="bg-[#075B40]/10"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-display">
                Nominations by Faculty Standing
              </h3>
              <p className="text-xs text-gray-500">
                Total departmental nominations vs confirmed Council members per faculty
              </p>
            </div>
            <span className="text-xs text-[#075B40] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live Database</span>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#003B2B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="Nominations" fill="#075B40" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Selected" fill="#D5AC49" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display mb-1">
              Workflow Status Breakdown
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Distribution of applications across the selection lifecycle
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#003B2B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-gray-600 truncate max-w-[130px]">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Nominations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">
              Recent Nomination Applications
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live updates across departmental submissions and review transitions
            </p>
          </div>
          <button
            onClick={() => onNavigate('nomination-management')}
            className="text-xs font-semibold text-[#075B40] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Reference No</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Matric No</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentNominations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    <FileText className="w-7 h-7 mx-auto mb-1.5 text-gray-300" />
                    <p className="font-semibold text-gray-600 text-xs">No candidate nominations registered yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Real-time submissions will populate here as Departmental Officers register and submit candidates.
                    </p>
                  </td>
                </tr>
              ) : (
                recentNominations.map((nom) => {
                  const s = studentMap.get(nom.studentId);
                  return (
                    <tr key={nom.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#075B40]">
                        {nom.referenceNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                        <img
                          src={s?.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                          alt={s?.fullName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{s?.fullName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{s?.matricNumber}</td>
                      <td className="px-4 py-3 text-gray-800">{nom.proposedPosition}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={nom.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(nom.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onOpenNomination(nom)}
                          className="text-[#075B40] hover:underline font-semibold"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
