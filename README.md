<p align="center">
  <img width="150" src="./docs/media/logo.svg" alt="mooc helper logo">
</p>

<h1 align="center">MOOC Helper</h1>

<p align="center">查询<strong>中国大学 MOOC(慕课)</strong>课程的<strong>单元测验</strong>、<strong>单元作业</strong>、<strong>期中/期末测试</strong>答案，支持导出 PDF 复习资料。</p>

---

## 功能

- 查询课程单元测验、单元作业、期中/期末测试的答案
- 单选题/多选题自动标注正确答案、填空题显示标准答案
- **导出 PDF** — 网页端一键打印，桌面端自动生成 PDF 文件
- 支持深色模式
- 网页版 + 桌面端（macOS / Windows）

## 使用

### 网页版

打开 [mooc-helper.vercel.app](https://mooc-helper.vercel.app/)，点击右上角**设置**粘贴 `mob-token`。

### 桌面端

从 [Releases](https://github.com/Green-hats/mooc-helper-pdf/releases) 下载：

| 平台 | 文件 |
|------|------|
| macOS | `mooc-helper_*.dmg` |
| Windows | `mooc-helper-win.exe` + `WebView2Loader.dll` |

> Windows 端构建包暂未在 Windows 设备上完整验证，实际运行效果以测试为准。

### 获取 mob-token

使用 [PCAPdroid](./docs/pcapdroid.md) 或 [Charles](./docs/charles.md) 抓取中国大学 MOOC App 的网络请求获取 `mob-token`。

### 导出 PDF

1. 选择课程 → 点击章节下的测验/作业
2. 点击内容区顶部的 PDF 图标
3. **网页端**：弹出打印对话框 → 另存为 PDF
4. **桌面端**：自动生成 PDF 并弹出保存对话框

## 开发

### 环境要求

- Node.js + pnpm
- Rust 工具链（构建桌面端需要）
- Tauri v1 运行环境（构建 macOS / Windows 安装包需要）

### 本地运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

开发服务器默认运行在 <http://localhost:3000>。

### 构建

```bash
# 构建网页版
pnpm build

# 导出静态文件到 out/
pnpm export

# 构建桌面端
pnpm tauri build
```

`pnpm tauri build` 会先执行静态导出，并使用 `out/` 作为 Tauri 打包资源。

### pnpm 依赖脚本提示

如果使用较新的 pnpm，安装依赖时可能提示需要批准 `core-js` / `core-js-pure` 的构建脚本：

```bash
pnpm approve-builds
```

选择 `core-js` 和 `core-js-pure` 后确认即可。仓库中的 `pnpm-workspace.yaml` 已包含对应的 `allowBuilds` 配置。

## 注意事项

- 查询操作会开启一次测验，请在**时间截止前**至少提交一次保证有效成绩
- 题目和答案的排列顺序可能与实际存在差异
- `pnpm export` 会提示 API routes 不会被静态导出，这是 Next.js 的正常提示；桌面端静态资源仍会写入 `out/`
- 构建时可能出现 React Hook 依赖或 Browserslist 过期提示，目前不影响构建通过

## 来源与维护

本项目基于 [whale4113/mooc-helper](https://github.com/whale4113/mooc-helper) 修改而来，感谢原项目作者提供的基础功能与实现。

当前 fork 由 [Green-hats](https://github.com/Green-hats) 维护，主要增加了 PDF 导出功能，并整理了桌面端构建与发布流程。

## 免责声明

本项目仅供参考和学习使用，不提供任何保证。使用者自行承担使用风险。

## License

MIT
