import {
  TAB_LIMIT,
  SELF_DESTRUCT_TIME_MS,
  TOGGLE_CURRENT_CONTEXT,
  TOGGLE_ALL_CONTEXT,
  TOGGLE_SELF_DESTRUCT_CONTEXT,
} from './constants';
import {
  getLocalStorage,
  addActiveWindow,
  removeActiveWindow,
  clearActiveWindows,
  toggleIsSelfDestructEnabled,
  setIsActiveAllWindows,
} from './storage';

export const isWindowActive = async (windowId) => {
  const { activeWindows } = await getLocalStorage();

  return activeWindows ? activeWindows.includes(windowId) : false;
};

const showTabNumbersInAllWindows = () => {
  setIsActiveAllWindows(true);

  chrome.windows.getAll({}, async (windows) => {
    for (let window of windows) {
      await addActiveWindow(window.id);
      showTabNumbersInWindow(window.id);
    }
  });
};

const removeTabNumbersInAllWindows = async () => {
  setIsActiveAllWindows(false);

  const { activeWindows } = await getLocalStorage();
  if (activeWindows) {
    for (let window of activeWindows) {
      removeTabNumbersInWindow(window);
    }

    clearActiveWindows();
  }
};

export const showTabNumbersInWindow = (windowId) => {
  chrome.tabs.query({ windowId }, async (tabs) => {
    for (const tab of tabs) {
      tab.url.includes('http') &&
        tab.index < TAB_LIMIT &&
        chrome.tabs.executeScript(tab.id, {
          code: `document.title = "${tab.index + 1}: ${tab.title.substring(
            tab.title.indexOf(':') + 1
          )}";`,
        });
    }

    const { isSelfDestructEnabled } = await getLocalStorage();
    isSelfDestructEnabled &&
      setTimeout(() => removeTabNumbersInAllWindows(), SELF_DESTRUCT_TIME_MS);
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
  });
};

export const resetTabTitle = (tabTitle) => {
  return tabTitle.includes(':')
    ? `document.title = "${tabTitle.substring(tabTitle.indexOf(':') + 2)}";`
    : `document.title = "${tabTitle}";`;
};

const toggleCurrentWindow = () => {
  chrome.windows.getCurrent({}, async (window) => {
    const { id } = window;
    const isActive = await isWindowActive(id);

    if (isActive) {
      removeTabNumbersInWindow(id);
      await removeActiveWindow(id);
    } else {
      showTabNumbersInWindow(id);
      await addActiveWindow(id);
    }
  });
};

const toggleAllWindows = async () => {
  const { isActiveAllWindows } = await getLocalStorage();
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
