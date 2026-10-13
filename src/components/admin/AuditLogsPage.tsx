import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { AuditLog } from '../../types';
import { History, Search, Shield, Filter, RefreshCw } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [entityFilter, setEntityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = () => {
    setLogs(DatabaseService.getAuditLogs());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (entityFilter && log.entityType !== entityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">
            Institutional System Audit Logs
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Immutable administrative activity trail tracking security, verification decisions, and council appointments.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Filter by Entity Category
          </label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">-- All Activity Categories --</option>
            <option value="Nomination">Nomination Actions</option>
            <option value="Verification">Academic Verification</option>
            <option value="Selection">Final SRC Selection</option>
            <option value="Candidate">Candidate Registration</option>
            <option value="Staff">Staff Management</option>
            <option value="Settings">System Settings</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Search Activity Logs
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by officer name, action keyword or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#003B2B] text-white uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Officer & Role</th>
                <th className="px-4 py-3">Action Recorded</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Activity Description</th>
                <th className="px-4 py-3">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="font-bold text-gray-900 block">{log.userName}</span>
                    <span className="text-[10px] text-gray-400">{log.userRole}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#075B40]">{log.action}</td>
                  <td className="px-4 py-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                      {log.entityType} ({log.entityId.slice(0, 10)})
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-gray-700 max-w-xs">{log.details}</td>
                  <td className="px-4 py-3 text-gray-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
