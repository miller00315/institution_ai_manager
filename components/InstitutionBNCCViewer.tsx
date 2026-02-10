
import React, { useState } from 'react';
import { useBNCCManager } from '../presentation/hooks/useBNCCManager';
import { ScrollText, Loader2, AlertTriangle, Search, Filter, Info, BookOpen } from 'lucide-react';

/**
 * InstitutionBNCCViewer - INSTITUTION ONLY
 * Read-only view of BNCC items for reference when linking disciplines.
 * This component is isolated and should only be used in InstitutionLayout.
 */
interface InstitutionBNCCViewerProps {
  hasSupabase: boolean;
}

const InstitutionBNCCViewer: React.FC<InstitutionBNCCViewerProps> = ({ hasSupabase }) => {
  const { items, loading, error } = useBNCCManager(hasSupabase);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [componentFilter, setComponentFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const uniqueComponents = Array.from(new Set(items.map(i => i.componente_curricular).filter(Boolean))).sort();

  const filteredItems = items.filter(i => {
      if (i.deleted) return false; // Institution doesn't see deleted items
      const matchSearch = (i.codigo_alfanumerico || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (i.descricao_habilidade || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchComp = componentFilter === 'All' || i.componente_curricular === componentFilter;
      return matchSearch && matchComp;
  });

  if (!hasSupabase) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Configure o banco de dados primeiro.</div>;

  return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Base Nacional Comum Curricular</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Consulte as competências para vincular às disciplinas da sua instituição</p>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <Info size={16} className="text-indigo-600 dark:text-indigo-400"/>
                  <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Modo Consulta</span>
              </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3 text-red-700 dark:text-red-300 items-center">
                <AlertTriangle size={20}/> {error}
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-3">
              <BookOpen className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" size={20}/>
              <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">Como vincular BNCC às disciplinas?</h4>
                  <p className="text-indigo-700 dark:text-indigo-300 text-sm mt-1">
                      Acesse o menu <strong>Disciplinas</strong> e edite cada disciplina para selecionar a competência BNCC correspondente. 
                      Use esta tela para consultar os códigos e descrições disponíveis.
                  </p>
              </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18}/>
                  <input 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Buscar por código ou descrição..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter className="text-slate-400 dark:text-slate-500" size={18}/>
                  <select 
                      value={componentFilter} 
                      onChange={e => setComponentFilter(e.target.value)}
                      className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full md:w-48"
                  >
                      <option value="All">Todos os Componentes</option>
                      {uniqueComponents.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
              </div>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-4">
              <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{filteredItems.length}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">competências encontradas</span>
              </div>
          </div>

          {/* Cards Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                  <div className="col-span-full p-12 text-center text-slate-400 dark:text-slate-500">
                      <Loader2 className="animate-spin inline mr-2"/> Carregando dados...
                  </div>
              ) : filteredItems.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-slate-400 dark:text-slate-500">
                      <ScrollText className="mx-auto mb-4 opacity-30" size={48}/>
                      <p>Nenhum item encontrado com os filtros aplicados.</p>
                  </div>
              ) : filteredItems.map(item => (
                  <div 
                      key={item.id} 
                      onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                      className={`bg-white dark:bg-slate-800 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedItem === item.id 
                              ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-900/50 shadow-lg' 
                              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                      }`}
                  >
                      <div className="flex items-start justify-between mb-2">
                          <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-sm bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                              {item.codigo_alfanumerico}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                              {item.componente_curricular}
                          </span>
                      </div>
                      
                      {item.ano_serie && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.ano_serie}</div>
                      )}
                      
                      <p className={`text-sm text-slate-700 dark:text-slate-200 ${selectedItem === item.id ? '' : 'line-clamp-3'}`}>
                          {item.descricao_habilidade}
                      </p>
                      
                      {item.unidade_tematica && (
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                              <span className="text-xs text-slate-400 dark:text-slate-500">Unidade: </span>
                              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{item.unidade_tematica}</span>
                          </div>
                      )}
                      
                      {selectedItem === item.id && (
                          <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/50">
                              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                  💡 Use o código <strong>{item.codigo_alfanumerico}</strong> ao vincular disciplinas
                              </p>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>
  );
};

export default InstitutionBNCCViewer;


