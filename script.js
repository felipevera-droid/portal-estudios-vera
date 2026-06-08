/* ============================================================
   PORTAL DE ESTUDIOS VERA — script.js v2.0
   ============================================================ */

// ============================================================
// 1. DATOS BASE (quizzes incorporados)
// ============================================================
const BUILTIN = {
  santiago: {
    'Matemáticas': [
      { title: 'Multiplicaciones rápidas', questions: [
        { q:'7 × 8',  options:['54','56','48','64'],  answer:'56',  hint:'Piensa en 7 grupos de 8.' },
        { q:'9 × 6',  options:['56','48','54','42'],  answer:'54',  hint:'9 veces 6.' },
        { q:'12 × 4', options:['44','48','52','42'],  answer:'48',  hint:'4 grupos de 12.' },
        { q:'15 × 3', options:['30','45','60','35'],  answer:'45',  hint:'3 grupos de 15.' },
        { q:'11 × 7', options:['77','66','88','70'],  answer:'77',  hint:'11 veces 7.' },
        { q:'6 × 9',  options:['54','48','63','56'],  answer:'54',  hint:'6 grupos de 9.' }
      ]},
      { title: 'Fracciones y equivalencias', questions: [
        { q:'¿Cuál fracción representa la mitad?',   options:['1/2','1/3','2/5','3/4'], answer:'1/2', hint:'Es dividir en dos partes iguales.' },
        { q:'2/4 es equivalente a:',                 options:['1/2','1/3','3/4','2/3'], answer:'1/2', hint:'Simplifica dividiendo entre 2.' },
        { q:'¿Cuánto es 3/6 simplificado?',          options:['1/2','1/3','2/3','3/4'], answer:'1/2', hint:'Divide numerador y denominador entre 3.' }
      ]}
    ],
    'Historia': [
      { title: 'Chile y sus regiones', questions: [
        { q:'¿Cuál es la capital de Chile?',           options:['Valparaíso','Concepción','Santiago','Temuco'], answer:'Santiago', hint:'Es donde está La Moneda.' },
        { q:'¿Cuántas regiones tiene Chile?',           options:['12','14','16','18'],                          answer:'16',       hint:'Más de 15.' },
        { q:'¿Cuál es la región más austral de Chile?', options:['Los Lagos','Aysén','Magallanes','Biobío'],    answer:'Magallanes', hint:'Es la más cercana a la Antártica.' }
      ]}
    ],
    'Ciencias': [
      { title: 'Sistema solar', questions: [
        { q:'¿Qué planeta es el planeta rojo?',       options:['Venus','Marte','Júpiter','Saturno'],    answer:'Marte',   hint:'Tiene color rojizo.' },
        { q:'¿Cuál es la estrella del sistema solar?',options:['La Luna','Marte','El Sol','Venus'],     answer:'El Sol',  hint:'Nos da luz y calor.' },
        { q:'¿Qué planeta tiene anillos famosos?',    options:['Júpiter','Urano','Saturno','Neptuno'],  answer:'Saturno', hint:'Sus anillos son de hielo.' }
      ]}
    ]
  },
  benjamin: {
    'Matemáticas': [
      { title: 'Sumas y restas', questions: [
        { q:'45 + 27',  options:['62','72','82','70'], answer:'72',  hint:'Suma decenas y unidades.' },
        { q:'90 - 38',  options:['62','52','58','42'], answer:'52',  hint:'Primero resta 30, luego 8.' },
        { q:'8 × 7',    options:['54','48','56','64'], answer:'56',  hint:'7 grupos de 8.' },
        { q:'120 + 35', options:['145','155','165','150'], answer:'155', hint:'Suma centenas y decenas.' }
      ]},
      { title: 'Geometría básica', questions: [
        { q:'¿Cuántos lados tiene un triángulo?',        options:['2','3','4','5'],                          answer:'3',         hint:'La pista está en el nombre.' },
        { q:'¿Qué figura tiene 4 lados iguales?',        options:['Triángulo','Rectángulo','Cuadrado','Círculo'], answer:'Cuadrado', hint:'Parece una caja perfecta.' },
        { q:'¿Cuántos lados tiene un hexágono?',         options:['5','6','7','8'],                          answer:'6',         hint:'Hexa = seis en griego.' }
      ]}
    ],
    'Lenguaje': [
      { title: 'Comprensión lectora', questions: [
        { q:'¿Qué es un sinónimo?', options:['Palabra igual','Palabra opuesta','Animal','Número'], answer:'Palabra igual',   hint:'Significa parecido.' },
        { q:'¿Qué es un antónimo?', options:['Palabra parecida','Palabra opuesta','Una oración','Un cuento'], answer:'Palabra opuesta', hint:'Es lo contrario.' }
      ]},
      { title: 'Ortografía básica', questions: [
        { q:'¿Cuál palabra está bien escrita?', options:['havion','avión','abión','avíon'],   answer:'avión',    hint:'Lleva tilde en la ó.' },
        { q:'¿Cuál está bien escrita?',          options:['vaca','baca','vaka','bacca'],       answer:'vaca',     hint:'Escríbela como suena, con V.' },
        { q:'¿Cuál está bien escrita?',          options:['niño','nino','ñiño','niño'],        answer:'niño',     hint:'Lleva ñ en el medio.' }
      ]}
    ]
  }
};

