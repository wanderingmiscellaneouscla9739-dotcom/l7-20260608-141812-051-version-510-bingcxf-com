(function () {
  window.setupPlayer = function (streamUrl) {
    var panel = document.querySelector("[data-player]");
    if (!panel) {
      return;
    }
    var video = panel.querySelector("video");
    var overlay = panel.querySelector(".player-overlay");
    var started = false;
    function playVideo() {
      if (started || !video || !streamUrl) {
        return;
      }
      started = true;
      panel.classList.add("is-playing");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        return;
      }
      video.src = streamUrl;
      video.play();
    }
    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          playVideo();
        }
      });
    }
  };
})();
