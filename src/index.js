import {
  PARENT_MENU_CONTEXT,
  TOGGLE_CURRENT_CONTEXT,
  TOGGLE_ALL_CONTEXT,
  SETTINGS_SEPARATOR_CONTEXT,
  TOGGLE_SELF_DESTRUCT_CONTEXT,
} from './constants';
import {
  onClickHandler,
  removeTabNumbersInWindow,
  showTabNumbersInWindow,
  resetTabTitle,
  isWindowActive,
} from './handlers';
import { removeActiveWindow } from './storage';

chrome.commands.onCommand.addListener((command) => {
  onClickHandler(command);
});

chrome.tabs.onMoved.addListener(async (tabId, moveInfo) => {
  const { windowId } = moveInfo;
  const isActive = await isWindowActive(windowId);

  if (isActive) {
    removeTabNumbersInWindow(windowId);
    showTabNumbersInWindow(windowId);
  }
});

chrome.tabs.onDetached.addListener(async (tabId, detachInfo) => {
  const { oldWindowId } = detachInfo;
  const isActive = await isWindowActive(oldWindowId);

  if (isActive) {
    showTabNumbersInWindow(oldWindowId);
    chrome.tabs.get(tabId, (tab) => {
      chrome.tabs.executeScript(tabId, { code: resetTabTitle(tab.title) });
    });
  }
});

chrome.tabs.onAttached.addListener(async (tabId, attachInfo) => {
  const { newWindowId } = attachInfo;
  const isActive = await isWindowActive(newWindowId);

  isActive && showTabNumbersInWindow(newWindowId);
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const { windowId, isWindowClosing } = removeInfo;
  const isActive = await isWindowActive(windowId);

  if (isActive && !isWindowClosing) {
    removeTabNumbersInWindow(removeInfo.windowId);
    showTabNumbersInWindow(removeInfo.windowId);
  }
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  const isActive = await isWindowActive(windowId);
  isActive && removeActiveWindow(windowId);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: PARENT_MENU_CONTEXT.id,
    title: PARENT_MENU_CONTEXT.title,
    contexts: PARENT_MENU_CONTEXT.contexts,
  });

  const contexts = [
    TOGGLE_CURRENT_CONTEXT,
    TOGGLE_ALL_CONTEXT,
    SETTINGS_SEPARATOR_CONTEXT,
    TOGGLE_SELF_DESTRUCT_CONTEXT,
  ];

  for (const context of contexts) {
    const { id, title, type, contexts, parentId } = context;
    chrome.contextMenus.create({ id, title, type, contexts, parentId });
  }
});

chrome.contextMenus.onClicked.addListener(onClickHandler);
