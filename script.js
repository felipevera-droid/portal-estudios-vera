/* ============================================================
   PORTAL DE ESTUDIOS VERA — script.js v2.2
   Novedades: preguntas de desarrollo, más preguntas, retry
   ============================================================ */

// Modelo base — Haiku es el más eficiente en tokens
const MODEL = 'claude-haiku-4-5-20251001';

// Repositorio GitHub para sincronización entre dispositivos
const GITHUB_REPO = 'felipevera-droid/vera';
const PORTAL_URL  = 'https://felipevera-droid.github.io/vera';

// ── 1. DATOS BASE ────────────────────────────────────────────
const BUILTIN = {
  santiago: {
    'Matemáticas': [
      { title:'Multiplicaciones rápidas', questions:[
        {type:'mc',q:'7 × 8',  options:['54','56','48','64'], answer:'56', hint:'7 grupos de 8.'},
        {type:'mc',q:'9 × 6',  options:['56','48','54','42'], answer:'54', hint:'9 veces 6.'},
        {type:'mc',q:'12 × 4', options:['44','48','52','42'], answer:'48', hint:'4 grupos de 12.'},
        {type:'mc',q:'15 × 3', options:['30','45','60','35'], answer:'45', hint:'3 grupos de 15.'},
        {type:'open',q:'Explica con tus palabras qué es una fracción y da un ejemplo.', answer:'Una fracción representa una parte de un entero. Por ejemplo, 1/2 es la mitad de algo.', hint:'Piensa en una pizza dividida en partes iguales.'}
      ]},
      { title:'Fracciones básicas', questions:[
        {type:'mc',q:'¿Cuál fracción es la mitad?', options:['1/2','1/3','2/5','3/4'], answer:'1/2', hint:'Dividir en dos partes iguales.'},
        {type:'mc',q:'2/4 equivale a:', options:['1/2','1/3','3/4','2/3'], answer:'1/2', hint:'Simplifica dividiendo entre 2.'},
        {type:'open',q:'¿Por qué 2/4 y 1/2 son equivalentes? Explícalo.', answer:'Porque representan la misma cantidad: la mitad. 2/4 simplificado (÷2) da 1/2.', hint:'Piensa en dividir algo en partes iguales.'}
      ]}
    ],
    'Historia': [
      { title:'Chile y sus regiones', questions:[
        {type:'mc',q:'¿Capital de Chile?', options:['Valparaíso','Concepción','Santiago','Temuco'], answer:'Santiago', hint:'Donde está La Moneda.'},
        {type:'mc',q:'¿Cuántas regiones tiene Chile?', options:['12','14','16','18'], answer:'16', hint:'Más de 15.'},
        {type:'open',q:'¿Por qué crees que Chile tiene una forma tan larga y angosta? Explica.', answer:'Por su geografía entre la cordillera de los Andes y el Océano Pacífico, que la delimitan naturalmente de norte a sur.', hint:'Piensa en los accidentes geográficos que rodean el país.'}
      ]}
    ],
    'Ciencias': [
      { title:'Sistema solar', questions:[
        {type:'mc',q:'¿El planeta rojo?', options:['Venus','Marte','Júpiter','Saturno'], answer:'Marte', hint:'Color rojizo.'},
        {type:'mc',q:'¿La estrella del sistema solar?', options:['La Luna','Marte','El Sol','Venus'], answer:'El Sol', hint:'Nos da luz y calor.'},
        {type:'open',q:'¿Qué diferencia hay entre un planeta y una estrella? Explica con tus palabras.', answer:'Las estrellas generan su propia luz y energía (como el Sol). Los planetas no generan luz propia, sino que reflejan la de las estrellas.', hint:'Piensa en qué produce el Sol vs qué hace la Tierra.'}
      ]}
    ]
  },
  benjamin: {
    'Matemáticas': [
      { title:'Sumas y restas', questions:[
        {type:'mc',q:'45 + 27',  options:['62','72','82','70'], answer:'72',  hint:'Suma decenas y unidades.'},
        {type:'mc',q:'90 - 38',  options:['62','52','58','42'], answer:'52',  hint:'Resta 30 y luego 8.'},
        {type:'mc',q:'8 × 7',    options:['54','48','56','64'], answer:'56',  hint:'7 grupos de 8.'},
        {type:'open',q:'Si tienes 90 fichas y regalas 38, ¿cuántas te quedan? Explica cómo lo resolviste.', answer:'52 fichas. Puedo restar 90 - 30 = 60, luego 60 - 8 = 52.', hint:'Separa la resta en dos pasos más fáciles.'}
      ]},
      { title:'Geometría básica', questions:[
        {type:'mc',q:'¿Lados de un triángulo?', options:['2','3','4','5'], answer:'3', hint:'La pista está en el nombre.'},
        {type:'mc',q:'¿Figura con 4 lados iguales?', options:['Triángulo','Rectángulo','Cuadrado','Círculo'], answer:'Cuadrado', hint:'Como una caja perfecta.'},
        {type:'open',q:'¿Qué diferencia hay entre un cuadrado y un rectángulo? Explica.', answer:'Un cuadrado tiene los 4 lados iguales. Un rectángulo tiene 2 lados largos y 2 cortos, pero todos sus ángulos son de 90°.', hint:'Piensa en las medidas de sus lados.'}
      ]}
    ],
    'Lenguaje': [
      { title:'Sinónimos y antónimos', questions:[
        {type:'mc',q:'¿Qué es un sinónimo?', options:['Palabra igual','Palabra opuesta','Animal','Número'], answer:'Palabra igual', hint:'Significa parecido.'},
        {type:'mc',q:'¿Qué es un antónimo?', options:['Palabra parecida','Palabra opuesta','Una oración','Un cuento'], answer:'Palabra opuesta', hint:'Es lo contrario.'},
        {type:'open',q:'Escribe un sinónimo y un antónimo para la palabra "rápido".', answer:'Sinónimo: veloz, ágil, ligero. Antónimo: lento, pausado, despacio.', hint:'Piensa en palabras que signifiquen lo mismo y lo contrario.'}
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

// ── 2. ESTADO ────────────────────────────────────────────────
const S = { student:'', quiz:[], quizMeta:{}, qIdx:0, score:0, totalGradable:0, answers:[], lastPct:0, lastOk:0, subject:'' };
let _quizCache = [];
let _pdfs      = [];
let audioCtx   = null;

// ── 3. STORAGE ───────────────────────────────────────────────
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
function getCustom(st)               { const r=localStorage.getItem('custom'); return r?JSON.parse(r)[st]||{}:{}; }
function saveCustom(st, subject, quiz) {
  const r=localStorage.getItem('custom'); const all=r?JSON.parse(r):{};
  if(!all[st])all[st]={}; if(!all[st][subject])all[st][subject]=[];
  all[st][subject].push(quiz); localStorage.setItem('custom',JSON.stringify(all));
  pushRemoteData(); // sync a GitHub en segundo plano
}
function deleteCustom(st, subject, title) {
  const r=localStorage.getItem('custom'); if(!r)return;
  const all=JSON.parse(r);
  if(all[st]?.[subject]){ all[st][subject]=all[st][subject].filter(q=>q.title!==title);
    if(!all[st][subject].length)delete all[st][subject];
    if(!Object.keys(all[st]).length)delete all[st]; }
  localStorage.setItem('custom',JSON.stringify(all));
  pushRemoteData();
}
function getSettings() { return JSON.parse(localStorage.getItem('cfg')||'{"theme":"light","sound":true,"pin":"1234"}'); }
function setSetting(k,v){ const s=getSettings(); s[k]=v; localStorage.setItem('cfg',JSON.stringify(s)); }
function getApiKey()    { return localStorage.getItem('api_key')||''; }
function setApiKey(k)   { localStorage.setItem('api_key',k); }
function getGhToken()   { return localStorage.getItem('gh_token')||''; }
function setGhToken(t)  { localStorage.setItem('gh_token',t); }

// ── 4. UTILS ─────────────────────────────────────────────────
function toDay()         { return new Date().toISOString().slice(0,10); }
function sleep(ms)       { return new Promise(r=>setTimeout(r,ms)); }
function allSubjects(st) { return [...new Set([...Object.keys(BUILTIN[st]||{}),...Object.keys(getCustom(st))])]; }
function allQuizzes(st,s){ return [...(BUILTIN[st]||{})[s]||[],...getCustom(st)[s]||[]]; }
function quizId(st,s,t)  { return [st,s,t].join('_').replace(/\s+/g,'_'); }
function starsHtml(pct)  { const n=Math.min(5,Math.ceil(pct/20)); return '⭐'.repeat(n)+'☆'.repeat(5-n); }
const ICONS = {'Matemáticas':'🔢','Historia':'📜','Ciencias':'🔬','Lenguaje':'📝','Inglés':'🌎','Arte':'🎨','Música':'🎵'};

// ── 5. AUDIO ─────────────────────────────────────────────────
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

// ── 6. THEME ─────────────────────────────────────────────────
function applyTheme() {
  const t = getSettings().theme;
  document.body.setAttribute('data-theme',t);
  document.getElementById('themeToggle').textContent = t==='dark'?'☀️ Modo claro':'🌙 Modo oscuro';
}

// ── 7. NAV ───────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

// ── 8. HOME ──────────────────────────────────────────────────
function renderHome() {
  ['santiago','benjamin'].forEach(st=>{
    const p=getProgress(st);
    const el=document.getElementById('homeStats'+st[0].toUpperCase()+st.slice(1));
    if(el) el.innerHTML=(p.totalStars?`<span>⭐ ${p.totalStars}</span>`:'')+
      (p.totalCompleted?`<span>📝 ${p.totalCompleted}</span>`:'')+
      (p.streak>0?`<span>🔥 ${p.streak}</span>`:'');
  });
}

// ── 9. DASHBOARD ─────────────────────────────────────────────
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

// ── 10. TEST LIST ────────────────────────────────────────────
function openSubject(subject) {
  S.subject=subject;
  document.getElementById('subjectTitle').textContent=subject;
  document.getElementById('quizStudentLabel').textContent=S.student==='santiago'?'Santiago':'Benjamín';
  const p=getProgress(S.student);
  _quizCache=allQuizzes(S.student,subject);
  const container=document.getElementById('quizCards');
  container.innerHTML=_quizCache.length===0
    ?'<p class="empty-state">Sin tests aún. Agrégalos desde ⚙️ Admin.</p>'
    :_quizCache.map((q,i)=>{
      const hist=(p.quizHistory||[]).filter(h=>h.quizId===quizId(S.student,subject,q.title));
      const best=hist.length?Math.max(...hist.map(h=>h.score)):null;
      const isAI=!(BUILTIN[S.student]?.[subject]?.some(b=>b.title===q.title));
      const mcCount=q.questions.filter(x=>x.type==='mc'||!x.type).length;
      const openCount=q.questions.filter(x=>x.type==='open').length;
      const typePill=openCount>0&&mcCount>0?'🔀 Mixto':openCount>0?'📝 Desarrollo':'⚡ Selección múltiple';
      return `<button class="quiz-card" data-i="${i}">
        <div class="quiz-card-header"><h3>${q.title}</h3>${isAI?'<span class="custom-badge">✨ IA</span>':''}</div>
        <p>${q.questions.length} preg. · <span style="font-size:.78rem;color:var(--primary)">${typePill}</span></p>
        ${best!==null?`<div class="quiz-history"><span>Mejor: ${best}%</span><span>${starsHtml(best)}</span></div>`:'<p class="quiz-new">✦ Nuevo</p>'}
      </button>`;
    }).join('');
  container.querySelectorAll('.quiz-card').forEach(btn=>
    btn.addEventListener('click',()=>startQuiz(_quizCache[+btn.dataset.i],subject)));
  showScreen('quizList');
}

// ── 11. TEST ENGINE ──────────────────────────────────────────
function startQuiz(quiz,subject) {
  S.quiz=quiz.questions; S.quizMeta={id:quizId(S.student,subject,quiz.title),subject,title:quiz.title};
  S.qIdx=0; S.score=0; S.answers=[];
  S.totalGradable = S.quiz.filter(q=>q.type==='mc'||!q.type).length || S.quiz.length;
  document.getElementById('quizTitle').textContent=quiz.title;
  document.getElementById('quizMeta').textContent=subject+' · '+(S.student==='santiago'?'Santiago':'Benjamín');
  showScreen('quizScreen'); renderQuestion();
}

function renderQuestion() {
  const q=S.quiz[S.qIdx];
  const isOpen = q.type==='open';
  document.getElementById('questionText').textContent=q.q;
  document.getElementById('questionCounter').textContent=`Pregunta ${S.qIdx+1} de ${S.quiz.length}`;
  document.getElementById('progressBar').style.width=(S.qIdx/S.quiz.length*100)+'%';
  document.getElementById('feedback').className='feedback hidden';

  // Badge de tipo
  const badge=document.getElementById('qTypeBadge');
  badge.textContent=isOpen?'📝 Desarrollo':'⚡ Selección múltiple';
  badge.className='q-type-badge '+(isOpen?'badge-open':'badge-mc');

  const opts=document.getElementById('options'); opts.innerHTML='';

  if (isOpen) {
    // --- PREGUNTA DE DESARROLLO ---
    const ta=document.createElement('textarea');
    ta.className='open-answer'; ta.placeholder='Escribe tu respuesta aquí…'; ta.rows=4;
    opts.appendChild(ta);

    // Acciones para preguntas abiertas
    const actions=document.getElementById('quizActions');
    actions.innerHTML=`
      <button id="showAnswerBtn" class="primary-btn">📖 Ver respuesta modelo</button>
    `;
    document.getElementById('showAnswerBtn').addEventListener('click',()=>{
      const fb=document.getElementById('feedback');
      fb.className='feedback open-reveal';
      fb.innerHTML=`<strong>Respuesta esperada:</strong><br>${q.answer}<br><small style="color:var(--muted)">💡 ${q.hint}</small>`;
      // Reemplazar botón con autoevaluación
      actions.innerHTML=`
        <button id="selfYes" class="self-btn self-yes">✅ Lo supe</button>
        <button id="selfNo"  class="self-btn self-no">❌ No lo supe</button>
      `;
      document.getElementById('selfYes').addEventListener('click',()=>recordOpen(true));
      document.getElementById('selfNo').addEventListener('click',()=>recordOpen(false));
      ta.disabled=true; playSound('correct');
    });

  } else {
    // --- SELECCIÓN MÚLTIPLE ---
    const actions=document.getElementById('quizActions');
    actions.innerHTML=`
      <button id="hintBtn"  class="secondary-btn" style="flex:1">💡 Pista</button>
      <button id="nextBtn"  class="primary-btn"   style="flex:2" disabled>Siguiente →</button>
    `;
    document.getElementById('hintBtn').addEventListener('click',()=>{
      const fb=document.getElementById('feedback');
      fb.className='feedback hint'; fb.innerHTML=`💡 ${q.hint}`;
    });
    document.getElementById('nextBtn').addEventListener('click',advanceQuestion);

    q.options.forEach(opt=>{
      const btn=document.createElement('button');
      btn.className='option-btn'; btn.textContent=opt;
      btn.addEventListener('click',()=>selectAnswer(btn,opt,q.answer,q.hint));
      opts.appendChild(btn);
    });
    document.getElementById('nextBtn').disabled=true;
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
  S.qIdx++;
  if (S.qIdx < S.quiz.length) renderQuestion();
  else showResults();
}

function showResults() {
  const total=S.quiz.length;
  const pct=Math.round(S.score/total*100);
  const [title,msg]=pct===100?['🏆 ¡Perfecto!','¡Dominas el tema!']:pct>=80?['🌟 ¡Muy bien!','Sigue así.']:pct>=60?['👍 ¡Bien!','Hay espacio para mejorar.']:['📚 Sigue practicando','Repasa y vuelve a intentarlo.'];
  document.getElementById('resultTitle').textContent=title;
  document.getElementById('scoreCircle').textContent=pct+'%';
  document.getElementById('scoreCircle').style.background=pct>=80?'var(--success)':pct>=60?'var(--warning)':'var(--danger)';
  document.getElementById('resultMessage').textContent=`${msg} (${S.score}/${total} correctas)`;
  document.getElementById('earnedBadges').innerHTML=`<div class="stars-earned">${starsHtml(pct)} (${Math.ceil(pct/20)}/5 estrellas)</div>`;
  document.getElementById('reviewList').innerHTML=S.answers.map(a=>
    a.type==='open'
      ?`<div class="review-item ${a.ok?'review-correct':'review-wrong'}">
          <span>${a.ok?'✅':'❌'}</span>
          <div><strong>${a.question}</strong><br>
          <span class="review-answer">Resp. esperada: ${a.modelAnswer}</span></div>
        </div>`
      :`<div class="review-item ${a.ok?'review-correct':'review-wrong'}">
          <span>${a.ok?'✅':'❌'}</span>
          <div><strong>${a.question}</strong>${!a.ok?`<br><span class="review-answer">${a.sel} → ${a.correct}</span>`:''}</div>
        </div>`
  ).join('');
  document.getElementById('progressBar').style.width='100%';
  S.lastPct=pct; S.lastOk=S.score; playSound('complete'); showScreen('resultScreen');
}

document.getElementById('finishQuiz').addEventListener('click',()=>{
  saveProgress(S.student,S.quizMeta,S.lastPct,S.lastOk,S.quiz.length);
  renderDashboard(); showScreen('dashboard');
});

// ── 12. ADMIN ────────────────────────────────────────────────
function showAdmin() {
  document.getElementById('pinGate').classList.remove('hidden');
  document.getElementById('adminContent').classList.add('hidden');
  document.getElementById('pinInput').value='';
  document.getElementById('pinError').classList.add('hidden');
  const key=getApiKey();
  document.getElementById('apiKeyStatus').textContent=key?'✅ API Key guardada':'';
  document.getElementById('apiKeyInput').placeholder=key?'sk-ant-… (ya configurada)':'sk-ant-api03-…';
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
document.getElementById('saveApiKey').addEventListener('click',()=>{
  const k=document.getElementById('apiKeyInput').value.trim(); if(!k)return;
  setApiKey(k); document.getElementById('apiKeyStatus').textContent='✅ API Key guardada';
  document.getElementById('apiKeyInput').value=''; document.getElementById('apiKeyInput').placeholder='sk-ant-… (ya configurada)';
});
document.getElementById('resetProgress').addEventListener('click',()=>{
  if(!confirm('⚠️ ¿Borrar TODO el progreso?'))return;
  localStorage.removeItem('prg_santiago'); localStorage.removeItem('prg_benjamin');
  renderHome(); alert('✅ Progreso borrado.');
});

function renderCustomQuizList() {
  const list=document.getElementById('customQuizList');
  let html=''; let totalSantiago=0, totalBenjamin=0;

  ['santiago','benjamin'].forEach(st=>{
    const cq=getCustom(st); const subs=Object.keys(cq); if(!subs.length)return;
    const other = st==='santiago'?'benjamin':'santiago';
    const otherIcon = st==='santiago'?'🦊':'🚀';
    const otherName = st==='santiago'?'Benjamín':'Santiago';
    let count=0;
    subs.forEach(sub=>count+=cq[sub].length);
    if(st==='santiago') totalSantiago=count; else totalBenjamin=count;
    html+=`<div class="custom-student">
      <strong>${st==='santiago'?'🚀 Santiago':'🦊 Benjamín'} <span class="quiz-count">${count} test${count!==1?'s':''}</span></strong>`;
    subs.forEach(sub=>cq[sub].forEach(q=>{
      html+=`<div class="custom-quiz-item">
        <span>${sub} — ${q.title} (${q.questions.length}q)</span>
        <div style="display:flex;gap:4px">
          <button class="copy-btn" data-st="${st}" data-other="${other}" data-sub="${sub}"
            data-t="${encodeURIComponent(q.title)}" title="Copiar a ${otherName}">${otherIcon} Copiar</button>
          <button class="delete-btn" data-st="${st}" data-sub="${sub}"
            data-t="${encodeURIComponent(q.title)}">🗑️</button>
        </div>
      </div>`;
    }));
    html+='</div>';
  });

  if(!html) {
    list.innerHTML='<p class="empty-state">Aún no hay tests generados con IA.</p>';
    return;
  }
  // Summary header
  list.innerHTML=`<div class="quiz-summary">
    <span>🚀 Santiago: <strong>${totalSantiago}</strong></span>
    <span>🦊 Benjamín: <strong>${totalBenjamin}</strong></span>
  </div>`+html;

  list.querySelectorAll('.delete-btn').forEach(btn=>btn.addEventListener('click',()=>{
    const t=decodeURIComponent(btn.dataset.t);
    if(!confirm(`¿Eliminar "${t}"?`))return;
    deleteCustom(btn.dataset.st,btn.dataset.sub,t); renderCustomQuizList();
  }));

  list.querySelectorAll('.copy-btn').forEach(btn=>btn.addEventListener('click',()=>{
    const t=decodeURIComponent(btn.dataset.t);
    const src=getCustom(btn.dataset.st)[btn.dataset.sub]?.find(q=>q.title===t);
    if(!src)return;
    saveCustom(btn.dataset.other, btn.dataset.sub, {title:src.title, questions:src.questions});
    renderCustomQuizList();
    if(S.student===btn.dataset.other) renderDashboard();
    const otherName=btn.dataset.other==='santiago'?'Santiago':'Benjamín';
    alert(`✅ "${t}" copiado a ${otherName}.`);
  }));
}

// ── 13. SINCRONIZACIÓN REMOTA (data.json en GitHub) ─────────

// Carga tests desde GitHub Pages (disponible en todos los dispositivos)
async function loadRemoteData() {
  try {
    const r = await fetch(`${PORTAL_URL}/data.json?_=${Date.now()}`);
    if (!r.ok) return;
    const remote = await r.json();
    if (Object.keys(remote).length > 0) {
      // Merge: remoto tiene prioridad sobre caché local
      localStorage.setItem('custom', JSON.stringify(remote));
    }
  } catch(e) { /* usa caché localStorage si no hay red */ }
}

// Sube todos los tests a GitHub → visible en todos los dispositivos
async function pushRemoteData() {
  const token = getGhToken();
  if (!token) return;                                    // sin token = solo local
  const statusEl = document.getElementById('ghSyncStatus');
  if (statusEl) { statusEl.classList.remove('hidden'); statusEl.textContent = '⏳ Guardando en todos los dispositivos…'; }
  try {
    const all     = JSON.parse(localStorage.getItem('custom') || '{}');
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(all, null, 2))));
    // Obtener SHA actual de data.json (necesario para actualizarlo)
    const metaR = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/data.json`,
      { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github+json' } });
    const meta  = await metaR.json();
    const body  = { message:'Portal: update tests', content };
    if (meta.sha) body.sha = meta.sha;
    const putR = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/data.json`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github+json' },
      body: JSON.stringify(body)
    });
    if (statusEl) {
      statusEl.textContent = putR.ok
        ? '✅ Sincronizado — disponible en todos los dispositivos'
        : '⚠️ Error al sincronizar: ' + (await putR.json().then(d=>d.message).catch(()=>''));
    }
  } catch(e) {
    if (statusEl) statusEl.textContent = '⚠️ Sin conexión — guardado solo en este dispositivo';
  }
}

// ── 14. PDF → CLAUDE API (con retry en rate limit) ──────────
function fileToBase64(file) {
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(file); });
}

