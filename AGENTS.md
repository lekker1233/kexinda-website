# AGENTS.md

这是 Kexinda（可鑫达）的 B2B 外贸独立站。Kexinda 是一家中国的仿真植物制造商，做仿真枝叶、绿植挂条、花环和节日装饰，客户是海外批发商、进口商和分销商。

先读 `PROGRESS.md`：里面是当前进度、下一步和待确认的问题。

## 技术栈

- Astro 静态站，输出到 `dist/`，可以部署到任意静态托管
- 不用前端框架，交互是原生 TypeScript（写在 `.astro` 文件的 `<script>` 和 `src/scripts/` 里）
- 图片处理用 sharp
- 需要 Node.js 22.23.4 或更新版本（Astro 7 的要求）

## 常用命令

```bash
npm install        # 安装依赖（需要联网；如果你的沙箱禁止联网，请让用户先运行）
npm run dev        # 本地预览 http://localhost:4321
npm run build      # 构建；每次改完都必须能成功
npm run catalog    # 用产品原图重建产品数据和图片（需要原图，见下文）
```

## 目录结构

| 路径 | 内容 |
|---|---|
| `site.config.mjs` | 站点名称、域名、邮箱、WhatsApp 等。留空的项不会显示 |
| `src/lib/catalog.ts` | 系列、品类、尺寸分组的定义和产品数据的工具函数 |
| `src/data/products.json` | 642 款产品的数据，由脚本生成，**不要手改** |
| `src/pages/` | 首页、目录（`products/`）、系列页（`collections/`）、关于、定制、联系、404 |
| `src/pages/preview-v2.astro` | 新设计方向的首页预览（见下文） |
| `src/components/` | 产品卡片 `ProductCard.astro`、目录筛选 `CatalogBrowser.astro` |
| `src/layouts/Base.astro` | 页头、页脚、询盘清单抽屉、SEO 标签 |
| `src/scripts/inquiry.ts` | 询盘清单，保存在访客浏览器的 localStorage |
| `src/styles/global.css` | 全站样式（目前是上一版） |
| `public/images/products/` | 处理好的产品图，每张有 400、800、1400 三个宽度的 WebP |
| `public/images/cutouts/` | 已检查合格的 33 张透明底抠图 |
| `public/images/seasons/` | 上一版首页用的微距裁切图 |
| `scripts/build-catalog.mjs`、`scripts/catalog-rules.mjs` | 产品目录生成脚本和规则 |
| `scripts/cutout-tools/` | 抠图辅助脚本，里面写死了原作者电脑上的路径，用之前要改 |
| `design-archive/v1/` | 上一版源码备份 |
| `design-archive/v2-draft/global.css` | 新方向的全站样式草稿，还没启用 |
| `catalog-report.md` | 哪些产品图没有收录，以及原因 |

## 当前进度（重要）

- 用户已选定新方向“鲜亮的季节海报风”：透明底产品放在大块季节色上，标题用 Bricolage Grotesque 字体，正文用 Instrument Sans。
- **只有首页预览用了新方向**（`/preview-v2/`）。其他正式页面还是上一版（灰绿纸色、衬线字体）。
- 继续铺开新方向的步骤写在 `PROGRESS.md`。样式草稿在 `design-archive/v2-draft/global.css`，类名已按新页面结构设计好（`.pill`、`.tile`、`.bento`、`.frame img.cut` 和 `.frame img.photo` 等）。
- 全部产品图还没批量抠图。上线前要删除 `src/pages/preview-v2.astro`。

## 规则

1. **网站内容全部用英文**，面向海外 B2B 采购商。和用户交流用中文。
2. **不要编造公司信息**：成立年份、工厂规模、认证、交期、起订量、价格、客户数量都不能写，除非用户提供了。可以引用的事实只有用户给的公司介绍，以及从产品数据算出来的数字（款数、系列数、尺寸范围）。
3. **联系方式只从 `site.config.mjs` 读取。** 没填就不显示，不要放假的邮箱或电话。
4. **产品数据和图片只通过脚本生成**，不要手改 `src/data/products.json` 或 `public/images/products/`。要改品类就改 `scripts/catalog-rules.mjs`，再运行 `npm run catalog`。
5. **这些产品默认不公开**：文件名含“不可推”“客供瓶”“副本”的，以及分辨率过低的。不要把它们加回来，除非用户明确要求。
6. **尺寸单位**：原图文件名里的“寸”是英寸（in），“尺”是英尺（ft）。网站同时显示英制和公制。
7. 页面在手机宽度（375px）下不能横向溢出，交互元素要能用键盘操作。
8. 改完运行 `npm run build`，确认成功后再交付。

## 产品原图

产品原图（约 2.6GB）不在这个文件夹里，在上一级目录的 6 个系列文件夹中：

- `春天02/春天02`
- `复活节/复活节`
- `国庆/国庆`
- `秋收/秋收`
- `鬼节/鬼节`
- `圣诞/圣诞`

`npm run catalog` 默认从 `website` 的上一级目录读取这些文件夹。如果手上没有原图，就不要运行这个命令；只改设计和文字时也用不到原图。

## 已知问题

- imgly 抠图工具和项目里的 sharp 不能在同一个 Node 进程里加载，否则会因 libvips 冲突而崩溃。
- imgly 抠图约四分之一会失败（花环缺一半、残留洞洞板）。BiRefNet 质量还没测完。
- 不再使用的旧字体依赖（newsreader、hanken-grotesk、ibm-plex-mono）等铺开新样式后再删除。
