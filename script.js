/* ============================================================
   PORTAL DE ESTUDIOS VERA — script.js v2.1 (clean)
   ============================================================ */

// ── 1. DATOS BASE ────────────────────────────────────────────
const BUILTIN = {
  santiago: {
    'Matemáticas': [
      { title:'Multiplicaciones rápidas', questions:[
        {q:'7 × 8',  options:['54','56','48','64'], answer:'56', hint:'7 grupos de 8.'},
        {q:'9 × 6',  options:['56','48','54','42'], answer:'54', hint:'9 veces 6.'},
        {q:'12 × 4', options:['44','48','52','42'], answer:'48', hint:'4 grupos de 12.'},
        {q:'15 × 3', options:['30','45','60','35'], answer:'45', hint:'3 grupos de 15.'},
        {q:'11 × 7', options:['77','66','88','70'], answer:'77', hint:'11 veces 7.'}
      ]},
      { title:'Fracciones básicas', questions:[
        {q:'¿Cuál fracción es la mitad?', options:['1/2','1/3','2/5','3/4'], answer:'1/2', hint:'Dividir en dos partes iguales.'},
        {q:'2/4 equivale a:', options:['1/2','1/3','3/4','2/3'], answer:'1/2', hint:'Simplifica dividiendo entre 2.'},
        {q:'3/6 simplificado es:', options:['1/2','1/3','2/3','3/4'], answer:'1/2', hint:'Divide ambos entre 3.'}
      ]}
    ],
    'Historia': [
      { title:'Chile y sus regiones', questions:[
        {q:'¿Capital de Chile?', options:['Valparaíso','Concepción','Santiago','Temuco'], answer:'Santiago', hint:'Donde está La Moneda.'},
        {q:'¿Cuántas regiones tiene Chile?', options:['12','14','16','18'], answer:'16', hint:'Más de 15.'},
        {q:'¿Región más austral?', options:['Los Lagos','Aysén','Magallanes','Biobío'], answer:'Magallanes', hint:'Cercana a la Antártica.'}
      ]}
    ],
    'Ciencias': [
      { title:'Sistema solar', questions:[
        {q:'¿El planeta rojo?', options:['Venus','Marte','Júpiter','Saturno'], answer:'Marte', hint:'Color rojizo.'},
        {q:'¿La estrella del sistema solar?', options:['La Luna','Marte','El Sol','Venus'], answer:'El Sol', hint:'Nos da luz y calor.'},
        {q:'¿El planeta con anillos famosos?', options:['Júpiter','Urano','Saturno','Neptuno'], answer:'Saturno', hint:'Sus anillos son de hielo.'}
      ]}
    ]
  },
  benjamin: {
    'Matemáticas': [
      { title:'Sumas y restas', questions:[
        {q:'45 + 27',  options:['62','72','82','70'], answer:'72',  hint:'Suma decenas y unidades.'},
        {q:'90 - 38',  options:['62','52','58','42'], answer:'52',  hint:'Resta 30 y luego 8.'},
        {q:'8 × 7',    options:['54','48','56','64'], answer:'56',  hint:'7 grupos de 8.'},
        {q:'120 + 35', options:['145','155','165','150'], answer:'155', hint:'Suma centenas y decenas.'}
      ]},
      { title:'Geometría básica', questions:[
        {q:'¿Lados de un triángulo?', options:['2','3','4','5'], answer:'3', hint:'La pista está en el nombre.'},
        {q:'¿Figura con 4 lados iguales?', options:['Triángulo','Rectángulo','Cuadrado','Círculo'], answer:'Cuadrado', hint:'Como una caja perfecta.'},
        {q:'¿Lados de un hexágono?', options:['5','6','7','8'], answer:'6', hint:'Hexa = seis en griego.'}
      ]}
    ],
    'Lenguaje': [
      { title:'Sinónimos y antónimos', questions:[
        {q:'¿Qué es un sinónimo?', options:['Palabra igual','Palabra opuesta','Animal','Número'], answer:'Palabra igual', hint:'Significa parecido.'},
        {q:'¿Qué es un antónimo?', options:['Palabra parecida','Palabra opuesta','Una oración','Un cuento'], answer:'Palabra opuesta', hint:'Es lo contrario.'}
      ]},
      { title:'Ortografía básica', questions:[
        {q:'¿Cuál está bien escrita?', options:['havion','avión','abión','avíon'], answer:'avión', hint:'Lleva tilde en la ó.'},
        {q:'¿Cuál está bien escrita?', options:['vaca','baca','vaka','bacca'], answer:'vaca', hint:'Se escribe con V.'}
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
const S = { student:'', quiz:[], quizMeta:{}, qIdx:0, score:0, answers:[], lastPct:0, lastOk:0, subject:'' };
let _quizCache = [];
let _pdfs      = [];  // [{file, title}] para el admin
let audioCtx   = null;

// ── 3. STORAGE ───────────────────────────────────────────────
function getProgress(st) {
  const d = {quizHistory:[],streak:0,lastStudyDate:null,totalCompleted:0,totalStars:0,bestScore:0};
  const r = localStorage.getItem('prg_'+st);
  return r ? {...d,...JSON.parse(r)} : d;
}
function saveProgress(st, meta, pct, ok, total) {
  const p = getProgress(st);
  const td = toDay();
  const stars = Math.ceil(pct/20);
  if (p.lastStudyDate !== td) {
    const yd = new Date(Date.now()-86400000).toISOString().slice(0,10);
    p.streak = (p.lastStudyDate===yd) ? p.streak+1 : 1;
    p.lastStudyDate = td;
  }
  p.quizHistory.push({quizId:meta.id,subject:meta.subject,title:meta.title,date:td,score:pct,ok,total,stars});
  p.totalCompleted++; p.totalStars+=stars; p.bestScore=Math.max(p.bestScore,pct);
  localStorage.setItem('prg_'+st, JSON.stringify(p));
}
function getCustom(st)              { const r=localStorage.getItem('custom'); return r ? JSON.parse(r)[st]||{} : {}; }
function saveCustom(st,subject,quiz) {
  const r=localStorage.getItem('custom'); const all=r?JSON.parse(r):{};
  if(!all[st])all[st]={}; if(!all[st][subject])all[st][subject]=[];
  all[st][subject].push(quiz); localStorage.setItem('custom',JSON.stringify(all));
}
function deleteCustom(st,subject,title) {
  const r=localStorage.getItem('custom'); if(!r)return;
  const all=JSON.parse(r);
  if(all[st]?.[subject]){ all[st][subject]=all[st][subject].filter(q=>q.title!==title);
    if(!all[st][subject].length)delete all[st][subject];
    if(!Object.keys(all[st]).length)delete all[st]; }
  localStorage.setItem('custom',JSON.stringify(all));
}
function getSettings() { return JSON.parse(localStorage.getItem('cfg')||'{"theme":"light","sound":true,"pin":"1234"}'); }
function setSetting(k,v){ const s=getSettings(); s[k]=v; localStorage.setItem('cfg',JSON.stringify(s)); }
function getApiKey()    { return localStorage.getItem('api_key')||''; }
function setApiKey(k)   { localStorage.setItem('api_key',k); }

// ── 4. UTILS ─────────────────────────────────────────────────
function toDay()         { return new Date().toISOString().slice(0,10); }
function allSubjects(st) { return [...new Set([...Object.keys(BUILTIN[st]||{}),...Object.keys(getCustom(st))])]; }
function allQuizzes(st,s){ return [...(BUILTIN[st]||{})[s]||[], ...getCustom(st)[s]||[]]; }
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
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value=freq;
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
      <span class="rank-count">${r.p.totalCompleted} quiz</span>
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
  el.innerHTML=sugg.length===0
    ?'<li class="plan-done">✅ ¡Todo listo por hoy!</li>'
    :sugg.map(s=>`<li class="plan-item" data-s="${s}">📖 ${s}</li>`).join('');
  el.querySelectorAll('.plan-item').forEach(li=>li.addEventListener('click',()=>openSubject(li.dataset.s)));
}

function renderSubjectGrid(st) {
  const p=getProgress(st);
  const studied=new Set((p.quizHistory||[]).map(h=>h.subject));
  const grid=document.getElementById('subjectGrid');
  grid.innerHTML=allSubjects(st).map(s=>`
    <button class="subject-card ${studied.has(s)?'studied':''}" data-s="${s}">
      <span class="subject-icon">${ICONS[s]||'📚'}</span>
      <h3>${s}</h3>
      <p>${allQuizzes(st,s).length} quizzes</p>
      ${studied.has(s)?'<span class="studied-badge">✓</span>':''}
    </button>`).join('');
  grid.querySelectorAll('.subject-card').forEach(btn=>btn.addEventListener('click',()=>openSubject(btn.dataset.s)));
}

// ── 10. QUIZ LIST ────────────────────────────────────────────
function openSubject(subject) {
  S.subject=subject;
  document.getElementById('subjectTitle').textContent=subject;
  document.getElementById('quizStudentLabel').textContent=S.student==='santiago'?'Santiago':'Benjamín';
  const p=getProgress(S.student);
  _quizCache=allQuizzes(S.student,subject);
  const container=document.getElementById('quizCards');
  container.innerHTML=_quizCache.length===0
    ?'<p class="empty-state">Sin quizzes aún. Agrégalos desde ⚙️ Admin.</p>'
    :_quizCache.map((q,i)=>{
      const hist=(p.quizHistory||[]).filter(h=>h.quizId===quizId(S.student,subject,q.title));
      const best=hist.length?Math.max(...hist.map(h=>h.score)):null;
      const isAI=!(BUILTIN[S.student]?.[subject]?.some(b=>b.title===q.title));
      return `<button class="quiz-card" data-i="${i}">
        <div class="quiz-card-header"><h3>${q.title}</h3>${isAI?'<span class="custom-badge">✨ IA</span>':''}</div>
        <p>${q.questions.length} pregunta${q.questions.length!==1?'s':''}</p>
        ${best!==null?`<div class="quiz-history"><span>Mejor: ${best}%</span><span>${starsHtml(best)}</span></div>`:'<p class="quiz-new">✦ Nuevo</p>'}
      </button>`;
    }).join('');
  container.querySelectorAll('.quiz-card').forEach(btn=>
    btn.addEventListener('click',()=>startQuiz(_quizCache[+btn.dataset.i],subject)));
  showScreen('quizList');
}

// ── 11. QUIZ ENGINE ──────────────────────────────────────────
function startQuiz(quiz,subject) {
  S.quiz=quiz.questions; S.quizMeta={id:quizId(S.student,subject,quiz.title),subject,title:quiz.title};
  S.qIdx=0; S.score=0; S.answers=[];
  document.getElementById('quizTitle').textContent=quiz.title;
  document.getElementById('quizMeta').textContent=subject+' · '+(S.student==='santiago'?'Santiago':'Benjamín');
  showScreen('quizScreen'); renderQuestion();
}

function renderQuestion() {
  const q=S.quiz[S.qIdx];
  document.getElementById('questionText').textContent=q.q;
  document.getElementById('questionCounter').textContent=`Pregunta ${S.qIdx+1} de ${S.quiz.length}`;
  document.getElementById('progressBar').style.width=(S.qIdx/S.quiz.length*100)+'%';
  document.getElementById('feedback').className='feedback hidden';
  document.getElementById('nextBtn').disabled=true;
  const opts=document.getElementById('options'); opts.innerHTML='';
  q.options.forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='option-btn'; btn.textContent=opt;
    btn.addEventListener('click',()=>selectAnswer(btn,opt,q.answer,q.hint));
    opts.appendChild(btn);
  });
}

function selectAnswer(btn,sel,correct,hint) {
  document.querySelectorAll('.option-btn').forEach(b=>b.disabled=true);
  const ok=sel===correct;
  if(ok){btn.classList.add('correct');S.score++;playSound('correct');}
  else{btn.classList.add('wrong');document.querySelectorAll('.option-btn').forEach(b=>{if(b.textContent===correct)b.classList.add('correct');});playSound('wrong');}
  S.answers.push({question:S.quiz[S.qIdx].q,sel,correct,ok});
  const fb=document.getElementById('feedback');
  fb.className='feedback '+(ok?'good':'bad');
  fb.innerHTML=ok?'✅ ¡Correcto!':`❌ Correcto: <strong>${correct}</strong><br><small>💡 ${hint}</small>`;
  document.getElementById('nextBtn').disabled=false;
}

document.getElementById('nextBtn').addEventListener('click',()=>{
  S.qIdx++; if(S.qIdx<S.quiz.length) renderQuestion(); else showResults();
});
document.getElementById('hintBtn').addEventListener('click',()=>{
  const fb=document.getElementById('feedback');
  fb.className='feedback hint'; fb.innerHTML=`💡 ${S.quiz[S.qIdx].hint}`;
});

function showResults() {
  const pct=Math.round(S.score/S.quiz.length*100);
  const [title,msg]=pct===100?['🏆 ¡Perfecto!','¡Dominas el tema!']:pct>=80?['🌟 ¡Muy bien!','Sigue así.']:pct>=60?['👍 ¡Bien!','Hay espacio para mejorar.']:['📚 Sigue practicando','Repasa y vuelve a intentarlo.'];
  document.getElementById('resultTitle').textContent=title;
  document.getElementById('scoreCircle').textContent=pct+'%';
  document.getElementById('scoreCircle').style.background=pct>=80?'var(--success)':pct>=60?'var(--warning)':'var(--danger)';
  document.getElementById('resultMessage').textContent=msg;
  document.getElementById('earnedBadges').innerHTML=`<div class="stars-earned">${starsHtml(pct)} (${Math.ceil(pct/20)}/5 estrellas)</div>`;
  document.getElementById('reviewList').innerHTML=S.answers.map(a=>
    `<div class="review-item ${a.ok?'review-correct':'review-wrong'}">
      <span>${a.ok?'✅':'❌'}</span>
      <div><strong>${a.question}</strong>${!a.ok?`<br><span class="review-answer">${a.sel} → ${a.correct}</span>`:''}</div>
    </div>`).join('');
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
  setApiKey(k);
  document.getElementById('apiKeyStatus').textContent='✅ API Key guardada';
  document.getElementById('apiKeyInput').value='';
  document.getElementById('apiKeyInput').placeholder='sk-ant-… (ya configurada)';
});

document.getElementById('resetProgress').addEventListener('click',()=>{
  if(!confirm('⚠️ ¿Borrar TODO el progreso?'))return;
  localStorage.removeItem('prg_santiago'); localStorage.removeItem('prg_benjamin');
  renderHome(); alert('✅ Progreso borrado.');
});

function renderCustomQuizList() {
  const list=document.getElementById('customQuizList'); let html='';
  ['santiago','benjamin'].forEach(st=>{
    const cq=getCustom(st); const subs=Object.keys(cq); if(!subs.length)return;
    html+=`<div class="custom-student"><strong>${st==='santiago'?'🚀 Santiago':'🦊 Benjamín'}</strong>`;
    subs.forEach(sub=>cq[sub].forEach(q=>{
      html+=`<div class="custom-quiz-item"><span>${sub} — ${q.title} (${q.questions.length}q)</span>
        <button class="delete-btn" data-st="${st}" data-sub="${sub}" data-t="${encodeURIComponent(q.title)}">🗑️</button></div>`;
    }));
    html+='</div>';
  });
  list.innerHTML=html||'<p class="empty-state">Aún no hay quizzes generados con IA.</p>';
  list.querySelectorAll('.delete-btn').forEach(btn=>btn.addEventListener('click',()=>{
    const t=decodeURIComponent(btn.dataset.t);
    if(!confirm(`¿Eliminar "${t}"?`))return;
    deleteCustom(btn.dataset.st,btn.dataset.sub,t); renderCustomQuizList();
  }));
}

// ── 13. PDF → CLAUDE API ─────────────────────────────────────
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
        <input class="pdf-title-inp" data-i="${i}" value="${p.title.replace(/"/g,'&quot;')}" placeholder="Título del quiz"/>
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

