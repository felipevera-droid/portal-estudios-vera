/* ============================================================
   PORTAL DE ESTUDIOS VERA — script.js v3.0
   Tests gestionados por Claude, sin claves en el portal
   ============================================================ */

const MODEL       = 'claude-haiku-4-5-20251001';
const GITHUB_REPO = 'felipevera-droid/vera';
const DATA_URL    = 'https://felipevera-droid.github.io/vera/data.json';

// ── DATOS BASE ───────────────────────────────────────────────
const BUILTIN = {
  santiago: {
    'Matemáticas': [
      { title:'Multiplicaciones rápidas', questions:[
        {type:'mc',q:'7 × 8',  options:['54','56','48','64'], answer:'56', hint:'7 grupos de 8.'},
        {type:'mc',q:'9 × 6',  options:['56','48','54','42'], answer:'54', hint:'9 veces 6.'},
        {type:'mc',q:'12 × 4', options:['44','48','52','42'], answer:'48', hint:'4 grupos de 12.'},
        {type:'mc',q:'15 × 3', options:['30','45','60','35'], answer:'45', hint:'3 grupos de 15.'},
        {type:'open',q:'Explica qué es una fracción y da un ejemplo.', answer:'Una fracción representa una parte de un entero. Ejemplo: 1/2 es la mitad.', hint:'Piensa en una pizza dividida en partes iguales.'}
      ]},
      { title:'Fracciones básicas', questions:[
        {type:'mc',q:'¿Cuál fracción es la mitad?', options:['1/2','1/3','2/5','3/4'], answer:'1/2', hint:'Dividir en dos partes iguales.'},
        {type:'mc',q:'2/4 equivale a:', options:['1/2','1/3','3/4','2/3'], answer:'1/2', hint:'Simplifica dividiendo entre 2.'},
        {type:'open',q:'¿Por qué 2/4 y 1/2 son equivalentes? Explícalo.', answer:'Porque representan la misma cantidad. 2/4 simplificado (÷2) da 1/2.', hint:'Piensa en dividir algo en partes iguales.'}
      ]}
    ],
    'Historia': [
      { title:'Chile y sus regiones', questions:[
        {type:'mc',q:'¿Capital de Chile?', options:['Valparaíso','Concepción','Santiago','Temuco'], answer:'Santiago', hint:'Donde está La Moneda.'},
        {type:'mc',q:'¿Cuántas regiones tiene Chile?', options:['12','14','16','18'], answer:'16', hint:'Más de 15.'},
        {type:'open',q:'¿Por qué Chile tiene forma tan larga y angosta? Explica.', answer:'Por la Cordillera de los Andes al este y el Océano Pacífico al oeste, que delimitan el territorio de norte a sur.', hint:'Piensa en los accidentes geográficos que rodean el país.'}
      ]}
    ],
    'Ciencias': [
      { title:'Sistema solar', questions:[
        {type:'mc',q:'¿El planeta rojo?', options:['Venus','Marte','Júpiter','Saturno'], answer:'Marte', hint:'Color rojizo.'},
        {type:'mc',q:'¿La estrella del sistema solar?', options:['La Luna','Marte','El Sol','Venus'], answer:'El Sol', hint:'Nos da luz y calor.'},
        {type:'open',q:'¿Qué diferencia hay entre un planeta y una estrella?', answer:'Las estrellas generan su propia luz y energía (como el Sol). Los planetas no generan luz propia, reflejan la de las estrellas.', hint:'Piensa en qué produce el Sol vs qué hace la Tierra.'}
      ]}
    ]
  },
  benjamin: {
    'Matemáticas': [
      { title:'Sumas y restas', questions:[
        {type:'mc',q:'45 + 27',  options:['62','72','82','70'], answer:'72',  hint:'Suma decenas y unidades.'},
        {type:'mc',q:'90 - 38',  options:['62','52','58','42'], answer:'52',  hint:'Resta 30 y luego 8.'},
        {type:'mc',q:'8 × 7',    options:['54','48','56','64'], answer:'56',  hint:'7 grupos de 8.'},
        {type:'open',q:'Si tienes 90 fichas y regalas 38, ¿cuántas quedan? Explica cómo lo resolviste.', answer:'52 fichas. Resto 90 - 30 = 60, luego 60 - 8 = 52.', hint:'Separa la resta en dos pasos más fáciles.'}
      ]},
      { title:'Geometría básica', questions:[
        {type:'mc',q:'¿Lados de un triángulo?', options:['2','3','4','5'], answer:'3', hint:'La pista está en el nombre.'},
        {type:'mc',q:'¿Figura con 4 lados iguales?', options:['Triángulo','Rectángulo','Cuadrado','Círculo'], answer:'Cuadrado', hint:'Como una caja perfecta.'},
        {type:'open',q:'¿Qué diferencia hay entre un cuadrado y un rectángulo?', answer:'Un cuadrado tiene los 4 lados iguales. Un rectángulo tiene 2 lados largos y 2 cortos, pero todos sus ángulos son rectos.', hint:'Piensa en las medidas de sus lados.'}
      ]}
    ],
    'Lenguaje': [
      { title:'Sinónimos y antónimos', questions:[
        {type:'mc',q:'¿Qué es un sinónimo?', options:['Palabra igual','Palabra opuesta','Animal','Número'], answer:'Palabra igual', hint:'Significa parecido.'},
        {type:'mc',q:'¿Qué es un antónimo?', options:['Palabra parecida','Palabra opuesta','Una oración','Un cuento'], answer:'Palabra opuesta', hint:'Es lo contrario.'},
        {type:'open',q:'Escribe un sinónimo y un antónimo para la palabra "rápido".', answer:'Sinónimo: veloz, ágil. Antónimo: lento, despacio.', hint:'Piensa en palabras que signifiquen lo mismo y lo contrario.'}
      ]}
    ]
  }
};

