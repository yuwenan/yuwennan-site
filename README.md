# 喻雯楠 · 产品经理作品集

[直接浏览作品集](https://yuwenan.github.io/yuwennan-site/portfolio/)

六个案例，展示从用户问题、产品判断到界面与交付的过程。打开网页即可查看，无需登录。

| 案例                | 重点                                   |
| ------------------- | -------------------------------------- |
| 脱单计划 · 小芳     | AI 红娘 App 体验、Agent 编排与语义检索 |
| Jué · AI 视频工作台 | 剧本、角色、场景与分镜的创作流程       |
| ClaudeWatch         | 手表与电脑之间的 AI 任务提醒与确认     |
| Prompt Hub          | Prompt 的收集、分类、查找与复用        |
| 多点惠农            | 采购、报价、电子合同与交易状态协同     |
| VoiceLab            | 光标输入、实时听写和录音转写           |

## 浏览与源码

- 网页：https://yuwenan.github.io/yuwennan-site/portfolio/
- `product-portfolio` 分支保存本作品集的完整源码。
- `main` 与 `gh-pages` 根目录保留原个人站，作品集部署到 `gh-pages/portfolio/`。

## 本地运行

需要 Node.js 22.12 或更新版本。

```bash
git clone --branch product-portfolio --single-branch https://github.com/yuwenan/yuwennan-site.git
cd yuwennan-site
npm ci
npm run dev
```

打开开发服务器输出的作品集路径。检查与构建：

```bash
npm run check
npm run format:check
npm run build
```

## 修改内容

- 案例：`src/content/work/<项目>/index.mdx`，图片与案例放在同一目录。
- 基本信息：`src/config/site.ts`；首页：`src/config/home.ts`。
- 网页地址与基础路径：`src/config/paths.ts`。
- 语音交互示意：`src/components/work/VoiceDemo.astro`。
- 视觉：`src/styles/portfolio.css`；模板基础样式：`src/styles/global.css`。
- 分类与作品数量从案例自动生成。

构建产物位于 `dist/`。部署时仅更新 `gh-pages` 分支下的 `portfolio/` 目录，保留该分支的其他文件。

## 展示范围

公开仓库包含作品集网站源码与筛选后的展示素材，不包含各产品的服务端、数据库、登录会话、密钥或内部接口配置。含用户昵称、头像、ID、聊天与内部地址的原始截图未放入公开版，也未继承私有预览仓库的 Git 历史。

- 小芳：保留用户提供的启动页、首页、Agent 路由总览和语义分布页面；其他能力以产品说明呈现。界面数量不作为已验证的业务成效。
- 多点惠农：展示原采购页面配合后补模拟服务运行的截图，使用虚构示例数据；不代表生产交易或真实签署服务。
- VoiceLab：封面和网页演示是交互示意，使用固定文本，不调用麦克风、ASR 或个人登录会话。本轮未在 macOS 运行原应用。
- 其余案例：使用已有项目界面材料，区分交付阶段，不填入未经验证的增长、收益或准确率。

## 致谢与许可

基于 [Maria](https://github.com/xocothemes/maria) Astro 作品集模板定制，保留原作者的 MIT 许可及字体授权。网站代码沿用 MIT；项目截图、名称与案例文字用于作品展示，其权利归相应权利人，不随代码许可转让。