async function generateQuizFromPdf(apiKey,file,grade,numQ) {
  const b64=await fileToBase64(file);
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({
      model:'claude-sonnet-4-6', max_tokens:2000,
      messages:[{role:'user',content:[
        {type:'document',source:{type:'base64',media_type:'application/pdf',data:b64}},
        {type:'text',text:`Eres un experto en educación chilena. Genera exactamente ${numQ} preguntas de selección múltiple para un estudiante de ${grade} basándote en este documento.
RESPONDE SOLO con JSON válido, sin texto adicional:
[{"q":"pregunta","options":["A","B","C","D"],"answer":"opción correcta exacta","hint":"pista"}]`}
      ]}]
    })
  });
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||`HTTP ${r.status}`);}
  const d=await r.json();
  return JSON.parse(d.content[0].text.trim().replace(/^```json\s*/i,'').replace(/\s*```$/,'').trim());
}

// PDF zone listeners
document.getElementById('pdfPickBtn').addEventListener('click',()=>document.getElementById('pdfInput').click());
document.getElementById('pdfInput').addEventListener('change',e=>addPdfs(e.target.files));
const _pz=document.getElementById('pdfZone');
_pz.addEventListener('dragover', e=>{e.preventDefault();_pz.classList.add('drag-over');});
_pz.addEventListener('dragleave',()=>_pz.classList.remove('drag-over'));
_pz.addEventListener('drop',e=>{e.preventDefault();_pz.classList.remove('drag-over');addPdfs(e.dataTransfer.files);});