// ============================================================
// 2. LOGROS (BADGES)
// ============================================================
const BADGES = [
  { id:'first',    icon:'🌟', name:'Primera estrella', desc:'Completar el primer quiz',  check: p => p.totalCompleted >= 1  },
  { id:'perfect',  icon:'💯', name:'¡Perfecto!',       desc:'100% en un quiz',           check: p => p.bestScore >= 100     },
  { id:'streak3',  icon:'🔥', name:'En racha',         desc:'3 días seguidos',           check: p => p.streak >= 3         },
  { id:'quiz5',    icon:'📚', name:'Estudioso',        desc:'Completar 5 quizzes',       check: p => p.totalCompleted >= 5  },
  { id:'quiz10',   icon:'🎓', name:'Académico',        desc:'Completar 10 quizzes',      check: p => p.totalCompleted >= 10 },
  { id:'stars20',  icon:'✨', name:'Coleccionista',    desc:'Juntar 20 estrellas',       check: p => p.totalStars >= 20    },
];

// ============================================================
// 3. ESTADO GLOBAL
// ============================================================
const S = {
  student:   '',
  quiz:      [],
  quizMeta:  {},
  qIdx:      0,
  score:     0,
  answers:   [],
  lastPct:   0,
  lastOk:    0,
  subject:   '',
  pendingQ:  null,
};
let _quizListCache = [];
let audioCtx = null;

// ============================================================
// 4. HELPERS STORAGE
// ============================================================
function getProgress(st) {
  const def = { quizHistory:[], streak:0, lastStudyDate:null, totalCompleted:0, totalStars:0, bestScore:0 };
  const raw = localStorage.getItem('prg_'+st);
  return raw ? {...def, ...JSON.parse(raw)} : def;
}

function saveProgress(st, meta, pct, ok, total) {
  const p = getProgress(st);
  const td = toDay();
  const stars = Math.ceil(pct / 20);
  if (p.lastStudyDate !== td) {
    const yd = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    p.streak = (p.lastStudyDate === yd) ? p.streak + 1 : 1;
    p.lastStudyDate = td;
  }
  p.quizHistory.push({ quizId:meta.id, subject:meta.subject, title:meta.title, date:td, score:pct, ok, total, stars });
  p.totalCompleted++;
  p.totalStars += stars;
  p.bestScore = Math.max(p.bestScore, pct);
  localStorage.setItem('prg_'+st, JSON.stringify(p));
  return p;
}

function getCustom(st) {
  const raw = localStorage.getItem('custom');
  if (!raw) return {};
  return JSON.parse(raw)[st] || {};
}

function saveCustom(st, subject, quiz) {
  const raw = localStorage.getItem('custom');
  const all = raw ? JSON.parse(raw) : {};
  if (!all[st]) all[st] = {};
  if (!all[st][subject]) all[st][subject] = [];
  all[st][subject].push(quiz);
  localStorage.setItem('custom', JSON.stringify(all));
}

