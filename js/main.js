/* ============================================================
   main.js —— 公共逻辑
   · 移动端导航栏汉堡菜单
   · 共享的数据加载与画作卡片生成工具（QCQ 命名空间）
   · 首页「精选作品」网格渲染
   ============================================================ */

/* ---------- 移动端导航栏切换 ---------- */
(function initNav() {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // 点击菜单项后自动收起
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---------- 共享工具：QCQ 命名空间 ---------- */
window.QCQ = (function () {
  // 加载网站数据（返回 Promise）。结果缓存，页内多处调用共享同一次请求。
  var dataPromise = null;
  function fetchData() {
    if (!dataPromise) {
      dataPromise = fetch('data/artworks.json').then(function (res) {
        if (!res.ok) throw new Error('数据加载失败');
        return res.json();
      });
    }
    return dataPromise;
  }

  // 根据一条画作数据生成卡片元素（<a> 链接）
  function artCard(item) {
    var a = document.createElement('a');
    a.className = 'art-card';
    a.href = 'artwork.html?id=' + item.id;

    a.innerHTML =
      '<div class="img-wrap">' +
        '<img src="' + item.image + '" alt="' + item.title +
          ' —— ' + item.artist + '的画作" loading="lazy">' +
        '<div class="overlay"><span>查看详情</span></div>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-title">' + item.title + '</div>' +
        '<div class="card-meta">' + item.artist + ' · ' + item.category + '</div>' +
      '</div>';

    return a;
  }

  return { fetchData: fetchData, artCard: artCard };
})();

/* ---------- 首页：渲染精选作品 ---------- */
(function initFeatured() {
  var grid = document.getElementById('featured-grid');
  if (!grid) return; // 仅首页存在该容器

  QCQ.fetchData()
    .then(function (data) {
      var featured = data.artworks.filter(function (a) { return a.featured; });
      // 最多展示 8 幅
      featured.slice(0, 8).forEach(function (item) {
        grid.appendChild(QCQ.artCard(item));
      });
    })
    .catch(function () {
      grid.innerHTML =
        '<p class="state-msg">作品加载失败，请稍后再试。</p>';
    });
})();

/* ---------- 机构信息：用后台 CMS 数据填充页面（页脚、关于页等） ---------- */
(function initSiteInfo() {
  // 页面 HTML 里已写有默认值；加载成功才覆盖，失败或字段为空均保留默认值，绝不留空。
  QCQ.fetchData()
    .then(function (data) {
      if (data && data.siteInfo) applySiteInfo(data.siteInfo);
    })
    .catch(function () { /* 保留页面中硬编码的默认机构信息 */ });

  // 按 "a.b.c" 路径取嵌套字段值
  function valueAt(info, path) {
    return path.split('.').reduce(function (obj, key) {
      return obj == null ? undefined : obj[key];
    }, info);
  }

  function applySiteInfo(info) {
    // data-site-text：把元素文本替换为对应字段
    document.querySelectorAll('[data-site-text]').forEach(function (el) {
      var v = valueAt(info, el.getAttribute('data-site-text'));
      if (v != null && v !== '') el.textContent = v;
    });
    // data-site-mailto：把链接的 href 设为 mailto:邮箱（文本不变）
    document.querySelectorAll('[data-site-mailto]').forEach(function (el) {
      var v = valueAt(info, el.getAttribute('data-site-mailto'));
      if (v != null && v !== '') el.setAttribute('href', 'mailto:' + v);
    });
  }
})();
