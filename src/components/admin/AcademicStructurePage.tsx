import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Faculty, Department, AcademicSession, SRCExercise, SRCPosition } from '../../types';
import { Modal } from '../common/Modal';
import {
  Building2,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';

export const AcademicStructurePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'faculties' | 'departments' | 'exercises'>('faculties');
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [exercises, setExercises] = useState<SRCExercise[]>([]);
  const [positions, setPositions] = useState<SRCPosition[]>([]);

  // Modals
  const [isFacModalOpen, setIsFacModalOpen] = useState(false);
  const [newFac, setNewFac] = useState({ code: '', name: '', deanName: '', officerEmail: '' });

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ facultyId: '', code: '', name: '', hodName: '', officerEmail: '' });

  const loadData = () => {
    const f = DatabaseService.getFaculties();
    setFaculties(f);
    setDepartments(DatabaseService.getDepartments());
    setExercises(DatabaseService.getExercises());
    setPositions(DatabaseService.getPositions());
    if (f.length > 0 && !newDept.facultyId) {
      setNewDept((prev) => ({ ...prev, facultyId: f[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      DatabaseService.createFaculty(
        {
          code: newFac.code.trim().toUpperCase(),
          name: newFac.name.trim(),
          deanName: newFac.deanName.trim(),
          officerEmail: newFac.officerEmail.trim().toLowerCase(),
        },
        currentUser || undefined
      );
      showToast('success', 'Faculty Added', `Faculty ${newFac.name} created successfully.`);
      setIsFacModalOpen(false);
      setNewFac({ code: '', name: '', deanName: '', officerEmail: '' });
      loadData();
    } catch (err: any) {
      showToast('danger', 'Error', err.message);
    }
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      DatabaseService.createDepartment(
        {
          facultyId: newDept.facultyId,
          code: newDept.code.trim().toUpperCase(),
          name: newDept.name.trim(),
          hodName: newDept.hodName.trim(),
          officerEmail: newDept.officerEmail.trim().toLowerCase(),
        },
        currentUser || undefined
      );
      showToast('success', 'Department Added', `Department ${newDept.name} created successfully.`);
      setIsDeptModalOpen(false);
      setNewDept((prev) => ({ ...prev, code: '', name: '', hodName: '', officerEmail: '' }));
      loadData();
    } catch (err: any) {
      showToast('danger', 'Error', err.message);
    }
  };

  const facMap = new Map(faculties.map((f) => [f.id, f]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">
            Academic Structure & Exercises
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure faculties, academic departments, selection sessions, and Council seats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'faculties' && (
            <button
              onClick={() => setIsFacModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Faculty</span>
            </button>
          )}
          {activeTab === 'departments' && (
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-xs flex gap-2">
        <button
          onClick={() => setActiveTab('faculties')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'faculties'
              ? 'bg-[#075B40] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Faculties ({faculties.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'departments'
              ? 'bg-[#075B40] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'exercises'
              ? 'bg-[#075B40] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          SRC Exercises & Positions ({exercises.length})
        </button>
      </div>

      {/* Tab: Faculties */}
      {activeTab === 'faculties' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Faculty Name</th>
                  <th className="px-4 py-3">Dean / Executive</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3">Departments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faculties.map((f) => {
                  const deptCount = departments.filter((d) => d.facultyId === f.id).length;
                  return (
                    <tr key={f.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#075B40]">{f.code}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{f.name}</td>
                      <td className="px-4 py-3 text-gray-700">{f.deanName}</td>
                      <td className="px-4 py-3 text-gray-500">{f.officerEmail}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{deptCount} Depts</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Departments */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Faculty</th>
                  <th className="px-4 py-3">Head of Department (HOD)</th>
                  <th className="px-4 py-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departments.map((d) => {
                  const f = facMap.get(d.facultyId);
                  return (
                    <tr key={d.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#075B40]">{d.code}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{d.name}</td>
                      <td className="px-4 py-3 text-gray-700">{f?.name}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{d.hodName}</td>
                      <td className="px-4 py-3 text-gray-500">{d.officerEmail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Exercises & Positions */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          {exercises.map((ex) => {
            const exPositions = positions.filter((p) => p.exerciseId === ex.id);
            return (
              <div key={ex.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-display">{ex.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{ex.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-[#075B40] border border-emerald-200">
                      Status: {ex.status}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Total Capacity: {ex.totalCapacity} Seats
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Configured SRC Council Seats & Quotas ({exPositions.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {exPositions.map((pos) => (
                      <div key={pos.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-gray-900 text-xs">{pos.title}</span>
                          <span className="text-xs font-mono font-bold text-[#075B40] bg-white px-2 py-0.5 rounded border border-gray-200">
                            Quota: {pos.quota}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1">{pos.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Faculty Modal */}
      {isFacModalOpen && (
        <Modal
          isOpen={isFacModalOpen}
          onClose={() => setIsFacModalOpen(false)}
          title="Add New Faculty"
          subtitle="Register an institutional faculty unit into the SRC selection database"
          maxWidth="md"
        >
          <form onSubmit={handleCreateFaculty} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Faculty Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. FNAS"
                value={newFac.code}
                onChange={(e) => setNewFac({ ...newFac, code: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20 uppercase font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Faculty Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Faculty of Natural & Applied Sciences"
                value={newFac.name}
                onChange={(e) => setNewFac({ ...newFac, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Dean of Faculty *</label>
              <input
                type="text"
                required
                placeholder="e.g. Prof. Zainab Umar"
                value={newFac.deanName}
                onChange={(e) => setNewFac({ ...newFac, deanName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                placeholder="dean.nas@nsuk.edu.ng"
                value={newFac.officerEmail}
                onChange={(e) => setNewFac({ ...newFac, officerEmail: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsFacModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg"
              >
                Create Faculty
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <Modal
          isOpen={isDeptModalOpen}
          onClose={() => setIsDeptModalOpen(false)}
          title="Add New Department"
          subtitle="Register an academic department under an approved faculty"
          maxWidth="md"
        >
          <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Parent Faculty *</label>
              <select
                value={newDept.facultyId}
                onChange={(e) => setNewDept({ ...newDept, facultyId: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Department Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CSC"
                value={newDept.code}
                onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg uppercase font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Department of Computer Science"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Head of Department (HOD) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Emmanuel Kalu"
                value={newDept.hodName}
                onChange={(e) => setNewDept({ ...newDept, hodName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                placeholder="hod.cs@nsuk.edu.ng"
                value={newDept.officerEmail}
                onChange={(e) => setNewDept({ ...newDept, officerEmail: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDeptModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg"
              >
                Create Department
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