const BADGES = [
  {id:'first',   icon:'🌟', name:'Primera estrella', check: p => p.totalCompleted >= 1 },
  {id:'perfect', icon:'💯', name:'¡Perfecto!',       check: p => p.bestScore >= 100    },
  {id:'streak3', icon:'🔥', name:'En racha',         check: p => p.streak >= 3         },
  {id:'quiz5',   icon:'📚', name:'Estudioso',        check: p => p.totalCompleted >= 5 },
  {id:'quiz10',  icon:'🎓', name:'Académico',        check: p => p.totalCompleted >= 10},
  {id:'stars20', icon:'✨', name:'Coleccionista',    check: p => p.totalStars >= 20    },
];

// ── ESTADO ───────────────────────────────────────────────────
const S = { student:'', quiz:[], quizMeta:{}, qIdx:0, score:0, answers:[], lastPct:0, lastOk:0, subject:'' };
let _quizCache = [];
let audioCtx   = null;

// ── STORAGE ──────────────────────────────────────────────────
function getProgress(st) {
  const d = {quizHistory:[],streak:0,lastStudyDate:null,totalCompleted:0,totalStars:0,bestScore:0};
  const r = localStorage.getItem('prg_'+st);
  return r ? {...d,...JSON.parse(r)} : d;
}
function saveProgress(st, meta, pct, ok, total) {
  const p = getProgress(st);
  const td = toDay(); const stars = Math.ceil(pct/20);
  if (p.lastStudyDate !== td) {
    const yd = new Date(Date.now()-86400000).toISOString().slice(0,10);
    p.streak = (p.lastStudyDate===yd) ? p.streak+1 : 1;
    p.lastStudyDate = td;
  }
  p.quizHistory.push({quizId:meta.id,subject:meta.subject,title:meta.title,date:td,score:pct,ok,total,stars});
  p.totalCompleted++; p.totalStars+=stars; p.bestScore=Math.max(p.bestScore,pct);
  localStorage.setItem('prg_'+st, JSON.stringify(p));
}
// Tests remotos — se cargan desde data.json en GitHub
function getRemote(st)  { const r=localStorage.getItem('remote'); return r?JSON.parse(r)[st]||{}:{}; }
function setRemote(data){ localStorage.setItem('remote',JSON.stringify(data)); }

function getSettings()  { return JSON.parse(localStorage.getItem('cfg')||'{"theme":"light","sound":true,"pin":"1234"}'); }
function setSetting(k,v){ const s=getSettings(); s[k]=v; localStorage.setItem('cfg',JSON.stringify(s)); }

