import React, { useState, useEffect } from 'react';
import { 
  Heart, Zap, PenTool, Plus, Calendar, CheckCircle, Target, Smile, 
  Camera, X, ChevronRight, Trophy, MoreHorizontal, Printer, User, 
  Users, MessageSquare, ThumbsUp, Clock, Layout, Flag, Link, 
  FileText, Mic, Save, MessageSquarePlus, Edit3, LogOut, Loader, ShieldCheck, Lock, AlertTriangle, Filter, Info, ExternalLink, Grid, Trash2, RotateCcw, FileSpreadsheet
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
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
  deleteDoc, 
  query,
  setDoc 
} from 'firebase/firestore';

// =================================================================
// 🔴 [설정 1] Firebase 키 (본인 것으로 교체 필수!)
// [수정] import.meta 오류 방지를 위해 직접 입력 방식으로 복구했습니다.
// =================================================================
const myFirebaseConfig = {
  apiKey: "AIzaSyA0cmpCyiVuUVeBwpID0HDKKKEd7xngP7U",
  authDomain: "cas-journey-3a3c6.firebaseapp.com",
  projectId: "cas-journey-3a3c6",
  storageBucket: "cas-journey-3a3c6.firebasestorage.app",
  messagingSenderId: "510320677268",
  appId: "Y1:510320677268:web:410c69b1d6e90a7cd33f81"
};

// =================================================================
// 🔒 [설정 2] 폐쇄형 명단 관리 (Whitelist)
// =================================================================
const TEACHER_WHITELIST = [
  "teacher1@gmail.com",
  "gassak3914@gmail.com",
  "entheos210@gmail.com" // 본인 이메일 (테스트용)
];

const STUDENT_WHITELIST = [
  "student1@gmail.com",
  "gassak3914@gmail.com",
  "entheos210@gmail.com" // 본인 이메일 (테스트용)
];
// =================================================================

let auth, db, appId;

try {
  // Config 우선순위: 1. 코드 상단 직접 입력 -> 2. 미리보기 환경 변수(__firebase_config)
  const configToUse = myFirebaseConfig.apiKey !== "YOUR_API_KEY_HERE" 
    ? myFirebaseConfig 
    : (typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null);

  if (configToUse) {
    const app = initializeApp(configToUse);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = configToUse.projectId || 'cas-app';
  } else {
    console.warn("⚠️ Firebase Config가 없습니다. 코드를 확인해주세요.");
  }
} catch (e) {
  console.error("❌ Firebase 초기화 에러:", e);
}

// --- Constants ---
const LEARNING_OUTCOMES = [
  { id: 1, code: "LO1", text: "자신의 강점과 성장 분야 파악 (Identify strengths and growth)", icon: "💪" },
  { id: 2, code: "LO2", text: "도전과 기술 습득 입증 (Demonstrate challenges and skills)", icon: "🧗" },
  { id: 3, code: "LO3", text: "CAS 활동의 계획 및 개시 (Initiate and plan experience)", icon: "🗺️" },
  { id: 4, code: "LO4", text: "헌신과 인내심 입증 (Show commitment and perseverance)", icon: "🔥" },
  { id: 5, code: "LO5", text: "협동 기술 입증 (Demonstrate collaborative skills)", icon: "🤝" },
  { id: 6, code: "LO6", text: "글로벌 이슈 참여 (Engage with issues of global significance)", icon: "🌍" },
  { id: 7, code: "LO7", text: "윤리적 선택의 인식 (Recognize ethics of choices)", icon: "⚖️" },
];

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
        <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <img 
                src="/logo.png" 
                alt="School Logo" 
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://placehold.co/200x200/2563eb/ffffff?text=School"; 
                }}
                className="w-full h-full object-contain rounded-full shadow-lg shadow-blue-100 bg-white p-1"
            />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">봉황IB CAS</h1>
        <p className="text-slate-500 mb-8">학생의 성장을 기록하고 공유하는<br/>배움과 베풂이 공존하는</p>
        
        {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-2 text-left animate-pulse">
                <AlertTriangle size={18} className="shrink-0 mt-0.5"/>
                <div>{errorMsg}</div>
            </div>
        )}

        <div className="space-y-3">
          <button onClick={() => onLogin('student')} className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.449 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
            학생 로그인 (Student Login)
          </button>
          <button onClick={() => onLogin('teacher')} className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2">
            <ShieldCheck size={20} /> 교사 로그인 (Teacher Login)
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
            <p>🔒 등록된 계정만 접속 가능합니다.</p>
            <p>접속 문의: 담당 선생님</p>
        </div>
      </div>
    </div>
  );
};

