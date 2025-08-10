const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// 确保dist目录存在
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// 复制静态资源
function copyStaticFiles() {
  const staticFiles = [
    { from: 'src/manifest.json', to: 'dist/manifest.json' },
    { from: 'src/popup.html', to: 'dist/popup.html' },
    { from: 'libs/icons/', to: 'dist/icons/', isDir: true },
    { from: 'libs/jieba/', to: 'dist/libs/jieba/', isDir: true }
  ];

  staticFiles.forEach(({ from, to, isDir }) => {
    if (isDir) {
      if (fs.existsSync(from)) {
        copyDir(from, to);
      }
    } else {
      if (fs.existsSync(from)) {
        const toDir = path.dirname(to);
        if (!fs.existsSync(toDir)) {
          fs.mkdirSync(toDir, { recursive: true });
        }
        fs.copyFileSync(from, to);
      }
    }
  });
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// esbuild配置
const buildConfig = {
  entryPoints: [
    'src/content.ts',
    'src/popup.ts',
    'src/segment-wrapper.ts',
    'src/background.ts'
  ],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  sourcemap: true,
  minify: !isWatch,
  define: {
    'process.env.NODE_ENV': isWatch ? '"development"' : '"production"'
  },
  loader: {
    '.wasm': 'file'
  },
  external: [
    // Chrome扩展API不需要bundle
  ],
  plugins: [
    {
      name: 'copy-static',
      setup(build) {
        build.onEnd(() => {
          copyStaticFiles();
          console.log('✅ 静态文件复制完成');
        });
      }
    }
  ]
};

async function build() {
  try {
    if (isWatch) {
      console.log('🔄 启动开发模式...');
      const ctx = await esbuild.context(buildConfig);
      await ctx.watch();
      console.log('👀 正在监听文件变化...');
    } else {
      console.log('🏗️  开始构建...');
      await esbuild.build(buildConfig);
      console.log('✅ 构建完成！');
    }
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

build(); 