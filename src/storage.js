export const getLocalStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get((result) => resolve(result));
  });
};

export const addActiveWindow = async (windowId) => {
  const { activeWindows = [] } = await getLocalStorage();

  return new Promise((resolve) => {
    !activeWindows.includes(windowId) && activeWindows.push(windowId);
    chrome.storage.local.set({ activeWindows }, (result) => resolve(result));
  });
};

export const removeActiveWindow = async (windowId) => {
  let { activeWindows = [] } = await getLocalStorage();

  return new Promise((resolve) => {
    activeWindows = activeWindows.filter((window) => window !== windowId);
    chrome.storage.local.set({ activeWindows }, (result) => resolve(result));
  });
};

export const clearActiveWindows = () => {
  chrome.storage.local.remove('activeWindows');
};

export const toggleIsSelfDestructEnabled = async () => {
  const { isSelfDestructEnabled = false } = await getLocalStorage();
  chrome.storage.local.set({ isSelfDestructEnabled: !isSelfDestructEnabled });
};

export const setIsActiveAllWindows = async (isActiveAllWindows) => {
  chrome.storage.local.set({ isActiveAllWindows });
};
