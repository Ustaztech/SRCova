import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { exportToPDF } from '../../utils/pdfExport';
import { exportToCSV } from '../../utils/csvExport';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileText,
  Printer,
  Download,
  Filter,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Faculty, Department, Nomination, Student } from '../../types';

export const ReportsPage: React.FC = () => {
  const { currentUser } = useAuth();

  const [reportType, setReportType] = useState<
    | 'final-src'
    | 'approved'
    | 'candidates'
    | 'departmental'
    | 'faculty-verification'
    | 'eligibility'
    | 'rejected'
    | 'audit-log'
  >('final-src');

  // Filters
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});

  const loadData = () => {
    setFaculties(DatabaseService.getFaculties());
    setDepartments(DatabaseService.getDepartments());
    setNominations(DatabaseService.getNominations());

    const studs = DatabaseService.getStudents();
    const map: Record<string, Student> = {};
    studs.forEach((s) => {
      map[s.id] = s;
    });
    setStudents(map);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('srcova:data_changed', handleUpdate);
    return () => window.removeEventListener('srcova:data_changed', handleUpdate);
  }, []);

  const handleFacultyChange = (fId: string) => {
    setSelectedFacultyId(fId);
    setSelectedDepartmentId('');
    if (fId) {
      setDepartments(DatabaseService.getDepartments(fId));
    } else {
      setDepartments(DatabaseService.getDepartments());
    }
  };

  // Filter nominations according to report type and filters
  let filteredData = nominations.filter((n) => {
    if (selectedFacultyId && n.facultyId !== selectedFacultyId) return false;
    if (selectedDepartmentId && n.departmentId !== selectedDepartmentId) return false;

    const student = students[n.studentId];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = n.referenceNumber.toLowerCase().includes(q);
      const matchName = student?.fullName.toLowerCase().includes(q) ?? false;
      const matchMatric = student?.matricNumber.toLowerCase().includes(q) ?? false;
      if (!matchRef && !matchName && !matchMatric) return false;
    }

    if (reportType === 'final-src') return n.status === 'Selected';
    if (reportType === 'approved') return ['Approved', 'Selected', 'Recommended for Selection'].includes(n.status);
    if (reportType === 'departmental') return true;
    if (reportType === 'faculty-verification')
      return ['Faculty Verified', 'Pending Student Affairs Review', 'Approved', 'Selected', 'Returned for Correction'].includes(
        n.status
      );
    if (reportType === 'rejected') return ['Faculty Rejected', 'Rejected'].includes(n.status);
    return true;
  });

  // Export handlers
  const handleExportPDF = () => {
    const facultyObj = faculties.find((f) => f.id === selectedFacultyId);
    const sub = facultyObj ? `Filtered for ${facultyObj.name}` : 'Institutional University Comprehensive Report';

    if (reportType === 'final-src') {
      const headers = ['Ref No', 'Full Name', 'Matriculation No', 'Faculty', 'Position Assigned', 'Status'];
      const rows = filteredData.map((n) => {
        const s = students[n.studentId];
        const f = faculties.find((fac) => fac.id === n.facultyId);
        return [n.referenceNumber, s?.fullName || 'N/A', s?.matricNumber || 'N/A', f?.code || 'N/A', n.proposedPosition, n.status];
      });
      exportToPDF({
        title: 'Final Student Representative Council Selection Report',
        subtitle: sub,
        headers,
        rows,
        generatedBy: currentUser?.fullName,
      });
    } else {
      const headers = ['Reference', 'Candidate Name', 'Matric No', 'Level', 'CGPA', 'Position', 'Status'];
      const rows = filteredData.map((n) => {
        const s = students[n.studentId];
        return [
          n.referenceNumber,
          s?.fullName || 'N/A',
          s?.matricNumber || 'N/A',
          s?.level || 'N/A',
          s?.cgpa.toFixed(2) || 'N/A',
          n.proposedPosition,
          n.status,
        ];
      });
      exportToPDF({
        title: `SRCova ${reportType.replace(/-/g, ' ').toUpperCase()} REPORT`,
        subtitle: sub,
        headers,
        rows,
        generatedBy: currentUser?.fullName,
      });
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Reference Number',
      'Candidate Name',
      'Matriculation Number',
      'Gender',
      'Faculty',
      'Department',
      'Level',
      'CGPA',
      'Course Rep',
      'Proposed Position',
      'Workflow Status',
      'Submission Date',
    ];

    const rows = filteredData.map((n) => {
      const s = students[n.studentId];
      const f = faculties.find((fac) => fac.id === n.facultyId);
      const d = departments.find((dept) => dept.id === n.departmentId);
      return [
        n.referenceNumber,
        s?.fullName || 'N/A',
        s?.matricNumber || 'N/A',
        s?.gender || 'N/A',
        f?.name || 'N/A',
        d?.name || 'N/A',
        s?.level || 'N/A',
        s?.cgpa.toFixed(2) || 'N/A',
        s?.isCourseRep ? 'Yes' : 'No',
        n.proposedPosition,
        n.status,
        n.submittedAt ? new Date(n.submittedAt).toLocaleDateString() : 'Draft',
      ];
    });

    exportToCSV(`SRCova_Report_${reportType}_${Date.now()}`, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">
            Official Reports & Data Exports
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate and export authenticated PDF, CSV, and print copies of candidate rosters, verification logs, and Council selections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#075B40]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'final-src', label: 'Final SRC Selection Report' },
          { id: 'approved', label: 'Approved Candidates' },
          { id: 'departmental', label: 'Departmental Nominations' },
          { id: 'faculty-verification', label: 'Faculty Verification Audit' },
          { id: 'rejected', label: 'Rejected Applications' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              reportType === tab.id
                ? 'bg-[#075B40] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Faculty Filter
          </label>
          <select
            value={selectedFacultyId}
            onChange={(e) => handleFacultyChange(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">-- All Faculties --</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Department Filter
          </label>
          <select
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">-- All Departments --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Search Candidate / Ref No
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, matric no, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
            />
          </div>
        </div>
      </div>

      {/* Report Data Table Preview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-xs font-bold text-gray-700">
            Records Matching Filter ({filteredData.length})
          </span>
          <span className="text-[11px] text-[#075B40] font-semibold">
            Institutional Data Engine Connected
          </span>
        </div>

        {filteredData.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-xs">
            No records found for the selected report filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#075B40] text-white uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Reference No</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Matriculation No</th>
                  <th className="px-4 py-3">Faculty / Dept</th>
                  <th className="px-4 py-3">Standing</th>
                  <th className="px-4 py-3">Office Nominated</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((nom) => {
                  const s = students[nom.studentId];
                  const f = faculties.find((fac) => fac.id === nom.facultyId);
                  return (
                    <tr key={nom.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#075B40]">
                        {nom.referenceNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{s?.fullName}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{s?.matricNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{f?.code}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-800">{s?.level}</span> •{' '}
                        <span className="text-[#075B40] font-semibold">{s?.cgpa.toFixed(2)} CGPA</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{nom.proposedPosition}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={nom.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