const LearningOutcomesProgress = ({ achievedSet, userEmail }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Target size={18} className="text-blue-500"/> 학습 성과 달성 현황 (Learning Outcomes)
          </h3>
          <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
              <User size={12} />
              {userEmail}
          </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {LEARNING_OUTCOMES.map((lo) => {
          const isMet = achievedSet.has(lo.id);
          return (
            <div key={lo.id} className="relative flex flex-col items-center gap-1 group cursor-help">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all shadow-sm ${isMet ? 'bg-blue-500 text-white scale-110 ring-2 ring-blue-200' : 'bg-slate-100 text-slate-300 grayscale'}`}>
                {lo.icon}
              </div>
              <span className={`text-[10px] font-bold ${isMet ? 'text-blue-600' : 'text-slate-300'}`}>{lo.code}</span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 text-center leading-tight">
                {lo.text}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProgressBar = ({ label, current, colorClass, icon: Icon }) => {
  const visualTarget = 50; const percentage = Math.min((current / visualTarget) * 100, 100);
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex-1 print:border-slate-300">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100 print:bg-transparent print:p-0`}><Icon size={18} className={colorClass.replace('bg-', 'text-')} /></div>
          <span className="font-bold text-slate-700 text-sm md:text-base">{label}</span>
        </div>
        <span className="text-sm font-bold text-slate-600">{current}시간 (Hours)</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden print:bg-slate-200"><div className={`h-full ${colorClass.replace('text-', 'bg-')} print:bg-slate-600 transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div></div>
    </div>
  );
};

// [수정된 GanttChart] - 픽셀 기반 너비 고정으로 찌그러짐 해결
const GanttChart = ({ activities, project }) => {
  const [scale, setScale] = useState('monthly'); 

  const projectItem = project && project.title ? { id: 'project-main', title: `[프로젝트] ${project.title}`, startDate: project.startDate, endDate: project.endDate, types: ['Project'], isProject: true } : null;
  const allItems = [...activities]; if (projectItem) allItems.push(projectItem);
  
  if (allItems.length === 0) return (<div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400 flex flex-col items-center justify-center h-40"><Layout size={24} className="mb-2 opacity-50" /><p>아직 타임라인에 표시할 활동이 없습니다.</p></div>);

  const typeOrder = { 'Creativity': 1, 'Activity': 2, 'Service': 3, 'Project': 4 };
  const getSortOrder = (item) => Math.min(...(item.types?.map(t => typeOrder[t] || 5) || [5]));
  const sortedItems = [...allItems].sort((a, b) => getSortOrder(a) - getSortOrder(b) || new Date(a.startDate) - new Date(b.startDate));
  
  const startDates = sortedItems.map(a => new Date(a.startDate || new Date())); 
  const endDates = sortedItems.map(a => new Date(a.endDate || new Date()));
  const minDate = new Date(Math.min(...startDates)); 
  const maxDate = new Date(Math.max(...endDates));
  
  // [수정] 월간 너비 확대 (100px)
  const columnWidth = scale === 'daily' ? 30 : 100; 
  let rangeStart, rangeEnd, allColumns, getPos;

  if (scale === 'daily') {
      rangeStart = new Date(minDate); rangeStart.setDate(rangeStart.getDate() - 2);
      rangeEnd = new Date(maxDate); rangeEnd.setDate(rangeEnd.getDate() + 2);
      allColumns = []; let curr = new Date(rangeStart); let safety = 0;
      while (curr <= rangeEnd && safety < 730) { allColumns.push(new Date(curr)); curr.setDate(curr.getDate() + 1); safety++; }
      getPos = (d1, d2) => Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  } else {
      rangeStart = new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1);
      rangeEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);
      allColumns = []; let curr = new Date(rangeStart); let safety = 0;
      while (curr <= rangeEnd && safety < 60) { allColumns.push(new Date(curr)); curr.setMonth(curr.getMonth() + 1); safety++; }
      getPos = (d1, d2) => (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  }
  
  const totalColumns = allColumns.length;
  // [수정] 컨테이너 너비 고정 (스크롤 발생 유도)
  const containerWidth = totalColumns * columnWidth;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Layout size={18} className="text-blue-500"/> 활동 타임라인</h3>
        <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
                <button onClick={() => setScale('daily')} className={`px-3 py-1 rounded-md transition-colors ${scale==='daily' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>일간</button>
                <button onClick={() => setScale('monthly')} className={`px-3 py-1 rounded-md transition-colors ${scale==='monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>월간</button>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded hidden sm:inline-block">{rangeStart.toLocaleDateString()} ~ {rangeEnd.toLocaleDateString()}</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div style={{ width: `${containerWidth}px` }}> 
            <div className="grid gap-0 mb-2 border-b border-slate-100 pb-2" style={{ gridTemplateColumns: `repeat(${totalColumns}, ${columnWidth}px)` }}>
            {allColumns.map((date, i) => {
                let label = '', subLabel = '';
                if (scale === 'daily') {
                    const day = date.getDate(); const month = date.getMonth() + 1;
                    const isFirstDay = day === 1 || i === 0;
                    label = day; if (isFirstDay) subLabel = `${month}월`;
                } else {
                    const monthName = date.toLocaleString('default', { month: 'short' });
                    const year = date.getFullYear().toString().slice(2);
                    const isNewYear = date.getMonth() === 0 || i === 0;
                    label = monthName; if (isNewYear) subLabel = `'${year}`;
                }
                const isWeekend = scale === 'daily' && (date.getDay() === 0 || date.getDay() === 6);
                return (
                    <div key={i} className={`text-[10px] text-center border-l border-transparent relative h-8 flex flex-col justify-end ${isWeekend ? 'bg-slate-50' : ''}`}>
                        {subLabel && <span className="absolute top-0 left-0 pl-1 text-xs font-bold text-blue-600 whitespace-nowrap z-10">{subLabel}</span>}
                        <span className={`${subLabel ? 'font-bold text-slate-800' : 'text-slate-400'}`}>{label}</span>
                    </div>
                );
            })}
            </div>
            <div className="space-y-3 relative min-h-[100px]">
                <div className="absolute inset-0 grid gap-0 h-full pointer-events-none" style={{ gridTemplateColumns: `repeat(${totalColumns}, ${columnWidth}px)` }}>
                    {allColumns.map((date, i) => {
                         const isWeekend = scale === 'daily' && (date.getDay() === 0 || date.getDay() === 6);
                         return <div key={i} className={`border-r border-slate-50 h-full ${isWeekend ? 'bg-slate-50/50' : ''}`}></div>
                    })}
                </div>
                {sortedItems.map((item, idx) => {
                    const actStart = new Date(item.startDate); const actEnd = new Date(item.endDate); 
                    let startCol, duration;
                    if (scale === 'daily') { startCol = getPos(rangeStart, actStart) + 1; duration = Math.max(getPos(actStart, actEnd) + 1, 1); } 
                    else { startCol = getPos(rangeStart, actStart) + 1; duration = Math.max(getPos(actStart, actEnd) + 1, 1); }
                    
                    let bg = {}, bdr = '', txt = '';
                    if (item.types?.includes('Project')) { bg={background:'#2563eb'}; bdr='#1d4ed8'; txt='#fff'; }
                    else { 
                        const colors = item.types?.map(t => getTypeColor(t).bg) || ['#eee'];
                        const stops = colors.map((c, i) => `${c} ${(i/colors.length)*100}% ${((i+1)/colors.length)*100}%`);
                        bg={background: colors.length > 1 ? `linear-gradient(to bottom, ${stops.join(',')})` : colors[0]}; 
                        bdr='#94a3b8'; txt='#1e293b';
                    }
                    return (
                        <div key={item.id || idx} className="grid gap-0 relative z-10 group" style={{ gridTemplateColumns: `repeat(${totalColumns}, ${columnWidth}px)` }}>
                            <div className="h-6 rounded border flex items-center px-2 text-[10px] font-bold truncate shadow-sm transition-all hover:opacity-90 hover:h-8 hover:-mt-1 hover:z-20"
                                style={{ gridColumnStart: startCol, gridColumnEnd: `span ${duration}`, ...bg, borderColor: bdr, color: txt }} 
                                title={`${item.title} (${item.startDate} ~ ${item.endDate})`}>
                                {item.types?.includes('Project') && <Flag size={10} className="mr-1 fill-current" />}{item.title}
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

const CASProjectSection = ({ project, onEdit, isTeacherMode, onApprove, onRevoke, onFeedback }) => {
    const displayProject = project || { title: '프로젝트를 계획해보세요!', description: '아직 등록된 프로젝트가 없습니다.', status: 'Planned', startDate: '', endDate: '' };
    const [open, setOpen] = useState(false);
    const [fb, setFb] = useState('');

    useEffect(() => {
        if(project?.feedback) setFb(project.feedback);
    }, [project?.feedback]);

    const handleSaveFeedback = () => { onFeedback(fb); setOpen(false); };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm print:border-slate-300 print:bg-white print:p-0 print:shadow-none">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <Flag size={20} className="text-blue-600" /> 나의 CAS 프로젝트 (CAS Project)
                    </h3>
                    <p className="text-xs text-blue-600 mt-1 font-medium">필수 요건: 1개월 이상 지속 + 협력 활동</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${displayProject.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : displayProject.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {displayProject.status === 'Completed' ? '완료됨' : displayProject.status === 'In Progress' ? '진행 중' : '계획 중'}
                    </div>
                    {/* 프로젝트 승인 상태 표시 */}
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${displayProject.approvalStatus==='Approved'?'bg-green-100 text-green-600 border-green-200':'bg-orange-100 text-orange-600 border-orange-200'}`}>
                        {displayProject.approvalStatus==='Approved'?'승인됨 (Approved)':'검토 중 (Pending)'}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-blue-100/50 shadow-sm print:border-slate-200 mb-4">
                <h4 className="font-bold text-lg text-slate-800 mb-2">{displayProject.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{displayProject.description}</p>
                <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100"><Calendar size={14} /> {displayProject.startDate || '미정'} ~ {displayProject.endDate || '미정'}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100"><Users size={14} /> {displayProject.isCollaborative ? '협력 활동' : '개인 활동'}</span>
                </div>
            </div>

            {/* Project Feedback Display */}
            {displayProject.feedback && !open && <div className="bg-yellow-50 p-3 rounded-xl text-sm text-yellow-800 font-medium border border-yellow-200 mb-2"><span className="block text-xs font-bold mb-1">👨‍🏫 선생님 피드백 (Teacher Feedback)</span>{displayProject.feedback}</div>}

            {/* Controls */}
            <div className="flex justify-end gap-2 print:hidden">
                {!isTeacherMode && (
                    <button onClick={onEdit} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <PenTool size={14} /> 프로젝트 수정
                    </button>
                )}
                {isTeacherMode && (
                    <div className="flex gap-2">
                        <button onClick={()=>setOpen(!open)} className="text-blue-600 text-sm font-bold flex items-center gap-1"><MessageSquarePlus size={16}/> 피드백</button>
                        {displayProject.approvalStatus !== 'Approved' ? (
                            <button onClick={onApprove} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-green-600 transition-colors"><ThumbsUp size={14}/> 승인</button>
                        ) : (
                            <button onClick={onRevoke} className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-orange-600 transition-colors"><RotateCcw size={14}/> 승인 취소</button>
                        )}
                    </div>
                )}
            </div>

            {/* Feedback Input (Teacher Only) */}
            {open && isTeacherMode && (
                <div className="mt-2 bg-blue-50 p-3 rounded-xl">
                    <textarea className="w-full p-2 border rounded mb-2 text-sm h-20" placeholder="프로젝트 피드백을 입력하세요..." value={fb} onChange={e=>setFb(e.target.value)}/>
                    <div className="flex justify-end gap-2">
                        <button onClick={()=>setOpen(false)} className="text-slate-500 text-xs font-bold">취소</button>
                        <button onClick={handleSaveFeedback} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">저장</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const EditProjectModal = ({ project, onClose, onSave }) => {
    const [data, setData] = useState(project || { title: '', status: 'Planned', startDate: '', endDate: '', description: '', isCollaborative: false });
    const [error, setError] = useState(null);
    const handleSave = (e) => { 
        e.preventDefault(); 
        if(data.status === 'Completed') {
            const start = new Date(data.startDate); const end = new Date(data.endDate);
            const diffTime = Math.abs(end - start); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (diffDays < 30) { setError("프로젝트 기간이 최소 1개월 이상이어야 '완료'할 수 있습니다."); return; }
        }
        onSave(data); onClose(); 
    };
    return (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden"><div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"><div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PenTool size={20} className="text-blue-600" /> 프로젝트 수정 (Edit Project)</h3><button onClick={onClose}><X size={20} /></button></div><form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm flex items-center gap-2"><AlertTriangle size={16}/> {error}</div>}
        <div><label className="block text-sm font-bold text-slate-700 mb-1">프로젝트 제목 (Project Title)</label><input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={data.title} onChange={e => setData({...data, title: e.target.value})} required/></div><div><label className="block text-sm font-bold text-slate-700 mb-1">상태 (Status)</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={data.status} onChange={e => setData({...data, status: e.target.value})}><option value="Planned">계획 중 (Planned)</option><option value="In Progress">진행 중 (In Progress)</option><option value="Completed">완료됨 (Completed)</option></select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">시작일 (Start Date)</label><input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={data.startDate} onChange={e => setData({...data, startDate: e.target.value})} required/></div><div><label className="block text-sm font-bold text-slate-700 mb-1">종료일 (End Date)</label><input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={data.endDate} onChange={e => setData({...data, endDate: e.target.value})} required/></div></div><div><label className="block text-sm font-bold text-slate-700 mb-1">설명 (Description)</label><textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[120px]" value={data.description} onChange={e => setData({...data, description: e.target.value})} required></textarea></div><div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"><input type="checkbox" checked={data.isCollaborative} onChange={e => setData({...data, isCollaborative: e.target.checked})}/><label className="text-sm font-bold">협력 활동 여부 (Collaborative?)</label></div><button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2 mt-2"><Save size={18} /> 저장 (Save Changes)</button></form></div></div>);
};

const AddActivityModal = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({ title: '', types: ['Creativity'], hours: 0, startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reflection: '', outcomes: [], attachments: [] });
    const toggleType = (t) => { const has = data.types.includes(t); if(has && data.types.length===1) return; setData({...data, types: has ? data.types.filter(x=>x!==t) : [...data.types, t]}); };
    const toggleOutcome = (id) => { setData(prev => ({ ...prev, outcomes: prev.outcomes.includes(id) ? prev.outcomes.filter(oid => oid !== id) : [...prev.outcomes, id] })); };
    const addEvidence = (type) => { const promptText = type === 'Link' ? "웹사이트 주소(URL)를 입력하세요:" : "구글 드라이브 공유 링크(URL)를 입력하세요:"; const val = prompt(promptText); if(val) setData(prev => ({...prev, attachments: [...prev.attachments, { type, val }] })); };
    const handleSave = () => { if(!data.title || !data.hours) return; onSave({ ...data, createdAt: Date.now(), hours: Number(data.hours) }); onClose(); };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50"><div><h3 className="text-xl font-bold text-slate-800">{step === 1 ? '새 활동 추가 (New Activity)' : step === 2 ? '학습 성과 (Learning Outcomes)' : '성찰 (Reflection)'}</h3><p className="text-xs text-slate-500">Step {step} of 3</p></div><button onClick={onClose}><X size={20}/></button></div>
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {step === 1 && (<><div><label className="block text-sm font-bold mb-1">활동 제목 (Title)</label><input className="w-full p-3 border rounded-xl" value={data.title} onChange={e=>setData({...data, title:e.target.value})}/></div><div><label className="block text-sm font-bold mb-1">종류 (Type)</label><div className="flex flex-col gap-2">{['Creativity','Activity','Service'].map(t=><button key={t} onClick={()=>toggleType(t)} className={`p-2 border rounded text-sm font-bold text-left ${data.types.includes(t)?'bg-blue-100 border-blue-500 text-blue-700':'bg-slate-50 text-slate-400'}`}>{t} {data.types.includes(t) && <CheckCircle size={14} className="inline ml-1"/>}</button>)}</div></div><div><label className="block text-sm font-bold mb-1">시간 (Hours)</label><input type="number" className="w-full p-3 border rounded-xl" placeholder="시간" value={data.hours} onChange={e=>setData({...data, hours:e.target.value})}/></div><div className="flex gap-2"><div className="flex-1"><label className="block text-sm font-bold mb-1">시작일 (Start)</label><input type="date" className="w-full p-3 border rounded-xl" value={data.startDate} onChange={e=>setData({...data, startDate:e.target.value})}/></div><div className="flex-1"><label className="block text-sm font-bold mb-1">종료일 (End)</label><input type="date" className="w-full p-3 border rounded-xl" value={data.endDate} onChange={e=>setData({...data, endDate:e.target.value})}/></div></div></>)}
                    {step === 2 && (<div className="space-y-2">{LEARNING_OUTCOMES.map(lo => (<button key={lo.id} onClick={()=>toggleOutcome(lo.id)} className={`w-full text-left p-3 border rounded-xl flex items-center gap-3 ${data.outcomes.includes(lo.id)?'bg-blue-50 border-blue-500 text-blue-800':''}`}><span className="text-xl">{lo.icon}</span><span className="text-sm font-medium">{lo.text}</span>{data.outcomes.includes(lo.id) && <CheckCircle size={16} className="ml-auto"/>}</button>))}</div>)}
                    {step === 3 && (<><div className="bg-blue-50 p-4 rounded-xl space-y-2"><p className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1"><Info size={12}/> 성찰 가이드 (Reflection Guide)</p><div className="text-xs text-slate-700 space-y-1"><p><strong>1. Why:</strong> 왜 이 활동을 시작했나요? 동기와 목표는?</p><p><strong>2. What & Obstacles:</strong> 어떤 어려움이 있었고 어떻게 극복했나요?</p><p><strong>3. So What:</strong> 이 경험을 통해 무엇을 배웠고 어떤 의미가 있나요?</p><p><strong>4. Now What:</strong> 이 배움을 앞으로 어떻게 적용할까요?</p></div></div><textarea className="w-full p-3 border rounded-xl min-h-[200px] text-sm" placeholder="가이드를 참고하여 성찰 내용을 작성해주세요..." value={data.reflection} onChange={e=>setData({...data, reflection:e.target.value})}/><div><span className="block text-sm font-bold text-slate-700 mb-2">증빙 자료 추가 (Add Evidence)</span><div className="text-xs text-slate-500 mb-2 bg-slate-100 p-2 rounded">💡 팁: 사진, 영상, 파일은 <strong>구글 드라이브</strong>에 업로드 후 '링크 복사'하여 입력해주세요.</div><div className="grid grid-cols-4 gap-2 text-center text-xs mb-2"><button onClick={() => addEvidence('Media')} className="p-2 border rounded hover:bg-slate-50"><Camera size={16} className="mx-auto mb-1"/>사진/영상</button><button onClick={() => addEvidence('Audio')} className="p-2 border rounded hover:bg-slate-50"><Mic size={16} className="mx-auto mb-1"/>오디오</button><button onClick={() => addEvidence('Link')} className="p-2 border rounded hover:bg-slate-50"><Link size={16} className="mx-auto mb-1"/>링크</button><button onClick={() => addEvidence('File')} className="p-2 border rounded hover:bg-slate-50"><FileText size={16} className="mx-auto mb-1"/>파일</button></div><div className="space-y-1">{data.attachments?.map((att, i) => (<div key={i} className="text-xs bg-slate-100 p-2 rounded flex items-center gap-2"><span className="font-bold text-blue-600">[{att.type}]</span> <span className="truncate flex-1">{att.val}</span></div>))}</div></div></>)}
                </div>
                <div className="p-5 border-t flex gap-2">
                    {step > 1 && <button onClick={()=>setStep(s=>s-1)} className="px-6 py-3 rounded-xl font-bold bg-slate-100">이전 (Back)</button>}
                    <button onClick={()=>{if(step<3)setStep(s=>s+1); else handleSave();}} className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2">
                        {step<3 ? <>다음 단계 <ChevronRight size={18}/></> : <>기록 완료 <CheckCircle size={18}/></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActivityCard = ({ activity, isTeacherMode, onApprove, onRevoke, onFeedback, onDelete }) => {
    const [open, setOpen] = useState(false);
    const [fb, setFb] = useState('');

    useEffect(() => {
        if(activity.feedback) setFb(activity.feedback);
    }, [activity.feedback]);

    const handleSaveFeedback = () => { 
        onFeedback(activity.id, fb); 
        setOpen(false); 
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
            <div className="flex justify-between mb-2">
                <div className="flex gap-2 mb-2 flex-wrap">
                    {activity.types?.map(type => { const colors = getTypeColor(type); return <span key={type} className={`inline-block px-2 py-1 rounded text-xs font-bold border ${colors.label}`}>{type === 'Creativity' ? '창의 (C)' : type === 'Activity' ? '활동 (A)' : '봉사 (S)'}</span> })}
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${activity.status==='Approved'?'bg-green-100 text-green-600 border-green-200':'bg-orange-100 text-orange-600 border-orange-200'}`}>{activity.status==='Approved'?'승인됨 (Approved)':'검토 중 (Pending)'}</span>
                </div>
                <button onClick={() => onDelete(activity.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 self-start" title="활동 삭제"><Trash2 size={16} /></button>
            </div>
            <h3 className="font-bold text-lg mb-1">{activity.title}</h3>
            <div className="text-sm text-slate-500 mb-3 flex items-center gap-2"><Calendar size={14}/> {activity.startDate} ~ {activity.endDate} • {activity.hours}h {isTeacherMode && <span className="bg-slate-100 px-2 rounded text-xs ml-2">{activity.studentName}</span>}</div>
            <div className="bg-slate-50 p-3 rounded-xl text-sm italic mb-3 border-l-4 border-blue-200">"{activity.reflection}"</div>
            <div className="flex flex-wrap gap-2 mb-4">{activity.outcomes && activity.outcomes.map(ocId => { const outcome = LEARNING_OUTCOMES.find(lo => lo.id === ocId); return <span key={ocId} className="text-xs bg-white border px-2 py-1 rounded-full flex items-center gap-1" title={outcome?.text}>{outcome?.icon} {outcome?.code}</span> })}</div>
            
            {/* Evidence Display */}
            {activity.attachments && activity.attachments.length > 0 && (
                <div className="mb-4 space-y-1">
                    <span className="text-xs font-bold text-slate-400">첨부 자료:</span>
                    {activity.attachments.map((att, i) => (
                        <div key={i} className="text-xs bg-slate-50 border p-2 rounded flex items-center gap-2">
                            <span className="font-bold text-slate-600">[{att.type}]</span> 
                            <a href={att.val.startsWith('http') ? att.val : '#'} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate flex-1 flex items-center gap-1">
                                {att.val} <ExternalLink size={10}/>
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {activity.feedback && !open && <div className="bg-yellow-50 p-3 rounded-xl text-sm text-yellow-800 font-medium border border-yellow-200 mb-2"><span className="block text-xs font-bold mb-1">👨‍🏫 선생님 피드백 (Teacher Feedback)</span>{activity.feedback}</div>}
            
            {isTeacherMode && (
                <div className="flex gap-2 mt-3 justify-end border-t pt-3">
                    <button onClick={()=>setOpen(!open)} className="text-blue-600 text-sm font-bold flex items-center gap-1"><MessageSquarePlus size={16}/> 피드백</button>
                    {activity.status === 'Pending' ? (
                        <button onClick={()=>onApprove(activity.id)} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-green-600 transition-colors"><ThumbsUp size={14}/> 승인</button>
                    ) : (
                        <button onClick={()=>onRevoke(activity.id)} className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-orange-600 transition-colors"><RotateCcw size={14}/> 승인 취소</button>
                    )}
                </div>
            )}
            {open && (
                <div className="mt-2 bg-blue-50 p-3 rounded-xl">
                    <div className="text-xs text-blue-800 mb-2 p-2 bg-blue-100 rounded opacity-70">
                        💡 <strong>피드백 팁:</strong> 1. 칭찬 2. 질문 3. 제안
                    </div>
                    <textarea className="w-full p-2 border rounded mb-2 text-sm h-20" placeholder="학생에게 줄 피드백을 입력하세요..." value={fb} onChange={e=>setFb(e.target.value)}/>
                    <div className="flex justify-end gap-2">
                        <button onClick={()=>setOpen(false)} className="text-slate-500 text-xs font-bold">취소</button>
                        <button onClick={handleSaveFeedback} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">저장</button>
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
  const [selectedStudent, setSelectedStudent] = useState('all');

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
  }, []);

  const handleLogin = async (r) => {
      if(!auth) return setLoginError("Firebase 설정이 필요합니다.");
      try {
          const provider = new GoogleAuthProvider();
          const res = await signInWithPopup(auth, provider);
          if(r==='teacher' && !TEACHER_WHITELIST.includes(res.user.email)) { await signOut(auth); return setLoginError("교사 명단에 없습니다."); }
          if(r==='student' && !STUDENT_WHITELIST.includes(res.user.email)) { await signOut(auth); return setLoginError("학생 명단에 없습니다."); }
          setRole(r); setLoginError(null);
      } catch(e) { setLoginError(e.message); }
  };

  const handleLogout = async () => { if(auth) await signOut(auth); setRole(null); setSelectedStudent('all'); };

  useEffect(() => {
    if (!user || !db || !appId) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'activities'));
    const unsub1 = onSnapshot(q, (s) => setActivities(s.docs.map(d => ({ ...d.data(), id: d.id }))));
    const unsub2 = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'projects', `project-${user.uid}`), (d) => { if(d.exists()) setProject(d.data()); });
    return () => { unsub1(); unsub2(); };
  }, [user, role]);

  const handleAddActivity = async (newActivity) => {
      if (!user || !db) return;
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'activities'), {
          ...newActivity, studentId: user.uid, studentName: user.displayName || "Student", status: 'Pending', feedback: ''
      });
      setShowModal(false);
  };

  const handleApprove = async (id) => {
      if (!db) return;
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', String(id)), { status: 'Approved' });
      } catch(e) { alert("승인 중 오류 발생: " + e.message); }
  };

  const handleRevoke = async (id) => {
      if (!db) return;
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', String(id)), { status: 'Pending' });
      } catch(e) { alert("승인 취소 중 오류 발생: " + e.message); }
  };

  const handleFeedback = async (id, text) => {
      if (!db) return;
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', String(id)), { feedback: text });
      } catch(e) { alert("피드백 저장 실패: " + e.message); }
  };

  const handleDeleteActivity = async (id) => {
      if (!db || !user) return;
      if (window.confirm("정말로 이 활동을 삭제하시겠습니까? 복구할 수 없습니다.")) {
          try {
              await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', id));
          } catch (e) {
              alert("삭제 실패: " + e.message);
          }
      }
  };

  const handleSaveProject = async (updatedProject) => {
      if (!db || !user) return;
      try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', `project-${user.uid}`), updatedProject); } 
      catch (e) { console.error("Error:", e); }
  };

  // --- CSV Export Logic ---
  const handleExportCSV = () => {
      const myActivities = role === 'student' 
          ? activities.filter(a => a.studentId === user.uid)
          : (selectedStudent === 'all' ? activities : activities.filter(a => a.studentId === selectedStudent));

      if (myActivities.length === 0) { alert("내보낼 활동이 없습니다."); return; }

      const headers = ['활동 제목', '종류', '시간', '시작일', '종료일', '상태', '성찰', '피드백'];
      const rows = myActivities.map(act => [
          act.title,
          act.types ? act.types.join(' & ') : '',
          act.hours,
          act.startDate,
          act.endDate,
          act.status,
          `"${(act.reflection || '').replace(/"/g, '""')}"`,
          `"${(act.feedback || '').replace(/"/g, '""')}"`
      ]);

      const BOM = '\uFEFF'; // Korean support
      const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `CAS_Activities_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // [수정] Teacher Project Handlers (Missing in previous version context)
  const handleProjectApprove = async () => {
      if (!db || !selectedStudent) return;
      const projectRef = doc(db, 'artifacts', appId, 'public', 'data', 'projects', `project-${selectedStudent}`);
      try { await updateDoc(projectRef, { approvalStatus: 'Approved' }); } catch(e) { alert("Error approving project: " + e.message); }
  };

  const handleProjectRevoke = async () => {
      if (!db || !selectedStudent) return;
      const projectRef = doc(db, 'artifacts', appId, 'public', 'data', 'projects', `project-${selectedStudent}`);
      try { await updateDoc(projectRef, { approvalStatus: 'Pending' }); } catch(e) { alert("Error revoking project: " + e.message); }
  };

  const handleProjectFeedback = async (text) => {
       if (!db || !selectedStudent) return;
       const projectRef = doc(db, 'artifacts', appId, 'public', 'data', 'projects', `project-${selectedStudent}`);
       try { await updateDoc(projectRef, { feedback: text }); } catch(e) { alert("Error saving feedback: " + e.message); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin"/></div>;
  if (!user) return <LoginView onLogin={handleLogin} errorMsg={loginError} />;

  const myActivities = role === 'student' 
      ? activities.filter(a => a.studentId === user.uid)
      : (selectedStudent ? activities.filter(a => a.studentId === selectedStudent) : []);

  const studentList = role === 'teacher' ? Array.from(new Map(activities.map(a => [a.studentId, a.studentName])).entries()).map(([id, name]) => ({id, name})) : [];
  const achievedOutcomes = new Set(myActivities.flatMap(a => a.outcomes || [])).size;
  const achievedSet = new Set(myActivities.flatMap(a => a.outcomes || []));
  
  const stats = { c: 0, a: 0, s: 0 };
  myActivities.forEach(act => {
      if(act.types?.includes('Creativity')) stats.c += Number(act.hours);
      if(act.types?.includes('Activity')) stats.a += Number(act.hours);
      if(act.types?.includes('Service')) stats.s += Number(act.hours);
  });
  const totalHours = myActivities.reduce((acc,cur) => Number(acc) + Number(cur.hours), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="bg-white p-4 border-b sticky top-0 z-30 flex justify-between items-center shadow-sm">
          <div>
            <div className="flex items-center gap-2"><h1 className="font-black text-xl text-slate-800">나의 CAS 여정</h1><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${role==='teacher'?'bg-yellow-100 text-yellow-700':'bg-blue-100 text-blue-700'}`}>{role === 'teacher' ? 'Teacher' : 'Student'}</span></div>
            <p className="text-xs text-slate-500">{role === 'student' ? '활동을 기록하고 성장하세요.' : '학생들의 활동을 검토하세요.'}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleExportCSV} className="text-slate-400 hover:text-green-600 p-2 print:hidden" title="엑셀로 내보내기"><FileSpreadsheet size={20}/></button>
            <button onClick={() => window.print()} className="text-slate-400 hover:text-blue-600 p-2 print:hidden" title="출력"><Printer size={20}/></button>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2 print:hidden" title="로그아웃"><LogOut size={20}/></button>
          </div>
      </div>
      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {role === 'teacher' && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700"><Filter size={16} /> 학생별 모아보기</div>
                <div className="relative">
                    <select 
                        className="w-full p-3 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                        value={selectedStudent || ''}
                        onChange={(e) => setSelectedStudent(e.target.value || null)}
                    >
                        <option value="" disabled>학생을 선택해주세요 (Select Student)</option>
                        {studentList.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                </div>
            </div>
        )}
        
        {role === 'teacher' && !selectedStudent ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">학생을 선택해주세요</h3>
                <p className="text-sm text-slate-400">상단 드롭다운에서 학생을 선택하면<br/>활동 내역과 프로젝트를 볼 수 있습니다.</p>
            </div>
        ) : (
            <>
                <LearningOutcomesProgress achievedSet={achievedSet} userEmail={role === 'student' ? user.email : (studentList.find(s => s.id === selectedStudent)?.name || 'Student')} />

                <section>
                    <div className="flex items-center justify-between mb-2"><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Target size={20} className="text-blue-500"/> 진척도 (Progress)</h2><span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200"><Clock size={12}/> Total: {totalHours}h</span></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <ProgressBar label="창의 (Creativity)" current={stats.c} colorClass="bg-purple-500 text-purple-500" icon={PenTool}/>
                        <ProgressBar label="활동 (Activity)" current={stats.a} colorClass="bg-yellow-500 text-yellow-500" icon={Zap}/>
                        <ProgressBar label="봉사 (Service)" current={stats.s} colorClass="bg-red-500 text-red-500" icon={Heart}/>
                    </div>
                </section>
                
                <CASProjectSection 
                    project={project} 
                    onEdit={() => setShowProjectModal(true)} 
                    isTeacherMode={role === 'teacher'}
                    onApprove={handleProjectApprove}
                    onRevoke={handleProjectRevoke}
                    onFeedback={handleProjectFeedback}
                />
                
                <GanttChart activities={myActivities} project={project} />
                
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">{role === 'student' ? <><Smile size={20} className="text-orange-500"/> 최근 활동</> : <><Users size={20} className="text-orange-500"/> {selectedStudent ? '학생 활동 기록' : '전체 활동'}</>}</h2>
                        {role==='student' && <button onClick={()=>setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-1 font-bold shadow-md hover:bg-blue-700 transition-all"><Plus size={18}/> 활동 추가</button>}
                    </div>
                    {myActivities.length > 0 ? myActivities.map(a => <ActivityCard key={a.id} activity={a} isTeacherMode={role==='teacher'} onApprove={handleApprove} onRevoke={handleRevoke} onFeedback={handleFeedback} onDelete={handleDeleteActivity} />) : <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200"><p className="text-slate-400">표시할 활동이 없습니다.</p></div>}
                </section>
            </>
        )}
      </main>
      
      {role === 'student' && <button onClick={() => setShowModal(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-300 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 print:hidden z-40" title="활동 추가"><Plus size={28} /></button>}
      {showModal && <AddActivityModal onClose={()=>setShowModal(false)} onSave={handleAddActivity}/>}
      {showProjectModal && <EditProjectModal project={project} onClose={()=>setShowProjectModal(false)} onSave={handleSaveProject}/>}
    </div>
  );
};

export default App;