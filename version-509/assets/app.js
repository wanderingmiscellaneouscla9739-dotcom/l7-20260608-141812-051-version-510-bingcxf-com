(function () {
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initMobileNavigation() {
        var toggle = $('.mobile-toggle');
        var nav = $('.main-nav');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initHeroSlider() {
        var slides = $all('.hero-slide');
        var dots = $all('.hero-dot');
        var current = 0;

        if (!slides.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 5500);
    }

    function loadHlsScript(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var existing = document.querySelector('script[data-hls-loader="true"]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.dataset.hlsLoader = 'true';
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function initVideoPlayer() {
        var video = $('#movie-player');
        var trigger = $('.play-trigger');
        var overlay = $('.player-overlay');
        var message = $('.player-message');

        if (!video || !window.__VIDEO_CONFIG__) {
            return;
        }

        var source = window.__VIDEO_CONFIG__.src;
        var hasInitialized = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function bindNative() {
            video.src = source;
            setMessage('播放准备完成，可开始观看。');
        }

        function bindWithHls() {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                window.__ACTIVE_HLS__ = hls;
                setMessage('播放准备完成，可开始观看。');
                return true;
            }
            return false;
        }

        function initializePlayer() {
            if (hasInitialized) {
                return Promise.resolve();
            }

            hasInitialized = true;
            setMessage('正在准备播放...');

            return new Promise(function (resolve) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    bindNative();
                    resolve();
                    return;
                }

                loadHlsScript(function () {
                    if (!bindWithHls()) {
                        bindNative();
                    }
                    resolve();
                });
            });
        }

        function startPlayback() {
            initializePlayer().then(function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setMessage('视频已准备，请再次点击播放按钮。');
                    });
                }
            });
        }

        if (trigger) {
            trigger.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (!hasInitialized) {
                startPlayback();
            }
        });
    }

    function initSearchPage() {
        var form = $('#search-form');
        var keywordInput = $('#search-keyword');
        var typeSelect = $('#search-type');
        var genreSelect = $('#search-genre');
        var yearSelect = $('#search-year');
        var results = $('#search-results');
        var note = $('#search-results-note');
        var data = window.SEARCH_INDEX || [];

        if (!form || !results || !data.length) {
            return;
        }

        function card(item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
                '        <span class="poster-frame">',
                '            <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + ' 封面" loading="lazy">',
                '            <span class="poster-shade"></span>',
                '            <span class="quality-badge">HD</span>',
                '            <span class="duration-badge">' + escapeHtml(item.duration) + '</span>',
                '            <span class="poster-play">▶</span>',
                '        </span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.region) + '</p>',
                '        <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
                '        <p class="movie-one-line">' + escapeHtml(item.oneLine) + '</p>',
                '        <div class="tag-row">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function render() {
            var keyword = normalize(keywordInput.value);
            var type = normalize(typeSelect.value);
            var genre = normalize(genreSelect.value);
            var year = normalize(yearSelect.value);

            var filtered = data.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    (item.tags || []).join(' '),
                    item.oneLine,
                    item.summary
                ].join(' '));

                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesType = !type || normalize(item.type).indexOf(type) !== -1;
                var matchesGenre = !genre || normalize(item.genre).indexOf(genre) !== -1;
                var matchesYear = !year || normalize(item.year) === year;

                return matchesKeyword && matchesType && matchesGenre && matchesYear;
            }).slice(0, 96);

            results.innerHTML = filtered.map(card).join('\n');
            if (note) {
                note.textContent = filtered.length ? '已展示匹配影片，点击卡片进入详情播放。' : '未找到匹配内容，请更换关键词或筛选条件。';
            }
        }

        var params = new URLSearchParams(window.location.search);
        if (params.get('q')) {
            keywordInput.value = params.get('q');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });

        [keywordInput, typeSelect, genreSelect, yearSelect].forEach(function (control) {
            control.addEventListener('input', render);
            control.addEventListener('change', render);
        });

        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNavigation();
        initHeroSlider();
        initVideoPlayer();
        initSearchPage();
    });
}());
