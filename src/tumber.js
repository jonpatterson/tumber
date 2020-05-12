const SHOW = 'show';
const HIDE = 'hide';
const TOGGLE_CURRENT = 'toggle_current_window';
const TOGGLE_ALL = 'toggle_all_windows';
const TAB_LIMIT = 8;

const activeWindows = new Set();

const showTabNumbersInWindow = (windowId) => {
  chrome.tabs.query({ windowId }, tabs => {
    for (const tab of tabs) {
      tab.url.includes('http') && tab.index < TAB_LIMIT &&
      chrome.tabs.executeScript(
        tab.id,
        { code: `document.title = "${tab.index + 1}: ${tab.title.substring(tab.title.indexOf(":") + 1)}";` }
      );
    }
    activeWindows.add(windowId);
    console.log(activeWindows);
  });
};

const removeTabNumbersInWindow = (windowId) => {
  chrome.tabs.query({ windowId }, tabs => {
    for (const tab of tabs) {
      tab.url.includes('http') &&
      chrome.tabs.executeScript(tab.id, { code: resetTabTitle(tab.title) })
    }
    activeWindows.delete(windowId);
    console.log(activeWindows);
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
      console.log(command);
      chrome.windows.getCurrent({}, window => {
        activeWindows.has(window.id)
          ? removeTabNumbersInWindow(window.id)
          : showTabNumbersInWindow(window.id)
      });
      break;
    case TOGGLE_ALL:
      console.log(command);
      break;
    default:
      break;
  }  
});

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  if (activeWindows.has(moveInfo.windowId)) {
    removeTabNumbersInWindow(moveInfo.windowId);
    showTabNumbersInWindow(moveInfo.windowId);
  }
});

chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  if (activeWindows.has(detachInfo.oldWindowId)) {
    showTabNumbersInWindow(detachInfo.oldWindowId);
    chrome.tabs.get(tabId, (tab) => {
      chrome.tabs.executeScript(tabId, { code: resetTabTitle(tab.title) })
    })
  }
});

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  if (activeWindows.has(attachInfo.newWindowId)) {
    showTabNumbersInWindow(attachInfo.newWindowId);
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (activeWindows.has(removeInfo.windowId)) {
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
