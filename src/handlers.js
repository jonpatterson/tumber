import {
  TAB_LIMIT,
  SELF_DESTRUCT_TIME_MS,
  TOGGLE_CURRENT_CONTEXT,
  TOGGLE_ALL_CONTEXT,
  TOGGLE_SELF_DESTRUCT_CONTEXT,
} from './constants';

export const activeWindowIds = new Set();
let isActiveAllWindows = false;
let isSelfDestructEnabled = false;

const showTabNumbersInAllWindows = () => {
  isActiveAllWindows = true;

  chrome.windows.getAll({}, (windows) => {
    for (let window of windows) {
      showTabNumbersInWindow(window.id);
    }
  });
};

const removeTabNumbersInAllWindows = () => {
  isActiveAllWindows = false;

  for (let activeWindowId of activeWindowIds) {
    removeTabNumbersInWindow(activeWindowId);
  }
};

export const showTabNumbersInWindow = (windowId) => {
  chrome.tabs.query({ windowId }, (tabs) => {
    for (const tab of tabs) {
      tab.url.includes('http') &&
        tab.index < TAB_LIMIT &&
        chrome.tabs.executeScript(tab.id, {
          code: `document.title = "${tab.index + 1}: ${tab.title.substring(
            tab.title.indexOf(':') + 1
          )}";`,
        });
    }
    activeWindowIds.add(windowId);

    if (isSelfDestructEnabled) {
      setTimeout(() => {
        removeTabNumbersInAllWindows();
      }, SELF_DESTRUCT_TIME_MS);
    }
  });
};

export const removeTabNumbersInWindow = (windowId) => {
  chrome.tabs.query({ windowId }, (tabs) => {
    for (const tab of tabs) {
      tab.url.includes('http') &&
        chrome.tabs.executeScript(tab.id, {
          code: resetTabTitle(tab.title),
        });
    }
    activeWindowIds.delete(windowId);
  });
};

export const resetTabTitle = (tabTitle) => {
  return tabTitle.includes(':')
    ? `document.title = "${tabTitle.substring(tabTitle.indexOf(':') + 2)}";`
    : `document.title = "${tabTitle}";`;
};

const toggleCurrentWindow = () => {
  chrome.windows.getCurrent({}, (window) => {
    activeWindowIds.has(window.id)
      ? removeTabNumbersInWindow(window.id)
      : showTabNumbersInWindow(window.id);
  });
};

const toggleAllWindows = () => {
  isActiveAllWindows
    ? removeTabNumbersInAllWindows()
    : showTabNumbersInAllWindows();
};

export const onClickHandler = (event) => {
  const eventId = typeof event === 'string' ? event : event.menuItemId;

  switch (eventId) {
    case TOGGLE_CURRENT_CONTEXT.id:
      toggleCurrentWindow();
      break;
    case TOGGLE_ALL_CONTEXT.id:
      toggleAllWindows();
      break;
    case TOGGLE_SELF_DESTRUCT_CONTEXT.id:
      isSelfDestructEnabled = !isSelfDestructEnabled;
      break;
    default:
      break;
  }
};
