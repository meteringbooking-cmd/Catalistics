/*!
 * Catalistics - console shell
 * Adds the navy sidebar, the top bar (title, page search, notifications,
 * profile, settings) and the "storage not connected" notice to every page.
 * It does not change anything inside the page itself.
 *
 * Skipped automatically when the page is shown inside another page (iframe),
 * and when the address has ?kiosk=1 (for wall screens).
 */
(function () {
  'use strict';
  if (window.CXShell) return;

  var ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    monitor: '<rect x="2" y="4" width="20" height="13" rx="1"/><path d="M8 21h8M12 17v4"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.3 17A10 10 0 1 1 20.7 17"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    bars: '<path d="M3 21h18"/><rect x="5" y="11" width="3" height="7"/><rect x="10.5" y="6" width="3" height="12"/><rect x="16" y="9" width="3" height="9"/>',
    pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    door: '<path d="M4 21h16M6 21V3h10v18"/><circle cx="13" cy="12" r=".6"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="1"/><path d="M9 4V2.8h6V4M9 10h6M9 14h6M9 18h4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    badge: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
    speed: '<path d="M12 14l3.5-3.5"/><path d="M4 18a9 9 0 1 1 16 0z"/>',
    van: '<path d="M2 17V6h12v11M14 9h4l4 4v4h-2"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    check: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M8 12l3 3 5-6"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.6-2.4-2.8-5.5-3"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    review: '<path d="M4 4h16v12H8l-4 4z"/><path d="M8 9l2 2 5-4"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    wallet: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3z"/><path d="M3 7V5a2 2 0 0 1 2-2h11v4"/><circle cx="16" cy="14" r="1"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    portal: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    collapse: '<path d="M15 6l-6 6 6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5V14M12 17v.5"/>'
  };
  function svg(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.grid) + '</svg>'; }

  // Navigation map. Files not listed here still get the shell; the title then comes from <title>.
  var NAV = [
    { group: 'Overview', items: [
      ['index.html', 'Console home', 'home'],
      ['workscreenftl.html', 'Work Screen', 'monitor'],
      ['officescreen.html', 'Office Screen', 'monitor'],
      ['office-screen-summary.html', 'Office Screen (summary)', 'monitor'],
      ['workscreendailystats.html', 'Daily Performance', 'gauge'],
      ['leaguetable.html', 'League Table', 'trophy']
    ]},
    { group: 'Analytics', items: [
      ['workscreenmetersgraph.html', 'Meters', 'chart'],
      ['workscreencompletionsgraph.html', 'Completion rate', 'bars'],
      ['workscreencompliance.html', 'Compliance trends', 'pie'],
      ['workscreenworkforce.html', 'Workforce', 'users'],
      ['morningwork.html', 'Morning work', 'chart'],
      ['catalistics-ai.html', 'Catalistics AI', 'spark']
    ]},
    { group: 'Daily data', items: [
      ['submitdata.html', 'Submit data', 'edit'],
      ['dataupload.html', 'Weekly job upload', 'upload'],
      ['operations-uploads.html', 'Operations uploads', 'upload'],
      ['D-1.html', 'D-1 call outcomes', 'phone'],
      ['noaccess.html', 'No accesses', 'door'],
      ['gsossubmission.html', 'GSOS submission', 'clipboard'],
      ['scheduling.html', 'Scheduling', 'calendar'],
      ['mapping.html', 'Field mapping', 'map'],
      ['jobtypeparameter.html', 'Job type parameters', 'sliders']
    ]},
    { group: 'People', items: [
      ['staff.html', 'Staff', 'users'],
      ['view.html', 'Engineers', 'user'],
      ['attendance.html', 'Attendance', 'calendar'],
      ['capacity.html', 'Team capacity', 'gauge'],
      ['working-hours.html', 'Working hours', 'clock'],
      ['calendar.html', 'Meeting calendar', 'calendar'],
      ['oncall.html', 'On-call rota', 'phone'],
      ['skills-matrix.html', 'Skills matrix', 'grid'],
      ['engineers-certs-upload.html', 'Engineer certificates', 'badge'],
      ['userdatabase.html', 'User management', 'key']
    ]},
    { group: 'Compliance & safety', items: [
      ['quarterlycompliance.html', 'Quarterly compliance', 'shield'],
      ['complaints.html', 'Complaints', 'alert'],
      ['speeding-display.html', 'Speeding dashboard', 'speed'],
      ['speeding.html', 'Log speeding', 'speed'],
      ['startendvantimes.html', 'Van start & end', 'van'],
      ['job-refusal.html', 'Job refusals', 'ban'],
      ['smart-tester-review.html', 'Smart tester review', 'check']
    ]},
    { group: 'Bonus', items: [
      ['bonus-deduction.html', 'Weekly deductions', 'percent'],
      ['bonus-deduction-ftm-review.html', 'FTM review', 'review'],
      ['bonus-deduction-final-review.html', 'Final monthly review', 'review'],
      ['bonus-tracker.html', 'Bonus tracker', 'list'],
      ['averagebonus.html', 'Average bonus', 'chart'],
      ['quarterlybonusupload.html', 'Quarterly bonus upload', 'upload']
    ]},
    { group: 'Finance', items: [
      ['additionalpayments.html', 'Additional payments', 'receipt'],
      ['allcontractfinances.html', 'Contract finances', 'wallet']
    ]},
    { group: 'Engineers', items: [
      ['engineers.html', 'Engineer portal', 'portal'],
      ['notification.html', 'Notifications', 'bell']
    ]},
    { group: 'Administration', items: [
      ['storage.html', 'Storage & settings', 'database']
    ]}
  ];

  var LS_COLLAPSE = 'catalistics.shell.collapsed';
  var LS_GROUPS = 'catalistics.shell.closedGroups';
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var params = new URLSearchParams(location.search);
  var inFrame = false; try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
  var skip = inFrame || params.get('kiosk') === '1' || document.documentElement.hasAttribute('data-cx-noshell');

  var file = (location.pathname.split('/').pop() || 'index.html');
  if (!/\.html?$/i.test(file)) file = 'index.html';
  var current = null, currentGroup = null, flat = [];
  NAV.forEach(function (g) { g.items.forEach(function (it) {
    flat.push({ href: it[0], label: it[1], icon: it[2], group: g.group });
    if (it[0].toLowerCase() === file.toLowerCase()) { current = it; currentGroup = g.group; }
  }); });

  function pageTitle() {
    if (current) return current[1];
    var t = (document.title || 'Catalistics').split(/[-|•—]/)[0].trim();
    return t || 'Catalistics';
  }

  function toast(msg, kind) {
    var host = document.getElementById('cx-toasts');
    if (!host) { host = document.createElement('div'); host.id = 'cx-toasts'; document.body.appendChild(host); }
    var t = document.createElement('div');
    t.className = 'cx-toast ' + (kind || 'info');
    t.textContent = msg;
    host.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 320); }, 4200);
  }

  window.CXShell = { toast: toast, nav: NAV, icons: ICONS, svg: svg };

  // Favicon on every page
  (function () {
    if (document.querySelector('link[rel~="icon"]')) return;
    var l = document.createElement('link'); l.rel = 'icon'; l.type = 'image/png'; l.href = 'assets/favicon.png';
    (document.head || document.documentElement).appendChild(l);
  })();

  if (skip) { document.documentElement.classList.add('cx-embedded'); return; }

  document.documentElement.classList.add('cx-shell');
  if (lsGet(LS_COLLAPSE, '0') === '1') document.documentElement.classList.add('cx-collapsed');

  function build() {
    if (document.getElementById('cx-sidebar')) return;
    var closed = {};
    try { closed = JSON.parse(lsGet(LS_GROUPS, '{}')) || {}; } catch (e) {}

    // ---- Sidebar
    var sb = document.createElement('nav');
    sb.id = 'cx-sidebar';
    sb.setAttribute('aria-label', 'Main navigation');
    var html = '<a class="cx-sb-brand" href="index.html" title="Catalistics console home">' +
      '<img class="cx-cat" src="assets/catalistics-cat.png" alt="">' +
      '<img class="cx-word" src="assets/catalistics-wordmark.png" alt="Catalistics"></a>' +
      '<div class="cx-sb-scroll">';
    NAV.forEach(function (g) {
      var isClosed = closed[g.group] && g.group !== currentGroup;
      html += '<div class="cx-sb-group' + (isClosed ? ' cx-closed' : '') + '" data-group="' + g.group + '">' +
        '<button type="button" class="cx-sb-group-title" aria-expanded="' + (!isClosed) + '">' + g.group + svg('chevron') + '</button><div class="cx-sb-items">';
      g.items.forEach(function (it) {
        var active = current && it[0] === current[0];
        html += '<a class="cx-sb-item' + (active ? ' cx-active' : '') + '" href="' + it[0] + '" data-label="' + it[1] + '"' + (active ? ' aria-current="page"' : '') + '>' +
          svg(it[2]) + '<span class="cx-sb-label">' + it[1] + '</span></a>';
      });
      html += '</div></div>';
    });
    html += '</div><div class="cx-sb-foot"><button type="button" class="cx-sb-collapse" title="Collapse navigation">' + svg('collapse') + '<span>Collapse</span></button></div>';
    sb.innerHTML = html;

    // ---- Top bar
    var tb = document.createElement('header');
    tb.id = 'cx-topbar';
    var crumbs = '<a href="index.html">Catalistics</a>' + (currentGroup ? '<span class="sep">›</span>' + currentGroup : '');
    tb.innerHTML =
      '<button type="button" class="cx-tb-icon cx-tb-menu" aria-label="Open navigation">' + svg('menu') + '</button>' +
      '<div class="cx-tb-title"><div class="cx-tb-crumbs">' + crumbs + '</div><div class="cx-tb-page">' + pageTitle() + '</div></div>' +
      '<div class="cx-tb-search">' + svg('search') +
        '<input type="search" placeholder="Search pages" aria-label="Search pages" autocomplete="off"><kbd>/</kbd>' +
        '<div class="cx-search-results" role="listbox"></div></div>' +
      '<div class="cx-tb-actions">' +
        '<button type="button" class="cx-tb-icon" data-pop="cx-pop-notes" aria-label="Notifications">' + svg('bell') + '<span class="cx-tb-dot" hidden></span></button>' +
        '<a class="cx-tb-icon cx-tb-hide-sm" href="storage.html" aria-label="Storage and settings" title="Storage & settings">' + svg('settings') + '</a>' +
        '<span class="cx-tb-divider"></span>' +
        '<button type="button" class="cx-tb-icon" data-pop="cx-pop-profile" aria-label="Profile"><span class="cx-tb-avatar">' + svg('user').replace('<svg', '<svg style="width:15px;height:15px;stroke:#fff"') + '</span></button>' +
      '</div>';

    // ---- Popovers
    var configured = window.CATALISTICS && window.CATALISTICS.isConfigured('primary');
    var notes = document.createElement('div');
    notes.className = 'cx-pop'; notes.id = 'cx-pop-notes';
    notes.innerHTML = '<h4>Notifications</h4>' +
      (configured
        ? '<div class="cx-pop-body">You\'re all caught up.</div>'
        : '<div class="cx-pop-row"><span class="cx-status warn"></span><div><strong>Storage not connected</strong><br><span style="color:var(--cx-text-2)">Add your database details so pages can load data.</span></div></div><a class="cx-pop-link" href="storage.html">Open Storage &amp; settings</a>');
    var profile = document.createElement('div');
    profile.className = 'cx-pop'; profile.id = 'cx-pop-profile';
    var prov = window.CATALISTICS ? window.CATALISTICS.provider() : 'firebase';
    profile.innerHTML = '<h4>Catalistics console</h4>' +
      '<div class="cx-pop-row"><div style="flex:1">Data storage</div>' + (configured ? '<span class="cx-status ok">' + (prov === 'aws' ? 'AWS' : 'Firebase') + '</span>' : '<span class="cx-status warn">Not connected</span>') + '</div>' +
      '<div class="cx-pop-row"><div style="flex:1">Sign-in</div><span class="cx-status ' + (window.CATALISTICS && window.CATALISTICS.requireSignIn() ? 'ok">Required' : 'warn">Off') + '</span></div>' +
      '<a class="cx-pop-link" href="storage.html">Storage &amp; settings</a>' +
      '<a class="cx-pop-link" href="index.html">Console home</a>';

    var scrim = document.createElement('div'); scrim.id = 'cx-scrim';

    document.body.insertBefore(scrim, document.body.firstChild);
    document.body.insertBefore(tb, document.body.firstChild);
    document.body.insertBefore(sb, document.body.firstChild);
    document.body.appendChild(notes);
    document.body.appendChild(profile);

    // ---- Setup notice
    if (!configured && file.toLowerCase() !== 'storage.html' && lsGet('catalistics.shell.flashDismissed', '') !== new Date().toDateString()) {
      var fl = document.createElement('div');
      fl.id = 'cx-flash';
      fl.setAttribute('role', 'status');
      fl.innerHTML = svg('info') + '<span>Data storage isn\'t connected yet, so this page can\'t load or save data.</span><a href="storage.html">Connect storage</a><button type="button" aria-label="Dismiss">×</button>';
      document.body.insertBefore(fl, tb.nextSibling);
      document.documentElement.classList.add('cx-has-flash');
      var setH = function () { document.documentElement.style.setProperty('--cx-flash-h', fl.offsetHeight + 'px'); };
      setH(); window.addEventListener('resize', setH);
      fl.querySelector('button').addEventListener('click', function () {
        fl.remove(); document.documentElement.classList.remove('cx-has-flash');
        lsSet('catalistics.shell.flashDismissed', new Date().toDateString());
      });
      tb.querySelector('.cx-tb-dot').hidden = false;
    }

    // ---- Behaviour
    sb.querySelector('.cx-sb-collapse').addEventListener('click', function () {
      var on = document.documentElement.classList.toggle('cx-collapsed');
      lsSet(LS_COLLAPSE, on ? '1' : '0');
      setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 200);
    });
    sb.querySelectorAll('.cx-sb-group-title').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var g = btn.parentElement; var c = g.classList.toggle('cx-closed');
        btn.setAttribute('aria-expanded', String(!c));
        closed[g.getAttribute('data-group')] = c; lsSet(LS_GROUPS, JSON.stringify(closed));
      });
    });
    tb.querySelector('.cx-tb-menu').addEventListener('click', function () { document.documentElement.classList.toggle('cx-mobile-open'); });
    scrim.addEventListener('click', function () { document.documentElement.classList.remove('cx-mobile-open'); });

    function closePops(except) { document.querySelectorAll('.cx-pop.cx-open').forEach(function (p) { if (p.id !== except) p.classList.remove('cx-open'); }); }
    tb.querySelectorAll('[data-pop]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); var id = b.getAttribute('data-pop'); closePops(id); document.getElementById(id).classList.toggle('cx-open'); });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.cx-pop')) closePops(); });

    // Page search
    var input = tb.querySelector('.cx-tb-search input'), box = tb.querySelector('.cx-search-results'), hl = -1, hits = [];
    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) { box.classList.remove('cx-open'); return; }
      hits = flat.filter(function (p) { return (p.label + ' ' + p.group + ' ' + p.href).toLowerCase().indexOf(q) !== -1; }).slice(0, 10);
      hl = hits.length ? 0 : -1;
      box.innerHTML = hits.length ? hits.map(function (p, i) { return '<a href="' + p.href + '"' + (i === 0 ? ' class="cx-hl"' : '') + '><span>' + p.label + '</span><small>' + p.group + '</small></a>'; }).join('') : '<div class="cx-empty">No pages match "' + q.replace(/</g, '&lt;') + '"</div>';
      box.classList.add('cx-open');
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!hits.length) return;
        hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
        box.querySelectorAll('a').forEach(function (a, i) { a.classList.toggle('cx-hl', i === hl); });
      } else if (e.key === 'Enter' && hl > -1 && hits[hl]) { location.href = hits[hl].href; }
      else if (e.key === 'Escape') { input.value = ''; box.classList.remove('cx-open'); input.blur(); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.cx-tb-search')) box.classList.remove('cx-open'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/input|textarea|select/i.test((document.activeElement || {}).tagName || '') && !(document.activeElement || {}).isContentEditable) { e.preventDefault(); input.focus(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
