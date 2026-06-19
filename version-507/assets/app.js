(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var trigger = document.querySelector("[data-mobile-trigger]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!trigger || !panel) {
      return;
    }
    trigger.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    var clear = document.querySelector("[data-search-clear]");
    var area = document.querySelector("[data-search-area]") || document;
    if (!input) {
      return;
    }
    var items = selectAll("[data-searchable]", area);
    function applySearch() {
      var value = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-tags") || "",
          item.getAttribute("data-year") || "",
          item.getAttribute("data-region") || "",
          item.textContent || ""
        ].join(" ").toLowerCase();
        item.classList.toggle("is-hidden", value.length > 0 && text.indexOf(value) === -1);
      });
    }
    input.addEventListener("input", applySearch);
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        applySearch();
        input.focus();
      });
    }
  }

  function initHeroSlider() {
    var slides = selectAll("[data-hero-slide]");
    var dots = selectAll("[data-hero-dot]");
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
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
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
        show(target);
        start();
      });
    });
    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
    }
    start();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initSearch();
    initHeroSlider();
  });
})();
