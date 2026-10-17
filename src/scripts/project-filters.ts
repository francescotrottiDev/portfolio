/** Progressive enhancement: every filter remains a real, statically generated URL. */
export function initProjectFilters(root: HTMLElement) {
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-project-filter]')];
  const entries = [...root.querySelectorAll<HTMLElement>('[data-project-entry]')];
  const count = root.querySelector<HTMLElement>('[data-project-count]')!;
  const empty = root.querySelector<HTMLElement>('[data-project-empty]')!;
  const apply = (selected: HTMLAnchorElement) => {
    const key = selected.dataset.category!;
    let visible = 0;
    for (const entry of entries) { entry.hidden = !!key && entry.dataset.category !== key; if (!entry.hidden) visible++; }
    for (const link of links) {
      if (link === selected) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
    }
    const name = selected.childNodes[0]?.textContent?.trim();
    count.textContent = `${visible} ${visible === 1 ? 'entry' : 'entries'}${key ? ` / ${name}` : ''}`;
    empty.hidden = visible > 0;
    root.dataset.filtered = key;
    // Keep robots/canonical metadata in sync with the URL even without navigation.
    document.title = key ? `${name} projects — Francesco Trotti` : 'Projects — Francesco Trotti';
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = new URL(selected.pathname,canonical.href).href;
    const og = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (og && canonical) og.content = canonical.href;
  };
  const selectedForPath = () => links.find(link=>link.pathname.replace(/\/$/,'') === location.pathname.replace(/\/$/,'')) ?? links[0];
  root.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('[data-project-filter], [data-clear-filter]') : null;
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const selected = link.hasAttribute('data-clear-filter') ? links[0] : link;
    if (!selected) return;
    event.preventDefault();
    if (location.pathname !== selected.pathname) history.pushState(null,'',selected.href);
    apply(selected);
  });
  window.addEventListener('popstate',()=>apply(selectedForPath()));
  apply(selectedForPath());
}
