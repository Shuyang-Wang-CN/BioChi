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

function sendApplyMessageToActiveTab(settings: BiochiSettings): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab?.id) return;
    const message: ChromeMessage = {
      action: 'applyBionicReading',
      settings,
    };
    chrome.tabs.sendMessage(activeTab.id, message).catch(() => void 0);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  // 可根据需要初始化设置或迁移
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle_biochi') return;
  const current = await getSettings();
  const next: BiochiSettings = { ...current, enableBionic: !current.enableBionic };
  await setSettings(next);
  sendApplyMessageToActiveTab(next);
});


