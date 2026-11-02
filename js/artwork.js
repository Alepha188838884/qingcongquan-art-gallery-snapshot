/* ============================================================
   artwork.js —— 画作详情页逻辑
   · 通过 URL 参数 ?id=N 加载对应画作
   · 渲染画作大图、作者信息、创作故事
   · 图片灯箱：点击放大、关闭
   · 上一幅 / 下一幅 导航
   ============================================================ */

(function () {
  var root = document.getElementById('artwork-root');
  if (!root) return;

  // 取 URL 参数 id
  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get('id'), 10);

  QCQ.fetchData()
    .then(function (data) {
      var list = data.artworks;
      var index = list.findIndex(function (a) { return a.id === id; });

      if (index === -1) {
        root.innerHTML =
          '<div class="state-msg">' +
            '<p>没有找到这幅画作。</p>' +
            '<p style="margin-top:1rem"><a class="btn btn--ghost" href="gallery.html">返回画廊</a></p>' +
          '</div>';
        return;
      }

      renderArtwork(list, index);
    })
    .catch(function () {
      root.innerHTML = '<div class="state-msg">作品加载失败，请稍后再试。</div>';
    });

  /* 渲染整个详情页 */
  function renderArtwork(list, index) {
    var art = list[index];
    var prev = list[index - 1];
    var next = list[index + 1];

    document.title = art.title + ' —— 青聪泉画作展';

    // 作者头像：有图用图，无图用姓名首字显示
    var avatarHtml = art.artistAvatar
      ? '<img class="avatar" src="' + art.artistAvatar + '" alt="' + art.artist + '">'
      : '<span class="avatar">' + art.artist.charAt(0) + '</span>';

    // 作者简介（如有）
    var bioHtml = art.artistBio
      ? '<div class="bio">关于小画家：' + art.artistBio + '</div>'
      : '';

    // 创作日期（可选）：留空则不显示这一条
    var dateItemHtml = art.date
      ? '<div class="meta-item">' +
          '<span class="label">创作日期</span>' +
          '<span class="value">' + formatDate(art.date) + '</span>' +
        '</div>'
      : '';

    // 创作故事（可选）+ 小画家简介：两者都为空时整块不渲染
    var storyInner =
      (art.description ? '<h3>创作故事</h3><p>' + art.description + '</p>' : '') +
      bioHtml;
    var storyHtml = storyInner
      ? '<div class="detail-story">' + storyInner + '</div>'
      : '';

    root.innerHTML =
      '<article class="artwork-detail">' +
        // 画作大图（点击放大）
        '<figure class="detail-image" id="zoom-trigger">' +
          '<img src="' + art.image + '" alt="' + art.title + ' —— ' + art.artist + '的画作">' +
        '</figure>' +
        // 详情信息
        '<div class="detail-info">' +
          '<h1>' + art.title + '</h1>' +
          '<div class="detail-artist">' +
            avatarHtml +
            '<div>' +
              '<div class="name">' + art.artist + '</div>' +
              '<div class="sub">' + art.artistAge + ' 岁的小画家</div>' +
            '</div>' +
          '</div>' +
          '<div class="detail-meta">' +
            dateItemHtml +
            '<div class="meta-item">' +
              '<span class="label">作品分类</span>' +
              '<span class="value"><span class="tag">' + art.category + '</span></span>' +
            '</div>' +
          '</div>' +
          storyHtml +
        '</div>' +
      '</article>' +
      // 上一幅 / 下一幅 / 返回画廊
      '<nav class="detail-nav">' +
        navSide('prev', prev) +
        '<a class="btn btn--ghost" href="gallery.html">返回画廊</a>' +
        navSide('next', next) +
      '</nav>';

    initLightbox(art);
  }

  /* 生成上一幅 / 下一幅链接 */
  function navSide(dir, art) {
    var isNext = dir === 'next';
    var cls = 'nav-side nav-side--' + dir + (art ? '' : ' disabled');
    var arrow = isNext ? '下一幅 →' : '← 上一幅';
    var name = art ? art.title : '已经到头啦';
    var href = art ? 'artwork.html?id=' + art.id : '#';
    return '<a class="' + cls + '" href="' + href + '">' +
             '<span class="nav-arrow">' + arrow + '</span>' +
             '<span class="nav-name">' + name + '</span>' +
           '</a>';
  }

  /* 把 "2025-03" 格式化为 "2025 年 3 月" */
  function formatDate(d) {
    var parts = (d || '').split('-');
    if (parts.length < 2) return d;
    return parts[0] + ' 年 ' + parseInt(parts[1], 10) + ' 月';
  }

  /* 灯箱：点击大图全屏查看 */
  function initLightbox(art) {
    var trigger = document.getElementById('zoom-trigger');
    var box = document.getElementById('lightbox');
    var boxImg = document.getElementById('lightbox-img');
    var closeBtn = document.getElementById('lightbox-close');
    if (!trigger || !box) return;

    function open() {
      boxImg.src = art.image;
      boxImg.alt = art.title;
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    trigger.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    // 点击图片以外的区域关闭
    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });
    // Esc 键关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }
})();
