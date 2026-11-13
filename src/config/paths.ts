export const siteOrigin = 'https://yuwenan.github.io';
export const siteBase = '/yuwennan-site/portfolio/';
export const withBase = (path: string) => {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path) || path.startsWith(siteBase)) return path;
  return `${siteBase}${path.replace(/^\/+/, '')}`;
};
