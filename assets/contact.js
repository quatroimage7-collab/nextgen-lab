(() => {
  'use strict';
  const form = document.getElementById('contact-form');
  if (!form) return;
  const cfg = window.LAB_CONTACT_CONFIG || {};
  const ready = cfg.enabled === true && /^[a-zA-Z0-9]{6,32}$/.test(cfg.formId || '') && !/YOUR|PLACEHOLDER/i.test(cfg.formId);
  const fields = document.getElementById('contact-fields');
  const button = document.getElementById('contact-submit');
  const status = document.getElementById('contact-status');
  const retry = document.getElementById('contact-retry');
  const names = ['name', 'email', 'message', 'consent'];
  const topics = ['研究室見学', '共同研究', '研究に関する質問', 'その他'];
  const messages = {
    unavailable: ['現在、フォームは受付準備中です。下記のメールアドレスをご利用ください。', 'This form is not accepting submissions yet. Please use the email address below.'],
    ready: ['必要事項をご入力のうえ、送信してください。', 'Complete the form below to send your inquiry.'],
    sending: ['送信しています。このページを閉じずにお待ちください。', 'Sending. Please keep this page open.'],
    success: ['お問い合わせを送信しました', 'Your inquiry has been sent.'],
    invalid: ['入力内容をご確認ください。エラーのある項目を修正してください。', 'Please correct the highlighted fields.'],
    blocked: ['送信を受け付けられませんでした。入力内容をご確認ください。', 'The submission could not be accepted. Please check your entries.'],
    offline: ['インターネットに接続されていません。接続を確認してから送信してください。', 'You are offline. Please reconnect before sending.'],
    configuration: ['受付設定に問題があるため送信できません。下記のメールアドレスへご連絡ください。', 'The form configuration prevents submission. Please contact the email address below.'],
    rejected: ['送信サービスで入力が受け付けられませんでした。入力内容をご確認ください。解消しない場合は下記のメールアドレスへご連絡ください。', 'The service rejected this submission. Please check your entries or contact the email address below.'],
    limited: ['送信回数または受付上限に達しています。時間をおいてからお試しいただくか、下記のメールアドレスへご連絡ください。', 'The submission or rate limit has been reached. Please try later or contact the email address below.'],
    unknown: ['送信結果を確認できませんでした。すでに届いている可能性があります。重複を避けるため、研究室に到達状況を確認してから再送してください。入力内容はこの画面に残しています。', 'The result could not be confirmed; your inquiry may already have arrived. Please check with the laboratory before retrying to avoid duplicates. Your entries remain on this page.']
  };
  let state = ready ? 'ready' : 'unavailable';
  let busy = false;
  let locked = false;
  let timer;
  const invalidFields = new Set();
  const text = pair => pair[document.documentElement.lang === 'en' ? 1 : 0];
  function render() {
    status.textContent = text(messages[state]);
    status.dataset.state = state === 'success' ? 'success' : ['ready', 'unavailable', 'sending'].includes(state) ? state : 'error';
    button.textContent = text(!ready ? ['受付準備中', 'Not yet available'] : busy ? ['送信中…', 'Sending…'] : state === 'success' ? ['送信済み', 'Sent'] : ['お問い合わせを送信', 'Send inquiry']);
    retry.hidden = state !== 'unknown';
    button.disabled = !ready || busy || locked;
    fields.disabled = !ready || busy || locked;
    form.setAttribute('aria-busy', String(busy));
    for (const name of names) {
      const el = form.elements.namedItem(name);
      const invalid = invalidFields.has(name);
      el.setAttribute('aria-invalid', String(invalid));
      document.getElementById('error-' + name).textContent = !invalid ? '' : text(name === 'email' ? ['有効なメールアドレスをご入力ください。', 'Enter a valid email address.'] : name === 'consent' ? ['個人情報の取り扱いへの同意が必要です。', 'Your consent is required.'] : ['空白だけにせず、文字数の上限内でご入力ください。', 'Enter non-blank text within the character limit.']);
    }
  }
  function show(next, focus = true) {
    state = next;
    render();
    if (focus) status.focus();
  }
  form.addEventListener('input', event => {
    if (invalidFields.delete(event.target.name)) render();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault(); // Never navigate or place submitted data in a URL.
    if (!ready || busy || locked) return;
    invalidFields.clear();
    for (const name of names) {
      const el = form.elements.namedItem(name);
      if (name !== 'consent') el.value = el.value.trim();
      if (!el.checkValidity() || (name !== 'consent' && (!el.value || el.value.length > el.maxLength))) invalidFields.add(name);
    }
    if (invalidFields.size) {
      show('invalid', false);
      form.elements.namedItem([...invalidFields][0]).focus();
      return;
    }
    if (form.elements.namedItem('_gotcha').value || !topics.includes(form.elements.namedItem('topic').value)) { show('blocked'); return; }
    if (navigator.onLine === false) { show('offline'); return; }
    // Capture before disabling controls, as disabled fields are omitted by FormData.
    const data = new FormData(form);
    data.set('subject', '次世代工学研究室：' + form.elements.namedItem('topic').value);
    const controller = new AbortController();
    busy = true;
    show('sending', false);
    timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://formspree.io/f/' + cfg.formId, {
        method: 'POST', body: data, headers: { Accept: 'application/json' },
        mode: 'cors', credentials: 'omit', redirect: 'error', signal: controller.signal,
        referrerPolicy: 'strict-origin-when-cross-origin'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.ok !== true) throw new Error('Unconfirmed response');
        locked = true;
        form.reset();
        state = 'success';
      } else if (response.status === 429) {
        state = 'limited';
      } else if ([401, 403, 404, 405, 410].includes(response.status)) {
        state = 'configuration';
        locked = true;
      } else if ([400, 413, 422].includes(response.status)) {
        state = 'rejected';
      } else {
        // A server error can follow acceptance. Do not automatically retry.
        throw new Error('Unconfirmed response');
      }
    } catch {
      state = 'unknown';
      locked = true;
    } finally {
      clearTimeout(timer);
      busy = false;
      show(state);
    }
  });
  retry.addEventListener('click', () => {
    locked = false;
    show('ready', false);
    form.elements.namedItem('name').focus();
  });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
