export const FORBIDDEN_TAGS = new Set(['我不知道的', '系列索引']);

export const TAG_ALIASES = new Map([
  ['浏览器原理', '浏览器'],
  ['bug', '问题排查'],
  ['bugs', '问题排查'],
  ['Search', '搜索'],
  ['Performance', '性能优化'],
]);

export const STRATEGIC_TAGS = new Set(['Astro', '搜索', 'Pagefind']);

export const MAX_TAGS_PER_POST = 4;
export const MAX_TAGS_PER_INDEX = 3;

export const TAG_POLICY_DOC = 'docs/tag-taxonomy.md';

export function getTagLimit(type) {
  return type === 'index' ? MAX_TAGS_PER_INDEX : MAX_TAGS_PER_POST;
}

export function normalizeTagValue(tag) {
  return TAG_ALIASES.get(tag) ?? tag;
}

export function cleanTagList(tags = []) {
  return [...new Set(tags.map(normalizeTagValue).filter((tag) => !FORBIDDEN_TAGS.has(tag)))];
}
