# 设计系统现代化改造计划

> 创建时间：2025-12-14
> 状态：待批准

## 任务概述

全站设计风格现代化改造，包括：
- 毛玻璃效果（导航栏 + 卡片）
- 暗黑模式（亮色/暗色/跟随系统）
- 增强阅读体验
- 极致性能优化（Core Web Vitals + 首屏 + 动画流畅）

## 技术方案

CSS 变量 + Tailwind 原生暗黑模式（方案 1）

---

## Phase 1: 设计系统基础设施

### 1.1 扩展 Tailwind 配置

**文件**: `tailwind.config.ts`

**操作**:
- 添加 `darkMode: 'class'` 配置
- 扩展颜色系统（语义化命名）
- 添加毛玻璃相关工具类
- 配置动画与过渡

**代码概要**:
```typescript
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
} satisfies Config;
```

**预期结果**: Tailwind 支持暗黑模式前缀和语义化颜色

---

### 1.2 创建 CSS 变量系统

**文件**: `src/styles/global.css`

**操作**:
- 定义 `:root` 亮色主题变量
- 定义 `.dark` 暗色主题变量
- 添加过渡动画关键帧
- 优化基础排版样式

**代码概要**:
```css
:root {
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-accent: #3b82f6;
  --color-border: #e2e8f0;
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.2);
}

.dark {
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-surface-elevated: #334155;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-accent: #60a5fa;
  --color-border: #334155;
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(51, 65, 85, 0.5);
}
```

**预期结果**: 完整的双主题色彩系统

---

## Phase 2: 暗黑模式实现

### 2.1 创建主题切换组件

**文件**: `src/components/ThemeToggle.astro`（新建）

**操作**:
- 创建三态切换按钮（亮色/暗色/系统）
- 使用 localStorage 持久化
- 添加图标与动画

**代码概要**:
```astro
---
// 无服务端逻辑，纯客户端组件
---
<button id="theme-toggle" aria-label="切换主题">
  <svg class="icon-sun">...</svg>
  <svg class="icon-moon">...</svg>
  <svg class="icon-system">...</svg>
</button>

<script>
  // 主题切换逻辑
  // 读取 localStorage / 系统偏好
  // 切换 document.documentElement.classList
</script>
```

**预期结果**: 可点击的主题切换按钮

---

### 2.2 添加防闪烁脚本

**文件**: `src/layouts/BaseLayout.astro`

**操作**:
- 在 `<head>` 中添加内联脚本
- 脚本在 DOM 解析前执行
- 根据 localStorage / 系统偏好设置 class

**代码概要**:
```html
<script is:inline>
  (function() {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

**预期结果**: 页面加载无主题闪烁

---

### 2.3 更新布局支持暗黑模式

**文件**: `src/layouts/BaseLayout.astro`

**操作**:
- 更新 `<html>` 和 `<body>` 类名
- 导航栏支持 `dark:` 变体
- 页脚支持 `dark:` 变体
- 集成 ThemeToggle 组件

**预期结果**: 布局框架完整支持暗黑模式

---

## Phase 3: 毛玻璃效果与组件升级

### 3.1 升级导航栏毛玻璃效果

**文件**: `src/layouts/BaseLayout.astro`

**操作**:
- 增强 backdrop-blur 强度
- 添加微妙边框和阴影
- 支持滚动时的视觉反馈

**代码概要**:
```html
<header class="
  fixed top-0 inset-x-0 z-50
  backdrop-blur-xl
  bg-white/70 dark:bg-slate-900/70
  border-b border-white/20 dark:border-slate-700/50
  shadow-lg shadow-black/5 dark:shadow-black/20
  transition-all duration-300
">
```

**预期结果**: 现代化毛玻璃导航栏

---

### 3.2 升级 PostCard 组件

**文件**: `src/components/PostCard.astro`

**操作**:
- 应用毛玻璃背景
- 添加悬停动画效果
- 支持暗黑模式
- 优化标签样式

**代码概要**:
```html
<article class="
  group relative overflow-hidden rounded-2xl
  backdrop-blur-md
  bg-white/60 dark:bg-slate-800/60
  border border-white/20 dark:border-slate-700/30
  shadow-xl shadow-black/5
  transition-all duration-300
  hover:shadow-2xl hover:scale-[1.02]
  hover:bg-white/80 dark:hover:bg-slate-800/80
