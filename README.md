# Kexinda 网站

静态网站（Astro），生成的 `dist/` 文件夹可以部署到任意静态托管（Cloudflare Pages、Netlify、Vercel 等）。

## 常用命令

需要 Node.js 22.23.4 或更新版本。用 Codex 等 AI 工具修改时，项目说明在 `AGENTS.md`。

```bash
npm install        # 首次使用时安装依赖
npm run dev        # 本地预览 http://localhost:4321
npm run build      # 生成可上线的 dist/
npm run catalog    # 产品图片或规则变动后，重建产品目录
```

## 上线前要填写

打开 `site.config.mjs`，填入邮箱、WhatsApp、电话、地址和域名。留空的项目不会显示在网站上。
没有填邮箱时，询盘表单不会发送，并会提示“尚未连接”。

## 增加或修改产品

1. 把图片放进对应的系列文件夹，沿用 `CS26-型号-尺寸寸.jpg` 的命名。
2. 新型号如需指定品类，在 `scripts/catalog-rules.mjs` 里添加。
3. 运行 `npm run catalog`。哪些图片没有收录、原因是什么，都写在 `catalog-report.md` 里。

文件名含“不可推”“客供瓶”“副本”的图片，以及分辨率过低的图片，不会出现在网站上。
