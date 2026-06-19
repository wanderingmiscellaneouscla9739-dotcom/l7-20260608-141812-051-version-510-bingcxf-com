(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var links = qs('[data-nav-links]');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function reset() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                reset();
            });
        });
        start();
    }

    function initFilters() {
        qsa('[data-filter-scope]').forEach(function (panel) {
            var scope = panel.parentElement;
            var search = qs('[data-filter-search]', panel);
            var year = qs('[data-filter-year]', panel);
            var kind = qs('[data-filter-kind]', panel);
            var cards = qsa('.movie-card', scope);

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : '';
                var selectedYear = year ? year.value : '';
                var selectedKind = kind ? kind.value : '';
                cards.forEach(function (card) {
                    var text = card.getAttribute('data-search') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardKind = card.getAttribute('data-kind') || '';
                    var visible = true;
                    if (query && text.indexOf(query) === -1) {
                        visible = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        visible = false;
                    }
                    if (selectedKind && cardKind.indexOf(selectedKind) === -1) {
                        visible = false;
                    }
                    card.classList.toggle('is-filtered-out', !visible);
                });
            }

            [search, year, kind].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function initPlayer() {
        var holder = qs('[data-player]');
        if (!holder) {
            return;
        }
        var video = qs('video', holder);
        var button = qs('[data-play-button]', holder);
        var stream = holder.getAttribute('data-stream');
        var attached = false;
        var hls = null;

        function attach() {
            if (!video || !stream || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            }
        }

        function play() {
            attach();
            if (!video) {
                return;
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function () {
                button.classList.add('is-hidden');
                play();
            });
        }
        if (video) {
            video.addEventListener('click', play);
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
