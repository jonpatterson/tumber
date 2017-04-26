var tabTitle = document.title;
// Remove tab number and restore original tab title
document.title = tabTitle.substring(tabTitle.indexOf(":") + 1);