function addPdfs(fileList) {
  Array.from(fileList).forEach(f=>{
    if(f.type!=='application/pdf')return;
    if(_pdfs.some(p=>p.file.name===f.name))return;
    const title=f.name.replace(/\.pdf$/i,'').replace(/[-_]/g,' ').trim();
    _pdfs.push({file:f,title});
  });
  renderPdfList();
  document.getElementById('generateBtn').disabled=_pdfs.length===0;
}

function renderPdfList() {
  const el=document.getElementById('pdfList');
  if(!_pdfs.length){el.innerHTML='';return;}
  el.innerHTML=_pdfs.map((p,i)=>`
    <div class="pdf-item">
      <span>📄</span>
      <div style="flex:1">
        <input class="pdf-title-inp" data-i="${i}" value="${p.title.replace(/"/g,'&quot;')}" placeholder="Título del test"/>
        <small style="color:var(--muted);font-size:.72rem">${p.file.name} · ${(p.file.size/1024).toFixed(0)} KB</small>
      </div>
      <button class="delete-btn pdf-rm" data-i="${i}">✕</button>
    </div>`).join('');
  el.querySelectorAll('.pdf-title-inp').forEach(inp=>inp.addEventListener('input',()=>{_pdfs[+inp.dataset.i].title=inp.value;}));
  el.querySelectorAll('.pdf-rm').forEach(btn=>btn.addEventListener('click',()=>{
    _pdfs.splice(+btn.dataset.i,1); renderPdfList();
    document.getElementById('generateBtn').disabled=_pdfs.length===0;
  }));
}