// ── UTILS ────────────────────────────────────────────────────
function toDay()         { return new Date().toISOString().slice(0,10); }
function sleep(ms)       { return new Promise(r=>setTimeout(r,ms)); }
function allSubjects(st) { return [...new Set([...Object.keys(BUILTIN[st]||{}),...Object.keys(getRemote(st))])]; }
function allQuizzes(st,s){ return [...(BUILTIN[st]||{})[s]||[],...getRemote(st)[s]||[]]; }
function quizId(st,s,t)  { return [st,s,t].join('_').replace(/\s+/g,'_'); }
function starsHtml(pct)  { const n=Math.min(5,Math.ceil(pct/20)); return '⭐'.repeat(n)+'☆'.repeat(5-n); }
const ICONS = {'Matemáticas':'🔢','Historia':'📜','Ciencias':'🔬','Lenguaje':'📝','Inglés':'🌎','Arte':'🎨','Música':'🎵','Tecnología':'💻','Biología':'🧬','Física':'⚡','Química':'🧪'};

// ── AUDIO ────────────────────────────────────────────────────
function playSound(type) {
  if (!getSettings().sound) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const ctx = audioCtx;
    const notes = type==='correct'?[523,659,784]:type==='wrong'?[300,200]:type==='complete'?[523,659,784,1047]:[];
    notes.forEach((freq,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.frequency.value=freq;
      const t=ctx.currentTime+i*0.1;
      g.gain.setValueAtTime(0.18,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.3);
      o.start(t); o.stop(t+0.3);
    });
  } catch(e){}
}

// ── THEME ────────────────────────────────────────────────────
function applyTheme() {
  const t = getSettings().theme;
  document.body.setAttribute('data-theme',t);
  document.getElementById('themeToggle').textContent = t==='dark'?'☀️ Modo claro':'🌙 Modo oscuro';
}

// ── REMOTE DATA (data.json en GitHub) ────────────────────────
async function loadRemoteData() {
  try {
    const r = await fetch(DATA_URL + '?_=' + Date.now());
    if (!r.ok) return;
    const data = await r.json();
    if (Object.keys(data).length) setRemote(data);
  } catch(e) {}
}

// ── NAV ──────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

// ── HOME ─────────────────────────────────────────────────────
function renderHome() {
  ['santiago','benjamin'].forEach(st=>{
    const p=getProgress(st);
    const el=document.getElementById('homeStats'+st[0].toUpperCase()+st.slice(1));
    if(el) el.innerHTML=
      (p.totalStars?`<span>⭐ ${p.totalStars}</span>`:'')+
      (p.totalCompleted?`<span>📝 ${p.totalCompleted}</span>`:'')+
      (p.streak>0?`<span>🔥 ${p.streak}</span>`:'');
  });
}

// ── DASHBOARD ────────────────────────────────────────────────
function renderDashboard() {
  const st=S.student, p=getProgress(st);
  const av={santiago:'🚀',benjamin:'🦊'};
  document.getElementById('studentAvatar').textContent = av[st]||'⭐';
  document.getElementById('studentName').textContent   = st==='santiago'?'Santiago':'Benjamín';
  document.getElementById('completedCount').textContent = p.totalCompleted;
  document.getElementById('starsCount').textContent     = p.totalStars;
  document.getElementById('bestScore').textContent      = p.bestScore+'%';
  document.getElementById('streakCount').textContent    = p.streak;
  renderRanking(); renderBadges(p); renderStudyPlan(st,p); renderSubjectGrid(st);
}

function renderRanking() {
  const rows=[{name:'Santiago',av:'🚀',p:getProgress('santiago')},{name:'Benjamín',av:'🦊',p:getProgress('benjamin')}]
    .sort((a,b)=>b.p.totalStars-a.p.totalStars);
  document.getElementById('rankingList').innerHTML=rows.map((r,i)=>`
    <div class="rank-item ${r.name.toLowerCase()===S.student?'current':''}">
      <span class="rank-pos">${i===0?'🥇':'🥈'}</span>
      <span>${r.av}</span><span class="rank-name">${r.name}</span>
      <span class="rank-stars">⭐ ${r.p.totalStars}</span>
      <span class="rank-count">${r.p.totalCompleted} tests</span>
    </div>`).join('');
}

function renderBadges(p) {
  const earned=BADGES.filter(b=>b.check(p));
  const pending=BADGES.filter(b=>!b.check(p)).slice(0,Math.max(2,4-earned.length));
  document.getElementById('badgesList').innerHTML=
    earned.map(b=>`<div class="badge earned"><span class="badge-icon">${b.icon}</span><span class="badge-name">${b.name}</span></div>`).join('')+
    pending.map(b=>`<div class="badge pending"><span class="badge-icon">🔒</span><span class="badge-name">${b.name}</span></div>`).join('');
}

