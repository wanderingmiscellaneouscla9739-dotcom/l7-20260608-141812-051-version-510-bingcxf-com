(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var next = root.querySelector("[data-hero-next]");
        var prev = root.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFiltering() {
        var lists = Array.prototype.slice.call(document.querySelectorAll(".searchable-list"));
        if (!lists.length) {
            return;
        }
        var searchInput = document.querySelector(".js-search-input");
        var filterSelect = document.querySelector(".js-filter-select");
        var sortSelect = document.querySelector(".js-sort-select");
        var countTarget = document.querySelector("[data-result-count]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && searchInput) {
            searchInput.value = query;
        }

        lists.forEach(function (list) {
            Array.prototype.slice.call(list.children).forEach(function (card, order) {
                card.setAttribute("data-default-order", String(order));
            });
        });

        function apply() {
            var keyword = normalize(searchInput ? searchInput.value : "");
            var category = filterSelect ? filterSelect.value : "";
            var visible = 0;
            lists.forEach(function (list) {
                var cards = Array.prototype.slice.call(list.children);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardCategory = card.getAttribute("data-category") || "";
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchCategory = !category || cardCategory === category;
                    var show = matchKeyword && matchCategory;
                    card.classList.toggle("is-hidden-by-filter", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                sortCards(list);
            });
            if (countTarget) {
                countTarget.textContent = "当前显示 " + visible + " 条";
            }
        }

        function sortCards(list) {
            if (!sortSelect) {
                return;
            }
            var mode = sortSelect.value;
            var cards = Array.prototype.slice.call(list.children);
            cards.sort(function (a, b) {
                if (mode === "year-desc") {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                }
                if (mode === "year-asc") {
                    return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                }
                if (mode === "rating-desc") {
                    return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                }
                return Number(a.getAttribute("data-default-order")) - Number(b.getAttribute("data-default-order"));
            });
            cards.forEach(function (card) {
                list.appendChild(card);
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", apply);
        }
        if (filterSelect) {
            filterSelect.addEventListener("change", apply);
        }
        if (sortSelect) {
            sortSelect.addEventListener("change", apply);
        }
        apply();
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFiltering();
    });
})();