function buildPrompt(grade, numQ, tipo) {
  const instrMC  = `- Selección múltiple: exactamente 4 opciones, una correcta, campo "type":"mc"`;
  const instrOpen= `- Desarrollo: pregunta abierta con respuesta esperada breve (2-3 líneas), campo "type":"open"`;
  let breakdown;
  if      (tipo==='mc')    { breakdown = `Las ${numQ} preguntas deben ser de selección múltiple.\n${instrMC}`; }
  else if (tipo==='open')  { breakdown = `Las ${numQ} preguntas deben ser de desarrollo.\n${instrOpen}`; }
  else { // mixed
    const half=Math.round(numQ/2);
    breakdown = `Genera ${half} preguntas de selección múltiple y ${numQ-half} de desarrollo.\n${instrMC}\n${instrOpen}`;
  }
  return `Eres un experto en educación chilena. Genera exactamente ${numQ} preguntas para un estudiante de ${grade} basándote en este documento.

${breakdown}

Pistas: breves, sin revelar la respuesta directamente.
RESPONDE SOLO con JSON válido, sin texto adicional ni markdown:

[
  {"type":"mc","q":"pregunta","options":["A","B","C","D"],"answer":"opción correcta exacta","hint":"pista"},
  {"type":"open","q":"pregunta de desarrollo","answer":"respuesta esperada","hint":"pista"}
]`;
}

