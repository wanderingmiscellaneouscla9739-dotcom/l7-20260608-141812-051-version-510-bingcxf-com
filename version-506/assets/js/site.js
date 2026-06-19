(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var setSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }
    }

    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-card-list]');
    if (panel && list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var searchInput = panel.querySelector('[data-search-input]');
        var categoryFilter = panel.querySelector('[data-category-filter]');
        var yearFilter = panel.querySelector('[data-year-filter]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var incomingQuery = params.get('q');
        if (incomingQuery && searchInput) {
            searchInput.value = incomingQuery;
        }
        var filterCards = function () {
            var q = (searchInput && searchInput.value || '').trim().toLowerCase();
            var category = categoryFilter && categoryFilter.value || '';
            var year = (yearFilter && yearFilter.value || '').trim();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var match = true;
                if (q && text.indexOf(q) === -1) {
                    match = false;
                }
                if (category && cardCategory !== category) {
                    match = false;
                }
                if (year && cardYear.indexOf(year) === -1) {
                    match = false;
                }
                card.classList.toggle('hide', !match);
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        };
        [searchInput, categoryFilter, yearFilter].forEach(function (input) {
            if (input) {
                input.addEventListener('input', filterCards);
                input.addEventListener('change', filterCards);
            }
        });
        filterCards();
    }
})();

function setupMoviePlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-play-overlay]');
    var playButton = document.querySelector('[data-play-button]');
    var muteButton = document.querySelector('[data-mute-button]');
    var fullscreenButton = document.querySelector('[data-fullscreen-button]');
    var attached = false;
    var hls = null;

    if (!video || !streamUrl) {
        return;
    }

    var attach = function () {
        if (attached) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        attached = true;
    };

    var play = function () {
        attach();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    };

    var toggle = function () {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    };

    if (overlay) {
        overlay.addEventListener('click', play);
    }
    if (playButton) {
        playButton.addEventListener('click', toggle);
    }
    if (muteButton) {
        muteButton.addEventListener('click', function () {
            video.muted = !video.muted;
        });
    }
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen();
            }
        });
    }
    video.addEventListener('click', toggle);
    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
    window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}
