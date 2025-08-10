# BioChi - 仿生阅读Chrome扩展

基于Jieba中文分词的现代化仿生阅读Chrome扩展，使用TypeScript + npm + esbuild构建。

## ✨ 特性

- 🔤 **智能文本处理**: 英文按空格分词，中文使用Jieba精确分词
- 🎯 **自定义加粗比例**: 用户可调节英文和中文的加粗百分比（10%-80%）
- 📱 **混合语言支持**: 智能识别并处理中英文混合文本
- ⚡ **性能优化**: WebAssembly加速分词，TypeScript类型安全
- 🎨 **现代化界面**: 美观的弹窗设置界面
- 🔧 **开发友好**: 支持热重载开发模式

## 🏗️ 技术架构

### 构建工具
- **TypeScript**: 类型安全的JavaScript
- **esbuild**: 超快的JavaScript打包器
- **npm**: 包管理和脚本运行

### 核心技术
- **Jieba-rs WASM**: Rust实现的中文分词，编译为WebAssembly
- **Chrome Extension Manifest V3**: 最新的扩展标准
- **ES Modules**: 现代化的模块系统

## 📁 项目结构

```
BioChi/
├── src/                    # TypeScript源代码
│   ├── content.ts          # 内容脚本主文件
│   ├── popup.ts           # 弹窗界面逻辑
│   ├── segment-wrapper.ts  # Jieba分词包装器
│   ├── types.ts           # TypeScript类型定义
│   ├── manifest.json      # 扩展配置文件
│   └── popup.html         # 弹窗界面HTML
├── libs/                   # 外部库文件
│   ├── icons/             # 扩展图标
│   │   ├── 16.png
│   │   ├── 32.png
│   │   └── 128.png
│   └── jieba/             # Jieba WASM文件
│       ├── jieba_wasm.js
│       └── jieba_wasm_bg.wasm
├── scripts/               # 构建脚本
│   └── build.js          # esbuild构建配置
├── dist/                 # 构建输出目录
├── package.json          # npm项目配置
└── tsconfig.json         # TypeScript配置
```

## 🚀 开发指南

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 快速开始

1. **安装依赖**
```bash
npm install
```

2. **开发模式** (支持热重载)
```bash
npm run dev
```

3. **生产构建**
```bash
npm run build
```

4. **类型检查**
```bash
npm run type-check
```

5. **代码检查**
```bash
npm run lint
```

6. **打包发布**
```bash
npm run package
```

### 安装扩展

1. 运行 `npm run build` 构建项目
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录

## 🎮 使用方法

1. **启用扩展**: 点击扩展图标，开启"启用仿生阅读"
2. **调节设置**:
   - **英文加粗比例**: 控制英文单词前缀加粗的百分比
   - **中文加粗比例**: 控制中文词汇前缀加粗的百分比
   - **字体增强**: 可选择是否放大加粗文字
3. **实时生效**: 设置会立即应用到当前页面

## 🔧 开发脚本

| 命令 | 描述 |
|------|------|
| `npm run build` | 生产环境构建 |
| `npm run dev` | 开发模式（监听文件变化） |
| `npm run clean` | 清理构建目录 |
| `npm run type-check` | TypeScript类型检查 |
| `npm run lint` | ESLint代码检查 |
| `npm run package` | 打包为.zip文件 |

## 🏛️ 架构设计

### 内容脚本 (content.ts)
- **BionicReader类**: 核心仿生阅读逻辑
- **语言检测**: 自动识别中文、英文、混合文本
- **DOM处理**: 智能遍历和样式应用
- **性能优化**: 使用requestIdleCallback避免阻塞

### 分词模块 (segment-wrapper.ts)
- **WASM加载**: 动态加载Jieba WebAssembly模块
- **错误处理**: 分词失败时降级到逐字模式
- **类型安全**: 完整的TypeScript类型定义

### 弹窗界面 (popup.ts)
- **设置管理**: Chrome storage同步
- **实时通信**: 与content script消息传递
- **响应式UI**: 现代化的用户界面

## 🎯 技术特点

### TypeScript优势
- **类型安全**: 编译时错误检查
- **智能提示**: 更好的开发体验
- **重构友好**: 安全的代码重构

### esbuild构建
- **极快速度**: 比webpack快10-100倍
- **ES6模块**: 原生模块支持
- **开发模式**: 支持watch模式热重载

### 现代化架构
- **ES2022**: 使用最新JavaScript特性
- **Chrome APIs**: 完整的类型支持
- **模块化设计**: 清晰的代码组织

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**BioChi** - 让阅读更高效 🚀 