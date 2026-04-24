(function () {
  const data = window.NOFT_DATA || {};

  function getPage() {
    return document.body ? document.body.dataset.page || "" : "";
  }

  function getRootPrefix() {
    const page = getPage();
    if (page === "home") return ".";
    if (page === "detail") return "../..";
    return "..";
  }

  function toRoot(path) {
    const prefix = getRootPrefix();
    return prefix === "." ? `./${path}` : `${prefix}/${path}`;
  }

  function getQueryParam(key) {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
  }

  function setQueryParam(key, value) {
    const url = new URL(window.location.href);
    if (!value || value === "all") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    window.history.replaceState({}, "", url);
  }

  function getWorkBySlug(slug) {
    return (data.works || []).find(function (work) {
      return work.slug === slug;
    });
  }

  function hasWebsiteCategory(work) {
    return (work.categorySlugs || []).some(function (slug) {
      return slug === "homepage" || slug === "landingpage" || slug === "corporatesite";
    });
  }

  function getWorkDetailHref(work) {
    const page = getPage();
    if (page === "home") return `./works/detail/index.html?slug=${encodeURIComponent(work.slug)}`;
    if (page === "works") return `./detail/index.html?slug=${encodeURIComponent(work.slug)}`;
    if (page === "detail") return `./index.html?slug=${encodeURIComponent(work.slug)}`;
    return `./works/detail/index.html?slug=${encodeURIComponent(work.slug)}`;
  }

  function getCategoryHref(slug) {
    const page = getPage();
    if (page === "home") return `./works/index.html?category=${encodeURIComponent(slug)}`;
    if (page === "works") return `./index.html?category=${encodeURIComponent(slug)}`;
    if (page === "detail") return `../index.html?category=${encodeURIComponent(slug)}`;
    return `./works/index.html?category=${encodeURIComponent(slug)}`;
  }

  function padNumber(value) {
    return String(value).padStart(2, "0");
  }

  function getInstagramIcon() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="4.5"></rect>
        <circle cx="12" cy="12" r="4.2"></circle>
        <circle cx="17.4" cy="6.6" r="1"></circle>
      </svg>
    `;
  }

  function getLineIcon() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.5c-4.97 0-9 3.46-9 7.72 0 2.43 1.31 4.59 3.36 6l-.68 3.28 3.28-1.73c.96.25 1.98.39 3.04.39 4.97 0 9-3.46 9-7.72S16.97 4.5 12 4.5z"></path>
        <path d="M8.8 11.2h6.4"></path>
        <path d="M8.8 13.5h4.8"></path>
      </svg>
    `;
  }

  function getMailIcon() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
        <path d="M4 7l8 6 8-6"></path>
      </svg>
    `;
  }

  function getEstimateIcon() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="2"></rect>
        <path d="M8 8h8"></path>
        <path d="M8 12h8"></path>
        <path d="M8 16h5"></path>
      </svg>
    `;
  }

  function syncActiveNav() {
    const current = getPage() === "detail" ? "works" : getPage();
    document.querySelectorAll(".site-header [data-nav-key]").forEach(function (link) {
      link.classList.toggle("is-active", link.dataset.navKey === current);
    });
  }

  function setupMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-menu]");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      document.body.classList.toggle("menu-open", !expanded);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }

  function renderWorkCard(work) {
    const pills = (work.categories || []).length
      ? `<div class="pill-row">${work.categories
          .map(function (category, index) {
            return `<a class="pill pill--link" href="${getCategoryHref(work.categorySlugs[index])}">#${category}</a>`;
          })
          .join("")}</div>`
      : "";

    return `
      <article class="work-card" data-categories="${(work.categorySlugs || []).join(" ")}" data-reveal>
        <a class="work-card__media-link" href="${getWorkDetailHref(work)}">
          <div class="work-card__media">
            <img src="${work.cover}" alt="${work.title}">
          </div>
        </a>
        <div class="work-card__content">
          <a class="work-card__title-link" href="${getWorkDetailHref(work)}">
            <div class="work-card__title">${work.title}</div>
          </a>
          ${pills}
        </div>
      </article>
    `;
  }

  function setupCarousel() {
    const track = document.querySelector("[data-hero-track]");
    const meta = document.querySelector("[data-hero-meta]");
    const slides = data.heroSlides || [];

    if (!track || !slides.length) return;

    track.innerHTML = slides
      .map(function (slide, index) {
        return `
          <figure class="hero-slide${index === 0 ? " is-active" : ""}" data-hero-slide>
            <img class="hero-slide__image" src="${slide.cover}" alt="">
          </figure>
        `;
      })
      .join("");

    let current = 0;

    function updateMeta() {
      if (!meta) return;
      meta.innerHTML = `<div class="hero-meta__count">${padNumber(current + 1)} / ${padNumber(slides.length)}</div>`;
    }

    function show(index) {
      current = index;
      track.querySelectorAll("[data-hero-slide]").forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      updateMeta();
    }

    updateMeta();
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 6200);
  }

  function renderHomeWorks() {
    const mount = document.querySelector("[data-home-works]");
    if (!mount || !data.works) return;
    mount.innerHTML = data.works.slice(0, 4).map(renderWorkCard).join("");
  }

  function renderAbout() {
    const image = document.querySelector("[data-about-image]");
    const name = document.querySelector("[data-about-name]");
    const mount = document.querySelector("[data-about-sections]");
    if (!mount || !data.about) return;

    if (image) image.src = data.about.image;
    if (name) name.textContent = data.about.name;

    mount.innerHTML = data.about.sections
      .map(function (section) {
        return `
          <li class="about-item" data-reveal>
            <div class="about-item__title">${section.title}</div>
            <div class="about-item__body">${section.body}</div>
          </li>
        `;
      })
      .join("");
  }

  function renderWorksPage() {
    const filterMount = document.querySelector("[data-works-filters]");
    const gridMount = document.querySelector("[data-works-grid]");
    const loadMore = document.querySelector("[data-load-more]");
    if (!gridMount || !data.works || !data.categories) return;

    let filter = getQueryParam("category") || "all";
    let visibleCount = 8;

    function filteredWorks() {
      if (filter === "all") return data.works;
      return data.works.filter(function (work) {
        return (work.categorySlugs || []).includes(filter);
      });
    }

    function renderFilters() {
      if (!filterMount) return;
      const chips = [{ title: "ALL", slug: "all" }].concat(data.categories);

      filterMount.innerHTML = chips
        .map(function (chip) {
          const active = chip.slug === filter ? " is-active" : "";
          return `<button class="filter-chip${active}" type="button" data-filter="${chip.slug}">#${chip.title}</button>`;
        })
        .join("");

      filterMount.querySelectorAll("[data-filter]").forEach(function (button) {
        button.addEventListener("click", function () {
          filter = button.getAttribute("data-filter") || "all";
          visibleCount = 8;
          setQueryParam("category", filter);
          renderFilters();
          renderGrid();
        });
      });
    }

    function renderGrid() {
      const works = filteredWorks();
      const visible = works.slice(0, visibleCount);
      gridMount.innerHTML = visible.map(renderWorkCard).join("");

      gridMount.querySelectorAll("[data-reveal]").forEach(function (node) {
        node.classList.add("is-visible");
      });

      if (loadMore) {
        loadMore.hidden = works.length <= visible.length;
      }
    }

    if (loadMore) {
      loadMore.addEventListener("click", function () {
        visibleCount += 4;
        renderGrid();
      });
    }

    renderFilters();
    renderGrid();
  }

  function renderContactPage() {
    const title = document.querySelector("[data-contact-title]");
    const copy = document.querySelector("[data-contact-copy]");
    const actions = document.querySelector("[data-contact-actions]");

    if (!data.contact) return;

    if (title) title.textContent = data.contact.title;
    if (copy) copy.innerHTML = data.contact.copy;
    if (actions) {
      actions.innerHTML = `
        <a class="action-button" href="${data.site.contactUrl}">お問い合わせページへ</a>
        <a class="action-button" href="${data.site.lineUrl}" target="_blank" rel="noopener noreferrer">公式LINE</a>
        <a class="action-button" href="${data.site.instagramUrl}" target="_blank" rel="noopener noreferrer">Instagram</a>
      `;
    }
  }

  function renderEstimatePromo() {
    const mount = document.querySelector("[data-estimate-promo]");
    if (!mount) return;

    mount.innerHTML = `
      <div class="estimate-promo__eyebrow">ESTIMATE</div>
      <div class="estimate-promo__title">見積りシミュレーション</div>
      <p class="estimate-promo__copy">Webサイト制作の概算費用を確認できるシミュレーションです。全体の印象を崩さず、初期検討の目安としてスムーズにご活用いただけます。</p>
      <a class="action-button action-button--icon" href="${data.site.estimateUrl}" target="_blank" rel="noopener noreferrer">
        ${getEstimateIcon()}
        <span>ESTIMATEへ</span>
      </a>
    `;
  }

  function renderContactBands() {
    document.querySelectorAll("[data-contact-band-actions]").forEach(function (mount) {
      mount.innerHTML = `
        <a class="cta-button" href="${data.site.contactUrl}">お問い合わせ</a>
        <a class="cta-button" href="${data.site.lineUrl}" target="_blank" rel="noopener noreferrer">公式LINE</a>
        <a class="cta-button" href="${data.site.instagramUrl}" target="_blank" rel="noopener noreferrer">Instagram</a>
      `;
    });
  }

  function renderAboutSocials() {
    document.querySelectorAll("[data-about-social]").forEach(function (mount) {
      mount.innerHTML = `
        <a class="social-chip social-chip--icon" href="${data.site.instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          ${getInstagramIcon()}
        </a>
      `;
    });
  }

  function setupDetailGallery(scope) {
    const gallery = scope.querySelector("[data-detail-gallery]");
    if (!gallery) return;

    const track = gallery.querySelector("[data-gallery-track]");
    const prev = gallery.querySelector("[data-gallery-prev]");
    const next = gallery.querySelector("[data-gallery-next]");
    const current = gallery.querySelector("[data-gallery-current]");
    const total = Number(gallery.dataset.galleryCount || "0");

    if (!track || !prev || !next || !current || !total) return;

    let index = 0;

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      current.textContent = padNumber(index + 1);
    }

    prev.addEventListener("click", function () {
      index = (index - 1 + total) % total;
      update();
    });

    next.addEventListener("click", function () {
      index = (index + 1) % total;
      update();
    });

    update();
  }

  function renderWorkDetailPage() {
    const mount = document.querySelector("[data-work-detail]");
    if (!mount) return;

    const slug = getQueryParam("slug");
    const work = getWorkBySlug(slug) || (data.works || [])[0];
    if (!work) return;

    document.title = `${work.title} | NOFT DesignWorks`;

    const categories = (work.categories || [])
      .map(function (category, index) {
        return `<a class="pill pill--link" href="../index.html?category=${encodeURIComponent(work.categorySlugs[index])}">#${category}</a>`;
      })
      .join("");

    const galleryImages =
      Array.isArray(work.gallery) && work.gallery.length > 0 ? work.gallery : [work.cover, work.cover];

    const productionParts = [];
    if ((work.categories || []).length) {
      productionParts.push(`制作種別: ${work.categories.join(" / ")}`);
    }
    if (work.deliverables) {
      productionParts.push(work.deliverables);
    }
    const productionBody = productionParts.join("<br>");

    const websiteSection = hasWebsiteCategory(work)
      ? `
        <section class="detail-copy-block" data-reveal>
          <div class="detail-copy-block__header">
            <div class="detail-copy-block__label">サイトURL</div>
            <h2 class="detail-copy-block__title">PROJECT URL</h2>
          </div>
          ${
            work.siteUrl
              ? `<p class="detail-copy-block__body"><a class="text-link" href="${work.siteUrl}" target="_blank" rel="noopener noreferrer"><span>サイトを見る</span><span class="text-link__arrow"></span></a></p>`
              : `<p class="detail-copy-block__body">この案件はWebサイト系の実績として掲載しています。公開可能なURLは準備中です。</p>`
          }
        </section>
      `
      : "";

    mount.innerHTML = `
      <article class="detail-layout">
        <div class="detail-intro" data-reveal>
          <div class="detail-heading__eyebrow">WORK DETAIL</div>
          <h1 class="detail-heading__title">${work.title}</h1>
          <div class="pill-row">${categories}</div>
        </div>

        <div class="detail-gallery" data-detail-gallery data-gallery-count="${galleryImages.length}" data-reveal>
          <button class="detail-gallery__arrow" type="button" data-gallery-prev aria-label="前の画像へ">
            <span></span>
          </button>
          <div class="detail-gallery__viewport">
            <div class="detail-gallery__track" data-gallery-track>
              ${galleryImages
                .map(function (image, index) {
                  return `
                    <figure class="detail-gallery__slide">
                      <img src="${image}" alt="${work.title} ${index + 1}">
                    </figure>
                  `;
                })
                .join("")}
            </div>
          </div>
          <button class="detail-gallery__arrow detail-gallery__arrow--next" type="button" data-gallery-next aria-label="次の画像へ">
            <span></span>
          </button>
          <div class="detail-gallery__meta">
            <span data-gallery-current>${padNumber(1)}</span>
            <span>/</span>
            <span>${padNumber(galleryImages.length)}</span>
          </div>
        </div>

        <div class="detail-copy-flow">
          <section class="detail-copy-block" data-reveal>
            <div class="detail-copy-block__header">
              <div class="detail-copy-block__label">概要</div>
              <h2 class="detail-copy-block__title">OVERVIEW</h2>
            </div>
            <p class="detail-copy-block__body">${work.summary}</p>
          </section>

          <section class="detail-copy-block" data-reveal>
            <div class="detail-copy-block__header">
              <div class="detail-copy-block__label">制作アプローチ</div>
              <h2 class="detail-copy-block__title">APPROACH</h2>
            </div>
            <p class="detail-copy-block__body">${work.approach}</p>
          </section>

          <section class="detail-copy-block" data-reveal>
            <div class="detail-copy-block__header">
              <div class="detail-copy-block__label">制作内容</div>
              <h2 class="detail-copy-block__title">PRODUCTION</h2>
            </div>
            <p class="detail-copy-block__body">${productionBody}</p>
          </section>

          ${websiteSection}
        </div>

        <div class="detail-nav" data-reveal>
          <a class="text-link" href="../index.html">
            <span>BACK TO WORKS</span>
            <span class="text-link__arrow"></span>
          </a>
        </div>
      </article>
    `;

    setupDetailGallery(mount);
  }

  function setupReveal() {
    const nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function setupCustomCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const html = document.documentElement;
    html.classList.add("has-custom-cursor");

    const cursor = document.createElement("div");
    cursor.className = "studio-target-cursor";
    document.body.appendChild(cursor);

    const hoverSelector = [
      "a",
      "button",
      "[role='button']",
      "input",
      "textarea",
      "select",
      "summary",
      "label",
      "[data-hover-cursor]"
    ].join(",");

    function updateHover(target) {
      const hoverable = target && target.closest ? target.closest(hoverSelector) : null;
      cursor.classList.toggle("is-hover", !!hoverable);
    }

    function bindIframe(frame) {
      if (!frame || frame.dataset.cursorBound === "true") return;

      frame.dataset.cursorBound = "true";

      frame.addEventListener("mouseenter", function () {
        cursor.classList.remove("is-visible", "is-hover", "is-down");
        cursor.classList.add("is-hidden-on-iframe");
      });

      frame.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-hidden-on-iframe");
      });
    }

    window.addEventListener(
      "pointermove",
      function (event) {
        const target = event.target;
        const isIframe = target && target.tagName === "IFRAME";

        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        cursor.classList.toggle("is-hidden-on-iframe", isIframe);
        cursor.classList.toggle("is-visible", !isIframe);
        updateHover(target);
      },
      { passive: true }
    );

    window.addEventListener("pointerdown", function () {
      cursor.classList.add("is-down");
    });

    window.addEventListener("pointerup", function () {
      cursor.classList.remove("is-down");
    });

    document.addEventListener("pointerleave", function () {
      cursor.classList.remove("is-visible", "is-hidden-on-iframe");
    });

    window.addEventListener("blur", function () {
      cursor.classList.remove("is-visible", "is-hidden-on-iframe");
    });

    document.querySelectorAll("iframe").forEach(function (frame) {
      bindIframe(frame);
    });

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (!(node instanceof Element)) return;
          if (node.tagName === "IFRAME") bindIframe(node);
          if (node.querySelectorAll) {
            node.querySelectorAll("iframe").forEach(function (frame) {
              bindIframe(frame);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function renderFloatingCta() {
    if (document.getElementById("noftPcCta") || document.getElementById("noftSpCta")) return;

    const pc = document.createElement("div");
    pc.className = "noft-cta noft-cta-pc";
    pc.id = "noftPcCta";
    pc.innerHTML = `
      <div class="noft-cta-pc__stack">
        <a class="noft-cta-pc__button" href="${toRoot("contact/index.html")}">
          <span>Contact</span>
          ${getMailIcon()}
        </a>
        <a class="noft-cta-pc__button" href="${data.site.estimateUrl}" target="_blank" rel="noopener noreferrer">
          <span>Estimate</span>
          ${getEstimateIcon()}
        </a>
        <a class="noft-cta-pc__button" href="${data.site.lineUrl}" target="_blank" rel="noopener noreferrer">
          <span>LINE</span>
          ${getLineIcon()}
        </a>
        <a class="noft-cta-pc__instagram" href="${data.site.instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <span>Instagram</span>
          ${getInstagramIcon()}
        </a>
      </div>
    `;

    const sp = document.createElement("div");
    sp.className = "noft-cta noft-cta-sp";
    sp.id = "noftSpCta";
    sp.innerHTML = `
      <div class="noft-cta-sp__inner noft-cta-sp__inner--four">
        <a class="noft-cta-sp__item" href="${toRoot("contact/index.html")}">
          ${getMailIcon()}
          <span>Contact</span>
        </a>
        <a class="noft-cta-sp__item" href="${data.site.estimateUrl}" target="_blank" rel="noopener noreferrer">
          ${getEstimateIcon()}
          <span>Estimate</span>
        </a>
        <a class="noft-cta-sp__item" href="${data.site.lineUrl}" target="_blank" rel="noopener noreferrer">
          ${getLineIcon()}
          <span>LINE</span>
        </a>
        <a class="noft-cta-sp__item" href="${data.site.instagramUrl}" target="_blank" rel="noopener noreferrer">
          ${getInstagramIcon()}
          <span>Instagram</span>
        </a>
      </div>
    `;

    document.body.appendChild(pc);
    document.body.appendChild(sp);

    function toggleCta() {
      const isSp = window.innerWidth <= 767;
      const isPc = window.innerWidth >= 768;
      const show = window.scrollY > 220;
      const footer = document.querySelector(".site-footer");
      const footerNearViewport = footer ? footer.getBoundingClientRect().top <= window.innerHeight - 96 : false;

      pc.classList.toggle("is-visible", isPc && show);
      sp.classList.toggle("is-visible", isSp && show && !footerNearViewport);
    }

    window.addEventListener("scroll", toggleCta, { passive: true });
    window.addEventListener("resize", toggleCta);
    toggleCta();
  }


  function setupAutoHideHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastY = window.scrollY;

    function syncHeader() {
      if (document.body.classList.contains("menu-open")) {
        header.classList.remove("is-hidden");
        lastY = window.scrollY;
        return;
      }

      const currentY = window.scrollY;
      const scrollingDown = currentY > lastY + 8;
      const scrollingUp = currentY < lastY - 8;

      if (currentY <= 80 || scrollingUp) {
        header.classList.remove("is-hidden");
      } else if (scrollingDown) {
        header.classList.add("is-hidden");
      }

      lastY = currentY;
    }

    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);
    syncHeader();
  }

  function renderBackToTop() {
    if (document.getElementById("noftBackToTop")) return;

    const button = document.createElement("button");
    button.className = "noft-back-to-top";
    button.id = "noftBackToTop";
    button.setAttribute("aria-label", "ページトップへ戻る");
    button.innerHTML = `
      <div class="noft-back-to-top__arrow-wrap">
        <div class="noft-back-to-top__arrow"></div>
        <div class="noft-back-to-top__line"></div>
      </div>
      <span class="noft-back-to-top__label">TOP</span>
    `;

    document.body.appendChild(button);

    function toggleBackToTop() {
      button.classList.toggle("is-visible", window.scrollY > 300);
    }

    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    window.addEventListener("resize", toggleBackToTop);
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    toggleBackToTop();
  }

  syncActiveNav();
  setupAutoHideHeader();
  setupMenu();
  setupCarousel();
  renderHomeWorks();
  renderAbout();
  renderWorksPage();
  renderContactPage();
  renderEstimatePromo();
  renderContactBands();
  renderAboutSocials();
  renderWorkDetailPage();
  setupReveal();
  setupCustomCursor();
  renderFloatingCta();
  renderBackToTop();
})();
