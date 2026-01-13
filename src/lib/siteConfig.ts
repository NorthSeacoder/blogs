export const siteConfig = {
  title: '?.log',
  description: '探索未知的技术笔记',
  author: 'NorthSeacoder',
  siteUrl: 'https://example.com',
  language: 'zh-CN',
  keywords: ['前端', '工程化', 'TypeScript', 'React', 'Vue'],
  // 站点创建日期，用于计算运行天数
  createdAt: new Date('2024-01-01'),
  // 社交链接
  social: {
    github: 'https://github.com/NorthSeacoder',
    twitter: '',
    email: 'mengpeng_bj@foxmail.com',
  },
  // 个人简介
  bio: '喜欢折腾工具的前端开发者',
  // 技能列表
  skills: ['TypeScript', 'React', 'Vue', 'Vite', 'Astro'],
};

export const navLinks = [
  { href: '/', label: '首页', icon: 'home' },
  { href: '/posts/', label: '文章', icon: 'file-text' },
  { href: '/series/', label: '系列', icon: 'folder' },
  { href: '/tags/', label: '标签', icon: 'tag' },
  { href: '/archives/', label: '归档', icon: 'calendar' },
  { href: '/about/', label: '关于', icon: 'user' },
];
