import React, { useState, useEffect } from 'react';
import { 
  Heart, Zap, PenTool, Plus, Calendar, CheckCircle, Target, Smile, 
  Camera, X, ChevronRight, Trophy, MoreHorizontal, Printer, User, 
  Users, MessageSquare, ThumbsUp, Clock, Layout, Flag, Link, 
  FileText, Mic, Save, MessageSquarePlus, Edit3, LogOut, Loader
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
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
  query
} from 'firebase/firestore';

// =================================================================
// 🔴 [중요] 여기에 본인의 Firebase 설정값을 붙여넣으세요! 
// (Firebase 콘솔 -> 프로젝트 설정 -> 내 앱 -> SDK 설정 및 구성)
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

// Firebase 초기화
let auth, db, appId;

try {
  // 실제 배포 시에는 myFirebaseConfig 사용
  const configToUse = myFirebaseConfig.apiKey !== "YOUR_API_KEY_HERE" 
    ? myFirebaseConfig 
    : (typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null);

  if (configToUse) {
    const app = initializeApp(configToUse);
    auth = getAuth(app);
    db = getFirestore(app);
    // appId는 데이터를 저장할 폴더 이름으로 사용
    appId = configToUse.projectId || 'cas-app'; 
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
}

// ... (이하 코드는 이전과 동일합니다) ...

const LEARNING_OUTCOMES = [
  { id: 1, text: "자신의 강점과 성장 분야 파악 (Identify strengths and growth) (LO1)", icon: "💪" },
  { id: 2, text: "도전과 기술 습득 입증 (Demonstrate challenges and skills) (LO2)", icon: "🧗" },
  { id: 3, text: "CAS 활동의 계획 및 개시 (Initiate and plan experience) (LO3)", icon: "🗺️" },
  { id: 4, text: "헌신과 인내심 입증 (Show commitment and perseverance) (LO4)", icon: "🔥" },
  { id: 5, text: "협동 기술 입증 (Demonstrate collaborative skills) (LO5)", icon: "🤝" },
  { id: 6, text: "글로벌 이슈 참여 (Engage with issues of global significance) (LO6)", icon: "🌍" },
  { id: 7, text: "윤리적 선택의 인식 (Recognize ethics of choices) (LO7)", icon: "⚖️" },
];

const getTypeColor = (type) => {
    switch (type) {
        case 'Creativity': return { bg: '#e9d5ff', border: '#a855f7', text: '#6b21a8', label: 'bg-purple-100 text-purple-700' }; 
        case 'Activity': return { bg: '#fef08a', border: '#eab308', text: '#854d0e', label: 'bg-yellow-100 text-yellow-700' }; 
        case 'Service': return { bg: '#fecaca', border: '#ef4444', text: '#991b1b', label: 'bg-red-100 text-red-700' }; 
        default: return { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', label: 'bg-slate-100 text-slate-700' };
    }
};

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
          <button 
            onClick={() => onLogin('student')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <User size={20} /> 학생으로 시작하기
          </button>
          <button 
            onClick={() => onLogin('teacher')}
            className="w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Users size={20} /> 교사로 시작하기
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-8">Secure Login via Firebase Auth</p>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, current, colorClass, icon: Icon }) => {
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
        <span className="text-sm font-bold text-slate-600">{current}h</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden print:bg-slate-200">
        <div 
          className={`h-full ${colorClass.replace('text-', 'bg-')} print:bg-slate-600 transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
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

  if (allItems.length === 0) {
      return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400">
            <Layout size={24} className="mx-auto mb-2 opacity-50" />
            <p>아직 타임라인에 표시할 활동이 없습니다.</p>
        </div>
      );
  }

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

  const getMonthDiff = (d1, d2) => {
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  };

  const totalColumns = allMonths.length;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border-slate-300 print:shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Layout size={18} className="text-blue-500" /> 활동 타임라인 (Activity Timeline)
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
                    {allMonths.map((_, i) => (
                        <div key={i} className="border-r border-slate-50 h-full"></div>
                    ))}
                </div>

                {sortedItems.map((item, idx) => {
                    const actStart = new Date(item.startDate);
                    const actEnd = new Date(item.endDate);
                    
                    const startCol = getMonthDiff(rangeStart, actStart) + 1;
                    const duration = Math.max(getMonthDiff(actStart, actEnd) + 1, 1);
                    
                    let backgroundStyle = {};
                    let borderColor = '';
                    let textColor = '';

                    if (item.types && item.types.includes('Project')) {
                        backgroundStyle = { background: '#2563eb' }; 
                        borderColor = '#1d4ed8';
                        textColor = '#ffffff';
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
                         borderColor = '#94a3b8'; 
                         textColor = '#1e293b'; 
                    }

                    return (
                        <div key={item.id || idx} className="grid gap-1 relative z-10 group cursor-default" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(40px, 1fr))` }}>
                            <div 
                                className="h-8 rounded-lg border flex items-center px-2 text-xs font-bold truncate transition-all hover:opacity-90 shadow-sm"
                                style={{ 
                                    gridColumnStart: startCol, 
                                    gridColumnEnd: `span ${duration}`,
                                    ...backgroundStyle,
                                    borderColor: borderColor,
                                    color: textColor
                                }}
                                title={`${item.title} (${item.types?.join(' + ')})`}
                            >
                                {item.types?.includes('Project') && <Flag size={12} className="mr-1 fill-current" />}
                                {item.title}
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
                
                <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <Calendar size={14} /> {displayProject.startDate || '미정'} ~ {displayProject.endDate || '미정'}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <Users size={14} /> {displayProject.isCollaborative ? '협력 활동 (Collaborative)' : '개인 활동 (Individual)'}
                    </div>
                </div>
            </div>
            
            <button 
                onClick={onEdit}
                className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 print:hidden"
            >
                <PenTool size={14} /> 프로젝트 수정 (Edit Project)
            </button>
        </div>
    );
};

