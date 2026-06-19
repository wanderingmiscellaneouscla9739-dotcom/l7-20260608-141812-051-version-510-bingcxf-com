(function () {
    window.initMoviePlayer = function (settings) {
        var video = document.querySelector(settings.video);
        var button = document.querySelector(settings.button);
        var overlay = document.querySelector(settings.overlay);
        var hlsInstance = null;
        if (!video || !settings.source) {
            return;
        }
        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = settings.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(settings.source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = settings.source;
            }
            video.setAttribute("data-ready", "1");
        }
        function start() {
            attach();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    video.controls = true;
                });
            }
        }
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.getAttribute("data-ready") !== "1" || video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