function deleteCustom(st, subject, title) {
  const raw = localStorage.getItem('custom');
  if (!raw) return;
  const all = JSON.parse(raw);
  if (all[st]?.[subject]) {
    all[st][subject] = all[st][subject].filter(q => q.title !== title);
    if (!all[st][subject].length) delete all[st][subject];
    if (!Object.keys(all[st]).length) delete all[st];
  }
  localStorage.setItem('custom', JSON.stringify(all));
}

function getSettings() {
  return JSON.parse(localStorage.getItem('settings') || '{"theme":"light","sound":true,"pin":"1234"}');
}
function setSetting(k, v) {
  const s = getSettings(); s[k] = v; localStorage.setItem('settings', JSON.stringify(s));
}
function getApiKey() { return localStorage.getItem('api_key') || ''; }
function setApiKey(k) { localStorage.setItem('api_key', k); }

// ============================================================
// 5. HELPERS GENERALES
// ============================================================
function toDay() { return new Date().toISOString().slice(0,10); }

function allSubjects(st) {
  const b = Object.keys(BUILTIN[st] || {});
  const c = Object.keys(getCustom(st));
  return [...new Set([...b, ...c])];
}

function allQuizzes(st, subject) {
  const b = (BUILTIN[st] || {})[subject] || [];
  const c = getCustom(st)[subject] || [];
  return [...b, ...c];
}

function quizId(st, subject, title) {
  return [st, subject, title].join('_').replace(/\s+/g,'_');
}

function starsHtml(pct) {
  const n = Math.min(5, Math.ceil(pct / 20));
  return '⭐'.repeat(n) + '☆'.repeat(5 - n);
}

const SUBJECT_ICONS = { 'Matemáticas':'🔢', 'Historia':'📜', 'Ciencias':'🔬', 'Lenguaje':'📝', 'Inglés':'🌎', 'Arte':'🎨', 'Música':'🎵', 'Tecnología':'💻' };

// ============================================================
// 6. AUDIO (Web Audio API — sin archivos externos)
// ============================================================
function playSound(type) {
  if (!getSettings().sound) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx;
    const notes = type === 'correct'  ? [523, 659, 784]
                : type === 'wrong'    ? [300, 200]
                : type === 'complete' ? [523, 659, 784, 1047]
                : [];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.start(t); o.stop(t + 0.3);
    });
  } catch(e) {}
}

// ============================================================
// 7. TEMA
// ============================================================
function applyTheme() {
  const theme = getSettings().theme;
  document.body.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro';
}

// ============================================================
// 8. NAVEGACIÓN
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ============================================================
// 9. HOME
// ============================================================
function renderHome() {
  ['santiago', 'benjamin'].forEach(st => {
    const p  = getProgress(st);
    const id = 'homeStats' + st.charAt(0).toUpperCase() + st.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML =
      (p.totalStars    ? `<span>⭐ ${p.totalStars}</span>`    : '') +
      (p.totalCompleted? `<span>📝 ${p.totalCompleted}</span>` : '') +
      (p.streak > 0   ? `<span>🔥 ${p.streak}</span>`         : '');
  });
}

// ============================================================
// 10. DASHBOARD
// ============================================================
function renderDashboard() {
  const st = S.student;
  const p  = getProgress(st);
  const av = { santiago:'🚀', benjamin:'🦊' };

  document.getElementById('studentAvatar').textContent = av[st] || '⭐';
  document.getElementById('studentName').textContent   = st === 'santiago' ? 'Santiago' : 'Benjamín';
  document.getElementById('completedCount').textContent = p.totalCompleted;
  document.getElementById('starsCount').textContent     = p.totalStars;
  document.getElementById('bestScore').textContent      = p.bestScore + '%';
  document.getElementById('streakCount').textContent    = p.streak;

  renderRanking();
  renderBadges(p);
  renderStudyPlan(st, p);
  renderSubjectGrid(st);
}

