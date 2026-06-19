(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var button = one('.menu-toggle');
    var panel = one('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.classList.toggle('open', !expanded);
    });
  }

  function setupHero() {
    var hero = one('.hero-section');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('.hero-dots button', hero);
    var prev = one('.hero-arrow.prev', hero);
    var next = one('.hero-arrow.next', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = one('.filter-panel');
    var list = one('[data-filter-list]');
    if (!panel || !list) {
      return;
    }
    var search = one('[data-filter-search]', panel);
    var type = one('[data-filter-type]', panel);
    var year = one('[data-filter-year]', panel);
    var sort = one('[data-filter-sort]', panel);
    var empty = one('.empty-state');
    var cards = all('.movie-card', list);
    var years = [];

    cards.forEach(function (card) {
      var value = card.getAttribute('data-year');
      if (value && years.indexOf(value) === -1) {
        years.push(value);
      }
    });

    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });

    if (year) {
      years.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        year.appendChild(option);
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && search) {
      search.value = query;
    }

    function applySort(visibleCards) {
      if (!sort || sort.value === 'default') {
        return;
      }
      var sorted = visibleCards.slice();
      if (sort.value === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }
      if (sort.value === 'title-asc') {
        sorted.sort(function (a, b) {
          return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-Hans-CN');
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = [];
      cards.forEach(function (card) {
        var matchKeyword = !keyword || (card.getAttribute('data-search') || '').indexOf(keyword) !== -1;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var ok = matchKeyword && matchType && matchYear;
        card.hidden = !ok;
        if (ok) {
          visible.push(card);
        }
      });
      applySort(visible);
      if (empty) {
        empty.classList.toggle('show', visible.length === 0);
      }
    }

    [search, type, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  window.bindMoviePlayer = function (video, cover, trigger, source) {
    if (!video || !source) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
