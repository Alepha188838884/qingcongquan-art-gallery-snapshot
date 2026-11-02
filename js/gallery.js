/* ============================================================
   gallery.js —— 画廊页逻辑
   · 加载全部画作并以瀑布流布局展示
   · 支持按分类、按作者筛选，「全部」重置
   · 筛选结果为空时显示友好空状态
   ============================================================ */

(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  var chipBox = document.getElementById('category-filter');
  var authorSelect = document.getElementById('author-filter');
  var emptyState = document.getElementById('empty-state');

  var allArtworks = [];
  var current = { category: '全部', author: '全部' };

  /* 渲染符合当前筛选条件的画作 */
  function render() {
    var list = allArtworks.filter(function (a) {
      var okCat = current.category === '全部' || a.category === current.category;
      var okAuthor = current.author === '全部' || a.artist === current.author;
      return okCat && okAuthor;
    });

    grid.innerHTML = '';

    if (list.length === 0) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    list.forEach(function (item, i) {
      var card = QCQ.artCard(item);
      card.classList.add('fade-in');
      // 轻微的错落进场动画
      card.style.animationDelay = (i * 0.05) + 's';
      grid.appendChild(card);
    });
  }

  /* 构建分类筛选胶囊按钮 */
  function buildCategoryChips(categories) {
    var values = ['全部'].concat(categories);
    values.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.className = 'chip' + (cat === '全部' ? ' is-active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', function () {
        current.category = cat;
        chipBox.querySelectorAll('.chip').forEach(function (c) {
          c.classList.remove('is-active');
        });
        btn.classList.add('is-active');
        render();
      });
      chipBox.appendChild(btn);
    });
  }

  /* 构建作者下拉选项（依据实际出现的作者去重） */
  function buildAuthorOptions(artworks) {
    var seen = {};
    artworks.forEach(function (a) { seen[a.artist] = true; });
    Object.keys(seen).forEach(function (name) {
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      authorSelect.appendChild(opt);
    });
    authorSelect.addEventListener('change', function () {
      current.author = authorSelect.value;
      render();
    });
  }

  /* 从画作中汇总实际出现过的分类（按首次出现顺序去重） */
  function collectCategories(artworks) {
    var seen = {};
    var list = [];
    artworks.forEach(function (a) {
      if (a.category && !seen[a.category]) {
        seen[a.category] = true;
        list.push(a.category);
      }
    });
    return list;
  }

  /* 初始化 */
  QCQ.fetchData()
    .then(function (data) {
      allArtworks = data.artworks;
      buildCategoryChips(collectCategories(data.artworks));
      buildAuthorOptions(data.artworks);
      render();
    })
    .catch(function () {
      grid.innerHTML = '<p class="state-msg">作品加载失败，请稍后再试。</p>';
    });
})();