function renderRanking() {
  const players = [
    { name:'Santiago', av:'🚀', p: getProgress('santiago') },
    { name:'Benjamín', av:'🦊', p: getProgress('benjamin') }
  ].sort((a, b) => b.p.totalStars - a.p.totalStars);

  document.getElementById('rankingList').innerHTML = players.map((d, i) => `
    <div class="rank-item ${d.name.toLowerCase() === S.student ? 'current' : ''}">
      <span class="rank-pos">${i === 0 ? '🥇' : '🥈'}</span>
      <span>${d.av}</span>
      <span class="rank-name">${d.name}</span>
      <span class="rank-stars">⭐ ${d.p.totalStars}</span>
      <span class="rank-count">${d.p.totalCompleted} quiz</span>
    </div>`).join('');
}

function renderBadges(p) {
  const earned  = BADGES.filter(b =>  b.check(p));
  const pending = BADGES.filter(b => !b.check(p)).slice(0, Math.max(2, 4 - earned.length));
  document.getElementById('badgesList').innerHTML =
    earned .map(b => `<div class="badge earned"  title="${b.desc}"><span class="badge-icon">${b.icon}</span><span class="badge-name">${b.name}</span></div>`).join('') +
    pending.map(b => `<div class="badge pending" title="${b.desc} (pendiente)"><span class="badge-icon">🔒</span><span class="badge-name">${b.name}</span></div>`).join('');
}

function renderStudyPlan(st, p) {
  const studied = new Set((p.quizHistory || []).filter(h => h.date === toDay()).map(h => h.subject));
  const suggestions = allSubjects(st).filter(s => !studied.has(s)).slice(0, 3);
  const plan = document.getElementById('studyPlan');
  if (suggestions.length === 0) {
    plan.innerHTML = '<li class="plan-done">✅ ¡Todo listo por hoy!</li>';
    return;
  }
  plan.innerHTML = suggestions.map(s =>
    `<li class="plan-item" data-subject="${s}">📖 ${s}</li>`).join('');
  plan.querySelectorAll('.plan-item').forEach(li =>
    li.addEventListener('click', () => openSubject(li.dataset.subject)));
}

function renderSubjectGrid(st) {
  const p       = getProgress(st);
  const studied = new Set((p.quizHistory || []).map(h => h.subject));
  const grid    = document.getElementById('subjectGrid');
  const subjects = allSubjects(st);

  grid.innerHTML = subjects.map(subject => {
    const qs   = allQuizzes(st, subject);
    const icon = SUBJECT_ICONS[subject] || '📚';
    return `<button class="subject-card ${studied.has(subject) ? 'studied' : ''}" data-subject="${subject}">
      <span class="subject-icon">${icon}</span>
      <h3>${subject}</h3>
      <p>${qs.length} quiz${qs.length !== 1 ? 'zes' : ''}</p>
      ${studied.has(subject) ? '<span class="studied-badge">✓ Practicado</span>' : ''}
    </button>`;
  }).join('');

  grid.querySelectorAll('.subject-card').forEach(btn =>
    btn.addEventListener('click', () => openSubject(btn.dataset.subject)));
}

// ============================================================
// 11. QUIZ LIST
// ============================================================
function openSubject(subject) {
  S.subject = subject;
  document.getElementById('subjectTitle').textContent = subject;
  document.getElementById('quizStudentLabel').textContent = S.student === 'santiago' ? 'Santiago' : 'Benjamín';

  const p = getProgress(S.student);
  _quizListCache = allQuizzes(S.student, subject);

  document.getElementById('quizCards').innerHTML = _quizListCache.length === 0
    ? '<p class="empty-state">No hay quizzes aún. Agrega uno desde ⚙️ Admin.</p>'
    : _quizListCache.map((quiz, i) => {
        const qid  = quizId(S.student, subject, quiz.title);
        const hist = (p.quizHistory || []).filter(h => h.quizId === qid);
        const best = hist.length ? Math.max(...hist.map(h => h.score)) : null;
        const isAI = !(BUILTIN[S.student]?.[subject]?.some(q => q.title === quiz.title));
        return `<button class="quiz-card" data-idx="${i}">
          <div class="quiz-card-header">
            <h3>${quiz.title}</h3>
            ${isAI ? '<span class="custom-badge">✨ IA</span>' : ''}
          </div>
          <p>${quiz.questions.length} pregunta${quiz.questions.length !== 1 ? 's' : ''}</p>
          ${best !== null
            ? `<div class="quiz-history"><span>Mejor: ${best}%</span><span>${starsHtml(best)}</span></div>`
            : '<p class="quiz-new">✦ Nuevo</p>'}
        </button>`;
      }).join('');

  document.getElementById('quizCards').querySelectorAll('.quiz-card').forEach(btn =>
    btn.addEventListener('click', () => startQuiz(_quizListCache[+btn.dataset.idx], subject)));

  showScreen('quizList');
}

