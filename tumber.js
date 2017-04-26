function onClickHandler(info) {
	if (info.menuItemId === "hide") {
		// Find all tabs in the current window
		chrome.tabs.query({}, function(tabs) {
			for (var i = 0; i < tabs.length; i++) {
				// Only execute script on tabs that display webpages
				if (tabs[i].url.indexOf("http") >= 0) {
					let tabId = tabs[i].id;
					chrome.tabs.executeScript(tabId, {
						file: "hide.js"
					});
				}
			}
		});
	} else {
		chrome.tabs.query({}, function(tabs) {
			for (var i = 0; i < tabs.length; i++) {
				if (tabs[i].url.indexOf("http") >= 0) {
					// Tab index is zero based so add one
					let tabNo = i + 1;
					let tabId = tabs[i].id;
					// Make the tab number available to update.js in each tab
					chrome.tabs.executeScript(tabId, {
						code: "var tabNo = '" + tabNo + "';"
					}, function() {
						chrome.tabs.executeScript(tabId, {
							file: "show.js"
						});
					});
				}
			}
		});
	}
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Setup context menu item on install
chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		"id": "show",
		"title": "Show",
		"type": "radio",
		"contexts": ["all"]
	});
	chrome.contextMenus.create({
		"id": "hide",
		"title": "Hide",
		"type": "radio",
		"contexts": ["all"]
	});
});
