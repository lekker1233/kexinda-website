// The inquiry list: models a buyer shortlists while browsing.
// Kept in this browser only, as a convenience. It is sent when the buyer submits the form.
export type Item = { slug: string; model: string; title: string; img: string };

const KEY = 'kexinda-inquiry';
let memory: Item[] = [];

export function read(): Item[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return memory;
  }
}

function write(items: Item[]) {
  memory = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* Private mode: the list simply lasts for this page view. */
  }
  sync();
}

export function add(item: Item) {
  const items = read();
  if (!items.some((i) => i.slug === item.slug)) write([...items, item]);
}

function remove(slug: string) {
  write(read().filter((i) => i.slug !== slug));
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

function renderList(el: Element, items: Item[]) {
  el.innerHTML = items.length
    ? `<ul class="line-items">${items
        .map(
          (i) => `<li class="line-item">
            <img src="${esc(i.img)}" alt="" width="54" height="72" loading="lazy" />
            <div><a href="/products/${esc(i.slug)}/">${esc(i.model)}</a><small>${esc(i.title)}</small></div>
            <button type="button" data-remove="${esc(i.slug)}" aria-label="Remove ${esc(i.model)}">Remove</button>
          </li>`,
        )
        .join('')}</ul>`
    : `<p class="list-empty">Your list is empty. Add models from the catalog with the + button, then send them together for a quote.</p>`;
}

export function sync() {
  const items = read();
  const slugs = new Set(items.map((i) => i.slug));
  document.querySelectorAll('[data-inquiry-count]').forEach((el) => (el.textContent = String(items.length)));
  document.querySelectorAll('[data-inquiry-list]').forEach((el) => renderList(el, items));
  document.querySelectorAll<HTMLElement>('[data-inquiry-toggle]').forEach((el) => {
    const on = slugs.has(el.dataset.slug!);
    el.setAttribute('aria-pressed', String(on));
    if (el.dataset.style === 'icon') {
      el.textContent = on ? '✓' : '+';
      el.setAttribute('aria-label', `${on ? 'Remove' : 'Add'} ${el.dataset.model} ${on ? 'from' : 'to'} inquiry list`);
    } else {
      el.textContent = on ? 'Added to inquiry list ✓' : 'Add to inquiry list';
    }
  });
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const toggle = target.closest<HTMLElement>('[data-inquiry-toggle]');
  if (toggle) {
    const { slug, model, title, img } = toggle.dataset as Item;
    if (read().some((i) => i.slug === slug)) remove(slug);
    else add({ slug, model, title, img });
    return;
  }
  const removeBtn = target.closest<HTMLElement>('[data-remove]');
  if (removeBtn) {
    remove(removeBtn.dataset.remove!);
    return;
  }
  const drawer = document.querySelector<HTMLDialogElement>('[data-drawer]');
  if (target.closest('[data-open-drawer]')) drawer?.showModal();
  if (target.closest('[data-close-drawer]') || target === drawer) drawer?.close();
});

sync();
window.addEventListener('storage', sync);
window.addEventListener('pageshow', sync);
