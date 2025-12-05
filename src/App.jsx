import React, { useState, useEffect } from 'react';
import { 
  Heart, Zap, PenTool, Plus, Calendar, CheckCircle, Target, Smile, 
  Camera, X, ChevronRight, Trophy, MoreHorizontal, Printer, User, 
  Users, MessageSquare, ThumbsUp, Clock, Layout, Flag, Link, 
  FileText, Mic, Save, MessageSquarePlus, Edit3, LogOut, Loader
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc,
  query,
  setDoc // 저장 기능을 위해 필수
} from 'firebase/firestore';

// =================================================================
// 🔴 [중요] Firebase 콘솔에서 발급받은 키를 여기에 넣으세요!
// =================================================================
const myFirebaseConfig = {
  apiKey: "AIzaSyDIQ-z006mRAFCIWikmp7JzrOB9qjHrxPw",
  authDomain: "cas-journey-3a3c6.firebaseapp.com",
  projectId: "cas-journey-3a3c6",
  storageBucket: "cas-journey-3a3c6.firebasestorage.app",
  messagingSenderId: "510320677268",
  appId: "1:510320677268:web:410c69b1d6e90a7cd33f81"
};
// =================================================================

let auth, db, appId;

try {
  const configToUse = myFirebaseConfig.apiKey !== "YOUR_API_KEY_HERE" 
    ? myFirebaseConfig 
    : (typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null);

  if (configToUse) {
    const app = initializeApp(configToUse);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = configToUse.projectId || 'cas-app';
  } else {
    console.warn("Firebase Config가 설정되지 않았습니다.");
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
}

// --- IB 7 Learning Outcomes ---
const LEARNING_OUTCOMES = [
  { id: 1, text: "자신의 강점과 성장 분야 파악 (Identify strengths and growth) (LO1)", icon: "💪" },
  { id: 2, text: "도전과 기술 습득 입증 (Demonstrate challenges and skills) (LO2)", icon: "🧗" },
  { id: 3, text: "CAS 활동의 계획 및 개시 (Initiate and plan experience) (LO3)", icon: "🗺️" },
  { id: 4, text: "헌신과 인내심 입증 (Show commitment and perseverance) (LO4)", icon: "🔥" },
  { id: 5, text: "협동 기술 입증 (Demonstrate collaborative skills) (LO5)", icon: "🤝" },
  { id: 6, text: "글로벌 이슈 참여 (Engage with issues of global significance) (LO6)", icon: "🌍" },
  { id: 7, text: "윤리적 선택의 인식 (Recognize ethics of choices) (LO7)", icon: "⚖️" },
];

// --- Colors Helper ---
const getTypeColor = (type) => {
    switch (type) {
        case 'Creativity': return { bg: '#e9d5ff', border: '#a855f7', text: '#6b21a8', label: 'bg-purple-100 text-purple-700' }; 
        case 'Activity': return { bg: '#fef08a', border: '#eab308', text: '#854d0e', label: 'bg-yellow-100 text-yellow-700' }; 
        case 'Service': return { bg: '#fecaca', border: '#ef4444', text: '#991b1b', label: 'bg-red-100 text-red-700' }; 
        default: return { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', label: 'bg-slate-100 text-slate-700' };
    }
};

// --- Components ---

const LoginView = ({ onLogin, errorMsg }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <Target className="text-white" size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">OpenBac CAS</h1>
        <p className="text-slate-500 mb-8">학생의 성장을 기록하고 공유하는<br/>가장 스마트한 방법</p>
        
        {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                {errorMsg}
            </div>
        )}

        <div className="space-y-3">
          <button onClick={() => onLogin('student')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2">
            <User size={20} /> 학생으로 시작하기 (Start as Student)
          </button>
          <button onClick={() => onLogin('teacher')} className="w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
            <Users size={20} /> 교사로 시작하기 (Start as Teacher)
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-8">Secure Login via Firebase Auth</p>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, current, colorClass, icon: Icon }) => {
  // Visual Reference only: 50시간을 시각적 만점으로 잡음
  const visualTarget = 50; 
  const percentage = Math.min((current / visualTarget) * 100, 100);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex-1 print:border-slate-300">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100 print:bg-transparent print:p-0`}>
            <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
          </div>
          <span className="font-bold text-slate-700 text-sm md:text-base">{label}</span>
        </div>
        <span className="text-sm font-bold text-slate-600">{current}시간 (Hours)</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden print:bg-slate-200">
        <div className={`h-full ${colorClass.replace('text-', 'bg-')} print:bg-slate-600 transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const GanttChart = ({ activities, project }) => {
  const projectItem = project && project.title ? {
      id: 'project-main',
      title: `[프로젝트] ${project.title}`,
      startDate: project.startDate,
      endDate: project.endDate,
      types: ['Project'], 
      isProject: true
  } : null;
  
  const allItems = [...activities];
  if (projectItem) allItems.push(projectItem);

  if (allItems.length === 0) return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400 flex flex-col items-center justify-center h-40">
        <Layout size={24} className="mb-2 opacity-50" />
        <p>아직 타임라인에 표시할 활동이 없습니다.</p>
    </div>
  );

  const typeOrder = { 'Creativity': 1, 'Activity': 2, 'Service': 3, 'Project': 4 };
  const getSortOrder = (item) => {
      if (!item.types || item.types.length === 0) return 5;
      const orders = item.types.map(t => typeOrder[t] || 5);
      return Math.min(...orders);
  };

  const sortedItems = [...allItems].sort((a, b) => {
      const orderA = getSortOrder(a);
      const orderB = getSortOrder(b);
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.startDate) - new Date(b.startDate);
  });
  
  const startDates = sortedItems.map(a => new Date(a.startDate || new Date()));
  const endDates = sortedItems.map(a => new Date(a.endDate || new Date()));
  const minDate = new Date(Math.min(...startDates));
  const maxDate = new Date(Math.max(...endDates));
  
  const rangeStart = new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1);
  const rangeEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);

  const allMonths = [];
  const curr = new Date(rangeStart);
  let safety = 0;
  while (curr <= rangeEnd && safety < 60) {
    allMonths.push(new Date(curr));
    curr.setMonth(curr.getMonth() + 1);
    safety++;
  }

  const getMonthDiff = (d1, d2) => (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  const totalColumns = allMonths.length;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border-slate-300 print:shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Layout size={18} className="text-blue-500"/> 활동 타임라인 (Activity Timeline)
        </h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
            {rangeStart.getFullYear()}.{rangeStart.getMonth()+1} ~ {rangeEnd.getFullYear()}.{rangeEnd.getMonth()+1}
        </span>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="min-w-max" style={{ width: `${Math.max(100, totalColumns * 6)}%` }}> 
            <div className="grid gap-1 mb-2 border-b border-slate-100 pb-2" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(40px, 1fr))` }}>
            {allMonths.map((date, i) => {
                const monthName = date.toLocaleString('default', { month: 'short' });
                const year = date.getFullYear().toString().slice(2);
                const isNewYear = date.getMonth() === 0 || i === 0;
                return (
                    <div key={i} className={`text-xs text-center ${isNewYear ? 'font-bold text-slate-800' : 'text-slate-400'}`}>
                        {isNewYear && <span className="block text-[10px] text-blue-500">'{year}</span>}
                        {monthName}
                    </div>
                );
            })}
            </div>
            <div className="space-y-3 relative min-h-[100px]">
                <div className="absolute inset-0 grid gap-1 h-full pointer-events-none" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(40px, 1fr))` }}>
                    {allMonths.map((_, i) => <div key={i} className="border-r border-slate-50 h-full"></div>)}
                </div>
                {sortedItems.map((item, idx) => {
                    const actStart = new Date(item.startDate);
                    const actEnd = new Date(item.endDate);
                    const startCol = getMonthDiff(rangeStart, actStart) + 1;
                    const duration = Math.max(getMonthDiff(actStart, actEnd) + 1, 1);
                    
                    let backgroundStyle = {}; let borderColor = ''; let textColor = '';
                    if (item.types && item.types.includes('Project')) {
                        backgroundStyle = { background: '#2563eb' }; borderColor = '#1d4ed8'; textColor = '#ffffff';
                    } else if (item.types && item.types.length === 1) {
                         const colors = getTypeColor(item.types[0]);
                         backgroundStyle = { background: colors.bg };
                         borderColor = colors.border;
                         textColor = colors.text;
                    } else if (item.types) {
                         const colors = item.types.map(t => getTypeColor(t).bg);
                         const gradientStops = colors.map((color, idx) => {
                             const startPct = (idx / colors.length) * 100;
                             const endPct = ((idx + 1) / colors.length) * 100;
                             return `${color} ${startPct}% ${endPct}%`;
                         });
                         backgroundStyle = { background: `linear-gradient(to bottom, ${gradientStops.join(', ')})` };
                         borderColor = '#94a3b8'; textColor = '#1e293b'; 
                    }
                    return (
                        <div key={item.id || idx} className="grid gap-1 relative z-10 group" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(40px, 1fr))` }}>
                            <div className="h-8 rounded-lg border flex items-center px-2 text-xs font-bold truncate shadow-sm"
                                style={{ gridColumnStart: startCol, gridColumnEnd: `span ${duration}`, ...backgroundStyle, borderColor, color: textColor }}>
                                {item.types?.includes('Project') && <Flag size={12} className="mr-1 fill-current" />}{item.title}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

