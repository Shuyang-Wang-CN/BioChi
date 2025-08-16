# BioChi - 仿生阅读Chrome扩展

<div align="center">
  <img src="libs/icons/512.png" alt="BioChi Logo" width="128" height="128">
  
  **基于Jieba中文分词的现代化仿生阅读Chrome扩展**
  
  *使用TypeScript + esbuild构建，支持Chrome扩展Manifest V3*
</div>


## 📖 什么是仿生阅读？

仿生阅读是一种革命性的阅读方法，通过对文本的视觉处理来提高阅读速度和理解能力。这种技术最初是为了帮助阅读障碍者而开发的，但现在被广泛应用于提升普通读者的阅读体验。

中文分词是仿生阅读的核心技术之一。与英文不同，中文没有天然的词汇边界，因此需要使用专门的分词算法来识别词汇单位。BioChi扩展使用了基于机器学习的Jieba分词库，能够准确识别各种中文词汇，包括专业术语、人名、地名等。

人工智能和机器学习技术的快速发展为文本处理带来了前所未有的机遇，BioChi正是在这样的技术背景下，为中文用户量身打造的阅读增强工具。


## 🎮 使用方法

### 基本操作
1. **启用扩展**: 点击扩展图标，开启"启用仿生阅读"开关
2. **快捷键切换**: 使用 `Alt+Shift+R` 快速启用/禁用（可在扩展管理页自定义）
3. **实时生效**: 所有设置会立即应用到当前页面，支持动态内容

### 详细设置
- **英文加粗比例**: 控制英文单词前缀加粗的百分比（10%-80%）
- **中文加粗比例**: 控制中文词汇前缀加粗的百分比（10%-80%）
- **字体增强**: 可选择是否放大加粗文字（1.1倍）
- **快捷键设置**: 点击"设置快捷键"按钮可自定义快捷键组合

## 📖 应用效果

启用BioChi仿生阅读后，您将看到以下效果：

### 中文文本效果
- **原文**: 这是一个仿生阅读的示例文本，可以帮助您更快地阅读和理解内容。
- **效果**: 这是**一**个**仿**生**阅**读的**示**例文本，**可**以**帮**助您更快地**阅**读和**理解**内容。

### 英文文本效果  
- **原文**: This is an example of bionic reading that helps you read faster and comprehend better.
- **效果**: **Th**is **i**s **a**n **exam**ple **o**f **bio**nic **read**ing **th**at **hel**ps **y**ou **re**ad **fas**ter **a**nd **comp**rehend **bet**ter.

### 混合文本效果
- **原文**: BioChi是一个Chrome extension，支持中英文mixed content处理。
- **效果**: **Bio**Chi**是**一个**Ch**rome **ext**ension，**支**持**中英**文**mi**xed **con**tent**处**理。

### 视觉特点
- ✅ **加粗文字**: 每个词汇的前缀部分会以粗体显示，引导眼球快速识别
- ✅ **智能分词**: 中文使用Jieba精确分词，英文按单词分割
- ✅ **保持可读性**: 后缀部分保持正常字重，确保文本完整性
- ✅ **自适应处理**: 自动识别中英文混合内容，分别应用最佳分词策略


## ✨ 特性

- 🔤 **智能文本处理**: 英文按单词分词，中文使用Jieba WASM精确分词
- 🎯 **自定义加粗比例**: 用户可调节英文和中文的加粗百分比（10%-80%）
- 📱 **混合语言支持**: 智能识别并处理中英文混合文本，分别应用最佳策略
- ⚡ **性能优化**: WebAssembly加速分词，requestIdleCallback避免阻塞
- 🎨 **现代化界面**: 渐变背景的美观弹窗设置界面
- ⌨️ **快捷键支持**: 支持Alt+Shift+R快速切换（可自定义）
- 🔄 **实时应用**: DOM变化监听，动态内容自动处理
- 🎛️ **字体增强**: 可选的加粗文字放大效果

## 🏗️ 技术架构

### 构建工具
- **TypeScript 5.0+**: 类型安全的JavaScript开发
- **esbuild**: 超快的JavaScript打包器，支持ESM和热重载
- **npm**: 包管理和脚本运行

### 核心技术
- **Jieba WASM**: Rust实现的中文分词，编译为WebAssembly模块
- **Chrome Extension Manifest V3**: 最新的扩展标准，支持Service Worker
- **ES2022 Modules**: 现代化的模块系统和异步导入
- **Chrome Storage API**: 同步设置存储
- **Chrome Commands API**: 快捷键支持


## 📁 项目结构

```
BioChi/
├── src/                    # TypeScript源代码
│   ├── content.ts          # 内容脚本 - 仿生阅读核心逻辑
│   ├── popup.ts           # 弹窗界面 - 设置管理和UI控制
│   ├── background.ts      # 后台脚本 - Service Worker和快捷键
│   ├── segment-wrapper.ts  # Jieba分词包装器 - WASM模块加载
│   ├── types.ts           # TypeScript类型定义
│   ├── manifest.json      # Chrome扩展配置文件（Manifest V3）
│   └── popup.html         # 弹窗界面HTML
├── libs/                   # 外部库文件
│   ├── icons/             # 扩展图标
│   │   └── 512.png        # 主图标
│   └── jieba/             # Jieba WASM文件
│       ├── jieba_wasm.js    # WASM胶水代码
│       └── jieba_wasm_bg.wasm # WASM核心模块
├── scripts/               # 构建脚本
│   └── build.js          # esbuild构建配置，支持静态资源复制
├── dist/                 # 构建输出目录（生成）
├── package.json          # npm项目配置
├── tsconfig.json         # TypeScript配置
└── README.md             # 项目文档
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

2. **开发模式** (支持文件监听)
```bash
npm run dev
# 或者
npm run build:watch
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
npm run package  # 清理 + 构建 + 压缩为zip
```

### 安装扩展

1. 运行 `npm run build` 构建项目
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录

### 内容脚本 (content.ts)
- **BionicReader类**: 核心仿生阅读逻辑，支持中英文混合处理
- **语言检测**: 自动识别中文、英文、混合文本类型
- **DOM处理**: 智能遍历Text节点，动态应用样式，避免重复处理
- **性能优化**: requestIdleCallback避免阻塞，MutationObserver监听变化
- **降级处理**: WASM加载失败时自动降级到逐字/逐词模式

### 分词模块 (segment-wrapper.ts)
- **WASM加载**: 异步加载Jieba WebAssembly模块，支持模块复用
- **错误处理**: 分词失败时降级到逐字模式，确保功能可用
- **类型安全**: 完整的TypeScript类型定义和接口约束

### 弹窗界面 (popup.ts)
- **设置管理**: Chrome storage同步，支持实时保存
- **实时通信**: 与content script消息传递，立即应用设置
- **响应式UI**: 渐变背景的现代化界面，滑块和开关控件
- **快捷键显示**: 动态检测和显示当前快捷键设置

### 后台脚本 (background.ts)
- **Service Worker**: Manifest V3兼容的后台处理
- **快捷键管理**: Commands API支持，可自定义快捷键组合
- **设置同步**: 提供统一的设置读写接口

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**BioChi** - 让阅读更高效 🚀 