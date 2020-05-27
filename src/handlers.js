import {
  TAB_LIMIT,
  SELF_DESTRUCT_TIME_MS,
  TOGGLE_CURRENT_CONTEXT,
  TOGGLE_ALL_CONTEXT,
  TOGGLE_SELF_DESTRUCT_CONTEXT,
} from './constants';

let isActiveAllWindows = false;

const getLocalStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get((result) => resolve(result));
  });
};

export const setActiveWindows = (windowId, action) => {
  chrome.storage.local.get((result) => {
    let activeWindows = result.activeWindows ? result.activeWindows : [];

    if (action === 'add') {
      !activeWindows.includes(windowId) && activeWindows.push(windowId);
    } else if (action === 'remove') {
      activeWindows = activeWindows.filter((window) => window !== windowId);
    }

    chrome.storage.local.set({ activeWindows });
  });
};

export const isWindowActive = (windowId) => {
  return new Promise((resolve) => {
    getLocalStorage().then(({ activeWindows }) => {
      resolve(activeWindows ? activeWindows.includes(windowId) : false);
    });
  });
};

const toggleIsSelfDestructEnabled = () => {
  chrome.storage.local.get((result) => {
    const isEnabled = result.isSelfDestructEnabled ? true : false;
    chrome.storage.local.set({ isSelfDestructEnabled: !isEnabled });
  });
};

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

  getLocalStorage().then(({ activeWindows }) => {
    for (let window of activeWindows) {
      removeTabNumbersInWindow(window);
    }
  });
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
    setActiveWindows(windowId, 'add');

    getLocalStorage().then(({ isSelfDestructEnabled }) => {
      if (isSelfDestructEnabled) {
        setTimeout(() => {
          removeTabNumbersInAllWindows();
        }, SELF_DESTRUCT_TIME_MS);
      }
    });
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

    setActiveWindows(windowId, 'remove');
  });
};

export const resetTabTitle = (tabTitle) => {
  return tabTitle.includes(':')
    ? `document.title = "${tabTitle.substring(tabTitle.indexOf(':') + 2)}";`
    : `document.title = "${tabTitle}";`;
};

const toggleCurrentWindow = () => {
  chrome.windows.getCurrent({}, (window) => {
    isWindowActive(window.id).then((result) => {
      result
        ? removeTabNumbersInWindow(window.id)
        : showTabNumbersInWindow(window.id);
    });
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
      toggleIsSelfDestructEnabled();
      break;
    default:
      break;
  }
};
