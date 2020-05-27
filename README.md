# ![tumber logo](https://github.com/jonpatterson/tumber/blob/master/src/icons/icon24.png?raw=true) Tumber #

Google Chrome allows fast switching between tabs using keyboard shortcuts.  With several tabs open this can take a bit of guess work.

Tumber shows a tab number in each open tab so you never jump to the wrong tab again!

Now available on the [Chrome Web Store](https://chrome.google.com/webstore/detail/tumber-tab-numbers-for-go/ikjojkniefmpkobmoilpeiiaofcajlgo)

### ✅ Prerequisites ###
* Node.js minimum [v10 LTS](https://nodejs.org/download/release/latest-v10.x/)

### 🛠️ Setup ###
1. Clone the repository and go to the project directory ```cd tumber```
2. Install the dependencies ```npm install```
3. Build the extension ``` npm run build```
4. Launch Google Chrome and enter ```chrome://extensions``` in the address bar
5. Check the option to enable _Developer mode_
6. Click the _Load unpacked_ button and select _dist_ from the project directory

### 🔢 Usage ###
* Right-click in browser tab and select _Toggle Current_ or _Toggle All_ from the Tumber menu
* Keyboard shortcut <kbd>Ctrl</kbd>+<kbd>Space</kbd> to toggle in current tab
* Keyboard shortcut <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Space</kbd> to toggle in all tabs
* Jump between tabs on Windows/Linux using <kbd>Ctrl</kbd>+<kbd>1</kbd> through <kbd>Ctrl</kbd>+<kbd>8</kbd>
* Jump between tabs on macOS using <kbd>&#8984;</kbd>+<kbd>1</kbd> through <kbd>&#8984;</kbd>+<kbd>8</kbd>

### 🎁 Bonus ###
Now with self destructing tab numbers!  Enable the _Self Destruct_ option from the Tumber menu and tab numbers will disappear after a few seconds.  Customise the delay time by setting ```SELF_DESTRUCT_TIME_MS``` in [src/constants.js](https://github.com/jonpatterson/tumber/blob/master/src/constants.js).

### 📝 Notes ###
* Tab numbers cannot be shown on Chrome tabs such as the New Tab Page or Settings
* Tabs are only numbered up to 8 as there are only shortcuts for the first 8 tabs
* Navigating away from the current page will cause the number to be removed from the tab title
* Some websites update the tab title to show status updates which may remove the tab number
