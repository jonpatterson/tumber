function onClickHandler() {
	// Find all tabs in the current window
	chrome.tabs.query({}, function(tabs) {
		for (var i = 0; i < tabs.length; i++) {
			// Only execute script on tabs that display webpages
			if (tabs[i].url.indexOf("http") >= 0) {
				// Tab index is zero based so add one
				let tabNo = i + 1;
				let tabId = tabs[i].id;
				// Make the tab number available to update.js in each tab
				chrome.tabs.executeScript(tabId, {
					code: "var tabNo = '" + tabNo + "';"
				}, function() {
					chrome.tabs.executeScript(tabId, {
						file: "update.js"
					});
				});
			}
		}
	});
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Setup context menu item on install
chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		"id": "main",
		"title": "Tumber",
		"contexts": ["all"]
	});
});
