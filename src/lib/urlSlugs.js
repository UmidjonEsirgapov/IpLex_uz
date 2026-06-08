import { allCategories } from './categories';

export function slugifyPathSegment(value) {
  return encodeURIComponent(String(value).toLowerCase());
}

export function decodePathSegment(segment) {
  return decodeURIComponent(segment);
}

export function resolveCategory(slug) {
  const decoded = decodePathSegment(slug);
  return allCategories.find(c => c.toLowerCase() === decoded.toLowerCase()) || decoded;
}

export function tagMatchesSlug(tag, slug) {
  const target = decodePathSegment(slug).toLowerCase();
  return tag.toLowerCase() === target;
}

export function resolveTagName(slug, allPosts) {
  const target = decodePathSegment(slug).toLowerCase();
  for (const post of allPosts) {
    const match = post.tags?.find(t => t.toLowerCase() === target);
    if (match) return match;
  }
  return decodePathSegment(slug);
}
