(function () {
    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        var search = document.querySelector(".nav-search");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            if (search) {
                search.classList.toggle("is-open");
            }
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", slider);
        var dots = selectAll("[data-hero-dot]", slider);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                activate(dotIndex);
            });
        });
        window.setInterval(function () {
            activate(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!panel || !grid) {
            return;
        }
        var input = panel.querySelector("[data-filter-input]");
        var year = panel.querySelector("[data-year-filter]");
        var reset = panel.querySelector("[data-filter-reset]");
        var cards = selectAll("[data-movie-card]", grid);
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var sameKeyword = !keyword || text.indexOf(keyword) !== -1;
                var sameYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                card.style.display = sameKeyword && sameYear ? "" : "none";
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (year) {
                    year.value = "";
                }
                apply();
            });
        }
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function cardTemplate(movie) {
        return [
            '<article class="movie-card">',
            '<a href="' + escapeHTML(movie.url) + '" aria-label="观看 ' + escapeHTML(movie.title) + '">',
            '<figure class="movie-thumb">',
            '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
            '<span class="movie-badge">' + escapeHTML(movie.category) + '</span>',
            '<span class="movie-year">' + escapeHTML(movie.year) + '</span>',
            '<span class="movie-play">▶</span>',
            '</figure>',
            '<div class="movie-body">',
            '<h3>' + escapeHTML(movie.title) + '</h3>',
            '<p>' + escapeHTML(movie.description) + '</p>',
            '<div class="movie-meta">',
            '<span>' + escapeHTML(movie.region) + '</span>',
            '<span>' + escapeHTML(movie.type) + '</span>',
            '<span>★ ' + escapeHTML(movie.rating) + '</span>',
            '</div>',
            '</div>',
            '</a>',
            '</article>'
        ].join("");
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        if (!results || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var queryInput = document.querySelector("[data-search-input]");
        var yearSelect = document.querySelector("[data-search-year]");
        var categorySelect = document.querySelector("[data-search-category]");
        var initialQuery = params.get("q") || "";
        if (queryInput) {
            queryInput.value = initialQuery;
        }
        var years = Array.from(new Set(window.SITE_MOVIES.map(function (movie) {
            return movie.year;
        }))).sort().reverse();
        var categories = Array.from(new Set(window.SITE_MOVIES.map(function (movie) {
            return movie.category;
        }))).sort();
        years.forEach(function (year) {
            if (yearSelect) {
                yearSelect.insertAdjacentHTML("beforeend", '<option value="' + escapeHTML(year) + '">' + escapeHTML(year) + '</option>');
            }
        });
        categories.forEach(function (category) {
            if (categorySelect) {
                categorySelect.insertAdjacentHTML("beforeend", '<option value="' + escapeHTML(category) + '">' + escapeHTML(category) + '</option>');
            }
        });
        function render() {
            var keyword = queryInput ? queryInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var category = categorySelect ? categorySelect.value : "";
            var matches = window.SITE_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.genre, movie.tags, movie.description, movie.year, movie.category].join(" ").toLowerCase();
                return (!keyword || text.indexOf(keyword) !== -1) &&
                    (!year || movie.year === year) &&
                    (!category || movie.category === category);
            }).slice(0, 96);
            if (!matches.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试更换关键词。</div>';
                return;
            }
            results.innerHTML = matches.map(cardTemplate).join("");
        }
        if (queryInput) {
            queryInput.addEventListener("input", render);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", render);
        }
        if (categorySelect) {
            categorySelect.addEventListener("change", render);
        }
        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
