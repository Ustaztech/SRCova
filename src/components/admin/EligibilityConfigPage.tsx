import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../db/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { EligibilityRule, EligibilityRuleType } from '../../types';
import { Modal } from '../common/Modal';
import {
  ClipboardList,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Shield,
  Sliders,
} from 'lucide-react';

export const EligibilityConfigPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [rules, setRules] = useState<EligibilityRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newRule, setNewRule] = useState({
    ruleCode: 'MIN_CGPA' as EligibilityRuleType,
    ruleName: '',
    description: '',
    thresholdValue: '3.50',
    isMandatory: true,
  });

  const loadData = () => {
    setRules(DatabaseService.getRules());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = (rule: EligibilityRule) => {
    const updated = DatabaseService.updateRule(
      rule.id,
      { isActive: !rule.isActive },
      currentUser || undefined
    );
    showToast('success', 'Criterion Updated', `${rule.ruleName} is now ${updated.isActive ? 'Active' : 'Disabled'}.`);
    loadData();
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      DatabaseService.createRule(
        {
          exerciseId: 'exercise-2026-main',
          ruleCode: newRule.ruleCode,
          ruleName: newRule.ruleName.trim(),
          description: newRule.description.trim(),
          ruleType: newRule.ruleCode,
          thresholdValue: newRule.thresholdValue,
          isMandatory: newRule.isMandatory,
          isActive: true,
        },
        currentUser || undefined
      );

      showToast('success', 'Rule Configured', `Configured criterion ${newRule.ruleName} successfully.`);
      setIsModalOpen(false);
      setNewRule({
        ruleCode: 'MIN_CGPA',
        ruleName: '',
        description: '',
        thresholdValue: '3.50',
        isMandatory: true,
      });
      loadData();
    } catch (err: any) {
      showToast('danger', 'Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">
            Senate Eligibility Assessment Rules
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure approved university criteria used by the eligibility engine during candidate evaluation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Configure New Criterion</span>
        </button>
      </div>

      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#075B40] shrink-0 mt-0.5" />
        <div className="text-xs text-[#003B2B] leading-relaxed">
          <strong className="block font-semibold">Institutional Compliance Standard:</strong>
          The eligibility engine automatically runs against these rules during academic verification to provide
          decision support for the Faculty Officer and Dean of Student Affairs. Outcomes support review and do
          not automatically elect candidates.
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Rule Code</th>
                <th className="px-4 py-3">Criterion Name & Description</th>
                <th className="px-4 py-3">Required Threshold</th>
                <th className="px-4 py-3">Mandatory</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Toggle Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#075B40]">{r.ruleCode}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">{r.ruleName}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{r.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
                      {String(r.thresholdValue)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        r.isMandatory
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {r.isMandatory ? 'Mandatory' : 'Advisory'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        r.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {r.isActive ? 'Active Engine Rule' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(r)}
                      className={`p-1 rounded transition-colors ${
                        r.isActive ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {r.isActive ? (
                        <ToggleRight className="w-6 h-6 inline" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 inline" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Configure University Eligibility Rule"
          subtitle="Enforce institutionally approved requirements for SRC candidates"
          maxWidth="md"
        >
          <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Rule Category *</label>
              <select
                value={newRule.ruleCode}
                onChange={(e) => setNewRule({ ...newRule, ruleCode: e.target.value as any })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="MIN_CGPA">MIN_CGPA (Minimum Grade Point Average)</option>
                <option value="ACADEMIC_LEVEL">ACADEMIC_LEVEL (Eligible Study Levels)</option>
                <option value="COURSE_REP_REQUIRED">COURSE_REP_REQUIRED (Course Rep Leadership)</option>
                <option value="NO_DISCIPLINARY_RECORD">NO_DISCIPLINARY_RECORD (Clearance)</option>
                <option value="REQUIRED_DOCUMENTS">REQUIRED_DOCUMENTS (Mandatory Uploads)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Rule Display Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Minimum CGPA Standing Requirement"
                value={newRule.ruleName}
                onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Required Threshold Value *</label>
              <input
                type="text"
                required
                placeholder="e.g. 3.50 or 200L,300L,400L"
                value={newRule.thresholdValue}
                onChange={(e) => setNewRule({ ...newRule, thresholdValue: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description & Senate Gazette Ref *</label>
              <textarea
                rows={2}
                required
                placeholder="Reference official university regulation..."
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRule.isMandatory}
                  onChange={(e) => setNewRule({ ...newRule, isMandatory: e.target.checked })}
                  className="w-4 h-4 text-[#075B40] rounded"
                />
                <span className="font-semibold text-gray-800">Mandatory Statutory Requirement</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#075B40] hover:bg-[#003B2B] rounded-lg"
              >
                Save Rule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
