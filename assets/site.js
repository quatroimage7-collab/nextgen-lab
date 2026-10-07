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
  const titles={index:['ホーム','Home'],research:['研究','Research'],members:['メンバー','People'],publications:['業績','Publications'],students:['学生の皆さんへ','For students'],contact:['お問い合わせ','Contact'],reception:['WEB受付','Appointments']};
  function setLanguage(lang){
    language=lang==='en'?'en':'ja';
    document.documentElement.lang=language;
    document.querySelectorAll('[data-ja]').forEach(el=>{el.textContent=el.dataset[language]||el.dataset.ja;});
    languageButton.textContent=language==='ja'?'EN':'日本語';
    languageButton.setAttribute('aria-label',language==='ja'?'Switch language to English':'日本語に切り替え');
    document.querySelector('nav').setAttribute('aria-label',language==='ja'?'メインナビゲーション':'Main navigation');
    const slug=location.pathname.split('/').pop().replace('.html','')||'index';
    document.title = slug === 'index'
  ? (language === 'ja'
      ? '三条市立大学 次世代工学研究室｜佐藤敦・AIと機械工学'
      : 'Next-Generation Engineering Laboratory | Atsushi Sato | Sanjo City University')
  : (titles[slug] || titles.index)[language === 'ja' ? 0 : 1]
    + ' | ' + (language === 'ja' ? titleJa : titleEn);
    const hero=document.querySelector('.hero-image');
    if(hero)hero.setAttribute('aria-label',language==='ja'?'ロボット、ドローン、レーザ彫刻機を描いたAI生成の研究コンセプト画像':'AI-generated research concept showing a robot, drone and laser engraving system');
    try{localStorage.setItem('nextgen-language',language);}catch{}
  }
  if (!languageButton) { // The reception form uses Japanese only.
    document.querySelectorAll('[data-ja]').forEach(el => el.textContent = el.dataset.ja);
  }
  let saved='ja';try{saved=localStorage.getItem('nextgen-language')||'ja';}catch{}
  if (languageButton) setLanguage(saved);
  languageButton?.addEventListener('click',()=>setLanguage(language==='ja'?'en':'ja'));
  const menu=document.querySelector('.menu-button'), nav=document.querySelector('nav'), header=document.querySelector('.site-header');
  function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');header.classList.remove('menu-open');}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);header.classList.toggle('menu-open',open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  nav.querySelectorAll('a').forEach(el=>el.addEventListener('click',closeMenu));
  window.matchMedia('(min-width:1001px)').addEventListener('change',closeMenu);
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

// Native MP4 file only. No binary conversion or embedded media payloads.
(() => {
  const video=document.getElementById('lab-film');
  if(!video)return;
  const toggle=document.getElementById('film-toggle'),sound=document.getElementById('film-sound');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  video.muted=true;
  function labels(){
    const en=document.documentElement.lang==='en';
    toggle.textContent=video.paused?(en?'Play':'再生'):(en?'Pause':'一時停止');
    toggle.setAttribute('aria-label',toggle.textContent);
    sound.textContent=video.muted?(en?'Sound OFF':'音声 OFF'):(en?'Sound ON':'音声 ON');
    sound.setAttribute('aria-label',video.muted?(en?'Turn sound on':'音声をオン'):(en?'Turn sound off':'音声をオフ'));
  }
  async function play(){try{await video.play();}catch{video.controls=true;}labels();}
  toggle.addEventListener('click',()=>{if(video.paused)play();else video.pause();});
  sound.addEventListener('click',()=>{video.muted=!video.muted;labels();});
  ['play','pause','volumechange'].forEach(e=>video.addEventListener(e,labels));
  video.addEventListener('error',()=>{document.getElementById('film-error').hidden=false;});
  new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  // Keep the native controls as an accessible autoplay fallback.
  if(reduced.matches){video.autoplay=false;video.pause();}else play();
  reduced.addEventListener('change',()=>{if(reduced.matches)video.pause();});
  labels();
})();

// Gentle movement of the main image, with pause and resume controls.
(() => {
  const frame=document.querySelector('.unified-visual');
  const button=document.querySelector('.image-motion-toggle');
  if(!frame||!button)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches;
  function sync(){
    frame.classList.toggle('motion-paused',paused);
    button.setAttribute('aria-pressed',String(paused));
    button.dataset.ja=paused?'動きを再開':'動きを止める';
    button.dataset.en=paused?'Resume motion':'Pause motion';
    button.textContent=document.documentElement.lang==='en'?button.dataset.en:button.dataset.ja;
  }
  button.addEventListener('click',()=>{paused=!paused;sync();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  sync();
})();