function renderStudyPlan(st,p) {
  const studied=new Set((p.quizHistory||[]).filter(h=>h.date===toDay()).map(h=>h.subject));
  const sugg=allSubjects(st).filter(s=>!studied.has(s)).slice(0,3);
  const el=document.getElementById('studyPlan');
  el.innerHTML=sugg.length===0?'<li class="plan-done">✅ ¡Todo listo por hoy!</li>'
    :sugg.map(s=>`<li class="plan-item" data-s="${s}">📖 ${s}</li>`).join('');
  el.querySelectorAll('.plan-item').forEach(li=>li.addEventListener('click',()=>openSubject(li.dataset.s)));
}

function renderSubjectGrid(st) {
  const p=getProgress(st); const studied=new Set((p.quizHistory||[]).map(h=>h.subject));
  const grid=document.getElementById('subjectGrid');
  grid.innerHTML=allSubjects(st).map(s=>`
    <button class="subject-card ${studied.has(s)?'studied':''}" data-s="${s}">
      <span class="subject-icon">${ICONS[s]||'📚'}</span>
      <h3>${s}</h3><p>${allQuizzes(st,s).length} tests</p>
      ${studied.has(s)?'<span class="studied-badge">✓</span>':''}
    </button>`).join('');
  grid.querySelectorAll('.subject-card').forEach(btn=>btn.addEventListener('click',()=>openSubject(btn.dataset.s)));
}

// ── TEST LIST ────────────────────────────────────────────────
function openSubject(subject) {
  S.subject=subject;
  document.getElementById('subjectTitle').textContent=subject;
  document.getElementById('quizStudentLabel').textContent=S.student==='santiago'?'Santiago':'Benjamín';
  const p=getProgress(S.student);
  _quizCache=allQuizzes(S.student,subject);
  const container=document.getElementById('quizCards');
  container.innerHTML=_quizCache.length===0
    ?'<p class="empty-state">Sin tests aún en esta materia.</p>'
    :_quizCache.map((q,i)=>{
      const hist=(p.quizHistory||[]).filter(h=>h.quizId===quizId(S.student,subject,q.title));
      const best=hist.length?Math.max(...hist.map(h=>h.score)):null;
      const mcCount=q.questions.filter(x=>x.type==='mc'||!x.type).length;
      const openCount=q.questions.filter(x=>x.type==='open').length;
      const pill=openCount>0&&mcCount>0?'🔀 Mixto':openCount>0?'📝 Desarrollo':'⚡ Selección múltiple';
      return `<button class="quiz-card" data-i="${i}">
        <h3>${q.title}</h3>
        <p>${q.questions.length} preg. · <span style="font-size:.78rem;color:var(--primary)">${pill}</span></p>
        ${best!==null?`<div class="quiz-history"><span>Mejor: ${best}%</span><span>${starsHtml(best)}</span></div>`:'<p class="quiz-new">✦ Nuevo</p>'}
      </button>`;
    }).join('');
  container.querySelectorAll('.quiz-card').forEach(btn=>
    btn.addEventListener('click',()=>startQuiz(_quizCache[+btn.dataset.i],subject)));
  showScreen('quizList');
}

// ── TEST ENGINE ──────────────────────────────────────────────
function startQuiz(quiz,subject) {
  S.quiz=quiz.questions; S.quizMeta={id:quizId(S.student,subject,quiz.title),subject,title:quiz.title};
  S.qIdx=0; S.score=0; S.answers=[];
  document.getElementById('quizTitle').textContent=quiz.title;
  document.getElementById('quizMeta').textContent=subject+' · '+(S.student==='santiago'?'Santiago':'Benjamín');
  showScreen('quizScreen'); renderQuestion();
}

