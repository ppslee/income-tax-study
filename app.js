// ──────────────────────────────────────────
// 소득세법 완전정복 - 핵심 로직
// ──────────────────────────────────────────

const EXAM_DATE = new Date('2027-04-24');

function getDDay() {
  const today = new Date(); today.setHours(0,0,0,0);
  const exam  = new Date(EXAM_DATE); exam.setHours(0,0,0,0);
  const diff  = Math.ceil((exam-today)/(1000*60*60*24));
  return diff > 0 ? `D-${diff}` : diff === 0 ? 'D-Day!' : `D+${Math.abs(diff)}`;
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getProgress() {
  const p = localStorage.getItem('its_progress');
  return p ? JSON.parse(p) : {};
}

function saveProgress(p) { localStorage.setItem('its_progress', JSON.stringify(p)); }

function updateProgress(chKey, type, correct, total) {
  const p = getProgress();
  if (!p[chKey]) p[chKey] = {};
  if (!p[chKey][type]) p[chKey][type] = { correct:0, total:0, lastDate:'' };
  p[chKey][type].correct  += correct;
  p[chKey][type].total    += total;
  p[chKey][type].lastDate  = getTodayStr();
  saveProgress(p);
}

function getChapterPct(chKey) {
  const p = getProgress();
  if (!p[chKey]) return 0;
  let c=0, t=0;
  Object.values(p[chKey]).forEach(v => { c+=v.correct; t+=v.total; });
  return t > 0 ? Math.round(c/t*100) : 0;
}

function getWrongNotes() {
  const w = localStorage.getItem('its_wrong');
  return w ? JSON.parse(w) : [];
}

function saveWrongNotes(arr) { localStorage.setItem('its_wrong', JSON.stringify(arr)); }

function addWrongNote(chKey, type, q, myAns, correctAns, 해설, 원문) {
  const arr = getWrongNotes();
  arr.push({ id:Date.now(), chKey, type, q, myAns, correctAns, 해설, 원문, date:getTodayStr(), reviewCount:0 });
  if (arr.length > 500) arr.splice(0, arr.length-500);
  saveWrongNotes(arr);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i=a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

const CHAPTER_LIST = [
  { key:'CH01', label:'CH01 소득세법 총론' },
  { key:'CH02', label:'CH02 이자·배당소득' },
  { key:'CH03', label:'CH03 사업소득' },
  { key:'CH04', label:'CH04 근로·연금·기타소득' },
  { key:'CH05', label:'CH05 소득금액 계산 특례' },
  { key:'CH06', label:'CH06 종합소득 과세표준' },
  { key:'CH07', label:'CH07 종합소득세액 계산' },
  { key:'CH08', label:'CH08 퇴직소득세' },
  { key:'CH09', label:'CH09 납세절차' },
  { key:'CH10', label:'CH10 양도소득세 ⭐' },
  { key:'CH11', label:'CH11 비거주자' },
];

const TYPE_LIST = [
  { key:'ox',      label:'OX 퀴즈',       color:'#1B5E20', icon:'⭕' },
  { key:'choice',  label:'4지선다',        color:'#6A1B9A', icon:'📝' },
  { key:'blank',   label:'빈칸 채우기',    color:'#1565C0', icon:'✏️' },
  { key:'cards',   label:'플래시카드',     color:'#E65100', icon:'🃏' },
  { key:'compare', label:'소득별 비교',    color:'#B71C1C', icon:'📊' },
  { key:'numbers', label:'숫자 집중 암기', color:'#00838F', icon:'🔢' },
  { key:'flow',    label:'계산흐름도',     color:'#37474F', icon:'🔄' },
  { key:'white',   label:'백지 테스트',    color:'#4527A0', icon:'📄' },
];

window.SELECTED_CH   = null;
window.SELECTED_TYPE = null;
window.CURRENT_DATA  = [];
window.CURRENT_IDX   = 0;
window.SESSION_CORRECT = 0;
window.SESSION_TOTAL   = 0;
window.SESSION_WRONGS  = [];

function getChData(chKey)       { return window[chKey] || null; }
function getTypeData(chKey, type) {
  const ch = getChData(chKey);
  if (!ch) return [];
  return ch[type] || [];
}

function initSession(chKey, type) {
  window.SELECTED_CH   = chKey;
  window.SELECTED_TYPE = type;
  const raw = getTypeData(chKey, type);
  window.CURRENT_DATA  = shuffle(raw);
  window.CURRENT_IDX   = 0;
  window.SESSION_CORRECT = 0;
  window.SESSION_TOTAL   = 0;
  window.SESSION_WRONGS  = [];
}

function processAnswer(isCorrect, q, myAns, correctAns, 해설, 원문) {
  window.SESSION_TOTAL++;
  if (isCorrect) window.SESSION_CORRECT++;
  else {
    window.SESSION_WRONGS.push({ q, myAns, correctAns, 해설, 원문 });
    addWrongNote(window.SELECTED_CH, window.SELECTED_TYPE, q, myAns, correctAns, 해설, 원문);
  }
  updateProgress(window.SELECTED_CH, window.SELECTED_TYPE, isCorrect?1:0, 1);
}

function closeModalOutside(e) {
  if (e.target.classList.contains('modal-overlay'))
    e.target.classList.remove('active');
}
