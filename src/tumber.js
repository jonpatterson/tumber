const SHOW = 'show';
const HIDE = 'hide';
const TOGGLE_CURRENT = 'toggle_current_window';
const TOGGLE_ALL = 'toggle_all_windows';
const TAB_LIMIT = 8;

const activeWindowIds = new Set();
let isActiveAllWindows = false;

const showTabNumbersInAllWindows = () => {
  chrome.windows.getAll({}, windows => {
    for (let window of windows) {
      showTabNumbersInWindow(window.id);
    }
    isActiveAllWindows = true;
  });
};

const removeTabNumbersInAllWindows = () => {
  for (let activeWindowId of activeWindowIds) {
    removeTabNumbersInWindow(activeWindowId);
  }
  isActiveAllWindows = false;
};

const showTabNumbersInWindow = (windowId) => {
  chrome.tabs.query({ windowId }, tabs => {
    for (const tab of tabs) {
      tab.url.includes('http') && tab.index < TAB_LIMIT &&
      chrome.tabs.executeScript(
        tab.id,
        { code: `document.title = "${tab.index + 1}: ${tab.title.substring(tab.title.indexOf(":") + 1)}";` }
      );
    }
    activeWindowIds.add(windowId);
  });
};

const removeTabNumbersInWindow = (windowId) => {
  chrome.tabs.query({ windowId }, tabs => {
    for (const tab of tabs) {
      tab.url.includes('http') &&
      chrome.tabs.executeScript(tab.id, { code: resetTabTitle(tab.title) })
    }
    activeWindowIds.delete(windowId);
  });
};

const resetTabTitle = (tabTitle) => {
  return tabTitle.includes(":")
    ? `document.title = "${tabTitle.substring(tabTitle.indexOf(":") + 2)}";`
    : `document.title = "${tabTitle}";`;
};

const onClickHandler = (info) => {
  switch (info.menuItemId) {
    case SHOW:
      chrome.windows.getCurrent({}, window => showTabNumbersInWindow(window.id));
      break;
    case HIDE:
      chrome.windows.getCurrent({}, window => removeTabNumbersInWindow(window.id));
      break;
    default:
      break;
  }
};

chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case TOGGLE_CURRENT:
      chrome.windows.getCurrent({}, window => {
        activeWindowIds.has(window.id)
          ? removeTabNumbersInWindow(window.id)
          : showTabNumbersInWindow(window.id)
      });
      break;
    case TOGGLE_ALL:
      isActiveAllWindows
        ? removeTabNumbersInAllWindows()
        : showTabNumbersInAllWindows()
      break;
    default:
      break;
  }
});

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  if (activeWindowIds.has(moveInfo.windowId)) {
    removeTabNumbersInWindow(moveInfo.windowId);
    showTabNumbersInWindow(moveInfo.windowId);
  }
});

chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  if (activeWindowIds.has(detachInfo.oldWindowId)) {
    showTabNumbersInWindow(detachInfo.oldWindowId);
    chrome.tabs.get(tabId, (tab) => {
      chrome.tabs.executeScript(tabId, { code: resetTabTitle(tab.title) })
    })
  }
});

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  if (activeWindowIds.has(attachInfo.newWindowId)) {
    showTabNumbersInWindow(attachInfo.newWindowId);
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (activeWindowIds.has(removeInfo.windowId)) {
    removeTabNumbersInWindow(removeInfo.windowId);
    showTabNumbersInWindow(removeInfo.windowId);
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
