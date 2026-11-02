import { getCollection } from 'astro:content';

export interface NavPage {
  id: string;
  data: {
    title: string;
  };
}

/**
 * Known pages stay in a stable public order. Any other published markdown
 * file is appended, so adding or removing a file updates the menu.
 */
const PREFERRED_ORDER = [
  '_index',
  'hackerspace',
  'events',
  'calendar-events',
  'membership',
  'member-benefits',
  'meetings-agm',
  'rules-policies',
  'faq',
  'incidents',
  'mailing-list',
  'social-chat',
  'contact-us',
  'donate',
  'press',
];

const preferredIndex = new Map(PREFERRED_ORDER.map((id, index) => [id, index]));

export async function getPublishedPages() {
  const entries = await getCollection('pages', ({ data }) => data.draft !== true);
  return [...entries].sort(comparePages);
}

function comparePages(a: NavPage, b: NavPage) {
  const ai = preferredIndex.get(a.id);
  const bi = preferredIndex.get(b.id);
  if (ai !== undefined && bi !== undefined) return ai - bi;
  if (ai !== undefined) return -1;
  if (bi !== undefined) return 1;
  return a.id.localeCompare(b.id);
}

/** Path segment for a content id. Home (`_index`) has no segment. */
export function routeSlug(id: string): string | null {
  if (id === '_index') return null;
  if (id.endsWith('/_index')) return id.slice(0, -'/_index'.length);
  return id;
}

export function pageHref(id: string): string {
  const slug = routeSlug(id);
  if (!slug) return '/';
  return `/${slug}/`;
}

function humanize(id: string): string {
  const base = id.endsWith('/_index') ? id.slice(0, -'/_index'.length) : id;
  const name = base.split('/').pop() ?? base;
  return name
    .split('-')
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'faq') return 'FAQ';
      if (lower === 'agm') return 'AGM';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function baseLabel(id: string, title: string): string {
  if (id === '_index') return 'Home';
  const head = title.split(/\s+[–—-]\s+/)[0]?.replace(/\|/g, '').trim();
  return head || humanize(id);
}

/** Labels follow each file's title. Shared titles fall back to the filename. */
export function navLabels(pages: NavPage[]): Map<string, string> {
  const preliminary = pages.map((page) => ({
    id: page.id,
    label: baseLabel(page.id, page.data.title),
  }));
  const counts = new Map<string, number>();
  for (const item of preliminary) {
    counts.set(item.label, (counts.get(item.label) ?? 0) + 1);
  }
  return new Map(
    preliminary.map((item) => [
      item.id,
      (counts.get(item.label) ?? 0) > 1 ? humanize(item.id) : item.label,
    ]),
  );
}
