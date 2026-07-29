// 全ページ共通の通信・処理中ポップアップ関数
// 呼び出し元のページで、先に GAS_URL / currentIdToken を定義しておくこと

function callServer(payload) {
  payload.idToken = currentIdToken;
  return fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  }).then(function (res) { return res.json(); });
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise(function (_, reject) { setTimeout(function () { reject(new Error((label || 'TIMEOUT') + ':' + ms + 'ms')); }, ms); })
  ]);
}

function showProcessing(text) {
  document.getElementById('processingText').textContent = text;
  document.getElementById('processingOverlay').style.display = 'flex';
}
function hideProcessing() {
  document.getElementById('processingOverlay').style.display = 'none';
}

// ==== 共通ナビゲーションメニュー（ハンバーガー＋スライド式、PCでは常時表示のサイドバー） ====
var NAV_LINKS = [
  { group: '売上・在庫', items: [
    { href: 'index.html', label: 'ホーム', icon: 'ti-home' },
    { href: 'sales-management.html', label: '直売所売上管理', icon: 'ti-shopping-cart' },
    { href: 'sanchoku-management.html', label: '産直サイト集計', icon: 'ti-building-store' }
  ] },
  { group: 'JA・丸統', items: [
    { href: 'ja-kyousen.html', label: 'JA共選・丸統 取り込み', icon: 'ti-file-invoice' }
  ] },
  { group: '記録・日誌', items: [
    { href: 'nikki.html', label: '農園日誌', icon: 'ti-notebook' },
    { href: 'ja-mail.html', label: 'JA指導メール', icon: 'ti-mail' }
  ] },
  { group: '管理', items: [
    { href: 'staff-management.html', label: 'スタッフ管理', icon: 'ti-users' }
  ] }
];

function initNavDrawer(currentFile) {
  document.body.classList.add('has-responsive-layout');

  var overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.id = 'navOverlay';
  overlay.onclick = closeNavDrawer;

  var drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.id = 'navDrawer';
  var html = '<p class="nav-drawer-title">もぐもぐ農園</p>';
  NAV_LINKS.forEach(function (group) {
    html += '<p class="nav-drawer-group-label">' + group.group + '</p>';
    group.items.forEach(function (item) {
      var isCurrent = item.href === currentFile;
      html += '<a class="nav-drawer-link' + (isCurrent ? ' current' : '') + '" href="' + item.href + '"><i class="ti ' + item.icon + '" aria-hidden="true"></i>' + item.label + '</a>';
    });
  });
  drawer.innerHTML = html;

  document.body.insertBefore(overlay, document.body.firstChild);
  document.body.insertBefore(drawer, document.body.firstChild);

  // 既存の.wrapをpage-content-areaで包む（PC幅の時、サイドバーの隣に本文を並べるため）
  var wrap = document.querySelector('.wrap');
  if (wrap) {
    var contentArea = document.createElement('div');
    contentArea.className = 'page-content-area';
    wrap.parentNode.insertBefore(contentArea, wrap);
    contentArea.appendChild(wrap);
  }

  // ハンバーガーボタンを、ページ側が用意したスロットに挿入する
  var slot = document.getElementById('navHamburgerSlot');
  if (slot) {
    var btn = document.createElement('button');
    btn.className = 'nav-hamburger-btn';
    btn.setAttribute('aria-label', 'メニュー');
    btn.innerHTML = '<i class="ti ti-menu-2" aria-hidden="true"></i>';
    btn.onclick = toggleNavDrawer;
    slot.appendChild(btn);
  }
}

function toggleNavDrawer() {
  document.getElementById('navDrawer').classList.toggle('show');
  document.getElementById('navOverlay').classList.toggle('show');
}
function closeNavDrawer() {
  document.getElementById('navDrawer').classList.remove('show');
  document.getElementById('navOverlay').classList.remove('show');
}
