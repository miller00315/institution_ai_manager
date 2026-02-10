
import React, { useState, useEffect } from 'react';
import { Building2, Users, Briefcase, GraduationCap, BookOpen, FileText, Send, ClipboardList, Layers, Loader2 } from 'lucide-react';
import { View } from '../types';
import { getSupabaseClient } from '../services/supabaseService';

interface InstitutionDashboardProps {
    onNavigate: (view: View) => void;
    institutionId: string;
    // Navigation callbacks for drill-down
    onViewProfessor?: (professorId: string) => void;
    onViewStudent?: (studentId: string) => void;
    onViewClass?: (classId: string) => void;
    onViewGrade?: (gradeId: string) => void;
    onViewTest?: (testId: string) => void;
}

interface Stats {
    departments: number;
    professors: number;
    students: number;
    classes: number;
    tests: number;
    activeReleases: number;
}

const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ onNavigate, institutionId }) => {
    const [stats, setStats] = useState<Stats>({ departments: 0, professors: 0, students: 0, classes: 0, tests: 0, activeReleases: 0 });
    const [loading, setLoading] = useState(true);
    const [institutionName, setInstitutionName] = useState('Instituição');

    const supabase = getSupabaseClient();

    useEffect(() => {
        const fetchStats = async () => {
            if (!supabase || !institutionId) return;
            try {
                // Get institution name
                const { data: inst } = await supabase
                    .from('institutions')
                    .select('name')
                    .eq('id', institutionId)
                    .single();

                if (inst) {
                    setInstitutionName(inst.name);
                }

                // Count departments
                const { count: deptCount } = await supabase
                    .from('departments')
                    .select('*', { count: 'exact', head: true })
                    .eq('institution_id', institutionId)
                    .eq('deleted', false);

                // Get department IDs for further queries
                const { data: depts } = await supabase
                    .from('departments')
                    .select('id')
                    .eq('institution_id', institutionId)
                    .eq('deleted', false);

                const deptIds = depts?.map(d => d.id) || [];

                let profCount = 0;
                if (deptIds.length > 0) {
                    const { count } = await supabase
                        .from('professors')
                        .select('*', { count: 'exact', head: true })
                        .in('department_id', deptIds)
                        .eq('deleted', false);
                    profCount = count || 0;
                }

                // Count grades
                const { data: grades } = await supabase
                    .from('school_grades')
                    .select('id')
                    .eq('institution_id', institutionId)
                    .eq('deleted', false);

                const gradeIds = grades?.map(g => g.id) || [];

                // Count classes
                let classCount = 0;
                if (gradeIds.length > 0) {
                    const { count } = await supabase
                        .from('classes')
                        .select('*', { count: 'exact', head: true })
                        .in('grade_id', gradeIds)
                        .eq('deleted', false);
                    classCount = count || 0;
                }

                // Count students
                const { data: classes } = await supabase
                    .from('classes')
                    .select('id')
                    .in('grade_id', gradeIds)
                    .eq('deleted', false);

                const classIds = classes?.map(c => c.id) || [];

                let studentCount = 0;
                if (classIds.length > 0) {
                    const { count } = await supabase
                        .from('students')
                        .select('*', { count: 'exact', head: true })
                        .in('class_id', classIds)
                        .eq('deleted', false);
                    studentCount = count || 0;
                }

                // Count tests from professors of this institution
                let testCount = 0;
                if (deptIds.length > 0) {
                    const { data: profs } = await supabase
                        .from('professors')
                        .select('id')
                        .in('department_id', deptIds)
                        .eq('deleted', false);
                    
                    const profIds = profs?.map(p => p.id) || [];
                    if (profIds.length > 0) {
                        const { count } = await supabase
                            .from('tests')
                            .select('*', { count: 'exact', head: true })
                            .in('professor_id', profIds)
                            .eq('deleted', false);
                        testCount = count || 0;
                    }
                }

                // Count active releases
                const { count: releaseCount } = await supabase
                    .from('test_releases')
                    .select('*', { count: 'exact', head: true })
                    .gte('end_time', new Date().toISOString());

                setStats({
                    departments: deptCount || 0,
                    professors: profCount,
                    students: studentCount,
                    classes: classCount,
                    tests: testCount,
                    activeReleases: releaseCount || 0
                });
            } catch (e) {
                console.error('Error fetching institution stats:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [supabase, institutionId]);

    const shortcuts = [
        { 
            label: 'Minha Instituição', 
            icon: Building2, 
            desc: 'Perfil e configurações', 
            view: 'my_institution' as View,
            color: 'bg-indigo-600'
        },
        { 
            label: 'Departamentos', 
            icon: Layers, 
            desc: 'Divisões acadêmicas', 
            view: 'departments' as View,
            color: 'bg-violet-500',
            stat: stats.departments,
            statLabel: 'depto(s)'
        },
        { 
            label: 'Professores', 
            icon: Briefcase, 
            desc: 'Corpo docente', 
            view: 'professors' as View,
            color: 'bg-blue-500',
            stat: stats.professors,
            statLabel: 'prof.'
        },
        { 
            label: 'Alunos', 
            icon: Users, 
            desc: 'Matrículas e cadastros', 
            view: 'students' as View,
            color: 'bg-emerald-500',
            stat: stats.students,
            statLabel: 'alunos'
        },
        { 
            label: 'Séries/Anos', 
            icon: GraduationCap, 
            desc: 'Níveis escolares', 
            view: 'grades' as View,
            color: 'bg-amber-500'
        },
        { 
            label: 'Turmas', 
            icon: Users, 
            desc: 'Classes e grupos', 
            view: 'classes' as View,
            color: 'bg-cyan-500',
            stat: stats.classes,
            statLabel: 'turmas'
        },
        { 
            label: 'Disciplinas', 
            icon: BookOpen, 
            desc: 'Matérias e currículo', 
            view: 'disciplines' as View,
            color: 'bg-pink-500'
        },
        { 
            label: 'Provas', 
            icon: FileText, 
            desc: 'Avaliações criadas', 
            view: 'tests' as View,
            color: 'bg-purple-500',
            stat: stats.tests,
            statLabel: 'provas'
        },
        { 
            label: 'Liberações', 
            icon: Send, 
            desc: 'Agendamentos de provas', 
            view: 'releases' as View,
            color: 'bg-orange-500',
            stat: stats.activeReleases,
            statLabel: 'ativas'
        },
        { 
            label: 'Resultados', 
            icon: ClipboardList, 
            desc: 'Notas e relatórios', 
            view: 'results' as View,
            color: 'bg-slate-600'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">{institutionName}</h1>
                    <p className="text-indigo-100 max-w-lg">
                        Gerencie a estrutura acadêmica da sua instituição, professores, alunos e avaliações.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <Building2 size={200} className="transform translate-x-10 translate-y-10"/>
                </div>

                {/* Quick Stats */}
                {!loading && (
                    <div className="flex flex-wrap gap-4 mt-6 relative z-10">
                        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                            <div className="text-2xl font-bold">{stats.departments}</div>
                            <div className="text-xs text-indigo-200">Departamentos</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                            <div className="text-2xl font-bold">{stats.professors}</div>
                            <div className="text-xs text-indigo-200">Professores</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                            <div className="text-2xl font-bold">{stats.students}</div>
                            <div className="text-xs text-indigo-200">Alunos</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                            <div className="text-2xl font-bold">{stats.classes}</div>
                            <div className="text-xs text-indigo-200">Turmas</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                            <div className="text-2xl font-bold">{stats.tests}</div>
                            <div className="text-xs text-indigo-200">Provas</div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center gap-2 mt-6 text-indigo-200">
                        <Loader2 className="animate-spin" size={16}/>
                        <span className="text-sm">Carregando estatísticas...</span>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Acesso Rápido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {shortcuts.map((s, idx) => (
                        <button 
                            key={idx}
                            onClick={() => onNavigate(s.view)}
                            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all flex flex-col text-left group hover:border-indigo-300 dark:hover:border-indigo-600 hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                    <s.icon size={22} />
                                </div>
                                {s.stat !== undefined && (
                                    <div className="text-right">
                                        {loading ? (
                                            <Loader2 className="animate-spin text-slate-400 dark:text-slate-500" size={20}/>
                                        ) : (
                                            <>
                                                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{s.stat}</div>
                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.statLabel}</div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{s.label}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-white">
                            <Users size={24}/>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">Cadastrar Alunos</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Adicione novos estudantes</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate('students')}
                        className="w-full bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Gerenciar Alunos →
                    </button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white">
                            <Briefcase size={24}/>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">Corpo Docente</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie professores</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate('professors')}
                        className="w-full bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Ver Professores →
                    </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500 dark:bg-purple-600 flex items-center justify-center text-white">
                            <ClipboardList size={24}/>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">Relatórios</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe resultados</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate('results')}
                        className="w-full bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Ver Resultados →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstitutionDashboard;


