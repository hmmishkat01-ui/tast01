/* =====================================================================
   প্রশান্তির সন্ধানে — Mental Health Assessment Quiz
   Vanilla JavaScript (no dependencies)
   ===================================================================== */
(function () {
  'use strict';

  /* ============================================================
     CONFIG — এখানে ক্লিনিকের ফোন ও WhatsApp নম্বর পরিবর্তন করুন
     ============================================================ */
  const CONFIG = {
    phone: '+8801711974357',            // সরাসরি কলের নম্বর
    whatsapp: '8801711974357',          // ক্লিনিকের WhatsApp নম্বর (দেশের কোড সহ, + ছাড়া)
    storageKey: 'proshanti_user'        // LocalStorage key (ব্যাকএন্ড ইন্টিগ্রেশনের জন্য)
  };

  /* ---------- Helpers ---------- */
  const bnDigits = '০১৭১১৯৭৪৩৫৭';
  const toBn = (n) => String(n).replace(/[0-9]/g, (d) => bnDigits[d]);
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* ---------- Data: 12 questions ---------- */
  // Option order = [ক, খ, গ]  →  score = index (ক=0, খ=1, গ=2)
  const questions = [
    { q: 'আপনি কি প্রায়ই অনুভব করেন যে আপনার রিপোর্টে কিছু ধরা পড়ছে না, কিন্তু আপনি ভালো নেই?',
      options: ['না, আমি সাধারণত ভালোই থাকি', 'হ্যাঁ, মাঝে মাঝে এরকম মনে হয়', 'হ্যাঁ, প্রায় প্রতিদিনই এরকম মনে হয়'] },
    { q: 'রাতে ঘুমানোর সময় আপনার মাথায় কী চলে?',
      options: ['তেমন কিছু না, সহজেই ঘুমিয়ে পড়ি', 'অনেক চিন্তা ঘুরপাক খায়, ঘুম আসতে দেরি হয়', 'কিছুই ভাবতে পারি না, শূন্য লাগে, তবুও ঘুম আসে না'] },
    { q: 'হঠাৎ কোনো জোরে শব্দ হলে আপনার কী হয়?',
      options: ['সামান্য চমকে উঠি, তারপর স্বাভাবিক', 'বুক ধড়ফড় করে, হাত কাঁপে, শ্বাস দ্রুত হয়', 'তেমন কিছুই অনুভব হয় না, সব যেন ঝাপসা'] },
    { q: 'আপনার পেটের অবস্থা কেমন?',
      options: ['হজম ভালো, তেমন সমস্যা নেই', 'গ্যাস, ফাঁপা ভাব, মাঝে মাঝে পেট খারাপ', 'সবসময় পেটে সমস্যা, খিদে পাই না'] },
    { q: 'প্রিয় মানুষের সাথে সম্পর্ক নিয়ে আপনার কী অনুভূতি?',
      options: ['ভালো সম্পর্ক আছে, সংযুক্ত অনুভব করি', 'সম্পর্ক আছে কিন্তু সবসময় হারানোর ভয় থাকে', 'কারো সাথে কথা বলতে ইচ্ছে করে না, নিজেকে গুটিয়ে রাখি'] },
    { q: 'সকালে ঘুম থেকে উঠলে কেমন লাগে?',
      options: ['ফ্রেশ লাগে, দিনটা শুরু করতে পারি', 'উদ্বিগ্ন লাগে, মাথায় চিন্তা শুরু হয়ে যায়', 'বিছানা থেকে উঠতেই ইচ্ছে করে না, সব ধূসর লাগে'] },
    { q: 'আপনার শরীরে কি এমন কোনো ব্যথা আছে যা কোনো পরীক্ষায় ধরা পড়ে না?',
      options: ['না, তেমন কিছু নেই', 'হ্যাঁ, ঘাড়ে-কাঁধে-বুকে চাপ বা মাথাব্যথা', 'পুরো শরীর ভারী লাগে, কোনো নির্দিষ্ট জায়গা না, সবখানেই'] },
    { q: 'আপনি কি কখনো অনুভব করেন যে নিজের শরীর থেকে বিচ্ছিন্ন হয়ে যাচ্ছেন?',
      options: ['না, কখনো না', 'খুব কম, শুধু চরম চাপে', 'হ্যাঁ, প্রায়ই, যেন কাঁচের ঘরে আটকে আছি'] },
    { q: 'আপনার কান্না নিয়ে কী অবস্থা?',
      options: ['দরকার হলে কাঁদতে পারি, স্বাভাবিক', 'অকারণে কান্না আসে, থামাতে পারি না', 'কাঁদতে চাই কিন্তু চোখে পানি আসে না'] },
    { q: 'ছোটবেলার কোনো কষ্টের স্মৃতি কি এখনো আপনাকে তাড়া করে?',
      options: ['না, অতীত অতীতেই আছে', 'হ্যাঁ, মাঝে মাঝে ফ্ল্যাশব্যাক আসে বা স্বপ্নে দেখি', 'মনে করতে পারি না ঠিকমতো, কিন্তু একটা ভারী ভাব সবসময় থাকে'] },
    { q: 'আপনি কি দীর্ঘদিন ওষুধ খাচ্ছেন কিন্তু মনে করেন মূল সমস্যার সমাধান হচ্ছে না?',
      options: ['না, আমি তেমন ওষুধ খাই না', 'হ্যাঁ, সাময়িক ভালো লাগে কিন্তু আবার ফিরে আসে', 'ওষুধেও আর কাজ হচ্ছে না, সব অসাড় লাগে'] },
    { q: 'আপনার জীবন সম্পর্কে এই মুহূর্তে কোন বাক্যটি সবচেয়ে বেশি মিলে?',
      options: ['সমস্যা আছে, কিন্তু আমি মোকাবেলা করতে পারি', 'সবসময় একটা যুদ্ধের মধ্যে আছি, ক্লান্ত কিন্তু থামতে পারি না', 'হাল ছেড়ে দিয়েছি, কিছুতেই আগ্রহ নেই, বেঁচে থাকাটাই যান্ত্রিক'] },
  ];

  /* ---------- Result categories (soft colors) ---------- */
  const categories = [
    { max: 6,  icon: 'fa-leaf', color: '#10b981', soft: '#ecfdf5', ring: '#a7f3d0',
      title: 'ভেন্ট্রাল ভেগাল মোড (নিরাপদ)',
      body: 'আপনার ভাইটাল ফোর্স তুলনামূলকভাবে সুস্থ আছে। আপনি সামাজিক সংযোগ অনুভব করতে পারছেন এবং আপনার শরীর নিরাপদ মোডে কাজ করছে। বইয়ের লাইফস্টাইল রিপ্রোগ্রামিং অধ্যায়গুলো ফলো করে এই সুস্থতা ধরে রাখুন।' },
    { max: 10, icon: 'fa-bolt', color: '#f59e0b', soft: '#fffbeb', ring: '#fcd34d',
      title: 'সিমপ্যাথেটিক মোড (যুদ্ধ মোড)',
      body: 'আপনার স্নায়ুতন্ত্র ক্রমাগত বিপদ সংকেত পাঠাচ্ছে। আপনি সবসময় উদ্বিগ্ন, অস্থির এবং সতর্ক অবস্থায় আছেন। এই মোডে দীর্ঘদিন থাকলে প্যানিক অ্যাটাক, অনিদ্রা এবং হৃদরোগের ঝুঁকি বাড়ে। আপনার ভাইটাল ফোর্স উত্তেজিত অবস্থায় আছে। একজন অভিজ্ঞ চিকিৎসকের 3D Healing Protocol আপনাকে নিরাপদ মোডে ফিরিয়ে আনতে পারে।' },
    { max: 14, icon: 'fa-cloud-moon', color: '#8b5cf6', soft: '#f5f3ff', ring: '#c4b5fd',
      title: 'ডরসাল ভেগাল মোড (শাটডাউন)',
      body: 'আপনার শরীর ও মন একটি গভীর শাটডাউন অবস্থায় আটকে আছে। আপনি অনুভূতিহীন, বিচ্ছিন্ন এবং জীবনের প্রতি আগ্রহ হারিয়ে ফেলেছেন। এটি সবচেয়ে গভীর স্তরের সমস্যা। শুধু ওষুধ বা শুধু কাউন্সেলিং, কোনোটিই একা যথেষ্ট নয়। আপনার প্রয়োজন 3D Healing Blueprint™। দয়া করে দেরি করবেন না।' },
    { max: 24, icon: 'fa-hand-holding-heart', color: '#ef4444', soft: '#fef2f2', ring: '#fca5a5',
      title: 'গুরুতর অবস্থা',
      body: 'আপনার অবস্থা অত্যন্ত গুরুতর। আপনার শান্তি-স্নায়ু এবং ভাইটাল ফোর্স গভীরভাবে ক্ষতিগ্রস্ত হয়েছে। আজই একজন অভিজ্ঞ চিকিৎসকের সাথে যোগাযোগ করুন। আপনি একা নন। সাহায্য আছে।' },
  ];

  const optionLabels = ['ক', 'খ', 'গ'];

  /* ---------- State ---------- */
  let currentIndex = 0;
  const answers = new Array(questions.length).fill(null);
  let locked = false;
  let userData = {};

  /* ---------- Element refs (assigned in init) ---------- */
  let welcomeScreen, quizScreen, resultScreen;
  let userForm, nameInput, whatsappInput, dobInput, backBtn, retakeBtn;
  let qNumberEl, progressFill, progressBar, qBody, qTextEl, optionsEl;

  /* ============================================================
     Screen switching (fade out → fade in)
     ============================================================ */
  function switchScreen(fromEl, toEl, beforeShow) {
    fromEl.classList.remove('screen-visible');
    setTimeout(() => {
      fromEl.classList.add('hidden');
      if (typeof beforeShow === 'function') beforeShow();
      toEl.classList.remove('hidden');
      void toEl.offsetWidth; // reflow so the transition plays
      toEl.classList.add('screen-visible');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }

  /* ============================================================
     Screen 1 — Form validation & persistence
     ============================================================ */
  function setError(field, message) {
    const wrap = document.getElementById(field + '-wrap');
    const err = document.getElementById(field + '-error');
    if (wrap) wrap.classList.add('error');
    if (err) {
      err.querySelector('span').textContent = message;
      err.classList.add('show');
    }
  }

  function clearError(field) {
    const wrap = document.getElementById(field + '-wrap');
    const err = document.getElementById(field + '-error');
    if (wrap) wrap.classList.remove('error');
    if (err) err.classList.remove('show');
  }

  function validateForm() {
    let valid = true;
    const name = nameInput.value.trim();
    const whatsapp = whatsappInput.value.trim();
    const dob = dobInput.value;

    // Name
    if (!name) { setError('name', 'অনুগ্রহ করে আপনার নাম লিখুন।'); valid = false; }
    else if (name.length < 2) { setError('name', 'নামটি খুব ছোট, পুরো নাম লিখুন।'); valid = false; }
    else clearError('name');

    // WhatsApp number (Bangladeshi mobile: 01[3-9]XXXXXXXX, with optional +880)
    const cleaned = whatsapp.replace(/[\s-]/g, '');
    if (!whatsapp) { setError('whatsapp', 'অনুগ্রহ করে WhatsApp নম্বর লিখুন।'); valid = false; }
    else if (!/^(?:\+?880|0)1[3-9]\d{8}$/.test(cleaned)) { setError('whatsapp', 'সঠিক নম্বর দিন (যেমন: 01712345678)।'); valid = false; }
    else clearError('whatsapp');

    // Date of birth
    if (!dob) { setError('dob', 'অনুগ্রহ করে জন্ম তারিখ নির্বাচন করুন।'); valid = false; }
    else if (new Date(dob) > new Date()) { setError('dob', 'জন্ম তারিখ ভবিষ্যতে হতে পারে না।'); valid = false; }
    else clearError('dob');

    return valid ? { name: name, whatsapp: cleaned, dob: dob } : null;
  }

  function saveUserData(data) {
    userData = Object.assign({}, data, { savedAt: new Date().toISOString() });
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(userData));
    } catch (e) {
      // localStorage may be unavailable (e.g. private mode / opaque origin).
      // Data still lives in the in-memory `userData` object for this session.
      console.warn('LocalStorage unavailable; user data kept in memory only.', e);
    }
  }

  function loadUserData() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) {
        userData = JSON.parse(raw);
        if (userData.name) nameInput.value = userData.name;
        if (userData.whatsapp) whatsappInput.value = userData.whatsapp;
        if (userData.dob) dobInput.value = userData.dob;
      }
    } catch (e) { /* ignore */ }
  }

  /* ============================================================
     Screen 2 — Quiz rendering & navigation
     ============================================================ */
  function renderQuestion() {
    const q = questions[currentIndex];
    const num = currentIndex + 1;

    qNumberEl.textContent = 'প্রশ্ন ' + toBn(num) + ' / ' + toBn(questions.length);
    const pct = (num / questions.length) * 100;
    progressFill.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', String(num));

    qTextEl.textContent = q.q;

    optionsEl.innerHTML = '';
    q.options.forEach((text, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      if (answers[currentIndex] === i) btn.classList.add('opt-selected');
      btn.innerHTML =
        '<span class="opt-label">' + optionLabels[i] + '</span>' +
        '<span class="opt-text">' + escapeHtml(text) + '</span>' +
        '<i class="opt-check fa-solid fa-circle-check"></i>';
      btn.addEventListener('click', () => selectOption(i, btn));
      optionsEl.appendChild(btn);
    });

    backBtn.classList.toggle('invisible', currentIndex === 0);
  }

  function changeQuestion(newIndex, dir) {
    locked = true;
    const outX = dir === 'back' ? '24px' : '-24px';
    const inX = dir === 'back' ? '-24px' : '24px';

    qBody.style.transition = 'opacity .25s ease, transform .25s ease';
    qBody.style.opacity = '0';
    qBody.style.transform = 'translateX(' + outX + ')';

    setTimeout(() => {
      currentIndex = newIndex;
      renderQuestion();

      qBody.style.transition = 'none';
      qBody.style.transform = 'translateX(' + inX + ')';
      qBody.style.opacity = '0';
      void qBody.offsetWidth; // reflow

      qBody.style.transition = 'opacity .3s ease, transform .3s ease';
      qBody.style.opacity = '1';
      qBody.style.transform = 'translateX(0)';

      setTimeout(() => { locked = false; }, 300);
    }, 250);
  }

  function selectOption(i, btn) {
    if (locked) return;
    locked = true;

    answers[currentIndex] = i; // score = i (ক=0, খ=1, গ=2)

    Array.prototype.forEach.call(optionsEl.children, (c) => c.classList.remove('opt-selected'));
    btn.classList.add('opt-selected');

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        changeQuestion(currentIndex + 1, 'next');
      } else {
        goToResult();
      }
    }, 420);
  }

  /* ============================================================
     Screen 3 — Result
     ============================================================ */
  function calcScore() {
    return answers.reduce((sum, v) => sum + (v || 0), 0);
  }

  function goToResult() {
    renderResult();
    switchScreen(quizScreen, resultScreen);
  }

  function renderResult() {
    const total = calcScore();
    const cat = categories.find((c) => total <= c.max) || categories[categories.length - 1];

    // Personalized greeting
    const greeting = document.getElementById('result-greeting');
    const safeName = escapeHtml(userData.name || 'বন্ধু');
    greeting.innerHTML =
      '<p class="text-lg font-bold text-slate-800">জনাব/বেগম ' + safeName + '</p>' +
      '<p class="text-sm text-slate-500">আপনার মানসিক স্বাস্থ্য যাচাইয়ের ফলাফল প্রস্তুত</p>';

    // Score + category theming
    document.getElementById('score-num').textContent = toBn(total);

    const card = document.getElementById('result-card');
    const accent = document.getElementById('result-accent');
    const badge = document.getElementById('result-icon-badge');
    const icon = document.getElementById('result-icon');
    const scoreP = document.getElementById('result-score');
    const titleE = document.getElementById('result-title');
    const bodyE = document.getElementById('result-body');

    card.style.borderColor = cat.ring;
    accent.style.background = cat.color;
    badge.style.background = cat.soft;
    icon.className = 'fa-solid ' + cat.icon + ' text-3xl';
    icon.style.color = cat.color;
    scoreP.style.background = cat.soft;
    scoreP.style.color = cat.color;
    titleE.style.color = cat.color;
    titleE.textContent = cat.title;
    bodyE.textContent = cat.body;

    // Personalize the WhatsApp CTA message (name + score + category)
    updateCtaLinks(total, cat);
  }

  /* ============================================================
     CTA links (built from CONFIG + optional result context)
     ============================================================ */
  function updateCtaLinks(total, cat) {
    const callBtn = document.getElementById('call-btn');
    const waBtn = document.getElementById('wa-btn');

    callBtn.setAttribute('href', 'tel:' + CONFIG.phone);

    let msg = 'আসসালামু আলাইকুম। ';
    if (userData.name) msg += 'আমি ' + userData.name + '। ';
    msg += '"প্রশান্তির সন্ধানে" বইয়ের মানসিক স্বাস্থ্য টেস্ট দিয়েছি';
    if (typeof total === 'number' && cat) {
      msg += ' — আমার স্কোর ' + toBn(total) + '/২৪ (' + cat.title + ')';
    }
    msg += '। আমি ডাক্তারের সাথে ১০ মিনিট ফ্রি পরামর্শ করতে চাই।';

    waBtn.setAttribute('href', 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg));
  }

  /* ============================================================
     Reset / retake
     ============================================================ */
  function resetQuiz() {
    currentIndex = 0;
    answers.fill(null);
    locked = false;
    qBody.style.cssText = ''; // clear inline transition styles
    renderQuestion();
  }

  /* ============================================================
     Init & event wiring
     ============================================================ */
  function init() {
    welcomeScreen = document.getElementById('welcome-screen');
    quizScreen    = document.getElementById('quiz-screen');
    resultScreen  = document.getElementById('result-screen');

    userForm      = document.getElementById('user-form');
    nameInput     = document.getElementById('name');
    whatsappInput = document.getElementById('whatsapp');
    dobInput      = document.getElementById('dob');
    backBtn       = document.getElementById('back-btn');
    retakeBtn     = document.getElementById('retake-btn');

    qNumberEl    = document.getElementById('q-number');
    progressFill = document.getElementById('q-progress-fill');
    progressBar  = document.getElementById('q-progressbar');
    qBody        = document.getElementById('q-body');
    qTextEl      = document.getElementById('q-text');
    optionsEl    = document.getElementById('q-options');

    // Prevent future dates on the DOB picker
    dobInput.max = new Date().toISOString().split('T')[0];

    // Restore any previously saved data (returning user)
    loadUserData();

    // Form submit → validate → save → start quiz
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = validateForm();
      if (!data) return;
      saveUserData(data);
      resetQuiz();
      switchScreen(welcomeScreen, quizScreen, () => { locked = false; });
    });

    // Clear a field's error as the user corrects it
    [nameInput, whatsappInput, dobInput].forEach((el) => {
      el.addEventListener('input', () => clearError(el.id));
    });

    // Back to previous question
    backBtn.addEventListener('click', () => {
      if (locked || currentIndex === 0) return;
      changeQuestion(currentIndex - 1, 'back');
    });

    // Retake → back to welcome (keeps saved details)
    retakeBtn.addEventListener('click', () => {
      switchScreen(resultScreen, welcomeScreen);
    });

    // Footer year (Bengali numerals)
    document.getElementById('year').textContent = toBn(new Date().getFullYear());

    // Default CTA links (before a result is computed)
    updateCtaLinks();

    // Prime quiz + reveal welcome screen
    renderQuestion();
    requestAnimationFrame(() => welcomeScreen.classList.add('screen-visible'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
