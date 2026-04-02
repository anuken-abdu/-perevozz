// ===== LANGUAGE DATA =====
const LANG_KEY = 'gruz_lang';

function getCurrentLang() {
  return localStorage.getItem(LANG_KEY) || 'ru';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang === 'kz' ? 'kk' : 'ru';
  
  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Update all translatable elements
  document.querySelectorAll('[data-ru]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'LABEL' || el.tagName === 'DIV' || el.tagName === 'LI') {
        el.innerHTML = text;
      } else if (el.tagName === 'OPTION') {
        el.textContent = text;
      }
    }
  });
  
  // Update placeholders
  document.querySelectorAll(`[data-placeholder-${lang}]`).forEach(el => {
    el.placeholder = el.getAttribute(`data-placeholder-${lang}`);
  });
}

// ===== MOBILE MENU =====
function initBurger() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (!burger || !nav) return;
  
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('active');
  });
  
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      nav.classList.remove('active');
    });
  });
}

// ===== CALCULATOR =====
function initCalculator() {
  const typeEl = document.getElementById('calcType');
  const moversEl = document.getElementById('calcMovers');
  const moversCountEl = document.getElementById('calcMoversCount');
  const moversField = document.getElementById('moversCountField');
  const hoursEl = document.getElementById('calcHours');
  const priceEl = document.getElementById('calcPrice');
  
  if (!typeEl || !priceEl) return;
  
  function calculate() {
    const basePrice = parseInt(typeEl.value);
    const hours = parseInt(hoursEl.value);
    const needMovers = moversEl.value === '1';
    const moversCount = needMovers ? parseInt(moversCountEl.value) : 0;
    const moverPrice = 2500;
    
    if (moversField) {
      moversField.style.display = needMovers ? 'block' : 'none';
    }
    
    const total = (basePrice * hours) + (moverPrice * moversCount * hours);
    priceEl.textContent = total.toLocaleString('ru-RU') + ' ₸';
  }
  
  [typeEl, moversEl, moversCountEl, hoursEl].forEach(el => {
    if (el) el.addEventListener('change', calculate);
  });
  
  calculate();
}

// ===== FAQ ACCORDION =====
function initFAQ() {
  document.querySelectorAll('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-item__answer');
      const isActive = item.classList.contains('active');
      
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const a = i.querySelector('.faq-item__answer');
        if (a) a.style.maxHeight = '0';
      });
      
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ===== FORM HANDLING =====
function initForms() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simple validation
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const parent = field.closest('.form-field');
        if (field.type === 'checkbox') {
          if (!field.checked) {
            valid = false;
            if (parent) parent.classList.add('error');
          } else {
            if (parent) parent.classList.remove('error');
          }
        } else if (!field.value.trim()) {
          valid = false;
          if (parent) parent.classList.add('error');
        } else {
          if (parent) parent.classList.remove('error');
        }
      });
      
      if (!valid) return;
      
      // Show success
      const successEl = form.querySelector('.form-success');
      if (successEl) {
        successEl.style.display = 'block';
        form.querySelectorAll('input, select, textarea, button[type="submit"]').forEach(el => {
          el.disabled = true;
        });
      }
      
      // Build WhatsApp message
      const name = form.querySelector('[id*="Name"]');
      const phone = form.querySelector('[id*="Phone"]');
      const type = form.querySelector('[id*="Type"]');
      const comment = form.querySelector('[id*="Comment"]');
      
      let msg = 'Новая заявка с сайта:%0A';
      if (name) msg += `Имя: ${name.value}%0A`;
      if (phone) msg += `Телефон: ${phone.value}%0A`;
      if (type) msg += `Тип газели: ${type.options[type.selectedIndex].text}%0A`;
      if (comment && comment.value) msg += `Комментарий: ${comment.value}%0A`;
      
      // Open WhatsApp in background
      setTimeout(() => {
        window.open(`https://wa.me/77074534518?text=${msg}`, '_blank');
      }, 1500);
    });
  });
  
  // Phone mask
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (!val.startsWith('7')) val = '7' + val;
      
      let formatted = '+7';
      if (val.length > 1) formatted += ' (' + val.slice(1, 4);
      if (val.length > 4) formatted += ') ' + val.slice(4, 7);
      if (val.length > 7) formatted += '-' + val.slice(7, 9);
      if (val.length > 9) formatted += '-' + val.slice(9, 11);
      
      e.target.value = formatted;
    });
  });
}

