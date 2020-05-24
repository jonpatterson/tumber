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
  setActiveWindows,
} from './handlers';

chrome.commands.onCommand.addListener((command) => {
  onClickHandler(command);
});

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  isWindowActive(moveInfo.windowId).then((result) => {
    if (result) {
      removeTabNumbersInWindow(moveInfo.windowId);
      showTabNumbersInWindow(moveInfo.windowId);
    }
  });
});

chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  if (isWindowActive(detachInfo.oldWindowId)) {
    showTabNumbersInWindow(detachInfo.oldWindowId);
    chrome.tabs.get(tabId, (tab) => {
      chrome.tabs.executeScript(tabId, { code: resetTabTitle(tab.title) });
    });
  }
});

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  if (isWindowActive(attachInfo.newWindowId)) {
    showTabNumbersInWindow(attachInfo.newWindowId);
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) {
    isWindowActive(removeInfo.windowId).then((result) => {
      if (result) {
        setActiveWindows(removeInfo.windowId, 'remove');
      }
    });
  } else if (isWindowActive(removeInfo.windowId)) {
    removeTabNumbersInWindow(removeInfo.windowId);
    showTabNumbersInWindow(removeInfo.windowId);
  }
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
