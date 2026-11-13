import { withBase, siteOrigin, siteBase } from './paths';
export interface NavLink {
  label: string;
  href: string;
}
export const siteConfig = {
  name: '喻雯楠',
  title: '喻雯楠 · AI 产品作品集',
  description:
    '从真实问题出发，把 AI 做进产品。精选 AI 红娘、AI 视频、智能手表、Prompt 管理、农业交易与语音输入六个案例。',
  siteUrl: `${siteOrigin}${siteBase}`,
  language: 'zh-CN',
  locale: 'zh_CN',
  dateLocale: 'zh-CN',
  socialImage: withBase('/social.svg'),
  author: { name: '喻雯楠', role: 'AI 产品经理', location: '杭州', email: '' },
  availability: { enabled: true, label: 'AI 产品经理 · 作品集' },
  action: { label: '浏览作品 ↗', href: withBase('/#work') },
  resumePdf: '',
  cookieConsent: { enabled: false },
  socials: [{ label: 'GitHub', href: 'https://github.com/yuwenan' }] satisfies NavLink[],
};
export const navigation: NavLink[] = [
  { label: '精选作品', href: withBase('/#work') },
  { label: '我的方法', href: withBase('/#approach') },
  { label: '关于我', href: withBase('/about/') },
];
export const legalLinks: NavLink[] = [];
