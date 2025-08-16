/// <reference types="chrome" />
import type { BiochiSettings, ChromeMessage, LanguageType } from './types.js';

// 定义分词函数类型
type SegmentChineseFunction = (text: string) => Promise<string[]>;

/**
 * 仿生阅读器主类 - 应用仿生阅读样式到页面
 */
class BionicReader {
  private settings: BiochiSettings;
  private segmentChinese: SegmentChineseFunction;

  constructor(segmentChineseFn: SegmentChineseFunction) {
    // 默认设置 - 将被storage中的值覆盖
    this.settings = {
      enableBionic: false,
      englishBoldRatio: 30,
      chineseBoldRatio: 50,
      boldEnlarge: false
    };

    // 存储分词函数
    this.segmentChinese = segmentChineseFn;

    // 启动初始化
    this.init();
  }

  /* ----------------- 启动和初始化 ---------------- */
  private async init(): Promise<void> {
    try {
      await this.loadSettings();

      // 监听popup/background消息
      chrome.runtime.onMessage.addListener((req: ChromeMessage, sender, sendResponse) => {
        if (req.action === 'applyBionicReading' && req.settings) {
          this.settings = { ...this.settings, ...req.settings };
          this.applyBionicReading();
          // 发送响应确认消息已处理
          sendResponse({ success: true });
        }
        return true; // 保持消息通道开放
      });

      // 设置就绪后观察DOM变化
      this.observeMutations();

      if (this.settings.enableBionic) {
        await this.applyBionicReading();
      }

      console.log('[BioChi] 初始化完成');
    } catch (err) {
      console.error('[BioChi] 初始化失败', err);
    }
  }

  private loadSettings(): Promise<void> {
    return new Promise<void>((resolve) => {
      chrome.storage.sync.get(this.settings, (items: Partial<BiochiSettings>) => {
        this.settings = { ...this.settings, ...items };
        resolve();
      });
    });
  }

