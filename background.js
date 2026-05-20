const AMAZON_APP_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
  'Mobile/21A329 AmazonApp/25.18.0.300 iOS/17.0';

const MOBILE_WIN_WIDTH = 393;
const UA_RULE_ID = 1001;

const ALL_RESOURCE_TYPES = [
  'main_frame', 'sub_frame', 'stylesheet', 'script', 'image',
  'font', 'object', 'xmlhttprequest', 'ping', 'media',
  'websocket', 'other'
];

async function getState() {
  return chrome.storage.session.get(['mobileWindowId', 'originalWindowId', 'originalBounds']);
}

async function setState(data) {
  return chrome.storage.session.set(data);
}

async function clearState() {
  return chrome.storage.session.remove(['mobileWindowId', 'originalWindowId', 'originalBounds']);
}

async function removeUaRule() {
  try {
    await chrome.declarativeNetRequest.updateSessionRules({
      addRules: [],
      removeRuleIds: [UA_RULE_ID]
    });
  } catch (_) {}
}

async function splitView(screenWidth, screenHeight) {
  const currentWindow = await chrome.windows.getCurrent({ populate: true });
  const activeTab = currentWindow.tabs.find(t => t.active);
  if (!activeTab) return { error: 'No active tab found' };

  const originalBounds = {
    left: currentWindow.left,
    top: currentWindow.top,
    width: currentWindow.width,
    height: currentWindow.height
  };

  const desktopWidth = screenWidth - MOBILE_WIN_WIDTH;

  await chrome.windows.update(currentWindow.id, {
    left: 0,
    top: 0,
    width: desktopWidth,
    height: screenHeight,
    state: 'normal'
  });

  const mobileWindow = await chrome.windows.create({
    url: activeTab.url,
    left: desktopWidth,
    top: 0,
    width: MOBILE_WIN_WIDTH,
    height: screenHeight,
    type: 'normal'
  });

  const mobileTabId = mobileWindow.tabs[0].id;

  await chrome.declarativeNetRequest.updateSessionRules({
    addRules: [{
      id: UA_RULE_ID,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [{
          header: 'User-Agent',
          operation: 'set',
          value: AMAZON_APP_UA
        }]
      },
      condition: {
        tabIds: [mobileTabId],
        resourceTypes: ALL_RESOURCE_TYPES
      }
    }],
    removeRuleIds: []
  });

  // Reload so the new UA takes effect on first load
  await chrome.tabs.reload(mobileTabId);

  await setState({
    mobileWindowId: mobileWindow.id,
    originalWindowId: currentWindow.id,
    originalBounds
  });

  return { success: true };
}

async function restoreView() {
  const { mobileWindowId, originalWindowId, originalBounds } = await getState();

  await removeUaRule();

  if (mobileWindowId) {
    try { await chrome.windows.remove(mobileWindowId); } catch (_) {}
  }

  if (originalWindowId && originalBounds) {
    try {
      await chrome.windows.update(originalWindowId, {
        ...originalBounds,
        state: 'normal'
      });
    } catch (_) {}
  }

  await clearState();
  return { success: true };
}

// User closes mobile window manually → clean up
chrome.windows.onRemoved.addListener(async (windowId) => {
  const { mobileWindowId, originalWindowId, originalBounds } = await getState();
  if (windowId !== mobileWindowId) return;

  await removeUaRule();

  if (originalWindowId && originalBounds) {
    try {
      await chrome.windows.update(originalWindowId, {
        ...originalBounds,
        state: 'normal'
      });
    } catch (_) {}
  }

  await clearState();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'split') {
    splitView(message.screenWidth, message.screenHeight)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (message.action === 'restore') {
    restoreView()
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (message.action === 'getState') {
    getState()
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});
