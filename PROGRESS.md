# 网站进度

更新时间：2026-11-05

## 当前状态

- 已定方向：**鲜亮的季节海报风**（透明底产品配大块季节色，Bricolage Grotesque 字体）。用户说明“先暂时用这个方案”。
- **新方向只完成了首页预览**：`src/pages/preview-v2.astro`，本地地址 `/preview-v2/`。
- **正式页面仍是上一版**（灰绿纸色、衬线字体）：`src/` 下的首页、目录、系列页、产品页、关于页、定制页和联系页。
- 全站样式草稿已写好但未启用：`design-archive/v2-draft/global.css`。
- 上一版源码备份：`design-archive/v1/src`。
- 没有提交 git，也没有部署。

## 等用户提供

- 域名和服务器（用户稍后提供）
- 询盘邮箱（必须，否则表单无法发送）；WhatsApp、电话、地址（可选）
- 填写位置：`site.config.mjs`

## 继续时的步骤

1. **定抠图方案。** 全部 661 张产品图还没有批量抠图。
   - imgly medium 模型：每张 2 至 3 秒，试过的 42 张里大约四分之一明显失败。
   - BiRefNet（birefnet-general）：模型已下载到 `~/.rembg/models/`，约 950MB。显卡（DirectML）运行时报错，CPU 上的质量和速度还没测，测试被用户暂停。
2. **批量抠图并逐张检查。** 抠不干净的退回原图，放在统一底色上。
3. **接入目录。** 给图片数据加是否已抠图的标记（样式草稿用 `.cut` 和 `.photo` 区分）。
4. **铺开样式。** 启用样式草稿，把预览页转为正式首页，改造其余页面和筛选栏。
5. **上线前。** 删除 `src/pages/preview-v2.astro`，移除不再使用的旧字体依赖（newsreader、hanken-grotesk、ibm-plex-mono），运行 `npm run build`，然后部署 `dist/`。

## 抠图工具

脚本在 `scripts/cutout-tools/`：

- `pre2.js`：把原图缩小成待抠的 PNG
- `cut.mjs`：用 imgly 抠图
- `rb.py`：用 rembg 和 BiRefNet 抠图，目前写的是 DirectML，继续测试时要改成 `CPUExecutionProvider`
- `post2.js`：生成检查用的总览图
- `post3.js`：导出合格的透明底 WebP

注意：

- imgly 和项目里的 sharp 不能在同一进程加载，否则会冲突，所以这些步骤要分开运行。
- imgly 包的许可证要看它的 LICENSE.md，所以只作为本地工具使用，不要加进网站依赖。
- 这些工具的依赖和 Python 虚拟环境原本装在会话临时目录里，可能已被清理，到时要重新安装。
- 脚本里的路径写的是当时的临时目录，继续使用前要核对。

已检查合格的 33 张抠图在 `public/images/cutouts/`。

## 待用户确认

- 文件夹“春天02”从 C225 开始，是否还有“春天01”没有放进来？
- “客供瓶”款式默认隐藏，是否合适？
- 14 张低分辨率图片有没有高清版本？
- “关于”页和定制页的说明是根据公司介绍扩写的，内容是否准确？