  /* ----------------- DOM遍历和观察 ---------------- */
  private observeMutations(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          // 跳过已处理的容器内的内容
          if (this.isElementNode(node) && node.closest('.biochi-span')) {
            continue;
          }
          // 延迟处理新节点，避免布局抖动
          window.requestIdleCallback(() => this.processNode(node));
        }
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  private async processNode(node: Node): Promise<void> {
    if (node.nodeType === Node.TEXT_NODE) {
      // 防止处理我们自己插入的文本（位于 .biochi-span 内）
      if (this.isElementNode(node.parentElement) && 
          node.parentElement.closest('.biochi-span')) {
        return;
      }
      await this.processTextNode(node as Text);
    } else if (this.isElementNode(node)) {
      // 跳过已应用仿生处理的容器
      if (node.closest('.biochi-span')) return;

      // 跳过特殊/已处理的容器
      if (
        node.classList.contains('biochi-processed') ||
        ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName) ||
        node.contentEditable === 'true'
      ) {
        return;
      }

      // 标记并遍历
      node.classList.add('biochi-processed');
      for (const child of Array.from(node.childNodes)) {
        await this.processNode(child);
      }
    }
  }

  /* ----------------- 文本处理辅助方法 ---------------- */
  private detectLanguage(text: string): LanguageType {
    const hasZh = /[\u4e00-\u9fff]/.test(text);
    const hasEn = /[A-Za-z]/.test(text);
    
    if (hasZh && !hasEn) return 'chinese';
    if (hasEn && !hasZh) return 'english';
    if (hasZh && hasEn) return 'mixed';
    return 'other'; // 纯数字、符号等
  }

  /* ----------------- 样式核心 ---------------- */
  private async processTextNode(textNode: Text): Promise<void> {
    const rawText = textNode.textContent;
    if (!rawText?.trim()) return;

    const language = this.detectLanguage(rawText);
    if (language === 'other') return;

    const styledHtml = await this.applyBionicStyle(rawText, language);
    if (styledHtml === rawText) return;

    const span = document.createElement('span');
    // 立即标记为已处理，避免observer/递归再次处理内部
    span.classList.add('biochi-span', 'biochi-processed');
    span.innerHTML = styledHtml;
    
    textNode.parentNode?.replaceChild(span, textNode);
  }

  private async applyBionicStyle(text: string, language: LanguageType): Promise<string> {
    if (!this.settings.enableBionic) return text;

    switch (language) {
      case 'english':
        return this.renderEnglish(text);
      case 'chinese':
        return await this.renderChinese(text);
      case 'mixed':
        return await this.renderMixed(text);
      default:
        return text;
    }
  }

  private async renderChinese(text: string): Promise<string> {
    const segments = await this.splitChinese(text);
    const percentage = this.settings.chineseBoldRatio;
    const enlarge = this.settings.boldEnlarge;

    return segments
      .map((segment) => this.styleWord(segment, percentage, enlarge))
      .join('');
  }

  private renderEnglish(text: string): string {
    const percentage = this.settings.englishBoldRatio;
    const enlarge = this.settings.boldEnlarge;

    // 使用正则替换，保持原始空格和格式
    return text.replace(/\b[A-Za-z]+\b/g, (word) => {
      return this.styleWord(word, percentage, enlarge);
    });
  }

  private async renderMixed(text: string): Promise<string> {
    // 处理混合中英文：中文用jieba+中文比例，英文用英文比例
    const chinesePercentage = this.settings.chineseBoldRatio;
    const englishPercentage = this.settings.englishBoldRatio;
    const enlarge = this.settings.boldEnlarge;

    // 先处理英文单词（用英文比例）
    let result = text.replace(/\b[A-Za-z]+\b/g, (word) => {
      return this.styleWord(word, englishPercentage, enlarge);
    });

    // 然后处理中文部分（用jieba分词 + 中文比例）
    try {
      // 找出所有中文片段
      const chineseMatches = [...result.matchAll(/[\u4e00-\u9fff]+/g)];

      // 从后往前替换，避免索引变化
      for (let i = chineseMatches.length - 1; i >= 0; i--) {
        const match = chineseMatches[i];
        if (!match.index || !match[0]) continue;
        
        const chineseText = match[0];
        const startIndex = match.index;

        // 对中文片段进行jieba分词
        const segments = await this.segmentChinese(chineseText);
        const styledChinese = segments
          .map((segment) => this.styleWord(segment, chinesePercentage, enlarge))
          .join('');

        // 替换原文中的中文片段
        result = result.slice(0, startIndex) + styledChinese + result.slice(startIndex + chineseText.length);
      }

      return result;
    } catch (error) {
      console.warn('[BioChi] 混合文本处理失败，使用简单模式', error);
      // 降级处理：中文逐字，英文按单词（英文已处理过）
      return result.replace(/[\u4e00-\u9fff]/g, (char) => {
        return this.styleWord(char, chinesePercentage, enlarge);
      });
    }
  }

  private styleWord(word: string, percentage: number, enlarge: boolean): string {
    if (word.length <= 1) return word;
    
    const boldLength = Math.ceil((word.length * percentage) / 100);
    const boldPart = word.slice(0, boldLength);
    const restPart = word.slice(boldLength);
    const style = enlarge ? ' style="font-size:1.1em;"' : '';
    
    return `<strong${style}>${boldPart}</strong>${restPart}`;
  }

  private async splitChinese(text: string): Promise<string[]> {
    try {
      return await this.segmentChinese(text);
    } catch (error) {
      console.warn('[BioChi] WASM分词失败，降级到逐字模式', error);
      return [...text];
    }
  }

  /* ----------------- 公共接口 ---------------- */
  public async applyBionicReading(): Promise<void> {
    if (!this.settings.enableBionic) {
      this.removeBionicReading();
      return;
    }
    
    // 清除旧标记然后重新处理整个文档
    this.removeBionicReading();
    await this.processNode(document.body);
  }

  public removeBionicReading(): void {
    // 移除所有仿生阅读标记
    document.querySelectorAll('.biochi-span').forEach((element) => {
      const textNode = document.createTextNode(element.textContent || '');
      element.parentNode?.replaceChild(textNode, element);
    });
    
    document.querySelectorAll('.biochi-processed').forEach((element) => {
      element.classList.remove('biochi-processed');
    });
  }

  /* ----------------- 类型守护 ---------------- */
  private isElementNode(node: Node | Element | null): node is Element {
    return node?.nodeType === Node.ELEMENT_NODE;
  }
}

/* ------------ 启动逻辑 ------------ */
async function bootstrap(): Promise<void> {
  try {
    const { segmentChinese: segmentChineseFn } = await import(
      chrome.runtime.getURL('segment-wrapper.js')
    );
    
    // 创建全局实例
    (window as any).bionicReader = new BionicReader(segmentChineseFn);
  } catch (error) {
    console.error('[BioChi] 启动失败', error);
  }
}

// 根据文档状态启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
} 