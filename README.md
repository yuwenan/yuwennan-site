# yuwennan-site 个人站

喻雯楠的个人作品集网站源码。Vite + React 单页站，Three.js/OGL 做视觉，GSAP + Lenis 做滚动动效（参考 Vivid+Co 风格重做的版本）。

线上地址：https://yuwenan.github.io/yuwennan-site/

## 页面构成

单页滚动，区块从上到下（都在 `src/App.jsx`）：

- **Hero + about**：开场视觉（深海鱼群视频 + PinnedSection 滚动钉住效果）
- **在做的东西**（#work）：项目图廊 + 点击看详情（Prompt Hub、智囊、记忆碎片、Skill Lab），截图在 `src/assets/`
- **更多小项目**：Bento 卡片列表（`MORE` 数组）
- **AIGC 作品**（#aigc）
- **数字分身对话台**（#contact）：产品级 chat 壳，侧栏预设问题本地问答秒出，纯展示，不接任何接口

## 内容红线

以下内容**已整体删除，不要加回来**：

- 「一路走来」经历、「会的东西」技能、「我的能力」优势三个区块（含公司/学校/私人邮箱）
- 在职期间为公司做的项目（AI 红娘及其管理后台、资讯日报机器人、AI 剧组、简历筛选）的截图与描述
- 访客统计 beacon、任何指向自有服务器的接口代理

站上只放个人独立项目与 AIGC 作品。

## 本地开发

```bash
git clone https://github.com/yuwenan/yuwennan-site.git
cd yuwennan-site
npm install
npm run dev        # Vite 开发服务器，热更新
npm run build      # 产出 dist/，可用 npm run preview 本地看
```

依赖就这几个：react / three / ogl / gsap / lenis / motion。`src/reactbits/` 是引入的 ReactBits 动效组件。

## 部署

托管在 GitHub Pages，没有服务器。发布 = 把构建产物推到 `gh-pages` 分支：

```bash
npm run deploy     # = vite build + gh-pages 推 dist/ 到 gh-pages 分支，约一分钟生效
```

- 源码在 `main`，产物在 `gh-pages`，两个分支互不干扰；改完源码先 commit + push main，再 `npm run deploy`
- `vite.config.js` 里 `base: '/yuwennan-site/'` 对应项目路径；`public/` 下的静态资源在代码里要用 `import.meta.env.BASE_URL` 拼路径（见 hero 视频）
- 没用 GitHub Actions 是因为本机 gh 登录令牌缺 `workflow` 权限；以后 `gh auth refresh -s workflow` 之后可以换成 push 自动构建
- 以后若绑自定义域名到根路径：`base` 改回 `'/'`，仓库 Settings → Pages 填域名，DNS 加 CNAME 指向 `yuwenan.github.io`

## 版本关系

- 2026-09 之前：部署在自有服务器 nginx，域名 yuwennan.com（已下线）
- 2026-09-14 起：迁到 GitHub Pages，同时删除在职期间公司项目的内容，仓库转公开

## 改动约定

- 每处改动就 git commit + push
- 涉及个人隐私的内容（真实经历、联系方式、公司学校）与公司项目内容一律不上
