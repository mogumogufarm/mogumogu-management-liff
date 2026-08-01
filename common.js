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
    { href: 'sales-management.html', label: '直売所売上管理', icon: 'ti-shopping-cart', children: [
      { href: 'sales-management.html?tab=progress', label: '本日の売上' },
      { href: 'sales-management.html?tab=history', label: '日別推移' },
      { href: 'sales-management.html?tab=monthly', label: '月別集計' },
      { href: 'sales-management.html?tab=stock', label: '在庫管理' }
    ] },
    { href: 'sanchoku-management.html', label: '産直サイト集計', icon: 'ti-building-store', children: [
      { href: 'sanchoku-management.html?tab=today', label: '本日の受注' },
      { href: 'sanchoku-management.html?tab=history', label: '日別推移' },
      { href: 'sanchoku-management.html?tab=unfilled', label: '金額未入力' }
    ] }
  ] },
  { group: 'JA・丸統', items: [
    { href: 'ja-kyousen.html', label: 'JA共選・丸統 取り込み', icon: 'ti-file-invoice' }
  ] },
  { group: '記録・日誌', items: [
    { href: 'nikki.html', label: '農園日誌', icon: 'ti-notebook' },
    { href: 'kusakari.html', label: '草刈り・刈払い管理', icon: 'ti-cut' },
    { href: 'ja-mail.html', label: 'JA指導メール', icon: 'ti-mail' }
  ] },
  { group: '管理', items: [
    { href: 'staff-management.html', label: 'スタッフ管理', icon: 'ti-users' }
  ] },
  { group: '設定', items: [
    { action: 'openDisplaySettings', label: '表示設定', icon: 'ti-adjustments' }
  ] }
];

// スマホ版など、明るい背景用のロゴ
var MOGUMOGU_LOGO_SVG_LIGHTBG =
  '<svg width="180" height="38" viewBox="0 0 424 88" style="vertical-align:middle;">' +
  '<defs><style>@import url("https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;800&display=swap");</style></defs>' +
  '<text x="212" y="14" text-anchor="middle" font-size="13" fill="#6B6048" font-family="\'M PLUS Rounded 1c\',sans-serif" font-weight="500">山梨県南アルプス果実</text>' +
  '<circle cx="76" cy="56" r="16" fill="#5B2E1F"/>' +
  '<circle cx="108" cy="56" r="16" fill="#3E6B22"/>' +
  '<circle cx="140" cy="56" r="16" fill="#C0392B"/>' +
  '<text x="170" y="67" font-size="30" font-weight="800" fill="#2E3B22" font-family="\'M PLUS Rounded 1c\',sans-serif">もぐもぐ農園</text>' +
  '<text x="212" y="82" text-anchor="middle" font-size="12" fill="#7A7256" font-family="\'M PLUS Rounded 1c\',sans-serif" font-weight="500">運営管理システム</text>' +
  '</svg>';

// 濃緑ヘッダー用のロゴ（PC版のpc-nav-headerで使用。文字色を白系に調整）
var MOGUMOGU_LOGO_SVG_DARKBG =
  '<svg width="220" height="46" viewBox="0 0 424 88" style="vertical-align:middle;">' +
  '<defs><style>@import url("https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;800&display=swap");</style></defs>' +
  '<text x="212" y="14" text-anchor="middle" font-size="13" fill="#D6CBAA" font-family="\'M PLUS Rounded 1c\',sans-serif" font-weight="500">山梨県南アルプス果実</text>' +
  '<circle cx="76" cy="56" r="16" fill="#C97B5F"/>' +
  '<circle cx="108" cy="56" r="16" fill="#8FBF6A"/>' +
  '<circle cx="140" cy="56" r="16" fill="#E0776A"/>' +
  '<text x="170" y="67" font-size="30" font-weight="800" fill="#F7F3E9" font-family="\'M PLUS Rounded 1c\',sans-serif">もぐもぐ農園</text>' +
  '<text x="212" y="82" text-anchor="middle" font-size="12" fill="#D6CBAA" font-family="\'M PLUS Rounded 1c\',sans-serif" font-weight="500">運営管理システム</text>' +
  '</svg>';

