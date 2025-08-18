/// <reference types="chrome" />
import type { BiochiSettings, ChromeMessage } from './types.js';

// 默认设置（作为 storage 的回退）
const defaultSettings: BiochiSettings = {
  enableBionic: false,
  englishBoldRatio: 30,
  chineseBoldRatio: 50,
  boldEnlarge: false,
};

async function getSettings(): Promise<BiochiSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaultSettings, (items: Partial<BiochiSettings>) => {
      resolve({ ...defaultSettings, ...items });
    });
  });
}

async function setSettings(next: Partial<BiochiSettings>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(next, () => resolve());
  });
}

async function injectAndApplyToActiveTab(settings: BiochiSettings): Promise<void> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (!activeTab?.id) return;

  // 检查是否是受限页面
  const restrictedUrls = [
    'chrome://',
    'chrome-extension://',
    'moz-extension://',
    'about:',
    'edge://',
    'opera://'
  ];

  const isRestrictedPage = restrictedUrls.some(prefix => 
    activeTab.url?.startsWith(prefix)
  );

  if (isRestrictedPage) {
    console.log('[BioChi Background] 当前页面不支持内容脚本注入:', activeTab.url);
    return;
  }

  try {
    // 首先尝试注入内容脚本
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['content.js']
    });

    // 等待脚本加载
    await new Promise(resolve => setTimeout(resolve, 100));

    // 发送应用设置的消息
    const message: ChromeMessage = {
      action: 'applyBionicReading',
      settings,
    };

    chrome.tabs.sendMessage(activeTab.id, message, (response) => {
      const err = chrome.runtime.lastError;
      if (err && !err.message.includes('Could not establish connection')) {
        console.warn('[BioChi Background] 发送消息失败:', err.message);
      }
    });
  } catch (error) {
    console.warn('[BioChi Background] 脚本注入失败:', error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  // 可根据需要初始化设置或迁移
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle_biochi') return;
  const current = await getSettings();
  const next: BiochiSettings = { ...current, enableBionic: !current.enableBionic };
  await setSettings(next);
  await injectAndApplyToActiveTab(next);
});


