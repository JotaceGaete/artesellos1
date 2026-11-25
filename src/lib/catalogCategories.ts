export const CATALOG_CATEGORIES = [
  { slug: 'automaticos', label: 'Automáticos' },
  { slug: 'bolsillo',    label: 'De bolsillo' },
  { slug: 'fechadores',  label: 'Fechadores' },
  { slug: 'redondos',    label: 'Redondos' },
] as const;

export type CategorySlug = (typeof CATALOG_CATEGORIES)[number]['slug'];

export function categoryLabel(slug: string): string {
  return CATALOG_CATEGORIES.find(c => c.slug === slug)?.label ?? slug;
}
