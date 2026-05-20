const splitBtn = document.getElementById('splitBtn');
const restoreBtn = document.getElementById('restoreBtn');
const status = document.getElementById('status');
const badge = document.getElementById('badge');
const badgeText = document.getElementById('badgeText');

function setLoading(msg) {
  status.textContent = msg;
  splitBtn.disabled = true;
  restoreBtn.disabled = true;
}

function setError(msg) {
  status.textContent = msg;
  splitBtn.disabled = false;
  restoreBtn.disabled = false;
}

function setActive(isActive) {
  splitBtn.style.display = isActive ? 'none' : 'block';
  restoreBtn.style.display = isActive ? 'block' : 'none';

  badge.className = 'badge ' + (isActive ? 'active' : 'inactive');
  badgeText.textContent = isActive ? 'Split active' : 'Ready';
}

async function updateUI() {
  const state = await chrome.runtime.sendMessage({ action: 'getState' });
  setActive(!!state.mobileWindowId);
}

splitBtn.addEventListener('click', async () => {
  setLoading('Opening split view…');
  const result = await chrome.runtime.sendMessage({
    action: 'split',
    screenWidth: window.screen.width,
    screenHeight: window.screen.height
  });
  if (result?.error) {
    setError('Error: ' + result.error);
  } else {
    window.close();
  }
});

restoreBtn.addEventListener('click', async () => {
  setLoading('Restoring…');
  const result = await chrome.runtime.sendMessage({ action: 'restore' });
  if (result?.error) {
    setError('Error: ' + result.error);
  } else {
    window.close();
  }
});

updateUI();