// ===== REVIEWS SLIDER =====
function initReviewsSlider() {
  const track = document.querySelector('.reviews__track');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');
  if (!track || !prevBtn || !nextBtn) return;
  
  let currentIndex = 0;
  const cards = track.querySelectorAll('.review-card');
  
  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }
  
  function updateSlider() {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, cards.length - visibleCount);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    
    const card = cards[0];
    if (!card) return;
    const gap = 24;
    const cardWidth = card.offsetWidth + gap;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  }
  
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; updateSlider(); }
  });
  
  nextBtn.addEventListener('click', () => {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, cards.length - visibleCount);
    if (currentIndex < maxIndex) { currentIndex++; updateSlider(); }
  });
  
  window.addEventListener('resize', updateSlider);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
  const topBtn = document.querySelector('.float-btn--top');
  if (!topBtn) return;
  
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('visible', window.scrollY > 500);
  });
  
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== EXIT INTENT POPUP =====
function initExitPopup() {
  const popup = document.querySelector('.exit-popup');
  if (!popup) return;
  
  let shown = sessionStorage.getItem('exit_popup_shown');
  
  document.addEventListener('mouseout', (e) => {
    if (e.clientY <= 0 && !shown && window.innerWidth > 768) {
      popup.classList.add('active');
      shown = true;
      sessionStorage.setItem('exit_popup_shown', 'true');
    }
  });
  
  popup.querySelector('.exit-popup__close')?.addEventListener('click', () => {
    popup.classList.remove('active');
  });
  
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.classList.remove('active');
  });
}

// ===== LIGHTBOX =====
function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;
  
  const img = lightbox.querySelector('.lightbox__img');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
  const nextBtn = lightbox.querySelector('.lightbox__nav--next');
  
  let images = [];
  let currentIdx = 0;
  
  document.querySelectorAll('.gallery-grid img').forEach((galleryImg, idx) => {
    images.push(galleryImg.src);
    galleryImg.addEventListener('click', () => {
      currentIdx = idx;
      img.src = images[currentIdx];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  
  if (prevBtn) prevBtn.addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + images.length) % images.length;
    img.src = images[currentIdx];
  });
  
  if (nextBtn) nextBtn.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % images.length;
    img.src = images[currentIdx];
  });
  
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
    if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
  });
}

// ===== HEADER SCROLL =====
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    header.style.background = window.scrollY > 50 
      ? 'rgba(13,13,13,.95)' 
      : 'rgba(13,13,13,.85)';
  });
}

// ===== TABS (About/Contacts page) =====
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const content = document.getElementById(target);
      if (content) content.classList.add('active');
    });
  });
  
  // Check hash for contacts tab
  if (window.location.hash === '#contacts') {
    const contactsBtn = document.querySelector('[data-tab="contacts-tab"]');
    if (contactsBtn) contactsBtn.click();
  }
}