// ============================================================
// 12. QUIZ ENGINE
// ============================================================
function startQuiz(quiz, subject) {
  S.quiz     = quiz.questions;
  S.quizMeta = { id: quizId(S.student, subject, quiz.title), subject, title: quiz.title };
  S.qIdx     = 0;
  S.score    = 0;
  S.answers  = [];

  document.getElementById('quizTitle').textContent = quiz.title;
  document.getElementById('quizMeta').textContent  = subject + ' · ' + (S.student === 'santiago' ? 'Santiago' : 'Benjamín');

  showScreen('quizScreen');
  renderQuestion();
}

function renderQuestion() {
  const q = S.quiz[S.qIdx];
  document.getElementById('questionText').textContent    = q.q;
  document.getElementById('questionCounter').textContent = `Pregunta ${S.qIdx + 1} de ${S.quiz.length}`;
  document.getElementById('progressBar').style.width     = (S.qIdx / S.quiz.length * 100) + '%';
  document.getElementById('feedback').className          = 'feedback hidden';
  document.getElementById('nextBtn').disabled            = true;

  const opts = document.getElementById('options');
  opts.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className   = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectAnswer(btn, opt, q.answer, q.hint));
    opts.appendChild(btn);
  });
}

function selectAnswer(btn, selected, correct, hint) {
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
  const ok = selected === correct;
  if (ok) { btn.classList.add('correct'); S.score++; playSound('correct'); }
  else {
    btn.classList.add('wrong');
    document.querySelectorAll('.option-btn').forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    playSound('wrong');
  }
  S.answers.push({ question: S.quiz[S.qIdx].q, selected, correct, ok });
  const fb = document.getElementById('feedback');
  fb.className  = 'feedback ' + (ok ? 'good' : 'bad');
  fb.innerHTML  = ok ? '✅ ¡Correcto!' : `❌ Correcto: <strong>${correct}</strong><br><small>💡 ${hint}</small>`;
  document.getElementById('nextBtn').disabled = false;
}

document.getElementById('nextBtn').addEventListener('click', () => {
  S.qIdx++;
  if (S.qIdx < S.quiz.length) renderQuestion();
  else showResults();
});

document.getElementById('hintBtn').addEventListener('click', () => {
  const fb = document.getElementById('feedback');
  fb.className = 'feedback hint';
  fb.innerHTML = `💡 Pista: ${S.quiz[S.qIdx].hint}`;
});

function showResults() {
  const total = S.quiz.length;
  const pct   = Math.round(S.score / total * 100);

  const [title, msg] =
    pct === 100 ? ['🏆 ¡Perfecto!',        '¡Dominas el tema al 100%!']        :
    pct >= 80   ? ['🌟 ¡Muy bien!',         'Casi perfecto, sigue así.']         :
    pct >= 60   ? ['👍 ¡Bien!',             'Buen trabajo, hay espacio para mejorar.'] :
                  ['📚 Sigamos practicando', 'Repasa el tema y vuelve a intentarlo.'];

  document.getElementById('resultTitle').textContent  = title;
  document.getElementById('scoreCircle').textContent  = pct + '%';
  document.getElementById('scoreCircle').style.background =
    pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';
  document.getElementById('resultMessage').textContent = msg;

  const starN = Math.ceil(pct / 20);
  document.getElementById('earnedBadges').innerHTML =
    `<div class="stars-earned">${starsHtml(pct)} (${starN}/5 estrellas)</div>`;

  document.getElementById('reviewList').innerHTML = S.answers.map(a =>
    `<div class="review-item ${a.ok ? 'review-correct' : 'review-wrong'}">
      <span>${a.ok ? '✅' : '❌'}</span>
      <div><strong>${a.question}</strong>
        ${!a.ok ? `<br><span class="review-answer">Tu respuesta: ${a.selected} → Correcto: ${a.correct}</span>` : ''}
      </div>
    </div>`).join('');

  document.getElementById('progressBar').style.width = '100%';
  S.lastPct = pct;
  S.lastOk  = S.score;
  playSound('complete');
  showScreen('resultScreen');
}