function renderQuestion() {
  const q=S.quiz[S.qIdx];
  const isOpen=q.type==='open';
  document.getElementById('questionText').textContent=q.q;
  document.getElementById('questionCounter').textContent=`Pregunta ${S.qIdx+1} de ${S.quiz.length}`;
  document.getElementById('progressBar').style.width=(S.qIdx/S.quiz.length*100)+'%';
  document.getElementById('feedback').className='feedback hidden';
  const badge=document.getElementById('qTypeBadge');
  badge.textContent=isOpen?'📝 Desarrollo':'⚡ Selección múltiple';
  badge.className='q-type-badge '+(isOpen?'badge-open':'badge-mc');
  const opts=document.getElementById('options'); opts.innerHTML='';
  const actions=document.getElementById('quizActions');

  if (isOpen) {
    const ta=document.createElement('textarea');
    ta.className='open-answer'; ta.placeholder='Escribe tu respuesta aquí…'; ta.rows=4;
    opts.appendChild(ta);
    actions.innerHTML=`<button id="showAnswerBtn" class="primary-btn">📖 Ver respuesta modelo</button>`;
    document.getElementById('showAnswerBtn').addEventListener('click',()=>{
      const fb=document.getElementById('feedback');
      fb.className='feedback open-reveal';
      fb.innerHTML=`<strong>Respuesta esperada:</strong><br>${q.answer}<br><small style="color:var(--muted)">💡 ${q.hint}</small>`;
      actions.innerHTML=`
        <button id="selfYes" class="self-btn self-yes">✅ Lo supe</button>
        <button id="selfNo"  class="self-btn self-no">❌ No lo supe</button>`;
      ta.disabled=true; playSound('correct');
      document.getElementById('selfYes').addEventListener('click',()=>recordOpen(true));
      document.getElementById('selfNo').addEventListener('click',()=>recordOpen(false));
    });
  } else {
    actions.innerHTML=`
      <button id="hintBtn" class="secondary-btn" style="flex:1">💡 Pista</button>
      <button id="nextBtn" class="primary-btn" style="flex:2" disabled>Siguiente →</button>`;
    document.getElementById('hintBtn').addEventListener('click',()=>{
      const fb=document.getElementById('feedback'); fb.className='feedback hint'; fb.innerHTML=`💡 ${q.hint}`;
    });
    document.getElementById('nextBtn').addEventListener('click',advanceQuestion);
    q.options.forEach(opt=>{
      const btn=document.createElement('button'); btn.className='option-btn'; btn.textContent=opt;
      btn.addEventListener('click',()=>selectAnswer(btn,opt,q.answer,q.hint));
      opts.appendChild(btn);
    });
  }
}

function selectAnswer(btn,sel,correct,hint) {
  document.querySelectorAll('.option-btn').forEach(b=>b.disabled=true);
  const ok=sel===correct;
  if(ok){btn.classList.add('correct');S.score++;playSound('correct');}
  else{btn.classList.add('wrong');document.querySelectorAll('.option-btn').forEach(b=>{if(b.textContent===correct)b.classList.add('correct');});playSound('wrong');}
  S.answers.push({type:'mc',question:S.quiz[S.qIdx].q,sel,correct,ok});
  const fb=document.getElementById('feedback');
  fb.className='feedback '+(ok?'good':'bad');
  fb.innerHTML=ok?'✅ ¡Correcto!':`❌ Correcto: <strong>${correct}</strong><br><small>💡 ${hint}</small>`;
  document.getElementById('nextBtn').disabled=false;
}

function recordOpen(selfOk) {
  if(selfOk) S.score++;
  S.answers.push({type:'open',question:S.quiz[S.qIdx].q,ok:selfOk,modelAnswer:S.quiz[S.qIdx].answer});
  playSound(selfOk?'correct':'wrong');
  advanceQuestion();
}

function advanceQuestion() {
  S.qIdx++; if(S.qIdx<S.quiz.length) renderQuestion(); else showResults();
}

function showResults() {
  const pct=Math.round(S.score/S.quiz.length*100);
  const [title,msg]=pct===100?['🏆 ¡Perfecto!','¡Dominas el tema!']:pct>=80?['🌟 ¡Muy bien!','Sigue así.']:pct>=60?['👍 ¡Bien!','Hay espacio para mejorar.']:['📚 Sigue practicando','Repasa y vuelve a intentarlo.'];
  document.getElementById('resultTitle').textContent=title;
  document.getElementById('scoreCircle').textContent=pct+'%';
  document.getElementById('scoreCircle').style.background=pct>=80?'var(--success)':pct>=60?'var(--warning)':'var(--danger)';
  document.getElementById('resultMessage').textContent=`${msg} (${S.score}/${S.quiz.length} correctas)`;
  document.getElementById('earnedBadges').innerHTML=`<div class="stars-earned">${starsHtml(pct)} (${Math.ceil(pct/20)}/5 estrellas)</div>`;
  document.getElementById('reviewList').innerHTML=S.answers.map(a=>
    a.type==='open'
      ?`<div class="review-item ${a.ok?'review-correct':'review-wrong'}"><span>${a.ok?'✅':'❌'}</span><div><strong>${a.question}</strong><br><span class="review-answer">Resp. esperada: ${a.modelAnswer}</span></div></div>`
      :`<div class="review-item ${a.ok?'review-correct':'review-wrong'}"><span>${a.ok?'✅':'❌'}</span><div><strong>${a.question}</strong>${!a.ok?`<br><span class="review-answer">${a.sel} → ${a.correct}</span>`:''}</div></div>`
  ).join('');
  document.getElementById('progressBar').style.width='100%';
  S.lastPct=pct; S.lastOk=S.score; playSound('complete'); showScreen('resultScreen');
}

