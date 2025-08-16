/// <reference types="chrome" />
import type { JiebaModule } from './types.js';

let jiebaModulePromise: Promise<JiebaModule> | null = null;

/**
 * 预加载WASM文件
 */
async function preloadWasm(wasmURL: string): Promise<WebAssembly.Module> {
  try {
    // 方法1: 使用fetch + WebAssembly.compile
    const response = await fetch(wasmURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.status}`);
    }
    const wasmBytes = await response.arrayBuffer();
    return await WebAssembly.compile(wasmBytes);
  } catch (error) {
    console.warn('WASM预加载失败，尝试流式加载', error);
    // 方法2: 降级到流式加载
    return await WebAssembly.compileStreaming(fetch(wasmURL));
  }
}

/**
 * 加载Jieba WASM模块
 */
function loadJieba(): Promise<JiebaModule> {
  if (!jiebaModulePromise) {
    const glueURL = chrome.runtime.getURL('libs/jieba/jieba_wasm.js');
    const wasmURL = chrome.runtime.getURL('libs/jieba/jieba_wasm_bg.wasm');

    jiebaModulePromise = (async () => {
      try {
        console.log('[BioChi WASM] 开始加载Jieba模块...');
        
        // 导入胶水代码
        const mod = await import(glueURL) as JiebaModule;
        console.log('[BioChi WASM] 胶水代码加载成功');
        
        try {
          // 方法1: 使用预编译的WASM模块（新格式）
          console.log('[BioChi WASM] 尝试预编译WASM模块...');
          const wasmModule = await preloadWasm(wasmURL);
          console.log('[BioChi WASM] WASM模块编译成功');
          await mod.default({ module_or_path: wasmModule });
          console.log('[BioChi WASM] 使用预编译模块初始化完成');
        } catch (preloadError) {
          // 方法2: 降级到URL初始化（新格式）
          console.warn('[BioChi WASM] 预编译失败，尝试URL初始化:', preloadError);
          await mod.default({ module_or_path: wasmURL });
          console.log('[BioChi WASM] 使用URL初始化完成');
        }
        
        return mod;
      } catch (error) {
        console.error('[BioChi WASM] 所有加载方法都失败:', error);
        throw error;
      }
    })();
  }
  return jiebaModulePromise;
}

/**
 * 中文分词函数
 * @param text 要分词的中文文本
 * @returns 分词结果数组
 */
export async function segmentChinese(text: string): Promise<string[]> {
  // 空文本直接返回
  if (!text || !text.trim()) {
    return [];
  }

  try {
    const mod = await loadJieba();
    const result = mod.cut(text);
    
    // 确保返回普通数组
    const segments = Array.isArray(result) ? result : Array.from(result);
    console.log(`[BioChi WASM] 分词成功: "${text}" -> [${segments.join(', ')}]`);
    
    return segments;
  } catch (error) {
    console.warn('[BioChi WASM] Jieba分词失败，退化到逐字分词:', error);
    
    // 降级处理：检查是否包含中文字符
    const chineseChars = text.match(/[\u4e00-\u9fff]/g);
    if (chineseChars) {
      return [...text]; // 逐字分词
    } else {
      return [text]; // 非中文直接返回整个文本
    }
  }
} 