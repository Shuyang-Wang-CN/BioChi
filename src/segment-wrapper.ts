/// <reference types="chrome" />
import type { JiebaModule } from './types.js';

let jiebaModulePromise: Promise<JiebaModule> | null = null;

/**
 * 加载Jieba WASM模块
 */
function loadJieba(): Promise<JiebaModule> {
  if (!jiebaModulePromise) {
    const glueURL = chrome.runtime.getURL('libs/jieba/jieba_wasm.js');
    const wasmURL = chrome.runtime.getURL('libs/jieba/jieba_wasm_bg.wasm');

    jiebaModulePromise = import(glueURL).then((mod: JiebaModule) =>
      mod.default(wasmURL).then(() => mod)   // 初始化WASM并返回模块
    );
  }
  return jiebaModulePromise;
}

/**
 * 中文分词函数
 * @param text 要分词的中文文本
 * @returns 分词结果数组
 */
export async function segmentChinese(text: string): Promise<string[]> {
  try {
    const mod = await loadJieba();
    return Array.from(mod.cut(text));        // 将JsArray转换为普通数组
  } catch (error) {
    console.warn('Jieba WASM加载失败，退化到逐字分词', error);
    return [...text]; // 降级到逐字分词
  }
} 