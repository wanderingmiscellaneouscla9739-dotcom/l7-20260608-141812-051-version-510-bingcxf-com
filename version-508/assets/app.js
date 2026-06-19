(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const tabs = Array.from(document.querySelectorAll('[data-hero-tab]'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    tabs.forEach(function (tab, tabIndex) {
      tab.classList.toggle('active', tabIndex === activeSlide);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const index = Number(tab.getAttribute('data-hero-tab'));
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterCards = Array.from(document.querySelectorAll('[data-filter-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && filterCards.length) {
    filterInput.addEventListener('input', function () {
      const keyword = filterInput.value.trim().toLowerCase();
      let visibleCount = 0;

      filterCards.forEach(function (card) {
        const text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        const visible = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visibleCount === 0);
      }
    });
  }

  function setupPlayer(player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    const streamUrl = video.getAttribute('data-stream');
    let attached = false;

    function attach() {
      if (attached || !streamUrl) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      button.classList.add('hidden');
      const playTask = video.play();

      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          button.classList.remove('hidden');
        });
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      start();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      button.classList.add('hidden');
    });
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
