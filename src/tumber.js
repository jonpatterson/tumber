const SHOW = 'show';
const HIDE = 'hide';
const TAB_LIMIT = 8;

const showTabNumbersInWindow = (windowId) => {
  chrome.tabs.query({ windowId }, tabs => {
    for (const tab of tabs) {
      tab.url.includes('http') && tab.index < TAB_LIMIT &&
      chrome.tabs.executeScript(
        tab.id,
        { code: `document.title = "${tab.index + 1}: ${tab.title.substring(tab.title.indexOf(":") + 1)}";` }
      );
    }
  });
};

const removeTabNumbersInWindow = (windowId) => {
  chrome.tabs.query({ windowId }, tabs => {
    for (const tab of tabs) {
      tab.url.includes('http') &&
      chrome.tabs.executeScript(tab.id, { code: resetTabTitle(tab.title) })
    }
  });
};

const resetTabTitle = (tabTitle) => {
  return tabTitle.includes(":")
    ? `document.title = "${tabTitle.substring(tabTitle.indexOf(":") + 2)}";`
    : `document.title = "${tabTitle}";`;
};

let activeWindows = [];

const onClickHandler = (info) => {
  switch (info.menuItemId) {
    case SHOW:
      showTabNumbersInWindow(chrome.windows.WINDOW_ID_CURRENT);
      chrome.windows.getCurrent({}, window => activeWindows.push(window.id));
      break;
    case HIDE:
      removeTabNumbersInWindow(chrome.windows.WINDOW_ID_CURRENT);
      chrome.windows.getCurrent({}, window => {
        activeWindows = activeWindows.filter(activeWindow => activeWindow !== window.id)
      });
      break;
    default:
      break;
  }
};

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  if (activeWindows.includes(moveInfo.windowId)) {
    removeTabNumbersInWindow(chrome.windows.WINDOW_ID_CURRENT);
    showTabNumbersInWindow(chrome.windows.WINDOW_ID_CURRENT);
  }
});

chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  if (activeWindows.includes(detachInfo.oldWindowId)) {
    showTabNumbersInWindow(detachInfo.oldWindowId);
    chrome.tabs.get(tabId, (tab) => {
      chrome.tabs.executeScript(tabId, { code: resetTabTitle(tab.title) })
    })
  }
});

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  if (activeWindows.includes(attachInfo.newWindowId)) {
    showTabNumbersInWindow(attachInfo.newWindowId);
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (activeWindows.includes(removeInfo.windowId)) {
    removeTabNumbersInWindow(chrome.windows.WINDOW_ID_CURRENT);
    showTabNumbersInWindow(chrome.windows.WINDOW_ID_CURRENT);
  }
});

const createContextMenuItem = (id) => {
  chrome.contextMenus.create({
    id,
    title: id.charAt(0).toUpperCase() + id.slice(1),
    contexts: ['all'],
  })
};

chrome.runtime.onInstalled.addListener(() => {
  const contexts = [SHOW, HIDE];

  for (const context of contexts) {
    createContextMenuItem(context);
  }
});

chrome.contextMenus.onClicked.addListener(onClickHandler);
