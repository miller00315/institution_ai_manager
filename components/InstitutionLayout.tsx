
import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './Navigation';
import { View } from '../types';
import { Session } from '@supabase/supabase-js';
import { Building2, Loader2, Menu, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '../services/supabaseService';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

// Institution Dashboard
import InstitutionDashboard from './InstitutionDashboard';

// Institution Managers manage their own entities
import ProfessorManager from './ProfessorManager';
import StudentManager from './StudentManager';
import ClassManager from './ClassManager';
import GradeManager from './GradeManager';
import TestManager from './TestManager';
import TestReleaseManager from './TestReleaseManager';
import TestResults from './TestResults';
import InstitutionDetails from './InstitutionDetails';
import DepartmentManager from './DepartmentManager';
import DisciplineManager from './DisciplineManager';
import QuestionManager from './QuestionManager';
import InstitutionBNCCViewer from './InstitutionBNCCViewer';
import FinancialManager from './FinancialManager';
import ReportManager from './ReportManager';

interface LayoutProps {
    session: Session | null;
    isConnected: boolean;
}

const InstitutionLayout: React.FC<LayoutProps> = ({ session, isConnected }) => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [myInstitutionId, setMyInstitutionId] = useState<string | null>(null);
    const [loadingInst, setLoadingInst] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    
    // Drill-down navigation state
    const [drillDownView, setDrillDownView] = useState<'professor' | 'student' | 'class' | 'grade' | 'test' | null>(null);
    const [drillDownId, setDrillDownId] = useState<string | null>(null);

    // View titles map
    const getViewTitle = (view: string): string => {
        const viewMap: Record<string, string> = {
            dashboard: 'Painel',
            my_institution: 'Minha Instituição',
            professors: 'Professores',
            students: 'Alunos',
            classes: 'Turmas',
            grades: 'Séries',
            departments: 'Departamentos',
            disciplines: 'Disciplinas',
            questions: 'Questões',
            tests: 'Provas',
            releases: 'Liberações',
            results: 'Resultados',
            bncc: 'BNCC',
            financial: 'Financeiro',
        };
        return viewMap[view] || view.replace('_', ' ');
    };

    // Simple navigation - breadcrumb is always: Painel > Current View
    const handleNavigate = useCallback((view: View) => {
        setCurrentView(view);
        setDrillDownView(null);
        setDrillDownId(null);
    }, []);

    // Build breadcrumb based on current view only (no history accumulation)
    const breadcrumbItems: BreadcrumbItem[] = currentView === 'dashboard' 
        ? [{ label: 'Painel', view: 'dashboard' }]
        : [
            { label: 'Painel', view: 'dashboard' },
            { label: getViewTitle(currentView), view: currentView }
          ];

    // Handle breadcrumb click
    const handleBreadcrumbNavigate = useCallback((view: string) => {
        setCurrentView(view as View);
        setDrillDownView(null);
        setDrillDownId(null);
    }, []);
    
    const handleDrillDown = (type: 'professor' | 'student' | 'class' | 'grade' | 'test', id: string) => {
        setDrillDownView(type);
        setDrillDownId(id);
    };
    
    const handleBackFromDrillDown = () => {
        setDrillDownView(null);
        setDrillDownId(null);
    };

    useEffect(() => {
        const fetchMyId = async () => {
            if (!session?.user || !isConnected) {
                setLoadingInst(false);
                return;
            }
            const client = getSupabaseClient();
            if (client) {
                try {
                    // Add a small delay to ensure session is fully established
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // 1. Get the App User ID and role from the Auth ID
                    const { data: appUser } = await client
                        .from('app_users')
                        .select('id, user_rules(rule_name)')
                        .eq('auth_id', session.user.id)
                        .maybeSingle();

                    if (appUser) {
                        // Verify user has Institution role
                        const role = (appUser.user_rules as any)?.rule_name;
                        setUserRole(role);
                        
                        if (role === 'Institution') {
                            // 2. Get the Institution managed by this App User
                            const { data } = await client
                                .from('institutions')
                                .select('id')
                                .eq('manager_id', appUser.id)
                                .maybeSingle();
                            
                            if (data) setMyInstitutionId(data.id);
                        }
                    }
                } catch (e) {
                    console.error("Error fetching my institution", e);
                } finally {
                    setLoadingInst(false);
                }
            } else {
                setLoadingInst(false);
            }
        };
        fetchMyId();
    }, [session?.user?.id, isConnected]); // Use session?.user?.id to ensure re-run on user change

    const renderContent = () => {
        if (loadingInst) {
            return (
                <div className="flex items-center justify-center h-full text-slate-400">
                    <Loader2 className="animate-spin mr-2"/> Identificando Instituição...
                </div>
            );
        }

        // Verify user has Institution role
        if (userRole !== 'Institution') {
            return (
                <div className="p-12 text-center border-2 border-dashed border-amber-300 rounded-xl m-8 bg-amber-50">
                    <AlertTriangle className="mx-auto text-amber-400 mb-4" size={48}/>
                    <h3 className="text-xl font-bold text-amber-800">Acesso Restrito</h3>
                    <p className="text-amber-600 mt-2">Apenas gerenciadores de instituição podem acessar esta área.</p>
                </div>
            );
        }

        // Isolamento Estrito: Se não houver ID de instituição para este gerenciador, bloquear acesso.
        if (!myInstitutionId) {
            return (
                <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-xl m-8">
                    <Building2 className="mx-auto text-slate-300 mb-4" size={48}/>
                    <h3 className="text-xl font-bold text-slate-700">Nenhuma Instituição Vinculada</h3>
                    <p className="text-slate-500 mt-2">Sua conta não está atualmente atribuída como gerenciador de nenhuma instituição.</p>
                </div>
            );
        }

        // Render drill-down views first
        if (drillDownView === 'professor' && drillDownId) {
            return (
                <ProfessorManager 
                    hasSupabase={isConnected}
                    institutionId={myInstitutionId}
                    initialProfessorId={drillDownId}
                    onBack={handleBackFromDrillDown}
                />
            );
        }
        if (drillDownView === 'student' && drillDownId) {
            return (
                <StudentManager 
                    hasSupabase={isConnected}
                    institutionId={myInstitutionId}
                    initialStudentId={drillDownId}
                    onBack={handleBackFromDrillDown}
                />
            );
        }
        if (drillDownView === 'class' && drillDownId) {
            return (
                <ClassManager 
                    hasSupabase={isConnected}
                    institutionId={myInstitutionId}
                    initialClassId={drillDownId}
                    onBack={handleBackFromDrillDown}
                />
            );
        }
        if (drillDownView === 'grade' && drillDownId) {
            return (
                <GradeManager 
                    hasSupabase={isConnected}
                    institutionId={myInstitutionId}
                    initialGradeId={drillDownId}
                    onBack={handleBackFromDrillDown}
                />
            );
        }
        if (drillDownView === 'test' && drillDownId) {
            return (
                <TestManager 
                    hasSupabase={isConnected}
                    institutionId={myInstitutionId}
                    initialTestId={drillDownId}
                    onBack={handleBackFromDrillDown}
                />
            );
        }

        // Pass myInstitutionId to enforce isolation in components
        switch (currentView) {
            case 'dashboard':
                return (
                    <InstitutionDashboard 
                        onNavigate={handleNavigate} 
                        institutionId={myInstitutionId}
                        onViewProfessor={(id) => handleDrillDown('professor', id)}
                        onViewStudent={(id) => handleDrillDown('student', id)}
                        onViewClass={(id) => handleDrillDown('class', id)}
                        onViewGrade={(id) => handleDrillDown('grade', id)}
                        onViewTest={(id) => handleDrillDown('test', id)}
                    />
                );
            case 'my_institution' as any: 
                return (
                    <InstitutionDetails 
                        institutionId={myInstitutionId} 
                        onBack={() => handleNavigate('dashboard')} 
                        hasSupabase={isConnected}
                        onViewProfessor={(id) => handleDrillDown('professor', id)}
                        onViewStudent={(id) => handleDrillDown('student', id)}
                        onViewClass={(id) => handleDrillDown('class', id)}
                        onViewGrade={(id) => handleDrillDown('grade', id)}
                    />
                );
            case 'professors': return <ProfessorManager hasSupabase={isConnected} institutionId={myInstitutionId} />;
            case 'students': return <StudentManager hasSupabase={isConnected} institutionId={myInstitutionId} />;
            case 'classes': return <ClassManager hasSupabase={isConnected} institutionId={myInstitutionId} />;
            case 'grades': return <GradeManager hasSupabase={isConnected} institutionId={myInstitutionId} />;
            case 'questions': return <QuestionManager hasSupabase={isConnected} />;
            case 'tests': return <TestManager hasSupabase={isConnected} institutionId={myInstitutionId} />;
            case 'releases': return <TestReleaseManager hasSupabase={isConnected} institutionId={myInstitutionId} />;
            case 'results': return <TestResults hasSupabase={isConnected} />; 
            
            // Direct access links using dedicated managers
            case 'departments': return <DepartmentManager hasSupabase={isConnected} institutionId={myInstitutionId} />;
            case 'disciplines': return <DisciplineManager hasSupabase={isConnected} institutionId={myInstitutionId} />;
            case 'bncc': return <InstitutionBNCCViewer hasSupabase={isConnected} />;
            case 'financial': return <FinancialManager hasSupabase={isConnected} institutionId={myInstitutionId} />;
            case 'reports': return <ReportManager hasSupabase={isConnected} institutionId={myInstitutionId || undefined} userRole="Institution" />;
            
            default: return <div>Select a module</div>;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Navigation 
                    currentView={currentView} 
                    onNavigate={handleNavigate} 
                    userEmail={session?.user?.email}
                    userRole="Institution"
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize truncate">{currentView.replace('_', ' ')}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher variant="compact" />
                        <LanguageSwitcher variant="compact" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden md:inline">Modo Gerenciador</span>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center text-white shrink-0">
                            <Building2 size={14} />
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {!drillDownView && (
                        <Breadcrumb 
                            items={breadcrumbItems} 
                            onNavigate={handleBreadcrumbNavigate}
                        />
                    )}
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default InstitutionLayout;
