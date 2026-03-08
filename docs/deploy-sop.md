# 博客部署 SOP

最后更新：2026-03-08

## 1. 当前结论

结合 `weekly` 项目的发版方式、当前博客仓库配置，以及现有基础设施情况，当前最推荐的方案是：

**方案 A：博客静态产物直接部署到 ECS**

- GitHub Actions 在云端构建 Astro 静态站点
- 构建产物通过 SSH / rsync 上传到 ECS
- ECS 上的 1Panel / OpenResty 直接托管静态文件
- 域名 `blog.mengpeng.tech` 直接解析到 ECS 公网 IP
- HTTPS 证书在 ECS 上统一处理

这是当前最省心的方案，原因很直接：

- 这个博客是纯静态站点，运行成本极低，不需要 NAS 参与
- 不依赖家庭网络、NAS 在线状态、Tailscale 链路稳定性
- 和 `weekly.mengpeng.tech` 的部署模型一致，维护成本最低
- 回滚、排障、续证、DNS 解析都会更简单

## 2. 什么时候才用 NAS + Tailscale + ECS 反代

你现在有些项目部署在 NAS 上，再通过 Tailscale 穿到 ECS，这种模式更适合：

- 需要常驻服务、数据库、Docker 编排、磁盘容量依赖 NAS 的项目
- 本身已经运行在 NAS 上，迁移到 ECS 成本高
- 需要使用家庭内网资源的项目

但**这个博客不属于这类项目**。它只是构建后的一组静态文件，所以不建议第一版就走：

`GitHub Actions -> NAS -> Tailscale -> ECS OpenResty 反代`

这条链路能跑，但多了：

- 一层 Tailscale 网络依赖
- 一层 ECS 反向代理配置
- 一层 NAS 可用性依赖
- 一层家庭宽带 / 上行稳定性风险

除非你明确希望把所有个人站点都统一放到 NAS，否则博客优先直上 ECS。

## 3. 从 `weekly` 当前发版逻辑得到的可复用点

`weekly` 当前流程核心是：

1. GitHub Actions 触发
2. 云端安装 Node / pnpm
3. 构建产物
4. 使用 `easingthemes/ssh-deploy` 通过 SSH 上传到 ECS
5. 上传目标目录是 1Panel/OpenResty 的站点根目录

可复用的思想：

- 用 GitHub Actions 做标准化发版
- 用 SSH 私钥把 `dist/` 推到 ECS
- 站点目录放在 1Panel/OpenResty 管理路径下
- 域名、HTTPS、站点目录都放到 ECS 统一收口

不能直接照抄的地方：

- `weekly` 的 workflow 里带了 Next.js 风格缓存路径，当前博客仓库不需要
- `weekly` 使用 `pnpm@8`，当前博客仓库 `packageManager` 锁的是 `pnpm@10.24.0`
- `weekly` 的条件构建逻辑是根据 `sections/` 目录判断，当前博客仓库不适用
- `weekly` 的环境变量很多，当前博客基本没有这类运行时依赖

## 4. 当前博客仓库已经发现的上线前问题

### 4.1 域名相关配置还是占位值

以下配置还在使用 `https://example.com`：

- `astro.config.mjs`
- `src/lib/siteConfig.ts`
- `public/robots.txt`

这会影响：

- sitemap
- RSS
- canonical
- Open Graph / SEO 绝对链接

上线前必须统一改为：

`https://blog.mengpeng.tech`

### 4.2 本地构建环境版本不满足要求

当前本地验证结果：

- 当前机器 Node：`18.17.1`
- 仓库要求：`>=20.3.0`
- Astro 实际也提示至少需要 `>=18.20.8`

因此本地 `pnpm build` 目前无法通过。

建议统一到：

- Node `22 LTS`
- pnpm `10.24.0`

### 4.3 需要确认 Pagefind 索引是否正确进入 `dist/`

当前脚本是：

```json
"build": "astro build && pagefind"
```

上线前要确认两件事：

1. `pagefind` 是否明确索引 `dist/`
2. 搜索索引最终是否落在 `dist/pagefind/`

如果不是，就需要把脚本调整为类似：

```json
"build": "astro build && pagefind --site dist"
```

否则即使页面能打开，搜索页也可能在生产环境失效。

## 5. 推荐部署拓扑

```text
GitHub push main
    ↓
GitHub Actions 构建 Astro 静态站点
    ↓
SSH / rsync 上传 dist/ 到 ECS
    ↓
1Panel / OpenResty 托管站点目录
    ↓
blog.mengpeng.tech
```

推荐的站点目录命名方式：

```text
/opt/1panel/apps/openresty/openresty/www/sites/blog.mengpeng.tech/index/
```

这样能和 `weekly.mengpeng.tech` 的风格保持一致。

## 6. 上线前准备清单

### 6.1 域名与 DNS

- 确认 `mengpeng.tech` 的 DNS 在你可控账号下
- 新增 `A` 记录：`blog.mengpeng.tech -> ECS 公网 IP`
- TTL 可先设短一些，方便首次切换

### 6.2 ECS 侧准备