">
```

**预期结果**: 现代化悬浮卡片效果

---

### 3.3 创建 GlassCard 通用组件

**文件**: `src/components/GlassCard.astro`（新建）

**操作**:
- 创建可复用的毛玻璃容器
- 支持 variant 属性（subtle/medium/strong）
- 支持 hover 效果开关

**预期结果**: 可复用的毛玻璃组件

---

## Phase 4: 页面样式现代化

### 4.1 首页 Hero 区域重设计

**文件**: `src/pages/index.astro`

**操作**:
- 更新渐变背景（支持暗黑）
- 添加微妙的动画效果
- 优化标签徽章样式
- 增强视觉层次

**预期结果**: 现代化首页视觉

---

### 4.2 文章详情页优化

**文件**: `src/pages/posts/[slug].astro`

**操作**:
- 优化文章元信息区域
- 增强 prose 排版（行高、字重、间距）
- 标签样式统一
- 添加阅读进度指示器（可选）

**预期结果**: 增强阅读体验

---

### 4.3 全局 prose 样式增强

**文件**: `src/styles/global.css`

**操作**:
- 自定义 prose 暗黑模式
- 优化代码块样式
- 增强链接悬停效果
- 优化图片圆角和阴影

**预期结果**: 优雅的文章排版

---

## Phase 5: 动画与交互优化

### 5.1 添加页面过渡动画

**文件**: `src/styles/global.css`

**操作**:
- 定义 fadeIn / slideUp 动画
- 添加 stagger 延迟效果
- 使用 GPU 加速属性

**代码概要**:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
```

**预期结果**: 流畅的页面进入动画

---

### 5.2 微交互优化

**文件**: 多个组件文件

**操作**:
- 按钮悬停/点击反馈
- 链接下划线动画
- 卡片悬停缩放
- 图标旋转/颜色过渡

**预期结果**: 精致的交互细节

---

## Phase 6: 性能优化与测试

### 6.1 CSS 性能优化

**操作**:
- 使用 `will-change` 提示浏览器
- 避免 `box-shadow` 动画（使用 opacity 替代）
- 减少重绘区域
- 优化选择器特异性

---

### 6.2 字体加载优化

**文件**: `src/layouts/BaseLayout.astro`

**操作**:
- 添加字体 preload
- 使用 font-display: swap
- 考虑系统字体降级

---

### 6.3 构建验证

**操作**:
- 运行 `pnpm build` 确保无错误
- 检查 CSS 体积变化
- 验证 Lighthouse 分数

**预期结果**:
- LCP < 2.0s
- CLS < 0.1
- FID < 100ms

---

## 文件变更清单

| 文件路径 | 操作 | 优先级 |
|---------|------|--------|
| `tailwind.config.ts` | 修改 | P0 |
| `src/styles/global.css` | 修改 | P0 |
| `src/components/ThemeToggle.astro` | 新建 | P0 |
| `src/layouts/BaseLayout.astro` | 修改 | P0 |
| `src/components/PostCard.astro` | 修改 | P1 |
| `src/components/GlassCard.astro` | 新建 | P1 |
| `src/pages/index.astro` | 修改 | P1 |
| `src/pages/posts/[slug].astro` | 修改 | P2 |

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| 暗黑模式闪烁 | 使用内联脚本提前设置 class |
| 毛玻璃性能问题 | 限制 backdrop-blur 使用范围，测试低端设备 |
| CSS 体积增大 | Tailwind purge 自动优化，监控构建产物 |
| 浏览器兼容性 | backdrop-filter 已广泛支持，提供 fallback |

---

## 成功标准

- [ ] 暗黑模式无闪烁切换
- [ ] 毛玻璃效果在导航栏和卡片生效
- [ ] 所有页面支持双主题
- [ ] Lighthouse Performance > 90
- [ ] 动画帧率 > 55fps
- [ ] 构建无错误
