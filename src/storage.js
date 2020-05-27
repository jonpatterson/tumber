export const getLocalStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get((result) => resolve(result));
  });
};

export const setActiveWindows = (windowId, action) => {
  return new Promise((resolve) => {
    chrome.storage.local.get((result) => {
      let activeWindows = result.activeWindows ? result.activeWindows : [];

      if (action === 'add') {
        !activeWindows.includes(windowId) && activeWindows.push(windowId);
      } else if (action === 'remove') {
        activeWindows = activeWindows.filter((window) => window !== windowId);
      }

      chrome.storage.local.set({ activeWindows }, (result) => resolve(result));
    });
  });
};