function initNavDrawer(currentFile) {
  var overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.id = 'navOverlay';
  overlay.onclick = closeNavDrawer;

  var drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.id = 'navDrawer';
  var html = '<p class="nav-drawer-title">もぐもぐ農園</p>';
  var currentFullPath = currentFile + window.location.search;
  NAV_LINKS.forEach(function (group) {
    html += '<p class="nav-drawer-group-label">' + group.group + '</p>';
    group.items.forEach(function (item) {
      if (item.action) {
        html += '<a class="nav-drawer-link" href="#" onclick="handleNavAction(\'' + item.action + '\'); return false;"><i class="ti ' + item.icon + '" aria-hidden="true"></i>' + item.label + '</a>';
        return;
      }
      var itemBaseFile = item.href.split('?')[0];
      var isCurrent = itemBaseFile === currentFile;
      html += '<a class="nav-drawer-link' + (isCurrent ? ' current' : '') + '" href="' + item.href + '"><i class="ti ' + item.icon + '" aria-hidden="true"></i>' + item.label + '</a>';
      if (item.children && isCurrent) {
        item.children.forEach(function (child) {
          var isChildCurrent = child.href === currentFullPath;
          html += '<a class="nav-drawer-link nav-drawer-sublink' + (isChildCurrent ? ' current' : '') + '" href="' + child.href + '">' + child.label + '</a>';
        });
      }
    });
  });
  drawer.innerHTML = html;

  document.body.insertBefore(overlay, document.body.firstChild);
  document.body.insertBefore(drawer, document.body.firstChild);

  // PC幅用：上部ヘッダー＋カテゴリタブ＋アイコングリッドを構築する
  buildPcTopNav(currentFile);

  // 既存の.wrapをpage-content-areaで包む
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

var pcNavCurrentFile = null;

function buildPcTopNav(currentFile) {
  pcNavCurrentFile = currentFile;

  var wrapper = document.createElement('div');
  wrapper.className = 'pc-nav-wrapper';
  wrapper.id = 'pcNavWrapper';

  wrapper.innerHTML =
    '<div class="pc-nav-header"><span>' + MOGUMOGU_LOGO_SVG_DARKBG + '</span><i class="ti ti-user-circle" aria-hidden="true"></i></div>' +
    '<div class="pc-nav-icongrid" id="pcNavIconGrid"></div>' +
    '<div class="pc-nav-subitem-row" id="pcNavSubRow"></div>';

  document.body.insertBefore(wrapper, document.body.firstChild);

  renderPcNavIconGrid();
}

function renderPcNavIconGrid() {
  var gridEl = document.getElementById('pcNavIconGrid');
  var subRowEl = document.getElementById('pcNavSubRow');
  var currentFullPath = pcNavCurrentFile + window.location.search;
  var gridHtml = '';
  var subHtml = '';

  // カテゴリごとに「ラベル＋アイコン列」のまとまりにして、常に並べて表示する
  NAV_LINKS.forEach(function (group) {
    gridHtml += '<div class="pc-nav-group"><p class="pc-nav-group-label">' + group.group + '</p><div class="pc-nav-group-row">';
    group.items.forEach(function (item) {
      if (item.action) {
        gridHtml += '<button class="pc-nav-icon-item" onclick="handleNavAction(\'' + item.action + '\')"><i class="ti ' + item.icon + '" aria-hidden="true"></i><p>' + item.label + '</p></button>';
        return;
      }
      var itemBaseFile = item.href.split('?')[0];
      var isCurrent = itemBaseFile === pcNavCurrentFile;
      gridHtml += '<a class="pc-nav-icon-item' + (isCurrent ? ' current' : '') + '" href="' + item.href + '"><i class="ti ' + item.icon + '" aria-hidden="true"></i><p>' + item.label + '</p></a>';
      if (item.children && isCurrent) {
        item.children.forEach(function (child) {
          var isChildCurrent = child.href === currentFullPath;
          subHtml += '<a class="pc-nav-subitem' + (isChildCurrent ? ' current' : '') + '" href="' + child.href + '">' + child.label + '</a>';
        });
      }
    });
    gridHtml += '</div></div>';
  });

  gridEl.innerHTML = gridHtml;
  subRowEl.innerHTML = subHtml;
  subRowEl.style.display = subHtml ? 'flex' : 'none';
}

function toggleNavDrawer() {
  document.getElementById('navDrawer').classList.toggle('show');
  document.getElementById('navOverlay').classList.toggle('show');
}
function closeNavDrawer() {
  document.getElementById('navDrawer').classList.remove('show');
  document.getElementById('navOverlay').classList.remove('show');
}

// サイドバーの「表示設定」など、リンクではなくアクションが指定された項目がクリックされた時の処理
function handleNavAction(action) {
  if (action === 'openDisplaySettings') {
    closeNavDrawer();
    if (typeof openDisplaySettingsModal === 'function') {
      // すでにホーム画面を開いている場合は、そのままモーダルを開く
      openDisplaySettingsModal();
    } else {
      // 他のページからの場合は、ホーム画面に移動してから開く
      window.location.href = 'index.html?openSettings=1';
    }
  }
}
