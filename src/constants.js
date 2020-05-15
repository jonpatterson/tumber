const TOGGLE_CURRENT_CONTEXT = {
  id: 'toggle_current_window',
  title: 'Toggle Current',
  type: 'normal',
  contexts: ['all'],
  parentId: 'parent',
};

const TOGGLE_ALL_CONTEXT = {
  id: 'toggle_all_windows',
  title: 'Toggle All',
  type: 'normal',
  contexts: ['all'],
  parentId: 'parent',
};

const TOGGLE_SELF_DESTRUCT_CONTEXT = {
  id: 'toggle_self_destruct',
  title: 'Self Destruct',
  type: 'checkbox',
  contexts: ['all'],
  parentId: 'parent',
};

const SETTINGS_SEPARATOR_CONTEXT = {
  id: 'settings_separator',
  type: 'separator',
  contexts: ['all'],
  parentId: 'parent',
}

const PARENT_MENU_CONTEXT = {
  id: 'parent',
  title: 'Tumber',
  contexts: ['all'],
}

const TAB_LIMIT = 8;

const SELF_DESTRUCT_TIME_MS = 4000;