document.getElementById('finishQuiz').addEventListener('click', () => {
  saveProgress(S.student, S.quizMeta, S.lastPct, S.lastOk, S.quiz.length);
  renderDashboard();
  showScreen('dashboard');
});

// ============================================================
// 13. ADMIN PANEL
// ============================================================
function showAdmin() {
  document.getElementById('pinGate').classList.remove('hidden');
  document.getElementById('adminContent').classList.add('hidden');
  document.getElementById('pinInput').value = '';
  document.getElementById('pinError').classList.add('hidden');
  const key = getApiKey();
  document.getElementById('apiKeyStatus').textContent  = key ? '✅ API Key guardada correctamente' : '';
  document.getElementById('apiKeyInput').placeholder   = key ? 'sk-ant-… (ya configurada)' : 'sk-ant-api03-…';
  renderCustomQuizList();
  showScreen('adminScreen');
}

document.getElementById('pinSubmit').addEventListener('click', () => {
  const pin = document.getElementById('pinInput').value;
  if (pin === getSettings().pin) {
    document.getElementById('pinGate').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
  } else {
    document.getElementById('pinError').classList.remove('hidden');
    document.getElementById('pinInput').value = '';
  }
});
document.getElementById('pinInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('pinSubmit').click();
});

document.getElementById('saveApiKey').addEventListener('click', () => {
  const k = document.getElementById('apiKeyInput').value.trim();
  if (!k) return;
  setApiKey(k);
  document.getElementById('apiKeyStatus').textContent = '✅ API Key guardada';
  document.getElementById('apiKeyInput').value = '';
  document.getElementById('apiKeyInput').placeholder = 'sk-ant-… (ya configurada)';
});

document.getElementById('generateAIBtn').addEventListener('click', async () => {
  const key      = getApiKey();
  const material = document.getElementById('adminMaterial').value.trim();
  const subject  = document.getElementById('adminSubject').value.trim();
  const title    = document.getElementById('adminQuizTitle').value.trim();
  const numQ     = parseInt(document.getElementById('adminNumQ').value);
  const student  = document.getElementById('adminStudent').value;

  if (!key)                       { alert('⚠️ Primero guarda tu API Key de Anthropic.'); return; }
  if (!material || !subject || !title) { alert('⚠️ Completa materia, título y material.'); return; }

  const grade = student === 'santiago' ? '4° básico (10 años)' : '3° básico (9 años)';

  document.getElementById('aiLoading').classList.remove('hidden');
  document.getElementById('generateAIBtn').disabled = true;
  document.getElementById('adminPreview').classList.add('hidden');

  try {
    const questions = await callClaudeAI(key, material, grade, numQ);
    S.pendingQ = { student, subject, title, questions };
    document.getElementById('previewContent').innerHTML =
      `<h4 style="margin-bottom:12px">${title} — ${questions.length} preguntas</h4>` +
      questions.map((q, i) => `
        <div class="preview-q">
          <p><strong>${i+1}. ${q.q}</strong></p>
          <ul>${q.options.map(o => `<li class="${o===q.answer?'preview-correct':''}">${o===q.answer?'✅':'○'} ${o}</li>`).join('')}</ul>
          <p class="preview-hint">💡 ${q.hint}</p>
        </div>`).join('');
    document.getElementById('adminPreview').classList.remove('hidden');
  } catch(err) {
    alert('❌ Error al generar preguntas:\n' + err.message);
  } finally {
    document.getElementById('aiLoading').classList.add('hidden');
    document.getElementById('generateAIBtn').disabled = false;
  }
});

