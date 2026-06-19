(function () {
    var hlsPromise = null;

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error('hls load failed'));
            };
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('active', i === index);
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

        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-filter-grid]');
        if (!panel || !grid) {
            return;
        }
        var searchInput = panel.querySelector('[data-search-input]');
        var typeInput = panel.querySelector('[data-filter-type]');
        var regionInput = panel.querySelector('[data-filter-region]');
        var categoryInput = panel.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && searchInput) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filter() {
            var keyword = normalize(searchInput && searchInput.value);
            var type = normalize(typeInput && typeInput.value);
            var region = normalize(regionInput && regionInput.value);
            var category = normalize(categoryInput && categoryInput.value);
            var visible = 0;

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute('data-search'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var matched = true;

                if (keyword && search.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    matched = false;
                }
                if (region && cardRegion.indexOf(region) === -1) {
                    matched = false;
                }
                if (category && cardCategory !== category) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [searchInput, typeInput, regionInput, categoryInput].forEach(function (input) {
            if (input) {
                input.addEventListener('input', filter);
                input.addEventListener('change', filter);
            }
        });

        filter();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var source = video && video.getAttribute('data-src');
            var playButton = shell.querySelector('[data-player-play]');
            var muteButton = shell.querySelector('[data-player-mute]');
            var fullscreenButton = shell.querySelector('[data-player-fullscreen]');
            var loading = shell.querySelector('[data-player-loading]');
            var isReady = false;
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function hideLoading() {
                if (loading) {
                    loading.classList.add('hide');
                }
            }

            function attachSource() {
                if (isReady) {
                    return Promise.resolve();
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    isReady = true;
                    return Promise.resolve();
                }
                return loadHls().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(Hls.Events.MANIFEST_PARSED, hideLoading);
                        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                hideLoading();
                            }
                        });
                    } else {
                        video.src = source;
                    }
                    isReady = true;
                }).catch(function () {
                    video.src = source;
                    isReady = true;
                });
            }

            function togglePlay() {
                attachSource().then(function () {
                    if (video.paused) {
                        video.play().catch(function () {});
                    } else {
                        video.pause();
                    }
                });
            }

            attachSource().then(function () {
                window.setTimeout(hideLoading, 1200);
            });
            video.addEventListener('canplay', hideLoading);
            video.addEventListener('playing', function () {
                hideLoading();
                if (playButton) {
                    playButton.textContent = 'Ⅱ';
                }
            });
            video.addEventListener('pause', function () {
                if (playButton) {
                    playButton.textContent = '▶';
                }
            });
            video.addEventListener('click', togglePlay);

            if (playButton) {
                playButton.addEventListener('click', togglePlay);
            }
            if (muteButton) {
                muteButton.addEventListener('click', function () {
                    video.muted = !video.muted;
                    muteButton.textContent = video.muted ? '🔇' : '🔊';
                });
            }
            if (fullscreenButton) {
                fullscreenButton.addEventListener('click', function () {
                    var target = shell.requestFullscreen ? shell : video;
                    if (target.requestFullscreen) {
                        target.requestFullscreen();
                    } else if (video.webkitEnterFullscreen) {
                        video.webkitEnterFullscreen();
                    }
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