async function generateQuizFromPdf(apiKey, file, grade, numQ, tipo) {
  const b64=await fileToBase64(file);
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({
      model:MODEL, max_tokens:8000,
      messages:[{role:'user',content:[
        {type:'document',source:{type:'base64',media_type:'application/pdf',data:b64}},
        {type:'text',text:buildPrompt(grade,numQ,tipo)}
      ]}]
    })
  });
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||`HTTP ${r.status}`);}
  const d=await r.json();
  const raw=d.content[0].text.trim().replace(/^```json\s*/i,'').replace(/\s*```$/,'').trim();
  return parseJsonBestEffort(raw);
}

// Intenta parsear JSON completo; si está truncado, rescata los objetos completos
function parseJsonBestEffort(text) {
  try { return JSON.parse(text); } catch(e) {
    // Extraer objetos JSON completos del array truncado
    const items=[]; let depth=0, start=-1;
    for(let i=0;i<text.length;i++){
      if(text[i]==='{'){if(depth===0)start=i;depth++;}
      else if(text[i]==='}'){depth--;if(depth===0&&start>=0){
        try{items.push(JSON.parse(text.slice(start,i+1)));}catch(_){}
        start=-1;
      }}
    }
    if(items.length>0){console.warn(`JSON truncado: se rescataron ${items.length} preguntas.`);return items;}
    throw new Error('No se pudo parsear la respuesta. Intenta con menos preguntas.');
  }
}

