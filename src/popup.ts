/// <reference types="chrome" />
import type { BiochiSettings, ChromeMessage } from './types.js';

/**
 * Popup页面控制器
 */
class PopupController {
  private settings: BiochiSettings = {
    enableBionic: false,
    englishBoldRatio: 30,
    chineseBoldRatio: 50,
    boldEnlarge: false
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.loadSettings();
      await this.renderShortcut();
      this.setupEventListeners();
      this.updateUI();
      console.log('[BioChi Popup] 初始化完成');
    } catch (error) {
      console.error('[BioChi Popup] 初始化失败', error);
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

  private setupEventListeners(): void {
    // 启用/禁用开关
    const enableToggle = document.getElementById('enableBionic') as HTMLInputElement;
    enableToggle?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.settings.enableBionic = target.checked;
      this.saveAndApply();
    });

    // 英文加粗比例
    const englishSlider = document.getElementById('englishBoldRatio') as HTMLInputElement;
    const englishValue = document.getElementById('englishBoldValue') as HTMLSpanElement;
    englishSlider?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const value = parseInt(target.value, 10);
      this.settings.englishBoldRatio = value;
      if (englishValue) englishValue.textContent = `${value}%`;
      this.saveAndApply();
    });

    // 中文加粗比例
    const chineseSlider = document.getElementById('chineseBoldRatio') as HTMLInputElement;
    const chineseValue = document.getElementById('chineseBoldValue') as HTMLSpanElement;
    chineseSlider?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const value = parseInt(target.value, 10);
      this.settings.chineseBoldRatio = value;
      if (chineseValue) chineseValue.textContent = `${value}%`;
      this.saveAndApply();
    });

    // 加粗字体放大
    const enlargeToggle = document.getElementById('boldEnlarge') as HTMLInputElement;
    enlargeToggle?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.settings.boldEnlarge = target.checked;
      this.saveAndApply();
    });

    // 打开快捷键设置页
    const openShortcuts = document.getElementById('openShortcuts') as HTMLButtonElement;
    openShortcuts?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
  }

  private updateUI(): void {
    // 更新UI控件的值
    const enableToggle = document.getElementById('enableBionic') as HTMLInputElement;
    const englishSlider = document.getElementById('englishBoldRatio') as HTMLInputElement;
    const englishValue = document.getElementById('englishBoldValue') as HTMLSpanElement;
    const chineseSlider = document.getElementById('chineseBoldRatio') as HTMLInputElement;
    const chineseValue = document.getElementById('chineseBoldValue') as HTMLSpanElement;
    const enlargeToggle = document.getElementById('boldEnlarge') as HTMLInputElement;

    if (enableToggle) enableToggle.checked = this.settings.enableBionic;
    if (englishSlider) englishSlider.value = this.settings.englishBoldRatio.toString();
    if (englishValue) englishValue.textContent = `${this.settings.englishBoldRatio}%`;
    if (chineseSlider) chineseSlider.value = this.settings.chineseBoldRatio.toString();
    if (chineseValue) chineseValue.textContent = `${this.settings.chineseBoldRatio}%`;
    if (enlargeToggle) enlargeToggle.checked = this.settings.boldEnlarge;
  }

  private async renderShortcut(): Promise<void> {
    const shortcutSpan = document.getElementById('shortcutValue') as HTMLSpanElement | null;
    if (!shortcutSpan) return;

    try {
      const platformInfo = await chrome.runtime.getPlatformInfo();
      const commands = await chrome.commands.getAll();
      const toggle = commands.find((c) => c.name === 'toggle_biochi');

      // 直接显示 Chrome 解析后的 shortcut。如果为空则根据平台给出建议值
      if (toggle?.shortcut) {
        shortcutSpan.textContent = toggle.shortcut;
        return;
      }

      // 回退：根据平台给默认建议
      const isMac = platformInfo.os === 'mac';
      const human = isMac ? '⌥⇧B' : 'Alt+Shift+B';
      shortcutSpan.textContent = `${human}（可在“设置快捷键”中修改）`;
    } catch (e) {
      shortcutSpan.textContent = '无法获取快捷键信息';
    }
  }

  private saveAndApply(): void {
    // 保存设置到storage
    chrome.storage.sync.set(this.settings, () => {
      console.log('[BioChi Popup] 设置已保存', this.settings);
    });

    // 发送消息到content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        const message: ChromeMessage = {
          action: 'applyBionicReading',
          settings: this.settings
        };
        
        chrome.tabs.sendMessage(activeTab.id, message).catch((error) => {
          console.warn('[BioChi Popup] 发送消息失败', error);
        });
      }
    });
  }
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
}); 