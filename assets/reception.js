(() => {
  'use strict';
  const cfg = window.LAB_CONFIG || {};
  const recipient = cfg.email || 'sato.atsushi@sanjo-u.ac.jp';
  const form = document.getElementById('report-form');
  const preview = document.getElementById('mail-preview');
  const status = document.getElementById('mail-status');
  const mailto = (title, body) => 'mailto:' + recipient + '?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
  const jump = el => el.scrollIntoView({behavior:'auto', block:'start'});
  let copyText = '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const name of ['company', 'person', 'email', 'placement', 'notes']) {
      const field = form.elements.namedItem(name);
      field.value = field.value.trim();
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = key => String(data.get(key) || '').trim();
    const subject = '【研究室へのお問い合わせ】' + (get('placement') || 'ご相談');
    const body = [
      '三条市立大学　次世代工学研究室　佐藤 敦 先生', '',
      `お名前：${get('person')}`, ...(get('company') ? [`ご所属：${get('company')}`] : []),
      `メールアドレス：${get('email')}`, '', 'ご相談内容：', get('notes'), '',
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
