(() => {
  'use strict';
  const cfg = window.LAB_CONFIG || {};
  const recipient = cfg.email || 'sato.atsushi@sanjo-u.ac.jp';
  const form = document.getElementById('report-form');
  const preview = document.getElementById('mail-preview');
  const status = document.getElementById('mail-status');
  const subject = '【産学連携実習】問題なし・面談不要のご連絡';
  const mailto = (title, body) => 'mailto:' + recipient + '?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
  const jump = el => el.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
  document.getElementById('booking-inquiry').href = mailto('【産学連携実習】面談のご相談', '佐藤先生\r\n\r\n産学連携実習について面談を希望します。\r\n企業名：\r\nご担当者名：\r\n相談内容：\r\n希望日時：\r\n');
  // Enable only an explicitly configured HTTPS booking service URL.
  if (cfg.bookingUrl) {
    try {
      const url = new URL(cfg.bookingUrl);
      if (url.protocol === 'https:' && !url.username && !url.password) {
        document.getElementById('booking-link').href = url.href;
        document.getElementById('booking-ready').hidden = false;
        document.getElementById('booking-pending').hidden = true;
      }
    } catch { /* Keep the truthful pending state for an invalid setting. */ }
  }
  let copyText = '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const name of ['company', 'person', 'email']) {
      const field = form.elements.namedItem(name);
      field.value = field.value.trim();
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = key => String(data.get(key) || '').trim();
    const body = [
      '三条市立大学　佐藤 敦 先生', '',
      'いつもお世話になっております。',
      `${get('company')}の${get('person')}です。`, '',
      '産学連携実習について、現時点で問題なく進んでおり、面談は不要です。',
      '状況が変わり、ご相談が必要になった際は改めてご連絡いたします。', '',
      `企業名：${get('company')}`, `ご担当者名：${get('person')}`, `メールアドレス：${get('email')}`,
      ...(get('placement') ? [`対象の学生・実習期間等：${get('placement')}`] : []),
      ...(get('notes') ? ['', '近況・連絡事項：', get('notes')] : []), '',
      'よろしくお願いいたします。'
    ].join('\r\n');
    document.getElementById('mail-to').textContent = recipient;
    document.getElementById('mail-subject').textContent = subject;
    document.getElementById('mail-body').textContent = body;
    document.getElementById('send-mail').href = mailto(subject, body);
    copyText = `宛先：${recipient}\r\n件名：${subject}\r\n\r\n${body}`;
    preview.hidden = false;
    status.textContent = '';
    document.getElementById('preview-title').focus({preventScroll:true});
    jump(preview);
  });
  // A preview is invalidated immediately if its source fields change.
  form.addEventListener('input', () => { preview.hidden = true; copyText = ''; document.getElementById('send-mail').removeAttribute('href'); });
  document.getElementById('edit-mail').addEventListener('click', () => { preview.hidden = true; form.elements.namedItem('company').focus({preventScroll:true}); jump(form); });
  document.getElementById('copy-mail').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      status.textContent = '文面をコピーしました。メールに貼り付け、宛先・件名を設定して送信してください。';
    } catch {
      status.textContent = '自動コピーができませんでした。上に表示された宛先・件名・本文を選択してコピーしてください。';
    }
  });
  document.getElementById('send-mail').addEventListener('click', () => {
    status.textContent = 'メールアプリで送信を完了してください。このページでは送信の完了を確認できません。';
  });
})();
