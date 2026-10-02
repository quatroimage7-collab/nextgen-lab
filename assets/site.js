(() => {
  const cfg = window.LAB_CONFIG || {};
  const titleJa = cfg.labNameJa || '次世代工学研究室';
  const titleEn = cfg.labNameEn || 'Next-Generation Engineering Laboratory';
  document.querySelectorAll('[data-ja]').forEach(el => {
    el.dataset.ja = el.dataset.ja.replaceAll('三条市立大学', cfg.affiliationJa || '三条市立大学').replaceAll('次世代工学研究室', titleJa);
    el.dataset.en = el.dataset.en.replaceAll('Sanjo City University', cfg.affiliationEn || 'Sanjo City University').replaceAll('Next-Generation Engineering Laboratory',titleEn);
  });
  const email = document.getElementById('email-contact');
  if (email && cfg.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.email)) {
    const link=document.createElement('a');link.href='mailto:'+cfg.email;link.className='text-link';link.textContent=cfg.email;email.replaceChildren(link);
  }
  const address=document.querySelector('.contact-address');
  if(address && cfg.addressJa){address.hidden=false;address.dataset.ja=cfg.addressJa;address.dataset.en=cfg.addressEn||cfg.addressJa;}
  const languageButton=document.querySelector('.lang-button');
  let language='ja';
  const titles={index:['ホーム','Home'],research:['研究','Research'],members:['メンバー','People'],publications:['業績','Publications'],students:['学生の皆さんへ','For students'],contact:['お問い合わせ','Contact']};
  function setLanguage(lang){
    language=lang==='en'?'en':'ja';
    document.documentElement.lang=language;
    document.querySelectorAll('[data-ja]').forEach(el=>{el.textContent=el.dataset[language]||el.dataset.ja;});
    languageButton.textContent=language==='ja'?'EN':'日本語';
    languageButton.setAttribute('aria-label',language==='ja'?'Switch language to English':'日本語に切り替え');
    document.querySelector('nav').setAttribute('aria-label',language==='ja'?'メインナビゲーション':'Main navigation');
    const slug=location.pathname.split('/').pop().replace('.html','')||'index';
    document.title=(titles[slug]||titles.index)[language==='ja'?0:1]+' | '+(language==='ja'?titleJa:titleEn);
    const hero=document.querySelector('.hero-image');
    if(hero)hero.setAttribute('aria-label',language==='ja'?'ロボット、ドローン、レーザ彫刻機を描いたAI生成の研究コンセプト画像':'AI-generated research concept showing a robot, drone and laser engraving system');
    try{localStorage.setItem('nextgen-language',language);}catch{}
  }
  let saved='ja';try{saved=localStorage.getItem('nextgen-language')||'ja';}catch{}
  setLanguage(saved);
  languageButton.addEventListener('click',()=>setLanguage(language==='ja'?'en':'ja'));
  const menu=document.querySelector('.menu-button'), nav=document.querySelector('nav'), header=document.querySelector('.site-header');
  function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');header.classList.remove('menu-open');}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);header.classList.toggle('menu-open',open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  nav.querySelectorAll('a').forEach(el=>el.addEventListener('click',closeMenu));
  window.matchMedia('(min-width:901px)').addEventListener('change',closeMenu);
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  if('IntersectionObserver' in window && !reduced.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
    document.documentElement.classList.add('js-motion');
    window.addEventListener('beforeprint',()=>document.documentElement.classList.remove('js-motion'));
  }
  const progress=document.querySelector('.reading-progress');let scheduled=false;
  function updateProgress(){const total=document.documentElement.scrollHeight-innerHeight;const value=total>0?Math.max(0,Math.min(1,scrollY/total)):0;progress.style.transform='scaleX('+value+')';scheduled=false;}
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});
  window.addEventListener('resize',updateProgress);updateProgress();
})();