document.getElementById('finishQuiz').addEventListener('click',()=>{
  saveProgress(S.student,S.quizMeta,S.lastPct,S.lastOk,S.quiz.length);
  renderDashboard(); showScreen('dashboard');
});

// ── ADMIN ────────────────────────────────────────────────────
function showAdmin() {
  document.getElementById('pinGate').classList.remove('hidden');
  document.getElementById('adminContent').classList.add('hidden');
  document.getElementById('pinInput').value='';
  document.getElementById('pinError').classList.add('hidden');
  renderCustomQuizList();
  showScreen('adminScreen');
}

document.getElementById('pinSubmit').addEventListener('click',()=>{
  if(document.getElementById('pinInput').value===getSettings().pin){
    document.getElementById('pinGate').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
  } else {
    document.getElementById('pinError').classList.remove('hidden');
    document.getElementById('pinInput').value='';
  }
});
document.getElementById('pinInput').addEventListener('keypress',e=>{if(e.key==='Enter')document.getElementById('pinSubmit').click();});

document.getElementById('resetProgress').addEventListener('click',()=>{
  if(!confirm('⚠️ ¿Borrar TODO el progreso?'))return;
  localStorage.removeItem('prg_santiago'); localStorage.removeItem('prg_benjamin');
  renderHome(); alert('✅ Progreso borrado.');
});

function renderCustomQuizList() {
  const list=document.getElementById('customQuizList'); let html='';
  ['santiago','benjamin'].forEach(st=>{
    const remote=getRemote(st); const subs=Object.keys(remote); if(!subs.length)return;
    html+=`<div class="custom-student"><strong>${st==='santiago'?'🚀 Santiago':'🦊 Benjamín'}</strong>`;
    subs.forEach(sub=>remote[sub].forEach(q=>{
      html+=`<div class="custom-quiz-item"><span>${sub} — ${q.title} (${q.questions.length}q)</span></div>`;
    }));
    html+='</div>';
  });
  list.innerHTML=html||'<p class="empty-state">Aún no hay tests agregados. Sube PDFs al chat de Claude.</p>';
}

// ── GLOBAL LISTENERS ─────────────────────────────────────────
document.querySelectorAll('.profile-card').forEach(btn=>btn.addEventListener('click',()=>{
  S.student=btn.dataset.student; renderDashboard(); showScreen('dashboard');
}));
document.getElementById('backHome').addEventListener('click',()=>{renderHome();showScreen('home');});
document.getElementById('backDashboard').addEventListener('click',()=>showScreen('dashboard'));
document.getElementById('exitQuiz').addEventListener('click',()=>showScreen('quizList'));
document.getElementById('backFromAdmin').addEventListener('click',()=>{if(S.student){renderDashboard();showScreen('dashboard');}else{renderHome();showScreen('home');}});
document.getElementById('adminBtn').addEventListener('click',showAdmin);
document.getElementById('dashAdminBtn').addEventListener('click',showAdmin);
document.getElementById('themeToggle').addEventListener('click',()=>{const c=getSettings().theme;setSetting('theme',c==='dark'?'light':'dark');applyTheme();});
document.getElementById('soundToggle').addEventListener('click',()=>{const c=getSettings().sound;setSetting('sound',!c);document.getElementById('soundToggle').textContent=c?'🔇 Sonido: OFF':'🔊 Sonido: ON';});

// ── INIT ─────────────────────────────────────────────────────
(function init() {
  applyTheme();
  document.getElementById('soundToggle').textContent = getSettings().sound ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
  renderHome();
  loadRemoteData().then(() => renderHome()).catch(() => {});
})();
