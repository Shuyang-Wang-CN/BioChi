// Chrome扩展相关类型
export interface BiochiSettings {
  enableBionic: boolean;
  englishBoldRatio: number;
  chineseBoldRatio: number;
  boldEnlarge: boolean;
}

export interface ChromeMessage {
  action: string;
  settings?: Partial<BiochiSettings>;
}

// 语言类型
export type LanguageType = 'chinese' | 'english' | 'mixed' | 'other';

// Jieba分词相关
export interface JiebaModule {
  cut(text: string): string[];
  default(wasmUrl: string): Promise<JiebaModule>;
}

// DOM相关 - 使用联合类型而不是继承，避免类型冲突
export type ProcessedNode = Node & {
  classList?: DOMTokenList;
  closest?: (selector: string) => Element | null;
  tagName?: string;
  contentEditable?: string;
}

// 构建配置
export interface BuildOptions {
  watch?: boolean;
  minify?: boolean;
  sourcemap?: boolean;
} 