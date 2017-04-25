var tabTitle = document.title;
// Remove existing tab number so it can be updated
tabTitle = tabTitle.substring(tabTitle.indexOf(":") + 1);
// Add tab number to start of tab title
document.title = `${tabNo}: ${tabTitle}`;
