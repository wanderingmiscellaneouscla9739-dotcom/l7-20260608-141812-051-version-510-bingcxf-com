(function () {
    function setupMoviePlayer(config) {
        var video = document.querySelector(config.videoSelector);
        var cover = document.querySelector(config.coverSelector);
        var button = document.querySelector(config.buttonSelector);
        var state = document.querySelector(config.stateSelector);
        var source = config.source;
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function setState(text) {
            if (state) {
                state.textContent = text;
            }
        }

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            loadVideo();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                    setState("点击播放");
                });
            }
        }

        function togglePlayback() {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        }

        var clickTargets = [];
        if (cover) {
            clickTargets.push(cover);
        }
        if (button && button !== cover) {
            clickTargets.push(button);
        }
        clickTargets.forEach(function (target) {
            target.addEventListener("click", startPlayback);
        });

        video.addEventListener("click", togglePlayback);
        video.addEventListener("play", function () {
            setState("正在播放");
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            setState("继续播放");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