// Retry automático si hay rate limit
async function generateWithRetry(apiKey, file, grade, numQ, tipo, updateMsg) {
  for (let attempt=0; attempt<3; attempt++) {
    try {
      return await generateQuizFromPdf(apiKey,file,grade,numQ,tipo);
    } catch(err) {
      const isRateLimit = err.message.toLowerCase().includes('rate limit') || err.message.includes('10,000');
      if (isRateLimit && attempt<2) {
        // Esperar 65 segundos con cuenta regresiva
        for (let s=65; s>0; s--) {
          updateMsg(`⏳ Límite de API alcanzado. Reintentando en ${s}s…`);
          await sleep(1000);
        }
        updateMsg(`🔄 Reintentando…`);
      } else {
        throw err;
      }
    }
  }
}

// PDF zone listeners
document.getElementById('pdfPickBtn').addEventListener('click',()=>document.getElementById('pdfInput').click());
document.getElementById('pdfInput').addEventListener('change',e=>addPdfs(e.target.files));
const _pz=document.getElementById('pdfZone');
_pz.addEventListener('dragover', e=>{e.preventDefault();_pz.classList.add('drag-over');});
_pz.addEventListener('dragleave',()=>_pz.classList.remove('drag-over'));
_pz.addEventListener('drop',e=>{e.preventDefault();_pz.classList.remove('drag-over');addPdfs(e.dataTransfer.files);});

