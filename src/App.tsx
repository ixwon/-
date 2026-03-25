/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Phone, 
  PlusCircle, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  User, 
  ArrowLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RotateCcw,
  LogIn,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_CONTACTS } from './data/mockData';
import { WorkPlan, ProjectContact } from './types';
import { 
  db, 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  handleFirestoreError,
  OperationType
} from './firebase';
import { orderBy, writeBatch, getDocs } from 'firebase/firestore';

type Tab = 'dashboard' | 'search' | 'contacts' | 'add';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('전체');
  const [filterDate, setFilterDate] = useState<string | 'all'>('all');
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [addFormProject, setAddFormProject] = useState('');
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, 'workPlans'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans: WorkPlan[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WorkPlan));
      setWorkPlans(plans);
      setFirestoreError(null);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'workPlans');
      } catch (e: any) {
        setFirestoreError(e.message);
      }
    });

    return () => unsubscribe();
  }, []);

  const allProjects = useMemo(() => {
    const projectsMap = new Map<string, string>();
    MOCK_CONTACTS.forEach(c => {
      projectsMap.set(c.projectName, c.department);
    });
    return Array.from(projectsMap.entries())
      .map(([name, dept]) => ({ name, dept }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const departments = useMemo(() => {
    const depts = new Set(workPlans.map(p => p.department.split('(')[0]));
    return ['전체', ...Array.from(depts)];
  }, [workPlans]);

  const filteredPlans = useMemo(() => {
    return workPlans.filter(p => {
      if (!p.isImplemented) return false;
      const matchesSearch = p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept === '전체' || p.department.startsWith(filterDept);
      const matchesDate = filterDate === 'all' || p.date === filterDate;
      return matchesSearch && matchesDept && matchesDate;
    });
  }, [workPlans, searchQuery, filterDept, filterDate]);

  const activeSitesCount = workPlans.filter(p => p.isImplemented).length;

  const sitesByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    workPlans.forEach(p => {
      if (p.isImplemented) {
        counts[p.date] = (counts[p.date] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [workPlans]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  const plansByDept = useMemo(() => {
    const grouped: Record<string, WorkPlan[]> = {};
    workPlans.filter(p => p.isImplemented).forEach(plan => {
      const dept = plan.department.split('(')[0];
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(plan);
    });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [workPlans]);

  const handleAddPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isImplemented = formData.get('isImplemented') === 'on';
    
    const newPlanData = {
      department: formData.get('department') as string,
      projectName: formData.get('projectName') as string,
      date: formData.get('date') as string,
      isImplemented: isImplemented,
      content: formData.get('content') as string,
      workers: formData.get('workerName') ? [{ name: formData.get('workerName') as string, rank: formData.get('workerRank') as string }] : [],
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'workPlans'), newPlanData);
      setAddFormProject('');
      setActiveTab('dashboard');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'workPlans');
      } catch (e: any) {
        setFirestoreError(e.message);
      }
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'workPlans', id));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `workPlans/${id}`);
      } catch (e: any) {
        setFirestoreError(e.message);
      }
    }
  };

  const handleResetAllPlans = async () => {
    try {
      const q = query(collection(db, 'workPlans'));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
      setShowResetConfirm(false);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, 'workPlans (batch delete)');
      } catch (e: any) {
        setFirestoreError(e.message);
      }
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 p-4">
      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 relative z-10">
          <h2 className="text-sm font-medium opacity-80">휴일 작업 현황</h2>
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold transition-colors"
          >
            <RotateCcw size={12} />
            전체 초기화
          </button>
        </div>
        <div className="space-y-3 relative z-10">
          {sitesByDate.map(([date, count]) => (
            <button 
              key={date}
              onClick={() => { 
                setActiveTab('search'); 
                setSelectedProject(null);
                setSelectedPlanId(null);
                setFilterDate(date); 
              }}
              className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} className="opacity-80" />
                <span className="text-lg font-bold">{formatDate(date)}</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black">{count}</span>
                <span className="text-sm mb-1 opacity-80">개 현장 시행</span>
                <ChevronRight size={18} className="ml-1 opacity-60" />
              </div>
            </button>
          ))}
          {sitesByDate.length === 0 && (
            <div className="text-center py-4 opacity-60 italic">시행 현장이 없습니다.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { 
            setActiveTab('search'); 
            setSelectedProject(null);
            setSelectedPlanId(null);
            setFilterDate('all'); 
          }}
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-left hover:border-blue-200 transition-colors"
        >
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CheckCircle2 size={18} />
            <span className="text-xs font-semibold">시행</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{activeSitesCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">전체 보기 →</p>
        </button>
        <div 
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-left"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <AlertCircle size={18} />
            <span className="text-xs font-semibold">미시행</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{12 - activeSitesCount}</p>
        </div>
      </div>

      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          사업단별 휴일 작업 계획
        </h3>
        <div className="space-y-6">
          {plansByDept.length > 0 ? plansByDept.map(([dept, plans]) => (
            <div key={dept} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                <h4 className="text-sm font-bold text-slate-700">{dept}사업단</h4>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">
                  {plans.length}
                </span>
              </div>
              <div className="grid gap-3">
                {plans.map(plan => (
                  <div 
                    key={plan.id} 
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveTab('search');
                      setSelectedProject(plan.projectName);
                      setSelectedPlanId(plan.id);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        {plan.department.includes('(') ? plan.department.split('(')[1].replace(')', '') : '일반'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{plan.date}</span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm mb-1">{plan.projectName}</h5>
                    <p className="text-xs text-slate-500 line-clamp-1">{plan.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="bg-slate-50 rounded-2xl py-10 text-center border border-dashed border-slate-200">
              <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm font-medium">등록된 시행 계획이 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  const renderProjectDetail = (projectName: string, planId?: string | null, showWorkPlan: boolean = true) => {
    const project = MOCK_CONTACTS.find(c => c.projectName === projectName) || MOCK_CONTACTS[0];
    const plan = workPlans.find(p => p.id === planId) || workPlans.find(p => p.projectName === projectName);
    
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => {
              setSelectedProject(null);
              setSelectedPlanId(null);
            }} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-900">
            {showWorkPlan ? '현장 상세 정보' : '비상연락망 상세'}
          </h2>
        </div>

        {/* Weekend Work Plan Section */}
        {showWorkPlan && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">주말 작업계획</h3>
            </div>
            {plan ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{plan.department}</p>
                    <h4 className="text-lg font-bold text-slate-800">{plan.projectName}</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{plan.date}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{plan.content}</p>
                </div>
                {plan.workers.length > 0 && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {plan.workers.map(w => `${w.name} ${w.rank}`).join(', ')}
                      </p>
                      <p className="text-xs text-slate-400">현장 근무자</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">등록된 작업 계획이 없습니다.</p>
            )}
          </div>
        )}

        {/* Emergency Contact Network Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          {!showWorkPlan && (
            <div className="mb-4">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{project.department}</p>
              <h3 className="text-lg font-bold text-slate-900">{project.projectName}</h3>
            </div>
          )}
          <div className="flex items-center gap-2 mb-6">
            <Phone size={18} className="text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">비상연락망</h3>
          </div>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest border-b border-slate-50 pb-2">내부 (K-water)</h4>
              <div className="space-y-4">
                {project.contacts.filter(c => c.type === 'internal').map((contact, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{contact.name} {contact.role}</p>
                      <p className="text-xs text-slate-500">{contact.category}</p>
                    </div>
                    <a 
                      href={`tel:${contact.phone}`}
                      className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest border-b border-slate-50 pb-2">외부 (감리/시공)</h4>
              <div className="space-y-4">
                {project.contacts.filter(c => c.type === 'external').map((contact, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{contact.name} {contact.role}</p>
                      <p className="text-xs text-slate-500">{contact.category}</p>
                    </div>
                    <a 
                      href={`tel:${contact.phone}`}
                      className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSearch = () => {
    if (selectedProject) {
      return renderProjectDetail(selectedProject, selectedPlanId);
    }

    return (
      <div className="p-4 space-y-4">
        <div className="sticky top-0 bg-slate-50 pt-2 pb-4 space-y-3 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="사업명 또는 작업내용 검색"
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setFilterDept(dept)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filterDept === dept 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
            {filterDate !== 'all' && (
              <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
                  <Calendar size={14} />
                  {formatDate(filterDate)} 필터링 중
                </div>
                <button 
                  onClick={() => setFilterDate('all')}
                  className="text-blue-400 hover:text-blue-600 p-1"
                >
                  <PlusCircle size={16} className="rotate-45" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPlans.length > 0 ? filteredPlans.map(plan => (
            <motion.div 
              layout
              key={plan.id} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedProject(plan.projectName);
                setSelectedPlanId(plan.id);
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {plan.department}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded text-emerald-600 bg-emerald-50">
                    시행
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Calendar size={14} />
                    {plan.date}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(plan.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-900">{plan.projectName}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex gap-2 text-sm text-slate-600">
                  <div className="mt-1 shrink-0">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
                  <p className="line-clamp-2">{plan.content}</p>
                </div>
              </div>
              {plan.workers.length > 0 && (
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {plan.workers.map(w => `${w.name} ${w.rank}`).join(', ')}
                      </p>
                      <p className="text-[10px] text-slate-400">현장 근무자</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-bold text-[10px]">
                    상세보기
                    <ChevronRight size={14} />
                  </div>
                </div>
              )}
            </motion.div>
          )) : (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContactsTab = () => {
    if (selectedProject) {
      return renderProjectDetail(selectedProject, null, false);
    }

    return (
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 px-2 mb-4">사업별 비상연락망</h2>
        <div className="space-y-3">
          {MOCK_CONTACTS.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.projectName)}
              className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group"
            >
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{project.department}</p>
                <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{project.projectName}</h3>
                <p className="text-xs text-slate-400 mt-1">담당자 {project.contacts.length}명 등록됨</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <ChevronRight size={20} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAddForm = () => (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 px-2">휴일 작업 계획 등록</h2>
      <form onSubmit={handleAddPlan} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4">
          <span className="text-sm font-bold text-slate-700">작업 시행 여부</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input name="isImplemented" type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">사업명</label>
          <select 
            name="projectName" 
            required 
            value={addFormProject}
            onChange={(e) => setAddFormProject(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">사업을 선택하세요</option>
            {allProjects.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">부서</label>
            <select 
              name="department" 
              value={allProjects.find(p => p.name === addFormProject)?.dept || ''}
              readOnly
              className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 cursor-not-allowed"
            >
              <option value="">사업 선택 시 자동 입력</option>
              {Array.from(new Set(MOCK_CONTACTS.map(c => c.department))).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {/* Hidden input to ensure department is sent in form data if select is disabled/readonly */}
            <input type="hidden" name="department" value={allProjects.find(p => p.name === addFormProject)?.dept || ''} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">시행일자</label>
            <input 
              name="date" 
              type="date" 
              required 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">작업 내용</label>
          <textarea 
            name="content" 
            required 
            rows={3}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="주요 작업 내용을 입력하세요"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">근무자 성명</label>
            <input 
              name="workerName" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">직급</label>
            <input 
              name="workerRank" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 토목3급"
            />
          </div>
        </div>
        <button 
          type="submit"
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors mt-4"
        >
          계획 등록하기
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">K</div>
            <h1 className="text-lg font-black tracking-tight text-slate-900">K-water <span className="font-medium text-slate-400">현장관리</span></h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (selectedProject || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'search' && renderSearch()}
            {activeTab === 'contacts' && renderContactsTab()}
            {activeTab === 'add' && renderAddForm()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Firestore Error Display */}
      <AnimatePresence>
        {firestoreError && (
          <div className="fixed bottom-24 left-4 right-4 z-50">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold mb-1">데이터베이스 오류</p>
                <p className="text-xs opacity-90 line-clamp-3">{firestoreError}</p>
              </div>
              <button 
                onClick={() => setFirestoreError(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <PlusCircle size={18} className="rotate-45" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw size={32} />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2">전체 계획 초기화</h3>
              <p className="text-slate-500 text-center mb-6">
                등록된 모든 휴일 작업 계획을 삭제하시겠습니까?<br/>
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleResetAllPlans}
                  className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                >
                  초기화하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deletion Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2">작업 계획 삭제</h3>
              <p className="text-slate-500 text-center mb-6">
                해당 휴일 작업 계획을 삭제하시겠습니까?<br/>
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    handleDeletePlan(deletingId);
                    setDeletingId(null);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  삭제하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-3 z-30">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setSelectedProject(null); }} 
            icon={<LayoutDashboard size={24} />} 
            label="홈" 
          />
          <NavButton 
            active={activeTab === 'search'} 
            onClick={() => { setActiveTab('search'); setSelectedProject(null); }} 
            icon={<Search size={24} />} 
            label="검색" 
          />
          <NavButton 
            active={activeTab === 'add'} 
            onClick={() => { setActiveTab('add'); setSelectedProject(null); }} 
            icon={<PlusCircle size={24} />} 
            label="등록" 
          />
          <NavButton 
            active={activeTab === 'contacts'} 
            onClick={() => { setActiveTab('contacts'); setSelectedProject(null); }} 
            icon={<Phone size={24} />} 
            label="연락망" 
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
