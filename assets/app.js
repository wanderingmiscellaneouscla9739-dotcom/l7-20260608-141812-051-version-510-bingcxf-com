(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initCardFilters() {
    var input = document.querySelector('[data-card-search]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '没有找到匹配影片';
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesCategory = !category || card.getAttribute('data-category') === category;
        var show = matchesKeyword && matchesYear && matchesCategory;
        card.classList.toggle('card-hidden', !show);
        if (show) {
          visible += 1;
        }
      });
      if (visible === 0) {
        if (!empty.parentNode) {
          list.appendChild(empty);
        }
      } else if (empty.parentNode) {
        empty.parentNode.removeChild(empty);
      }
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', apply);
    }
  }

  function movieCardTemplate(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('') : '';
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.summary) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  window.initSearchPage = function () {
    var items = window.SEARCH_MOVIES || [];
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    if (!form || !input || !results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function render(query) {
      var term = query.trim().toLowerCase();
      if (!term) {
        title.textContent = '热门推荐';
        results.innerHTML = items.slice(0, 36).map(movieCardTemplate).join('');
        return;
      }
      var matched = items.filter(function (movie) {
        var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, Array.isArray(movie.tags) ? movie.tags.join(' ') : '', movie.summary].join(' ').toLowerCase();
        return haystack.indexOf(term) !== -1;
      }).slice(0, 120);
      title.textContent = '搜索结果';
      if (matched.length) {
        results.innerHTML = matched.map(movieCardTemplate).join('');
      } else {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
      }
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      history.replaceState(null, '', nextUrl);
      render(query);
    });
    input.addEventListener('input', function () {
      render(input.value);
    });
    render(initial);
  };

  window.setupVideoPlayer = function (videoId, buttonId, streamUrl) {
    ready(function () {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      if (!video || !button || !streamUrl) {
        return;
      }
      var attached = false;
      var hls = null;
      function playVideo() {
        button.classList.add('is-hidden');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }
      function attachAndPlay() {
        if (attached) {
          playVideo();
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(streamUrl);
          });
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          return;
        }
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
      }
      button.addEventListener('click', attachAndPlay);
      video.addEventListener('click', function () {
        if (video.paused) {
          attachAndPlay();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
    });
  };

  ready(function () {
    initMobileMenu();
    initHero();
    initCardFilters();
  });
})();
