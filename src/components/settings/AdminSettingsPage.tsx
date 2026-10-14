import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { SystemSettings } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import {
  Settings,
  Shield,
  Save,
  RotateCcw,
  Sparkles,
  Building2,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useNotifications();

  const [settings, setSettings] = useState<SystemSettings>(DatabaseService.getSettings());
  const [formData, setFormData] = useState<SystemSettings>(DatabaseService.getSettings());
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    const s = DatabaseService.getSettings();
    setSettings(s);
    setFormData(s);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = DatabaseService.updateSettings(formData, currentUser || undefined);
      setSettings(updated);
      showToast('success', 'Settings Saved', 'System branding and institutional parameters updated.');
    } catch (err: any) {
      showToast('danger', 'Error', err.message);
    }
  };

  const handleResetDatabase = () => {
    DatabaseService.resetToSeedData();
    showToast(
      'info',
      'Database Reinitialized',
      'Persistent storage reinitialized with clean research taxonomy and administrator account.'
    );
    setIsResetConfirmOpen(false);
    refreshUser();
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">
            System & Brand Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure institutional identity, official logo assets, selection deadlines, and governance rules.
          </p>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Database</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Brand Identity & Logos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#075B40]" />
            <span>Official SRCova Branding Assets</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">
                Variation 1 — Horizontal Header Logo
              </span>
              <div className="h-20 flex items-center justify-center p-2 bg-white rounded-lg border border-gray-100">
                <BrandLogo variant="horizontal" height={42} />
              </div>
              <input
                type="text"
                value={formData.primaryLogoUrl}
                onChange={(e) => setFormData({ ...formData, primaryLogoUrl: e.target.value })}
                className="w-full text-[11px] px-2 py-1.5 border border-gray-300 rounded mt-2 font-mono"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">
                Variation 2 — Flat Vector-Style Logo
              </span>
              <div className="h-20 flex items-center justify-center p-2 bg-white rounded-lg border border-gray-100">
                <BrandLogo variant="vector" height={48} />
              </div>
              <input
                type="text"
                value={formData.vectorLogoUrl}
                onChange={(e) => setFormData({ ...formData, vectorLogoUrl: e.target.value })}
                className="w-full text-[11px] px-2 py-1.5 border border-gray-300 rounded mt-2 font-mono"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">
                Variation 3 — Premium PNG Logo
              </span>
              <div className="h-20 flex items-center justify-center p-2 bg-white rounded-lg border border-gray-100">
                <BrandLogo variant="premium" height={48} />
              </div>
              <input
                type="text"
                value={formData.premiumLogoUrl}
                onChange={(e) => setFormData({ ...formData, premiumLogoUrl: e.target.value })}
                className="w-full text-[11px] px-2 py-1.5 border border-gray-300 rounded mt-2 font-mono"
              />
            </div>
          </div>
        </div>

        {/* General Institutional Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#075B40]" />
            <span>Institution Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Application Name *</label>
              <input
                type="text"
                required
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Institution Name *</label>
              <input
                type="text"
                required
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Official Tagline *</label>
              <input
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Contact Email *</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Campus Physical Address *</label>
            <input
              type="text"
              required
              value={formData.campusAddress}
              onChange={(e) => setFormData({ ...formData, campusAddress: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#075B40]/20"
            />
          </div>
        </div>

        {/* Governance & Selection Workflow */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#075B40]" />
            <span>Workflow Governance & Approval Stage Configuration</span>
          </h3>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isManagementApprovalRequired}
                onChange={(e) =>
                  setFormData({ ...formData, isManagementApprovalRequired: e.target.checked })
                }
                className="w-4 h-4 text-[#075B40] rounded focus:ring-[#075B40]"
              />
              <span className="font-bold text-gray-900 text-xs">
                Require Management (Vice-Chancellor) Final Approval Stage
              </span>
            </label>
            <p className="text-[11px] text-gray-600 ml-6 leading-relaxed">
              When enabled, candidates recommended by the Dean of Student Affairs must be formally confirmed
              by the Vice-Chancellor / Executive Selection Board before their seat is officially gazetted.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Max Nominations Per Department
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxNominationsPerDept}
                onChange={(e) =>
                  setFormData({ ...formData, maxNominationsPerDept: parseInt(e.target.value) || 3 })
                }
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Senate Default CGPA Baseline Threshold
              </label>
              <input
                type="number"
                step="0.05"
                min="2.50"
                max="5.00"
                value={formData.minCgpaRequirement}
                onChange={(e) =>
                  setFormData({ ...formData, minCgpaRequirement: parseFloat(e.target.value) || 3.50 })
                }
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg font-bold text-[#075B40]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center gap-2 transition-colors shadow-md shadow-[#075B40]/20"
          >
            <Save className="w-4 h-4 text-[#D5AC49]" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-gray-900">Reinitialize Database?</h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              This will reinitialize the database with clean research configuration, resetting all
              candidate rosters, nominations, and reviews while preserving institutional settings.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDatabase}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Reset Database Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
