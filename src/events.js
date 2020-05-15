chrome.commands.onCommand.addListener((command) => { onClickHandler(command) });

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