const CASProjectSection = ({ project, onEdit }) => {
    const displayProject = project || { title: '프로젝트를 계획해보세요!', description: '아직 등록된 프로젝트가 없습니다.', status: 'Planned', startDate: '', endDate: '' };
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm print:border-slate-300 print:bg-white print:p-0 print:shadow-none">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <Flag size={20} className="text-blue-600" /> 나의 CAS 프로젝트 (CAS Project)
                    </h3>
                    <p className="text-xs text-blue-600 mt-1 font-medium">필수 요건: 1개월 이상 지속 + 협력 활동</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    displayProject.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 
                    displayProject.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                    {displayProject.status === 'Completed' ? '완료됨 (Completed)' : 
                     displayProject.status === 'In Progress' ? '진행 중 (In Progress)' : '계획 중 (Planned)'}
                </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-blue-100/50 shadow-sm print:border-slate-200">
                <h4 className="font-bold text-lg text-slate-800 mb-2">{displayProject.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{displayProject.description}</p>
                <div className="flex gap-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100"><Calendar size={14}/> {displayProject.startDate || '미정'} ~ {displayProject.endDate || '미정'}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100"><Users size={14}/> {displayProject.isCollaborative ? '협력 (Collaborative)' : '개인 (Individual)'}</span>
                </div>
            </div>
            <button onClick={onEdit} className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 print:hidden">
                <PenTool size={14}/> 프로젝트 수정 (Edit Project)
            </button>
        </div>
    );
};

