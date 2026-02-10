
import React, { useState, useEffect } from 'react';
import { useSettingsManager } from '../presentation/hooks/useSettingsManager';
import { Briefcase, Plus, Trash2, Loader2, AlertTriangle, Building2, Lock, Edit2, Save, X, CheckCircle, RotateCcw } from 'lucide-react';
import { Department } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { useAppTranslation } from '../presentation/hooks/useAppTranslation';

interface DepartmentManagerProps {
  hasSupabase: boolean;
  institutionId?: string;
}

const DepartmentManager: React.FC<DepartmentManagerProps> = ({ hasSupabase, institutionId }) => {
  const { t } = useAppTranslation();
  const { 
      departments, institutions, loading, error, 
      fetchDepartments, addDepartment, updateDepartment, deleteDepartment, restoreDepartment,
      isManager, isAdmin, showDeleted, setShowDeleted
  } = useSettingsManager(hasSupabase, institutionId);

  const [selectedInstId, setSelectedInstId] = useState(institutionId || '');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Manager mode and context
  const isManagerMode = !!institutionId || institutions.length === 1;
  const hasInstitutionContext = isManagerMode || !!selectedInstId;

  // Form State
  const [formData, setFormData] = useState<{name: string, code: string}>({
      name: '',
      code: ''
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
      isOpen: boolean;
      id: string | null;
      action: 'delete' | 'restore';
      name: string;
  }>({ isOpen: false, id: null, action: 'delete', name: '' });
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Auto-select logic
  useEffect(() => {
      if (institutionId) {
          setSelectedInstId(institutionId);
          fetchDepartments(institutionId);
      } else if (isManager && institutions.length > 0) {
          const myInstId = institutions[0].id;
          setSelectedInstId(myInstId);
          fetchDepartments(myInstId);
      }
  }, [institutionId, isManager, institutions]);

  // Reload departments when showDeleted changes
  useEffect(() => {
      if (selectedInstId) {
          fetchDepartments(selectedInstId);
      }
  }, [showDeleted]);

  const handleInstChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedInstId(id);
      if (id) fetchDepartments(id);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedInstId) return alert(t('department.selectInstitution'));
      if (!formData.name) return alert(t('department.nameRequired'));
      
      setIsSubmitting(true);
      try {
          if (editingId) {
              await updateDepartment(editingId, { name: formData.name, code: formData.code, institution_id: selectedInstId });
          } else {
              await addDepartment({ name: formData.name, code: formData.code, institution_id: selectedInstId });
          }
          setShowForm(false);
          setFormData({ name: '', code: '' });
          setEditingId(null);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleEdit = (d: Department) => {
      setEditingId(d.id);
      setFormData({ name: d.name, code: d.code || '' });
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', code: '' });
  };

  // Modal Triggers
  const openDeleteModal = (d: Department) => {
      setModalConfig({ isOpen: true, id: d.id, action: 'delete', name: d.name });
  };

  const openRestoreModal = (d: Department) => {
      setModalConfig({ isOpen: true, id: d.id, action: 'restore', name: d.name });
  };

  const executeAction = async () => {
      if (!modalConfig.id) return;
      setIsActionLoading(true);
      try {
          if (modalConfig.action === 'delete') {
              await deleteDepartment(modalConfig.id, selectedInstId);
          } else {
              await restoreDepartment(modalConfig.id);
          }
          setModalConfig({ ...modalConfig, isOpen: false });
      } catch (err: any) {
          alert(err.message || 'Erro ao executar ação');
      } finally {
          setIsActionLoading(false);
      }
  };

  // Filter departments by institution and deleted status
  const filteredDepartments = React.useMemo(() => {
      const activeInstId = institutionId || selectedInstId;
      let filtered = departments;
      
      if (activeInstId) {
          filtered = filtered.filter(d => d.institution_id === activeInstId);
      }
      
      // Filter by deleted status based on showDeleted flag
      if (!showDeleted) {
          filtered = filtered.filter(d => !d.deleted);
      }
      
      return filtered;
  }, [departments, institutionId, selectedInstId, showDeleted]);

  if (!hasSupabase) return <div className="p-8 text-center text-slate-500">Configure o banco de dados primeiro.</div>;

  return (
    <div className="w-full space-y-8">
      <div className="flex justify-between items-center">
          <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('department.title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('department.description')}</p>
          </div>
          <div className="flex gap-3 items-center">
              {isAdmin && (
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <input 
                          type="checkbox" 
                          checked={showDeleted} 
                          onChange={e => setShowDeleted(e.target.checked)} 
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="font-bold">{t('common.showDeleted')}</span>
                  </label>
              )}
              {hasInstitutionContext && (
                  <button onClick={() => { setShowForm(!showForm); if (showForm) handleCancel(); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all">
                      {showForm ? t('common.cancel') : <><Plus size={20}/> {t('department.new')}</>}
                  </button>
              )}
          </div>
      </div>

      {/* Institution Selector for Admin */}
      {!isManagerMode && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('institution.institutionContext')}</label>
              <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"/>
                  <select 
                      value={selectedInstId} 
                      onChange={handleInstChange}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                      <option value="">{t('institution.selectInstitution')}</option>
                      {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
              </div>
          </div>
      )}

      {/* No Institution Selected Message - Only show after loading */}
      {!hasInstitutionContext && !loading && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
              <Building2 size={48} className="mx-auto text-amber-400 dark:text-amber-500 mb-4"/>
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-2">{t('institution.noInstitutionSelected')}</h3>
              <p className="text-amber-600 dark:text-amber-400 text-sm">{t('institution.noInstitutionSelectedDescDept')}</p>
          </div>
      )}

      {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3 text-red-700 dark:text-red-300 items-center">
              <AlertTriangle size={20}/> {error}
          </div>
      )}

      <ConfirmationModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
          onConfirm={executeAction}
          title={modalConfig.action === 'delete' ? t('department.deleteTitle') : t('department.restoreTitle')}
          message={
              modalConfig.action === 'delete'
              ? <span dangerouslySetInnerHTML={{ __html: t('department.deleteMessage', { name: modalConfig.name }) }} />
              : <span dangerouslySetInnerHTML={{ __html: t('department.restoreMessage', { name: modalConfig.name }) }} />
          }
          confirmLabel={modalConfig.action === 'delete' ? t('common.delete') : t('common.restore')}
          isDestructive={modalConfig.action === 'delete'}
          isLoading={isActionLoading}
      />

      {hasInstitutionContext && showForm && (
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 mb-6">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{editingId ? t('department.edit') : t('department.createNew')}</h3>
              </div>

              <div className="p-8">
                  <div className="space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('department.name')} *</label>
                          <input 
                              required 
                              value={formData.name} 
                              onChange={e => setFormData({...formData, name: e.target.value})} 
                              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                              placeholder={t('department.namePlaceholder')}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('department.code')}</label>
                          <input 
                              value={formData.code} 
                              onChange={e => setFormData({...formData, code: e.target.value})} 
                              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                              placeholder={t('department.codePlaceholder')}
                          />
                      </div>
                      
                      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mt-4">
                          <h5 className="font-bold text-indigo-900 dark:text-indigo-200 mb-3 text-sm flex items-center gap-2"><Briefcase size={16}/> {t('department.institutionalLink')}</h5>
                          <div>
                              <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase mb-1">{t('institution.singular')}</label>
                              {isManagerMode ? (
                                  <div className="w-full border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-700 rounded-lg px-4 py-2 text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                                      <Lock size={14} className="text-indigo-600 dark:text-indigo-400"/>
                                      <span className="font-medium">{institutions.find(i => i.id === selectedInstId)?.name || t('institution.currentInstitution')}</span>
                                  </div>
                              ) : (
                                  <div className="relative">
                                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 dark:text-indigo-500"/>
                                      <select 
                                          required 
                                          value={selectedInstId} 
                                          onChange={handleInstChange} 
                                          className="w-full border border-indigo-200 dark:border-indigo-700 rounded-lg pl-10 pr-4 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                      >
                                          <option value="">{t('institution.selectInstitutionOption')}</option>
                                          {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                      </select>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold flex gap-2 items-center shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                      {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20}/>}
                      {isSubmitting ? t('department.saving') : (editingId ? t('department.update') : t('department.create'))}
                  </button>
              </div>
          </form>
      )}

      {/* List filtered by institutionId if present - Omitir durante cadastro */}
      {hasInstitutionContext && !showForm && (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider" style={{ width: '40%' }}>{t('common.name')}</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider" style={{ width: '15%' }}>{t('department.code').replace(' (Opcional)', '')}</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider" style={{ width: '35%' }}>{t('institution.singular')}</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right" style={{ width: '10%', minWidth: '100px' }}>{t('common.actions')}</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Carregando dados...</td></tr>
              ) : filteredDepartments.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400">{t('department.noDepartmentFound')}</td></tr>
              ) : filteredDepartments.map(d => {
                  const isDeleted = d.deleted;
                  return (
                      <tr key={d.id} className={`transition-colors group ${isDeleted ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-l-4 border-l-red-400 dark:border-l-red-600' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                          <td className="p-4">
                              <div className={`font-semibold text-slate-900 dark:text-slate-100 ${isDeleted ? 'line-through text-red-700 dark:text-red-400' : ''} truncate`}>{d.name}</div>
                              {isDeleted && <span className="text-[10px] text-red-500 font-bold uppercase">{t('common.deleted')}</span>}
                          </td>
                          <td className="p-4">
                              {d.code ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${isDeleted ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-700'}`}>
                                      {d.code}
                                  </span>
                              ) : (
                                  <span className="text-slate-300 dark:text-slate-600 italic text-xs">{t('department.noCode')}</span>
                              )}
                          </td>
                          <td className="p-4 text-sm text-slate-600 dark:text-slate-400 truncate">
                              {institutions.find(i => i.id === d.institution_id)?.name || 'N/A'}
                          </td>
                          <td className="p-4 text-right overflow-visible">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 min-w-fit">
                                  {isDeleted ? (
                                      <button onClick={() => openRestoreModal(d)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-all shrink-0 flex-shrink-0" title="Restaurar">
                                          <RotateCcw size={16}/>
                                      </button>
                                  ) : (
                                      <>
                                          <button onClick={() => handleEdit(d)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all shrink-0 flex-shrink-0"><Edit2 size={16}/></button>
                                          <button onClick={() => openDeleteModal(d)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all shrink-0 flex-shrink-0"><Trash2 size={16}/></button>
                                      </>
                                  )}
                              </div>
                          </td>
                      </tr>
                  );
              })}
          </tbody>
          </table>
      </div>
      )}
    </div>
  );
};

export default DepartmentManager;
