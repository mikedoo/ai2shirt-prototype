/* ============================================================
   衣想工作室 · 低保真原型 · 页面共享脚本
   每个 prototype/pages/*.html 都引用本文件。
   - 自动检测：standalone（双击打开）/ embed（被 iframe 嵌入）
   - 嵌入时把 [data-go] / [data-toast] 点击转发给父级（postMessage）
   - 单独打开时显示本地 toast，跳转改为提示
   - 同时处理 chip / swatch 单选与数量 +/-（本地 UI 反馈）
   ============================================================ */
(function () {
  const inFrame = window.parent !== window;
  document.body.classList.add(inFrame ? 'embed' : 'standalone');

  function showLocalToast(msg) {
    let t = document.getElementById('__local_toast');
    if (!t) {
      t = document.createElement('div');
      t.id = '__local_toast';
      t.style.cssText = [
        'position:fixed', 'top:14px', 'left:50%',
        'transform:translateX(-50%)',
        'background:#000', 'color:#fff',
        'padding:8px 16px', 'border-radius:18px',
        'font-size:12px', 'z-index:9999',
        'pointer-events:none', 'white-space:nowrap',
        'opacity:0', 'transition:opacity 0.2s'
      ].join(';');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 1500);
  }

  /* ---------- 主跳转 / toast ---------- */
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-go],[data-toast]');
    if (!el) return;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    const dest = el.dataset.go || null;
    const toast = el.dataset.toast || null;
    if (inFrame) {
      window.parent.postMessage(
        { type: 'page-action', dest: dest, toast: toast },
        '*'
      );
    } else {
      if (toast) showLocalToast(toast);
      if (dest) showLocalToast('▶ 演示模式：跳转到 ' + dest);
    }
  });

  /* ---------- chip / swatch 单选（同 [data-chip-group]） ---------- */
  document.addEventListener('click', function (e) {
    const chip = e.target.closest('[data-chip-group]');
    if (!chip) return;
    const group = chip.dataset.chipGroup;
    document
      .querySelectorAll('[data-chip-group="' + group + '"]')
      .forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });

  /* ---------- 数量 +/- ---------- */
  document.addEventListener('click', function (e) {
    const qty = e.target.closest('[data-qty]');
    if (!qty) return;
    const display = document.querySelector('[data-qty-value]');
    if (!display) return;
    let v = parseInt(display.textContent, 10) || 1;
    if (qty.dataset.qty === 'plus') v += 1;
    if (qty.dataset.qty === 'minus' && v > 1) v -= 1;
    display.textContent = v;
  });
})();