const EditProjectModal = ({ project, onClose, onSave }) => {
    const [data, setData] = useState(project || { title: '', status: 'Planned', startDate: '', endDate: '', description: '', isCollaborative: false });
    const handleSave = (e) => { e.preventDefault(); onSave(data); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PenTool size={20} className="text-blue-600" /> 프로젝트 수정 (Edit Project)</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">프로젝트 제목 (Project Title)</label>
                        <input className="w-full p-3 border rounded-xl" value={data.title} onChange={e=>setData({...data, title:e.target.value})} required/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">상태 (Status)</label>
                        <select className="w-full p-3 border rounded-xl" value={data.status} onChange={e=>setData({...data, status:e.target.value})}>
                            <option value="Planned">계획 중 (Planned)</option><option value="In Progress">진행 중 (In Progress)</option><option value="Completed">완료됨 (Completed)</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1">시작일 (Start)</label>
                            <input type="date" className="w-full p-3 border rounded-xl" value={data.startDate} onChange={e=>setData({...data, startDate:e.target.value})} required/>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1">종료일 (End)</label>
                            <input type="date" className="w-full p-3 border rounded-xl" value={data.endDate} onChange={e=>setData({...data, endDate:e.target.value})} required/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">설명 (Description)</label>
                        <textarea className="w-full p-3 border rounded-xl min-h-[100px]" value={data.description} onChange={e=>setData({...data, description:e.target.value})} required/>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border rounded-xl">
                        <input type="checkbox" checked={data.isCollaborative} onChange={e=>setData({...data, isCollaborative:e.target.checked})}/>
                        <label className="text-sm font-bold">협력 활동 여부 (Collaborative?)</label>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl flex items-center justify-center gap-2"><Save size={18}/> 저장 (Save)</button>
                </form>
            </div>
        </div>
    );
};

