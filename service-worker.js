// Keeps a snapshot of states for quick restore.
let lastSnapshot = null;

// Utility: get all regular extensions except this one and themes.
async function listManageableExtensions() {
  const all = await chrome.management.getAll();
  const selfId = chrome.runtime.id;
  return all.filter(e =>
    e.type === 'extension' &&
    e.id !== selfId &&
    !e.isApp &&
    e.permissions && // just to be safe
    !e.installType?.includes('theme') && // themes aren't manageable on/off
    true
  );
}

async function snapshotStates() {
  const exts = await listManageableExtensions();
  lastSnapshot = exts.map(x => ({ id: x.id, enabled: x.enabled }));
  return lastSnapshot;
}

async function restoreSnapshot() {
  if (!lastSnapshot) return { ok: false, reason: "No snapshot captured yet." };
  await Promise.allSettled(lastSnapshot.map(s => chrome.management.setEnabled(s.id, s.enabled)));
  return { ok: true };
}

async function disableAllExcept(exclusions = []) {
  const exts = await listManageableExtensions();
  await snapshotStates();
  await Promise.allSettled(
    exts.map(x => chrome.management.setEnabled(x.id, exclusions.includes(x.id) ? x.enabled : false))
  );
}

async function enableOnly(inclusions = []) {
  const exts = await listManageableExtensions();
  await snapshotStates();
  await Promise.allSettled(
    exts.map(x => chrome.management.setEnabled(x.id, inclusions.includes(x.id)))
  );
}

// Message router from popup/options
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === 'LIST_EXTENSIONS') {
        const exts = await listManageableExtensions();
        sendResponse({ ok: true, exts });
      } else if (msg.type === 'DISABLE_ALL_EXCEPT') {
        await disableAllExcept(msg.exclusions || []);
        sendResponse({ ok: true });
      } else if (msg.type === 'ENABLE_ONLY') {
        await enableOnly(msg.inclusions || []);
        sendResponse({ ok: true });
      } else if (msg.type === 'SNAPSHOT') {
        await snapshotStates();
        sendResponse({ ok: true });
      } else if (msg.type === 'RESTORE') {
        const r = await restoreSnapshot();
        sendResponse(r);
      } else {
        sendResponse({ ok: false, reason: 'Unknown message type' });
      }
    } catch (e) {
      sendResponse({ ok: false, reason: e?.message || String(e) });
    }
  })();
  return true; // keep message channel open for async
});