async function callClaudeAI(apiKey, material, grade, numQ) {
  const prompt = `Eres un experto en educación chilena. Genera exactamente ${numQ} preguntas de selección múltiple para un estudiante de ${grade}.

MATERIAL:
${material}

REGLAS:
- Cada pregunta tiene exactamente 4 opciones
- Solo una opción es correcta
- Las preguntas deben ser claras y apropiadas para la edad
- La pista (hint) ayuda sin revelar directamente la respuesta
- Responde SOLO con JSON válido, sin texto adicional ni markdown

FORMATO EXACTO (array JSON):
[{"q":"pregunta aquí","options":["A","B","C","D"],"answer":"opción correcta exacta","hint":"pista aquí"}]`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const raw  = data.content[0].text.trim()
    .replace(/^```json\s*/i,'').replace(/\s*```$/,'').trim();
  return JSON.parse(raw);
}

document.getElementById('saveQuizBtn').addEventListener('click', () => {
  if (!S.pendingQ) return;
  const { student, subject, title, questions } = S.pendingQ;
  saveCustom(student, subject, { title, questions });
  document.getElementById('adminMaterial').value   = '';
  document.getElementById('adminSubject').value    = '';
  document.getElementById('adminQuizTitle').value  = '';
  document.getElementById('adminPreview').classList.add('hidden');
  S.pendingQ = null;
  renderCustomQuizList();
  alert(`✅ Quiz "${title}" guardado para ${student === 'santiago' ? 'Santiago' : 'Benjamín'} en ${subject}.`);
});

function renderCustomQuizList() {
  const list = document.getElementById('customQuizList');
  let html = '';
  ['santiago', 'benjamin'].forEach(st => {
    const cq   = getCustom(st);
    const subs = Object.keys(cq);
    if (!subs.length) return;
    html += `<div class="custom-student"><strong>${st === 'santiago' ? '🚀 Santiago' : '🦊 Benjamín'}</strong>`;
    subs.forEach(sub => cq[sub].forEach(q => {
      html += `<div class="custom-quiz-item">
        <span>${sub} — ${q.title} (${q.questions.length}q)</span>
        <button class="delete-btn"
          data-st="${st}" data-sub="${sub}" data-title="${encodeURIComponent(q.title)}">🗑️</button>
      </div>`;
    }));
    html += '</div>';
  });
  list.innerHTML = html || '<p class="empty-state">Aún no hay quizzes generados con IA.</p>';

  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = decodeURIComponent(btn.dataset.title);
      if (!confirm(`¿Eliminar el quiz "${title}"?`)) return;
      deleteCustom(btn.dataset.st, btn.dataset.sub, title);
      renderCustomQuizList();
    });
  });
}

document.getElementById('resetProgress').addEventListener('click', () => {
  if (!confirm('⚠️ ¿Borrar TODO el progreso de Santiago y Benjamín? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem('prg_santiago');
  localStorage.removeItem('prg_benjamin');
  renderHome();
  alert('✅ Progreso borrado.');
});

// ============================================================
// 14. EVENT LISTENERS GLOBALES
// ============================================================
document.querySelectorAll('.profile-card').forEach(btn =>
  btn.addEventListener('click', () => {
    S.student = btn.dataset.student;
    renderDashboard();
    showScreen('dashboard');
  }));

document.getElementById('backHome').addEventListener('click',      () => { renderHome(); showScreen('home'); });
document.getElementById('backDashboard').addEventListener('click', () => showScreen('dashboard'));
document.getElementById('exitQuiz').addEventListener('click',      () => showScreen('quizList'));
document.getElementById('backFromAdmin').addEventListener('click', () => {
  if (S.student) { renderDashboard(); showScreen('dashboard'); }
  else           { renderHome();      showScreen('home');      }
});

document.getElementById('adminBtn').addEventListener('click',     showAdmin);
document.getElementById('dashAdminBtn').addEventListener('click', showAdmin);

document.getElementById('themeToggle').addEventListener('click', () => {
  const cur = getSettings().theme;
  setSetting('theme', cur === 'dark' ? 'light' : 'dark');
  applyTheme();
});

document.getElementById('soundToggle').addEventListener('click', () => {
  const cur = getSettings().sound;
  setSetting('sound', !cur);
  document.getElementById('soundToggle').textContent = cur ? '🔇 Sonido: OFF' : '🔊 Sonido: ON';
});

// ============================================================
// 15. INIT
// ============================================================
(function init() {
  applyTheme();
  const s = getSettings();
  document.getElementById('soundToggle').textContent = s.sound ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
  renderHome();
})();