// Generate button
document.getElementById('generateBtn').addEventListener('click',async()=>{
  const key=getApiKey(); if(!key){alert('⚠️ Configura tu API Key primero.');return;}
  const subject=document.getElementById('adminSubject').value.trim(); if(!subject){alert('⚠️ Escribe el nombre de la materia.');return;}
  const student=document.getElementById('adminStudent').value;
  const numQ=parseInt(document.getElementById('adminNumQ').value);
  const grade=student==='santiago'?'4° básico (10 años)':'3° básico (9 años)';
  const statusEl=document.getElementById('genStatus'), msgEl=document.getElementById('genMsg'), resultEl=document.getElementById('genResult');
  statusEl.classList.remove('hidden'); resultEl.classList.add('hidden');
  document.getElementById('generateBtn').disabled=true;
  let saved=0, failed=[];
  for(let i=0;i<_pdfs.length;i++){
    const {file,title}=_pdfs[i];
    msgEl.textContent=`Procesando ${i+1}/${_pdfs.length}: ${title}…`;
    try{const qs=await generateQuizFromPdf(key,file,grade,numQ); saveCustom(student,subject,{title,questions:qs}); saved++;}
    catch(err){failed.push(`${title}: ${err.message}`);}
  }
  statusEl.classList.add('hidden'); document.getElementById('generateBtn').disabled=false;
  const name=student==='santiago'?'Santiago':'Benjamín';
  resultEl.className='gen-result '+(failed.length&&!saved?'result-error':'result-ok');
  resultEl.innerHTML=(saved?`✅ ${saved} quiz${saved>1?'zes':''} guardado${saved>1?'s':''} para ${name} en <strong>${subject}</strong>.<br>`:'')+(failed.length?`❌ ${failed.join(', ')}`: '');
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
document.getElementById('backFromAdmin').addEventListener('click',()=>{ if(S.student){renderDashboard();showScreen('dashboard');}else{renderHome();showScreen('home');} });
document.getElementById('adminBtn').addEventListener('click',showAdmin);
document.getElementById('dashAdminBtn').addEventListener('click',showAdmin);
document.getElementById('themeToggle').addEventListener('click',()=>{const c=getSettings().theme;setSetting('theme',c==='dark'?'light':'dark');applyTheme();});
document.getElementById('soundToggle').addEventListener('click',()=>{const c=getSettings().sound;setSetting('sound',!c);document.getElementById('soundToggle').textContent=c?'🔇 Sonido: OFF':'🔊 Sonido: ON';});

// ── 15. INIT ─────────────────────────────────────────────────
(function init(){
  applyTheme();
  const s=getSettings();
  document.getElementById('soundToggle').textContent=s.sound?'🔊 Sonido: ON':'🔇 Sonido: OFF';
  renderHome();
})();
