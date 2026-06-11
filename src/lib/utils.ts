export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')   // Remove all non-word chars
    .replace(/--+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')        // Trim - from start of text
    .replace(/-+$/, '');       // Trim - from end of text
}

export function getItemUrl(item: { _id: string, name: string }) {
  const slug = slugify(item.name);
  return `/shop/${item._id}${slug ? `-${slug}` : ''}`;
}

export function extractIdFromSlug(slug: string) {
  // MongoDB ObjectIds are 24 hex characters.
  // If the slug is longer and has a hyphen after 24 chars, or just has a hyphen.
  if (slug.includes('-')) {
    return slug.split('-')[0];
  }
  return slug;
}
