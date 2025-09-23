const els = {
  list: document.getElementById('list'),
  btnDisableAllExcept: document.getElementById('btnDisableAllExcept'),
  btnEnableOnly: document.getElementById('btnEnableOnly'),
  btnSnapshot: document.getElementById('btnSnapshot'),
  btnRestore: document.getElementById('btnRestore'),
  openOptions: document.getElementById('openOptions'),
};

async function getPrefs() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ inclusions: [], exclusions: [] }, resolve);
  });
}

function send(type, payload = {}) {
  return new Promise(res => chrome.runtime.sendMessage({ type, ...payload }, res));
}

function render(exts, prefs) {
  els.list.innerHTML = '';
  exts.forEach(x => {
    const row = document.createElement('div');
    row.className = 'ext';

    const enabledTag = document.createElement('span');
    enabledTag.className = 'tag';
    enabledTag.textContent = x.enabled ? 'on' : 'off';

    const info = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = x.name;
    const id = document.createElement('div');
    id.className = 'id';
    id.textContent = x.id;
    info.appendChild(name);
    info.appendChild(id);

    const toggles = document.createElement('div');
    toggles.style.display = 'flex';
    toggles.style.gap = '6px';

    const inc = document.createElement('input');
    inc.type = 'checkbox';
    inc.title = 'Include (only these will be enabled by “Enable only inclusions”)';
    inc.checked = prefs.inclusions.includes(x.id);

    const exc = document.createElement('input');
    exc.type = 'checkbox';
    exc.title = 'Exclude (kept on during “Disable all except exclusions”)';
    exc.checked = prefs.exclusions.includes(x.id);

    inc.addEventListener('change', async () => {
      const p = await getPrefs();
      const set = new Set(p.inclusions);
      inc.checked ? set.add(x.id) : set.delete(x.id);
      chrome.storage.sync.set({ inclusions: [...set] });
    });

    exc.addEventListener('change', async () => {
      const p = await getPrefs();
      const set = new Set(p.exclusions);
      exc.checked ? set.add(x.id) : set.delete(x.id);
      chrome.storage.sync.set({ exclusions: [...set] });
    });

    toggles.appendChild(inc);
    toggles.appendChild(exc);

    row.appendChild(enabledTag);
    row.appendChild(info);
    row.appendChild(toggles);
    els.list.appendChild(row);
  });
}

async function init() {
  const [{ exts }, prefs] = await Promise.all([
    send('LIST_EXTENSIONS'),
    getPrefs()
  ]);
  render(exts, prefs);

  els.btnDisableAllExcept.onclick = async () => {
    const { exclusions } = await getPrefs();
    await send('DISABLE_ALL_EXCEPT', { exclusions });
    const refreshed = await send('LIST_EXTENSIONS');
    render(refreshed.exts, await getPrefs());
  };

  els.btnEnableOnly.onclick = async () => {
    const { inclusions } = await getPrefs();
    await send('ENABLE_ONLY', { inclusions });
    const refreshed = await send('LIST_EXTENSIONS');
    render(refreshed.exts, await getPrefs());
  };

  els.btnSnapshot.onclick = async () => {
    await send('SNAPSHOT');
  };
  els.btnRestore.onclick = async () => {
    await send('RESTORE');
    const refreshed = await send('LIST_EXTENSIONS');
    render(refreshed.exts, await getPrefs());
  };

  els.openOptions.onclick = (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  };
}

init();