// ===== GAZEL PAGE DYNAMIC CONTENT =====
const GAZEL_DATA = {
  tent: {
    ru: { name: 'Тентованная газель', desc: 'Универсальная газель с тентовым покрытием — идеальна для мелких переезов, доставки мебели и коробок. Тент легко снимается для погрузки крупногабаритных предметов сверху.' },
    kz: { name: 'Тентті газель', desc: 'Тентті жабынды бар әмбебап газель — ұсақ көшу, жиһаз және қораптарды жеткізу үшін тамаша. Ірі заттарды жоғарыдан тиеу үшін тент оңай алынады.' },
    capacity: '1,5 т', volume: '9–12 м³', dimensions: '3.0 × 1.9 × 1.8 м', price: '3 000',
    suitable_ru: ['Мелкие переезды', 'Доставка мебели', 'Перевозка коробок', 'Бытовая техника', 'Личные вещи', 'Небольшие грузы'],
    suitable_kz: ['Ұсақ көшу', 'Жиһаз жеткізу', 'Қораптарды тасымалдау', 'Тұрмыстық техника', 'Жеке заттар', 'Шағын жүктер'],
    img: 'https://mgx-backend-cdn.metadl.com/generate/images/1051846/2026-04-02/88c982bd-70de-4e9c-8d99-10bb9c8040a1.png'
  },
  dlinnomer: {
    ru: { name: 'Удлинённая газель', desc: 'Газель с удлинённым кузовом для перевозки длинномерных грузов. Увеличенный объём кузова позволяет перевозить больше вещей за один рейс.' },
    kz: { name: 'Ұзартылған газель', desc: 'Ұзын жүктерді тасымалдауға арналған ұзартылған шанақты газель. Шанақтың үлкен көлемі бір рейсте көбірек зат тасымалдауға мүмкіндік береді.' },
    capacity: '2 т', volume: '16–18 м³', dimensions: '4.2 × 1.9 × 2.0 м', price: '4 500',
    suitable_ru: ['Длинномерные грузы', 'Крупная мебель', 'Стройматериалы', 'Профили и трубы', 'Офисные переезды', 'Большие объёмы'],
    suitable_kz: ['Ұзын жүктер', 'Ірі жиһаз', 'Құрылыс материалдары', 'Профильдер мен құбырлар', 'Кеңсе көшу', 'Үлкен көлемдер'],
    img: 'https://mgx-backend-cdn.metadl.com/generate/images/1051846/2026-04-02/88c982bd-70de-4e9c-8d99-10bb9c8040a1.png'
  },
  furgon: {
    ru: { name: 'Газель-фургон', desc: 'Закрытый цельнометаллический фургон — надёжная защита груза от дождя, снега и пыли. Идеален для перевозки техники и электроники.' },
    kz: { name: 'Газель-фургон', desc: 'Жабық толық металл фургон — жүкті жаңбыр, қар және шаңнан сенімді қорғау. Техника мен электрониканы тасымалдау үшін тамаша.' },
    capacity: '1,5 т', volume: '10–12 м³', dimensions: '3.0 × 1.9 × 1.9 м', price: '3 500',
    suitable_ru: ['Электроника и техника', 'Хрупкие грузы', 'Документы', 'Медикаменты', 'Ценные вещи', 'Перевозка в непогоду'],
    suitable_kz: ['Электроника және техника', 'Сынғыш жүктер', 'Құжаттар', 'Дәрі-дәрмектер', 'Құнды заттар', 'Нашар ауа-райында тасымалдау'],
    img: 'https://mgx-backend-cdn.metadl.com/generate/images/1051846/2026-04-02/17c451ad-2bc8-4442-bc92-7a3ab6b50a13.png'
  },
  bortovaya: {
    ru: { name: 'Бортовая газель', desc: 'Газель с открытым бортовым кузовом — удобна для погрузки крупногабаритных грузов краном или погрузчиком. Идеальна для стройматериалов.' },
    kz: { name: 'Бортты газель', desc: 'Ашық бортты шанақты газель — ірі жүктерді кран немесе тиегішпен тиеуге ыңғайлы. Құрылыс материалдары үшін тамаша.' },
    capacity: '2 т', volume: '—', dimensions: '3.0 × 1.9 м (открытый)', price: '3 000',
    suitable_ru: ['Стройматериалы', 'Крупногабарит', 'Вывоз мусора', 'Поддоны', 'Металлоконструкции', 'Негабаритные грузы'],
    suitable_kz: ['Құрылыс материалдары', 'Ірі жүктер', 'Қоқыс шығару', 'Паллеттер', 'Металл конструкциялар', 'Габаритсіз жүктер'],
    img: 'https://mgx-backend-cdn.metadl.com/generate/images/1051846/2026-04-02/88c982bd-70de-4e9c-8d99-10bb9c8040a1.png'
  },
  next: {
    ru: { name: 'ГАЗель NEXT', desc: 'Увеличенный фургон ГАЗель NEXT — максимальная грузоподъёмность и объём кузова. Для крупных переездов и коммерческих перевозок.' },
    kz: { name: 'ГАЗель NEXT', desc: 'Үлкейтілген ГАЗель NEXT фургоны — максималды жүк көтерімділігі және шанақ көлемі. Ірі көшу және коммерциялық тасымалдау үшін.' },
    capacity: '3,5 т', volume: '20–25 м³', dimensions: '5.1 × 2.1 × 2.1 м', price: '6 000',
    suitable_ru: ['Крупные переезды', 'Коммерческие перевозки', 'Большие объёмы', 'Тяжёлые грузы', 'Складские перевозки', 'Оптовые доставки'],
    suitable_kz: ['Ірі көшу', 'Коммерциялық тасымалдау', 'Үлкен көлемдер', 'Ауыр жүктер', 'Қойма тасымалдары', 'Көтерме жеткізу'],
    img: 'https://mgx-backend-cdn.metadl.com/generate/images/1051846/2026-04-02/2e6ddbae-8a91-4fe9-a540-9b164b7a0fee.png'
  },
  refrizherator: {
    ru: { name: 'Газель-рефрижератор', desc: 'Газель с холодильной установкой — поддерживает температуру от -20°C до +12°C. Для продуктов питания, лекарств и скоропортящихся грузов.' },
    kz: { name: 'Газель-тоңазытқыш', desc: 'Тоңазытқыш қондырғысы бар газель — температураны -20°C-ден +12°C-ге дейін ұстайды. Тамақ өнімдері, дәрі-дәрмектер және тез бұзылатын жүктер үшін.' },
    capacity: '1,5 т', volume: '9 м³', dimensions: '—', price: '5 000',
    suitable_ru: ['Продукты питания', 'Лекарства', 'Скоропортящийся груз', 'Замороженные продукты', 'Цветы', 'Кондитерские изделия'],
    suitable_kz: ['Тамақ өнімдері', 'Дәрі-дәрмектер', 'Тез бұзылатын жүк', 'Мұздатылған өнімдер', 'Гүлдер', 'Кондитерлік бұйымдар'],
    img: 'https://mgx-backend-cdn.metadl.com/generate/images/1051846/2026-04-02/17c451ad-2bc8-4442-bc92-7a3ab6b50a13.png'
  }
};

function initGazelPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  if (!type || !GAZEL_DATA[type]) return;
  
  const data = GAZEL_DATA[type];
  const lang = getCurrentLang();
  const langData = data[lang] || data.ru;
  
  // Fill page content
  const setContent = (sel, val) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = val;
  };
  const setHTML = (sel, val) => {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = val;
  };
  
  setContent('.gazel-name', langData.name);
  setContent('.gazel-desc', langData.desc);
  setContent('.gazel-capacity', data.capacity);
  setContent('.gazel-volume', data.volume);
  setContent('.gazel-dimensions', data.dimensions);
  setContent('.gazel-price', `от ${data.price} ₸/час`);
  
  // Set page title
  document.title = `${langData.name} — Грузоперевозки Астана | от ${data.price} ₸/час`;
  
  // Set images
  document.querySelectorAll('.gazel-main-img').forEach(img => { img.src = data.img; img.alt = langData.name; });
  document.querySelectorAll('.gazel-gallery-img').forEach(img => { img.src = data.img; });
  
  // Suitable list
  const suitableList = document.querySelector('.suitable-list');
  if (suitableList) {
    const items = lang === 'kz' ? data.suitable_kz : data.suitable_ru;
    suitableList.innerHTML = items.map(item => `<li><span>✓</span> ${item}</li>`).join('');
  }
  
  // Pre-fill form type
  const formType = document.getElementById('formType');
  if (formType) formType.value = type;
  
  // Gazel nav links active state
  document.querySelectorAll('.gazel-nav-link').forEach(link => {
    const linkType = new URLSearchParams(link.href.split('?')[1]).get('type');
    link.classList.toggle('active', linkType === type);
  });
}

// ===== DYNAMIC ORDER COUNTER =====
function initOrderCounter() {
  const base = 8;
  const hour = new Date().getHours();
  const extra = Math.floor(hour * 0.7 + Math.random() * 3);
  const count = base + extra;
  
  document.querySelectorAll('.hero__counter strong').forEach(el => {
    el.textContent = count;
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Set language
  const lang = getCurrentLang();
  setLang(lang);
  
  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  
  // Init all modules
  initBurger();
  initCalculator();
  initFAQ();
  initForms();
  initReviewsSlider();
  initScrollAnimations();
  initScrollTop();
  initExitPopup();
  initLightbox();
  initHeaderScroll();
  initTabs();
  initGazelPage();
  initOrderCounter();
});