- 确认 ECS 有公网 IP
- 确认安全组放行 `80` 和 `443`
- 确认 1Panel / OpenResty 正常工作
- 在 ECS 上预创建站点目录或通过 1Panel 新建站点
- 确认 OpenResty 对应站点根目录指向博客部署目录

### 6.3 HTTPS 证书

- 在 1Panel 里为 `blog.mengpeng.tech` 申请 Let's Encrypt 证书
- 确认自动续期已开启
- 如果你希望统一跳转 HTTPS，确认站点启用了 `80 -> 443` 重定向

### 6.4 GitHub Secrets / Variables

至少准备以下 secrets：

- `ALIYUN_SERVER_ACCESS_TOKEN`
- `ALIYUN_SERVER_HOST`

如果你和 `weekly` 复用同一台 ECS，这两个值大概率可以沿用，但最好确认：

- 私钥是否仍可登录当前 ECS
- host 是否固定
- 部署用户是否仍使用 `root`

### 6.5 仓库内配置

上线前需要修改：

- `astro.config.mjs` 的 `site`
- `src/lib/siteConfig.ts` 的 `siteUrl`
- `public/robots.txt` 的 Sitemap 地址

建议顺手复核：

- 作者名
- GitHub 链接
- 邮箱
- 社交链接
- 站点描述

### 6.6 构建与验证环境

- 本地安装 Node `22`
- 使用 pnpm `10.24.0`
- 执行 `pnpm install`
- 执行 `pnpm build`
- 检查产物中是否包含：
  - HTML 页面
  - `sitemap-index.xml`
  - `rss.xml`
  - `pagefind/`

## 7. 发版 SOP

### Step 1：确定部署方案

本次先采用：

**ECS 直出静态站点**

先不要让 NAS 参与首版上线。

### Step 2：修正生产域名配置

把仓库里所有站点绝对地址统一到：

`https://blog.mengpeng.tech`

重点文件：

- `astro.config.mjs`
- `src/lib/siteConfig.ts`
- `public/robots.txt`

### Step 3：升级本地与 CI 运行时

- 本地切换到 Node `22`
- CI 里也统一使用 Node `22`
- CI 使用 pnpm `10.24.0`

不要沿用 `weekly` 的 `pnpm@8`。

### Step 4：验证构建产物

本地执行：

```bash
pnpm install
pnpm build
```

确认：

- 构建成功
- `dist/` 可直接作为静态站点目录
- 搜索索引已经生成
- 访问本地预览时搜索可用

如搜索索引不在 `dist/`，先修正 `pagefind` 命令，再继续。

### Step 5：在 ECS 上创建站点

在 1Panel/OpenResty 中创建：

- 域名：`blog.mengpeng.tech`
- 根目录：`/opt/1panel/apps/openresty/openresty/www/sites/blog.mengpeng.tech/index/`

并确认：

- 站点配置生效
- 目录可被 OpenResty 读取
- 默认首页路径正确

### Step 6：配置 DNS 与证书

- 域名 `blog.mengpeng.tech` 指向 ECS 公网 IP
- 申请并绑定 HTTPS 证书
- 启用 HTTP 跳转 HTTPS

### Step 7：新增博客仓库的 GitHub Actions

建议新增独立 workflow，逻辑参考 `weekly`，但按博客仓库简化：

- 触发分支：`main`
- 安装 Node `22`
- 安装 pnpm `10.24.0`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- 把 `dist/` 上传到：
  `/opt/1panel/apps/openresty/openresty/www/sites/blog.mengpeng.tech/index/`

当前博客仓库不建议首版就加复杂的“按目录判断是否构建”逻辑，先保证稳定。

### Step 8：首次手动发版

首次上线建议：

1. 先在本地确认构建通过
2. 再推送 `main`
3. 观察 GitHub Actions 日志
4. 到 ECS 检查目标目录文件是否完整

### Step 9：上线后验收

至少检查：

- 首页能打开
- 文章详情页能打开
- `/rss.xml` 正常
- `/sitemap-index.xml` 正常
- `/search/` 正常
- 页面搜索可用
- 页面 canonical 指向 `blog.mengpeng.tech`
- 浏览器无明显 404 静态资源错误
- HTTPS 正常且证书有效

## 8. 首版上线不建议做的事情

- 不要首版就走 NAS + Tailscale + ECS 反代
- 不要照抄 `weekly` 的缓存和条件构建逻辑
- 不要继续保留 `example.com` 占位配置
- 不要在没确认 `Pagefind` 产物位置前直接上线

## 9. 如果后续你坚持统一到 NAS

如果你后面希望所有个人项目都收口到 NAS，也可以改成：

```text
GitHub Actions
    ↓
部署到 NAS 静态目录
    ↓
NAS 通过 Tailscale 暴露给 ECS
    ↓
ECS OpenResty 反代到 NAS Tailscale IP
    ↓
blog.mengpeng.tech
```

但这应该是**第二阶段重构**，不该是首版上线方案。

## 10. 本次执行建议

当前最合理的顺序是：

1. 先改站点域名配置
2. 解决 Node / pnpm 版本一致性
3. 验证 `Pagefind` 产物位置
4. 在 ECS 上创建 `blog.mengpeng.tech` 站点
5. 新增博客仓库自己的 deploy workflow
6. 首次上线后再决定是否需要 NAS 统一化