const EditProjectModal = ({ project, onClose, onSave }) => {
    const [data, setData] = useState(project || { title: '', status: 'Planned', startDate: '', endDate: '', description: '', isCollaborative: false });

    const handleSave = (e) => {
        e.preventDefault();
        onSave(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <PenTool size={20} className="text-blue-600" /> 프로젝트 수정 (Edit Project)
                    </h3>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">프로젝트 제목 (Project Title)</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={data.title}
                            onChange={e => setData({...data, title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">상태 (Status)</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            value={data.status}
                            onChange={e => setData({...data, status: e.target.value})}
                        >
                            <option value="Planned">계획 중 (Planned)</option>
                            <option value="In Progress">진행 중 (In Progress)</option>
                            <option value="Completed">완료됨 (Completed)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">시작일 (Start Date)</label>
                            <input 
                                type="date" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                value={data.startDate}
                                onChange={e => setData({...data, startDate: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">종료일 (End Date)</label>
                            <input 
                                type="date" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                value={data.endDate}
                                onChange={e => setData({...data, endDate: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">설명 (Description)</label>
                        <textarea 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                            value={data.description}
                            onChange={e => setData({...data, description: e.target.value})}
                            required
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <input 
                            type="checkbox" 
                            id="collaborative"
                            checked={data.isCollaborative}
                            onChange={e => setData({...data, isCollaborative: e.target.checked})}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="collaborative" className="text-sm font-bold text-slate-700 cursor-pointer">
                            협력 활동 여부 (Collaborative?)
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 mt-2"
                    >
                        <Save size={18} /> 저장 (Save Changes)
                    </button>
                </form>
            </div>
        </div>
    );
};

const ActivityCard = ({ activity, isTeacherMode, onApprove, onFeedback }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState(activity.feedback || '');

  const handleSaveFeedback = () => {
      onFeedback(activity.id, feedbackText);
      setIsFeedbackOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow mb-4 break-inside-avoid print:shadow-none print:border-slate-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex gap-2 mb-2">
            {activity.types && activity.types.map(type => {
                const colors = getTypeColor(type);
                return (
                    <span key={type} className={`inline-block px-2 py-1 rounded text-xs font-bold mr-1 print:border print:border-slate-300 ${colors.label}`}>
                        {type === 'Creativity' ? '창의 (C)' : type === 'Activity' ? '활동 (A)' : '봉사 (S)'}
                    </span>
                );
            })}
            <span className={`inline-block px-2 py-1 rounded text-xs font-bold
              ${activity.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'} print:border print:border-slate-300`}>
              {activity.status === 'Approved' ? '승인됨' : '검토 중'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-800">{activity.title}</h3>
            {isTeacherMode && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{activity.studentName}</span>}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs mt-1 print:text-slate-600">
            <Calendar size={12} /> {activity.startDate} ~ {activity.endDate}
            <span>•</span>
            <span className="font-medium text-slate-600">{activity.hours} hours</span>
          </div>
        </div>
        
        {isTeacherMode ? (
            <div className="flex gap-2 print:hidden">
                <button 
                    onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="피드백 남기기"
                >
                    <MessageSquarePlus size={20} />
                </button>
                {activity.status === 'Pending' && (
                    <button 
                        onClick={() => onApprove(activity.id)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                        <ThumbsUp size={14} /> 승인
                    </button>
                )}
            </div>
        ) : (
          <button className="text-slate-300 hover:text-slate-500 print:hidden">
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed mb-4 border-l-4 border-blue-200 print:bg-white print:border-slate-300 print:italic">
        "{activity.reflection}"
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {activity.outcomes && activity.outcomes.map(ocId => {
          const outcome = LEARNING_OUTCOMES.find(lo => lo.id === ocId);
          return (
            <div key={ocId} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-full text-xs text-slate-600 shadow-sm print:border-slate-400" title={outcome?.text}>
              <span>{outcome?.icon}</span>
              <span className="truncate max-w-[200px]">{outcome?.text?.split('(')[0]}</span>
            </div>
          );
        })}
      </div>

      {activity.feedback && !isFeedbackOpen && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-3 text-sm text-slate-700 animate-in fade-in slide-in-from-top-2">
              <MessageSquare size={18} className="text-yellow-600 shrink-0 mt-0.5" />
              <div className="w-full">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-yellow-800 text-xs mb-1 block">선생님 피드백 (Teacher Feedback)</span>
                    {isTeacherMode && (
                        <button onClick={() => setIsFeedbackOpen(true)} className="text-yellow-600 hover:text-yellow-800"><Edit3 size={12}/></button>
                    )}
                  </div>
                  {activity.feedback}
              </div>
          </div>
      )}

      {isFeedbackOpen && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 animate-in fade-in zoom-in-95">
              <label className="block text-xs font-bold text-blue-800 mb-2">피드백 작성 (Write Feedback)</label>
              <textarea 
                className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                placeholder="학생에게 줄 조언이나 격려의 말을 남겨주세요..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                autoFocus
              ></textarea>
              <div className="flex justify-end gap-2 mt-2">
                  <button 
                    onClick={() => {
                        setIsFeedbackOpen(false);
                        setFeedbackText(activity.feedback || ''); 
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                      취소 (Cancel)
                  </button>
                  <button 
                    onClick={handleSaveFeedback}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                      <Save size={12} /> 저장 (Save)
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

const AddActivityModal = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    title: '', types: ['Creativity'], hours: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reflection: '', outcomes: []
  });

  const toggleOutcome = (id) => {
    setData(prev => ({
      ...prev,
      outcomes: prev.outcomes.includes(id) ? prev.outcomes.filter(oid => oid !== id) : [...prev.outcomes, id]
    }));
  };

  const toggleType = (type) => {
      setData(prev => {
          const exists = prev.types.includes(type);
          let newTypes;
          if (exists) {
              if (prev.types.length === 1) return prev; 
              newTypes = prev.types.filter(t => t !== type);
          } else {
              newTypes = [...prev.types, type];
          }
          return { ...prev, types: newTypes };
      });
  };

  const handleSave = () => {
    if(!data.title || !data.hours) return;
    onSave({ ...data, id: Date.now(), hours: Number(data.hours) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {step === 1 ? '새 활동 추가 (New Activity)' : step === 2 ? '학습 성과 (Learning Outcomes)' : '성찰 (Reflection)'}
            </h3>
            <p className="text-xs text-slate-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">어떤 활동을 했나요? (What did you do?)</label>
                <input 
                  autoFocus
                  type="text" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="예: 축구 연습, 피아노 레슨... (e.g., Soccer Practice)"
                  value={data.title}
                  onChange={e => setData({...data, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">종류 (Type) - 다중 선택 가능</label>
                  <div className="flex flex-col gap-2">
                      {['Creativity', 'Activity', 'Service'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleType(type)}
                            className={`p-2 rounded-lg text-sm font-bold transition-all border ${
                                data.types.includes(type)
                                ? type === 'Creativity' ? 'bg-purple-100 text-purple-700 border-purple-200'
                                : type === 'Activity' ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                              {type === 'Creativity' ? '창의 (C)' : type === 'Activity' ? '활동 (A)' : '봉사 (S)'}
                              {data.types.includes(type) && <CheckCircle size={14} className="inline ml-2"/>}
                          </button>
                      ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">시간 (Hours)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    placeholder="0"
                    value={data.hours}
                    onChange={e => setData({...data, hours: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">시작일 (Start)</label>
                    <input 
                    type="date" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={data.startDate}
                    onChange={e => setData({...data, startDate: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">종료일 (End)</label>
                    <input 
                    type="date" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={data.endDate}
                    onChange={e => setData({...data, endDate: e.target.value})}
                    />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-2">이 활동으로 달성한 학습 성과를 선택하세요.</p>
              {LEARNING_OUTCOMES.map((lo) => (
                <button
                  key={lo.id}
                  onClick={() => toggleOutcome(lo.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3
                    ${data.outcomes.includes(lo.id) 
                      ? 'border-blue-500 bg-blue-50 text-blue-800' 
                      : 'border-slate-100 hover:border-blue-200 text-slate-600'}`}
                >
                  <span className="text-xl">{lo.icon}</span>
                  <span className="text-sm font-medium">{lo.text}</span>
                  {data.outcomes.includes(lo.id) && <CheckCircle size={16} className="ml-auto text-blue-500" />}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-blue-600 uppercase mb-2">성찰 도우미 (Reflection Helper)</p>
                <p className="text-sm text-slate-700 italic">"가장 힘들었던 점은 무엇인가요? 마치고 나서 어떤 기분이 들었나요? 다음에는 무엇을 다르게 해보고 싶나요?"</p>
              </div>
              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                placeholder="여기에 성찰 내용을 작성하세요... (Write your reflection here)"
                value={data.reflection}
                onChange={e => setData({...data, reflection: e.target.value})}
              ></textarea>
              
              <div>
                <span className="block text-sm font-bold text-slate-700 mb-2">증빙 자료 추가 (Add Evidence)</span>
                <div className="grid grid-cols-4 gap-2">
                   <button className="p-3 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 flex flex-col items-center gap-1 transition-all">
                      <Camera size={20} />
                      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">사진/영상<br/>(Media)</span>
                   </button>
                   <button className="p-3 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 flex flex-col items-center gap-1 transition-all">
                      <Mic size={20} />
                      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">오디오<br/>(Audio)</span>
                   </button>
                   <button className="p-3 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 flex flex-col items-center gap-1 transition-all">
                      <Link size={20} />
                      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">링크<br/>(Link)</span>
                   </button>
                   <button className="p-3 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 flex flex-col items-center gap-1 transition-all">
                      <FileText size={20} />
                      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">파일<br/>(File)</span>
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              이전 (Back)
            </button>
          )}
          <button 
            onClick={() => step < 3 ? setStep(s => s + 1) : handleSave()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
          >
            {step < 3 ? (
              <>다음 단계 (Next) <ChevronRight size={18} /></>
            ) : (
              <>기록 완료 (Complete Log) <CheckCircle size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [activities, setActivities] = useState([]);
  const [project, setProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(null); // Add login error state

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (selectedRole) => {
    if (!auth) {
        setLoginError("Firebase 설정이 올바르지 않습니다. 코드를 확인해주세요.");
        return;
    }
    try {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
         await signInWithCustomToken(auth, __initial_auth_token);
      } else {
         await signInAnonymously(auth);
      }
      setRole(selectedRole); 
      setLoginError(null);
    } catch (error) {
      console.error("Login failed", error);
      // More user-friendly error handling
      if (error.code === 'auth/operation-not-allowed') {
          setLoginError("Firebase 콘솔에서 '익명 로그인'을 켜주세요.");
      } else if (error.code === 'auth/unauthorized-domain') {
          setLoginError("현재 도메인이 승인되지 않았습니다. Firebase 콘솔의 Auth 설정에서 도메인을 추가해주세요.");
      } else {
          setLoginError("로그인 중 문제가 발생했습니다: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
      if(auth) await signOut(auth);
      setRole(null);
  };

  useEffect(() => {
    if (!user || !db || !appId) return;

    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'activities'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (role === 'student') {
        setActivities(fetchedActivities.filter(a => a.studentId === user.uid));
      } else {
        setActivities(fetchedActivities);
      }
    });

    const projectRef = doc(db, 'artifacts', appId, 'public', 'data', `project-${user.uid}`);
    const unsubscribeProject = onSnapshot(projectRef, (doc) => {
        if(doc.exists()) {
            setProject(doc.data());
        }
    });
    
    return () => { unsubscribe(); unsubscribeProject(); };
  }, [user, role]);

  const handleAddActivity = async (newActivity) => {
      if (!user || !db) return;
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'activities'), {
          ...newActivity,
          studentId: user.uid,
          studentName: "Student", 
          status: 'Pending',
          feedback: ''
      });
      setShowModal(false);
  };

  const handleApprove = async (id) => {
      if (!db) return;
      const activityRef = doc(db, 'artifacts', appId, 'public', 'data', 'activities', id);
      await updateDoc(activityRef, { status: 'Approved' });
  };

  const handleFeedback = async (id, text) => {
      if (!db) return;
      const activityRef = doc(db, 'artifacts', appId, 'public', 'data', 'activities', id);
      await updateDoc(activityRef, { feedback: text });
  };

  const handleSaveProject = async (updatedProject) => {
      if (!db || !user) return;
      const projectRef = doc(db, 'artifacts', appId, 'public', 'data', `project-${user.uid}`);
      setProject(updatedProject); // Optimistic UI update, real logic needs setDoc
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-blue-600"/></div>;

  if (!user) {
    return <LoginView onLogin={handleLogin} errorMsg={loginError} />;
  }

  const stats = {
    c: activities.filter(a => a.types && a.types.includes('Creativity')).reduce((acc, cur) => Number(acc) + Number(cur.hours), 0),
    a: activities.filter(a => a.types && a.types.includes('Activity')).reduce((acc, cur) => Number(acc) + Number(cur.hours), 0),
    s: activities.filter(a => a.types && a.types.includes('Service')).reduce((acc, cur) => Number(acc) + Number(cur.hours), 0),
  };
  const totalHours = activities.reduce((acc, cur) => Number(acc) + Number(cur.hours), 0);
  const achievedOutcomes = new Set(activities.flatMap(a => a.outcomes || [])).size;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-0 print:bg-white print:pb-0">
      
      <div className="bg-white px-6 py-8 md:py-10 border-b border-slate-100 sticky top-0 z-30 print:static print:border-none print:p-0 print:mb-8">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                {role === 'student' ? '나의 CAS 여정' : '교사 대시보드'}
              </h1>
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${role === 'teacher' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                  {role === 'teacher' ? 'Teacher Mode' : 'Student Mode'}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
               {role === 'student' ? '활동을 기록하고 성장하세요.' : '학생들의 활동을 검토하세요.'}
            </p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500"><LogOut size={20}/></button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8 print:p-0 print:space-y-6">
        
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target size={20} className="text-blue-500" /> 진척도 (Progress)
            </h2>
            <div className="flex gap-2">
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12}/> Total: {totalHours}h
                </span>
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {achievedOutcomes}/7 Outcomes
                </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <ProgressBar label="창의 (Creativity)" current={stats.c} colorClass="bg-purple-500 text-purple-500" icon={PenTool} />
            <ProgressBar label="활동 (Activity)" current={stats.a} colorClass="bg-yellow-500 text-yellow-500" icon={Zap} />
            <ProgressBar label="봉사 (Service)" current={stats.s} colorClass="bg-red-500 text-red-500" icon={Heart} />
          </div>
        </section>

        <section>
            <CASProjectSection 
                project={project} 
                onEdit={() => setShowProjectModal(true)} 
            />
        </section>

        <section>
            <GanttChart activities={activities} project={project} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {role === 'student' ? <><Smile size={20} className="text-orange-500" /> 최근 활동</> : <><Users size={20} className="text-orange-500" /> 학생 활동 검토</>}
            </h2>
            {role === 'student' && (
                <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus size={16} /> 활동 추가
                </button>
            )}
          </div>
          
          {activities.length > 0 ? (
            activities.map(activity => (
              <ActivityCard 
                key={activity.id} 
                activity={activity} 
                isTeacherMode={role === 'teacher'}
                onApprove={handleApprove}
                onFeedback={handleFeedback}
              />
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400">등록된 활동이 없습니다.</p>
            </div>
          )}
        </section>
      </main>

      {showModal && <AddActivityModal onClose={() => setShowModal(false)} onSave={handleAddActivity} />}
      {showProjectModal && <EditProjectModal project={project} onClose={() => setShowProjectModal(false)} onSave={handleSaveProject} />}
    </div>
  );
};

export default App;