// Generate
document.getElementById('generateBtn').addEventListener('click',async()=>{
  const key=getApiKey(); if(!key){alert('⚠️ Configura tu API Key primero.');return;}
  const subject=document.getElementById('adminSubject').value.trim(); if(!subject){alert('⚠️ Escribe el nombre de la materia.');return;}
  const student=document.getElementById('adminStudent').value;
  const numQ=parseInt(document.getElementById('adminNumQ').value);
  const tipo=document.getElementById('adminQType').value;
  const grade=student==='santiago'?'4° básico':'3° básico';
  const msgEl=document.getElementById('genMsg'), statusEl=document.getElementById('genStatus'), resultEl=document.getElementById('genResult');
  const updateMsg=t=>{ msgEl.textContent=t; };
  statusEl.classList.remove('hidden'); resultEl.classList.add('hidden');
  document.getElementById('generateBtn').disabled=true;
  let saved=0, failed=[];
  for(let i=0;i<_pdfs.length;i++){
    const {file,title}=_pdfs[i];
    updateMsg(`Procesando ${i+1}/${_pdfs.length}: ${title}…`);
    try{
      const qs=await generateWithRetry(key,file,grade,numQ,tipo,updateMsg);
      saveCustom(student,subject,{title,questions:qs}); saved++;
    }catch(err){ failed.push(`${title}: ${err.message}`); }
    // Pausa entre archivos para evitar rate limit
    if(i<_pdfs.length-1){
      // Pausa larga entre PDFs: el límite es 10.000 tokens/min de entrada
      // PDFs grandes pueden usar casi todo ese límite por sí solos
      for(let s=65;s>0;s--){
        updateMsg(`⏳ Pausa entre PDFs (${s}s) para no superar el límite de la API…`);
        await sleep(1000);
      }
    }
  }
  statusEl.classList.add('hidden'); document.getElementById('generateBtn').disabled=false;
  const name=student==='santiago'?'Santiago':'Benjamín';
  resultEl.className='gen-result '+(failed.length&&!saved?'result-error':'result-ok');
  resultEl.innerHTML=(saved?`✅ ${saved} test${saved>1?'s':''} guardado${saved>1?'s':''} para ${name} en <strong>${subject}</strong>.<br>`:'')+(failed.length?`❌ ${failed.join('<br>')}`: '');
  resultEl.classList.remove('hidden');
  if(saved){_pdfs=[];renderPdfList();document.getElementById('adminSubject').value='';renderCustomQuizList();if(S.student===student)renderDashboard();}
});

// ── 14. GLOBAL LISTENERS ─────────────────────────────────────
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

// ── 16. INIT ─────────────────────────────────────────────────
(async function init(){
  applyTheme();
  document.getElementById('soundToggle').textContent=getSettings().sound?'🔊 Sonido: ON':'🔇 Sonido: OFF';
  // Cargar tests remotos (con timeout de 4s para no bloquear si hay red lenta)
  try { await Promise.race([loadRemoteData(), sleep(4000)]); } catch(e) {}
  renderHome();

  // GitHub token admin listeners
  document.getElementById('saveGhToken').addEventListener('click',()=>{
    const t=document.getElementById('ghTokenInput').value.trim(); if(!t)return;
    setGhToken(t);
    document.getElementById('ghTokenStatus').textContent='✅ Token guardado — la sincronización está activa';
    document.getElementById('ghTokenStatus').style.color='var(--success)';
    document.getElementById('ghTokenInput').value='';
    document.getElementById('ghTokenInput').placeholder='ghp_… (ya configurado)';
  });
})();
