(() => {
  const nav = document.getElementById("post-table-of-contents");
  if (!nav) return;

  const panel = nav.closest("details");
  const desktop = window.matchMedia("(min-width: 768px)");
  const sections = Array.from(nav.querySelectorAll('a[href^="#"]'))
    .map((link) => ({
      link,
      heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
    }))
    .filter(({ heading }) => heading);
  if (!sections.length) return;

  const updateDisclosure = () => {
    panel.open = desktop.matches;
  };
  updateDisclosure();
  desktop.addEventListener("change", updateDisclosure);

  // Close the mobile contents before the browser follows the heading anchor.
  nav.addEventListener("click", (event) => {
    if (!desktop.matches && event.target.closest("a")) panel.open = false;
  });

  let currentLink;
  let scheduled = false;
  const updateCurrentSection = () => {
    scheduled = false;
    let active = sections[0].link;
    for (const { link, heading } of sections) {
      if (heading.getBoundingClientRect().top > 100) break;
      active = link;
    }
    if (active === currentLink) return;
    currentLink?.removeAttribute("aria-current");
    active.setAttribute("aria-current", "location");
    currentLink = active;

    // A long contents list scrolls independently, without moving the article.
    if (desktop.matches && panel.open) {
      const sidebar = nav.closest("aside");
      const bounds = sidebar.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.top < bounds.top) sidebar.scrollTop += item.top - bounds.top;
      else if (item.bottom > bounds.bottom) sidebar.scrollTop += item.bottom - bounds.bottom;
    }
  };
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateCurrentSection);
  };
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate);
  updateCurrentSection();
})();