const AddActivityModal = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({ title: '', types: ['Creativity'], hours: 0, startDate: '', endDate: '', reflection: '', outcomes: [] });
    const toggleType = (t) => {
        const has = data.types.includes(t);
        if(has && data.types.length===1) return;
        setData({...data, types: has ? data.types.filter(x=>x!==t) : [...data.types, t]});
    };
    const toggleOutcome = (id) => {
        setData(prev => ({ ...prev, outcomes: prev.outcomes.includes(id) ? prev.outcomes.filter(oid => oid !== id) : [...prev.outcomes, id] }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{step === 1 ? '새 활동 추가 (New Activity)' : step === 2 ? '학습 성과 (Learning Outcomes)' : '성찰 (Reflection)'}</h3>
                        <p className="text-xs text-slate-500">Step {step} of 3</p>
                    </div>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {step === 1 && (
                        <>
                            <div><label className="block text-sm font-bold mb-1">활동 제목 (Title)</label><input className="w-full p-3 border rounded-xl" value={data.title} onChange={e=>setData({...data, title:e.target.value})}/></div>
                            <div>
                                <label className="block text-sm font-bold mb-1">종류 (Type)</label>
                                <div className="flex flex-col gap-2">
                                    {['Creativity','Activity','Service'].map(t=><button key={t} onClick={()=>toggleType(t)} className={`p-2 border rounded text-sm font-bold text-left ${data.types.includes(t)?'bg-blue-100 border-blue-500 text-blue-700':'bg-slate-50 text-slate-400'}`}>{t === 'Creativity' ? '창의 (C)' : t === 'Activity' ? '활동 (A)' : '봉사 (S)'} {data.types.includes(t) && <CheckCircle size={14} className="inline ml-1"/>}</button>)}
                                </div>
                            </div>
                            <div><label className="block text-sm font-bold mb-1">시간 (Hours)</label><input type="number" className="w-full p-3 border rounded-xl" placeholder="시간" value={data.hours} onChange={e=>setData({...data, hours:e.target.value})}/></div>
                            <div className="flex gap-2">
                                <div className="flex-1"><label className="block text-sm font-bold mb-1">시작일 (Start)</label><input type="date" className="w-full p-3 border rounded-xl" value={data.startDate} onChange={e=>setData({...data, startDate:e.target.value})}/></div>
                                <div className="flex-1"><label className="block text-sm font-bold mb-1">종료일 (End)</label><input type="date" className="w-full p-3 border rounded-xl" value={data.endDate} onChange={e=>setData({...data, endDate:e.target.value})}/></div>
                            </div>
                        </>
                    )}
                    {step === 2 && (
                        <div className="space-y-2">
                            {LEARNING_OUTCOMES.map(lo => (
                                <button key={lo.id} onClick={()=>toggleOutcome(lo.id)} className={`w-full text-left p-3 border rounded-xl flex items-center gap-3 ${data.outcomes.includes(lo.id)?'bg-blue-50 border-blue-500 text-blue-800':''}`}>
                                    <span className="text-xl">{lo.icon}</span><span className="text-sm font-medium">{lo.text}</span>
                                    {data.outcomes.includes(lo.id) && <CheckCircle size={16} className="ml-auto"/>}
                                </button>
                            ))}
                        </div>
                    )}
                    {step === 3 && (
                        <>
                            <div className="bg-blue-50 p-4 rounded-xl text-sm italic text-slate-700">"가장 힘들었던 점은 무엇인가요? 마치고 나서 어떤 기분이 들었나요?"</div>
                            <textarea className="w-full p-3 border rounded-xl min-h-[150px]" placeholder="성찰 내용 (Reflection)..." value={data.reflection} onChange={e=>setData({...data, reflection:e.target.value})}/>
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <button className="p-2 border rounded hover:bg-slate-50"><Camera size={16} className="mx-auto mb-1"/>사진/영상</button>
                                <button className="p-2 border rounded hover:bg-slate-50"><Mic size={16} className="mx-auto mb-1"/>오디오</button>
                                <button className="p-2 border rounded hover:bg-slate-50"><Link size={16} className="mx-auto mb-1"/>링크</button>
                                <button className="p-2 border rounded hover:bg-slate-50"><FileText size={16} className="mx-auto mb-1"/>파일</button>
                            </div>
                        </>
                    )}
                </div>
                <div className="p-5 border-t flex gap-2">
                    {step > 1 && <button onClick={()=>setStep(s=>s-1)} className="px-6 py-3 rounded-xl font-bold bg-slate-100">이전 (Back)</button>}
                    <button onClick={()=>{if(step<3)setStep(s=>s+1); else {onSave({...data, id:Date.now()}); onClose();}}} className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2">
                        {step<3 ? <>다음 단계 (Next) <ChevronRight size={18}/></> : <>기록 완료 (Complete) <CheckCircle size={18}/></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActivityCard = ({ activity, isTeacherMode, onApprove, onFeedback }) => {
    const [open, setOpen] = useState(false);
    const [fb, setFb] = useState(activity.feedback || '');
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
            <div className="flex justify-between mb-2">
                <div className="flex gap-2 mb-2 flex-wrap">
                    {activity.types?.map(type => {
                        const colors = getTypeColor(type);
                        return <span key={type} className={`inline-block px-2 py-1 rounded text-xs font-bold border ${colors.label}`}>{type === 'Creativity' ? '창의 (C)' : type === 'Activity' ? '활동 (A)' : '봉사 (S)'}</span>
                    })}
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${activity.status==='Approved'?'bg-green-100 text-green-600 border-green-200':'bg-orange-100 text-orange-600 border-orange-200'}`}>{activity.status==='Approved'?'승인됨 (Approved)':'검토 중 (Pending)'}</span>
                </div>
            </div>
            <h3 className="font-bold text-lg mb-1">{activity.title}</h3>
            <div className="text-sm text-slate-500 mb-3 flex items-center gap-2"><Calendar size={14}/> {activity.startDate} ~ {activity.endDate} • {activity.hours}h {isTeacherMode && <span className="bg-slate-100 px-2 rounded text-xs ml-2">{activity.studentName}</span>}</div>
            <div className="bg-slate-50 p-3 rounded-xl text-sm italic mb-3 border-l-4 border-blue-200">"{activity.reflection}"</div>
            
            {/* Outcomes Display */}
            <div className="flex flex-wrap gap-2 mb-4">
                {activity.outcomes && activity.outcomes.map(ocId => {
                    const outcome = LEARNING_OUTCOMES.find(lo => lo.id === ocId);
                    return <span key={ocId} className="text-xs bg-white border px-2 py-1 rounded-full flex items-center gap-1" title={outcome?.text}>{outcome?.icon} {outcome?.text?.split('(')[0]}</span>
                })}
            </div>

            {activity.feedback && !open && <div className="bg-yellow-50 p-3 rounded-xl text-sm text-yellow-800 font-medium border border-yellow-200 mb-2">
                <span className="block text-xs font-bold mb-1">👨‍🏫 선생님 피드백 (Teacher Feedback)</span>
                {activity.feedback}
            </div>}
            
            {isTeacherMode && (
                <div className="flex gap-2 mt-3 justify-end border-t pt-3">
                    <button onClick={()=>setOpen(!open)} className="text-blue-600 text-sm font-bold flex items-center gap-1"><MessageSquarePlus size={16}/> 피드백 (Feedback)</button>
                    {activity.status==='Pending' && <button onClick={()=>onApprove(activity.id)} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1"><ThumbsUp size={14}/> 승인 (Approve)</button>}
                </div>
            )}
            {open && (
                <div className="mt-2 bg-blue-50 p-3 rounded-xl">
                    <textarea className="w-full p-2 border rounded mb-2 text-sm" placeholder="피드백 작성..." value={fb} onChange={e=>setFb(e.target.value)}/>
                    <div className="flex justify-end gap-2">
                        <button onClick={()=>setOpen(false)} className="text-slate-500 text-xs font-bold">취소</button>
                        <button onClick={()=>{onFeedback(activity.id, fb); setOpen(false);}} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">저장</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App Logic ---

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [activities, setActivities] = useState([]);
  const [project, setProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
  }, []);

  const handleLogin = async (r) => {
      if(!auth) return setLoginError("Firebase 설정이 필요합니다.");
      try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
          else await signInAnonymously(auth);
          setRole(r); setLoginError(null);
      } catch(e) { setLoginError(e.message); }
  };

  const handleLogout = async () => { if(auth) await signOut(auth); setRole(null); };

  useEffect(() => {
    if (!user || !db || !appId) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'activities'));
    const unsub1 = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setActivities(role === 'student' ? list.filter(a => a.studentId === user.uid) : list);
    });
    
    // [FIXED PATH: 6 segments]
    const projectRef = doc(db, 'artifacts', appId, 'public', 'data', 'projects', `project-${user.uid}`);
    const unsub2 = onSnapshot(projectRef, (doc) => {
        if(doc.exists()) setProject(doc.data());
    });
    return () => { unsub1(); unsub2(); };
  }, [user, role]);

  const handleAddActivity = async (newActivity) => {
      if (!user || !db) return;
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'activities'), {
          ...newActivity, studentId: user.uid, studentName: "Student", status: 'Pending', feedback: ''
      });
      setShowModal(false);
  };

  const handleApprove = async (id) => {
      if (!db) return;
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', id), { status: 'Approved' });
  };

  const handleFeedback = async (id, text) => {
      if (!db) return;
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', id), { feedback: text });
  };

  const handleSaveProject = async (updatedProject) => {
      if (!db || !user) return;
      // [FIXED PATH: 6 segments]
      const projectRef = doc(db, 'artifacts', appId, 'public', 'data', 'projects', `project-${user.uid}`);
      try {
          await setDoc(projectRef, updatedProject);
      } catch (e) {
          console.error("Project Save Error:", e);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin"/></div>;
  if (!user) return <LoginView onLogin={handleLogin} errorMsg={loginError} />;

  // Stats Logic (Simplified)
  const stats = { c: 0, a: 0, s: 0 };
  activities.forEach(act => {
      if(act.types?.includes('Creativity')) stats.c += Number(act.hours);
      if(act.types?.includes('Activity')) stats.a += Number(act.hours);
      if(act.types?.includes('Service')) stats.s += Number(act.hours);
  });
  const totalHours = activities.reduce((acc,cur) => acc + Number(cur.hours), 0);
  const achievedOutcomes = new Set(activities.flatMap(a => a.outcomes || [])).size;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="bg-white p-4 border-b sticky top-0 z-30 flex justify-between items-center shadow-sm">
          <div>
            <div className="flex items-center gap-2">
                <h1 className="font-black text-xl text-slate-800">나의 CAS 여정 (My CAS Journey)</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${role==='teacher'?'bg-yellow-100 text-yellow-700':'bg-blue-100 text-blue-700'}`}>{role === 'teacher' ? 'Teacher' : 'Student'}</span>
            </div>
            <p className="text-xs text-slate-500">{role === 'student' ? '활동을 기록하고 성장하세요.' : '학생들의 활동을 검토하세요.'}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2"><LogOut size={20}/></button>
      </div>
      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <section>
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Target size={20} className="text-blue-500"/> 진척도 (Progress)</h2>
                <div className="flex gap-2">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200"><Clock size={12}/> Total: {totalHours}h</span>
                    <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full border border-blue-200">{achievedOutcomes}/7 Outcomes Met</span>
                </div>
            </div>
            <div className="flex gap-2">
                <ProgressBar label="창의 (Creativity)" current={stats.c} colorClass="bg-purple-500 text-purple-500" icon={PenTool}/>
                <ProgressBar label="활동 (Activity)" current={stats.a} colorClass="bg-yellow-500 text-yellow-500" icon={Zap}/>
                <ProgressBar label="봉사 (Service)" current={stats.s} colorClass="bg-red-500 text-red-500" icon={Heart}/>
            </div>
        </section>
        <CASProjectSection project={project} onEdit={() => setShowProjectModal(true)} />
        <GanttChart activities={activities} project={project} />
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    {role === 'student' ? <><Smile size={20} className="text-orange-500"/> 최근 활동 (Recent Activities)</> : <><Users size={20} className="text-orange-500"/> 학생 활동 검토 (Student Logs)</>}
                </h2>
                {role==='student' && <button onClick={()=>setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-1 font-bold shadow-md hover:bg-blue-700 transition-all"><Plus size={18}/> 활동 추가 (Add)</button>}
            </div>
            {activities.length > 0 ? activities.map(a => <ActivityCard key={a.id} activity={a} isTeacherMode={role==='teacher'} onApprove={handleApprove} onFeedback={handleFeedback} />) : <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200"><p className="text-slate-400">등록된 활동이 없습니다.</p></div>}
        </section>
      </main>
      
      {/* Floating Action Button (Student) - Restored */}
      {role === 'student' && (
        <button 
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-300 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 print:hidden z-40"
          title="활동 추가"
        >
          <Plus size={28} />
        </button>
      )}

      {showModal && <AddActivityModal onClose={()=>setShowModal(false)} onSave={handleAddActivity}/>}
      {showProjectModal && <EditProjectModal project={project} onClose={()=>setShowProjectModal(false)} onSave={handleSaveProject}/>}
    </div>
  );
};

export default App;