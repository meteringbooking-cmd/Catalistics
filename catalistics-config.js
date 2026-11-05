/*!
 * Catalistics - shared configuration loader
 * ------------------------------------------------------------------
 * Every page loads this file first (a plain <script>, before any module),
 * so the settings are ready before a page connects to its database.
 *
 * Where the settings come from (later sources win):
 *   1. window.CATALISTICS_DEFAULTS  - optional file "catalistics-settings.js",
 *      downloaded from Storage & Settings and deployed beside the pages, so
 *      every user of the site gets the same connection without typing it in.
 *   2. This browser's saved settings (localStorage), entered on storage.html.
 *
 * Nothing in this file contains a key, password, target or company detail.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'catalistics.settings.v1';

  // Each database slot the pages use. Pages ask for a slot by name.
  var DB_SLOTS = {
    primary:   { label: 'Primary database',   help: 'Performance, people, compliance, bonus, stock and finance data. Used by almost every page.' },
    secondary: { label: 'Secondary database', help: 'Solar jobs, staff list and meeting calendar. Leave blank to use the primary database.' },
    assets:    { label: 'Asset tracking database', help: 'Asset and meter-install checks. Leave blank to use the primary database.' }
  };

  // Targets are intentionally blank. Each company sets its own on storage.html.
  var TARGET_DEFS = {
    completionRate:          { label: 'Completion rate target', unit: '%', help: 'Completed jobs / total jobs. Drives the RAG colours and the bonus completion check.' },
    completionAmber:         { label: 'Completion rate amber threshold', unit: '%', help: 'Below the target but at or above this shows amber; below it shows red.' },
    metersPerEngineerPerDay: { label: 'Meters per engineer per day', unit: 'meters', help: 'Used to build the daily meters target from headcount.' },
    metersAllowance:         { label: 'Meters target allowance', unit: '%', help: 'Share of the full headcount target that counts as the target (e.g. 90).' },
    bravoMetersPerEngineer:  { label: 'Bravo meters per engineer per day', unit: 'meters', help: 'Per-engineer daily meters for the Bravo contract team views.' },
    contractDailyMeters:     { label: 'Fixed daily meters target (Bravo)', unit: 'meters', help: 'Fixed daily target for the whole Bravo contract.' },
    attendanceRate:          { label: 'Attendance target', unit: '%', help: 'At-work percentage shown green at or above this.' },
    attendanceAmber:         { label: 'Attendance amber threshold', unit: '%', help: '' },
    workingDayHours:         { label: 'Working day length', unit: 'hours', help: 'Expected hours per engineer per day on the Working Hours page.' },
    weeklyHoursRed:          { label: 'Weekly hours: red below', unit: 'hours', help: '' },
    weeklyHoursAmber:        { label: 'Weekly hours: amber below', unit: 'hours', help: '' },
    complianceGreen:         { label: 'Compliance: green at or above', unit: '%', help: '' },
    complianceAmber:         { label: 'Compliance: amber at or above', unit: '%', help: '' },
    capacityGreen:           { label: 'Capacity: available at or above', unit: '%', help: '' }
  };

  // Links to other systems and forms. All blank by default.
  var LINK_DEFS = {
    homeUrl:              { label: 'Main site address', help: 'Where this site is published, e.g. https://portal.example.com' },
    deltaSite:            { label: 'Delta contract site' },
    hrSite:               { label: 'HR site' },
    recruitmentSite:      { label: 'Recruitment site' },
    solarSite:            { label: 'Solar site' },
    assetSite:            { label: 'Asset tracking site' },
    sharedSpreadsheet:    { label: 'Shared spreadsheet (Work Screen link)' },
    bonusPolicyDocument:  { label: 'Bonus policy document' },
    accidentForm:         { label: 'Accident / incident form' },
    nearMissForm:         { label: 'Near miss form' },
    fleetMinorDamageForm: { label: 'Fleet minor damage form' },
    fleetAccidentForm:    { label: 'Fleet vehicle accident form' },
    fleetMileageForm:     { label: 'Fleet mileage audit form' },
    supportWhatsApp:      { label: 'Support WhatsApp number', help: 'International format without + or spaces, e.g. 447700900000' }
  };

  function deepMerge(a, b) {
    var out = Array.isArray(a) ? a.slice() : Object.assign({}, a || {});
    if (!b || typeof b !== 'object') return out;
    Object.keys(b).forEach(function (k) {
      var v = b[k];
      if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = deepMerge(out[k], v);
      else if (v !== undefined && v !== null && v !== '') out[k] = v;
    });
    return out;
  }

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }

  var EMPTY = {
    provider: 'firebase',
    firebase: { primary: {}, secondary: {}, assets: {} },
    aws: {},
    ai: { endpoint: '' },
    links: {},
    targets: {},
    security: { requireSignIn: false, adminPassword: '', financePin: '' },
    display: { sidebarCollapsed: false }
  };

  var settings = deepMerge(deepMerge(EMPTY, window.CATALISTICS_DEFAULTS || {}), readLocal());

  function isFirebaseConfigured(cfg) {
    return !!(cfg && cfg.apiKey && cfg.projectId && cfg.appId);
  }

  // A harmless placeholder so firebase.initializeApp() does not throw on a fresh
  // install. Reads simply fail until real details are entered.
  function placeholderConfig(slot) {
    return {
      apiKey: 'not-configured',
      authDomain: 'not-configured.firebaseapp.com',
      projectId: 'not-configured-' + slot,
      storageBucket: 'not-configured.appspot.com',
      messagingSenderId: '0',
      appId: '1:0:web:not-configured'
    };
  }

  function firebaseConfig(slot) {
    slot = slot || 'primary';
    var fb = settings.firebase || {};
    var cfg = fb[slot];
    if (!isFirebaseConfigured(cfg) && slot !== 'primary') cfg = fb.primary;   // fall back to primary
    if (!isFirebaseConfigured(cfg)) return placeholderConfig(slot);
    var clean = {};
    ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId', 'databaseURL']
      .forEach(function (k) { if (cfg[k]) clean[k] = String(cfg[k]).trim(); });
    return clean;
  }

  function num(v) {
    if (v === '' || v === null || v === undefined) return NaN;
    var n = Number(v);
    return isFinite(n) ? n : NaN;
  }

  // Returns the number, or NaN when the target has not been set.
  function target(key) { return num((settings.targets || {})[key]); }
  function hasTarget(key) { return !isNaN(target(key)); }
  // Text for labels: "90%" or "Not set".
  function targetLabel(key, suffix) {
    var t = target(key);
    if (isNaN(t)) return 'Not set';
    return t.toLocaleString() + (suffix === undefined ? (TARGET_DEFS[key] && TARGET_DEFS[key].unit === '%' ? '%' : '') : suffix);
  }
  // A ratio (e.g. 0.9) from a percentage target; NaN when unset.
  function targetRatio(key) { var t = target(key); return isNaN(t) ? NaN : t / 100; }
  // Format any number that may be NaN (an unset target) for display.
  function fmt(n, dp) {
    if (n === null || n === undefined || (typeof n === 'number' && !isFinite(n))) return '—';
    return typeof dp === 'number' ? Number(n).toFixed(dp) : Number(n).toLocaleString();
  }
  // Red / amber / green helper. Returns 'green' | 'amber' | 'red' | 'none'.
  function rag(value, greenKey, amberKey) {
    var g = target(greenKey), a = target(amberKey);
    if (isNaN(g) || value === null || value === undefined || isNaN(value)) return 'none';
    if (value >= g) return 'green';
    if (!isNaN(a) && value >= a) return 'amber';
    return 'red';
  }

  // Pick one of [green, amber, red, unset] for a value against two targets.
  function band(value, greenKey, amberKey, choices) {
    var r = rag(value, greenKey, amberKey);
    return r === 'green' ? choices[0] : r === 'amber' ? choices[1] : r === 'red' ? choices[2] : (choices.length > 3 ? choices[3] : choices[0]);
  }

  function link(key) { return String(((settings.links || {})[key]) || '').trim(); }
  function linkPath(key, path) {
    var base = link(key);
    if (!base) return '';
    return base.replace(/\/+$/, '') + '/' + String(path || '').replace(/^\/+/, '');
  }
  function notify(msg) {
    if (window.CXShell && window.CXShell.toast) window.CXShell.toast(msg, 'info');
    else try { console.warn(msg); } catch (e) {}
  }
  function openLink(key, path, target) {
    var url = path ? linkPath(key, path) : link(key);
    if (!url) { notify('This link has not been set up yet. Add it under Storage & Settings › Linked systems.'); return null; }
    if (key === 'supportWhatsApp') url = 'https://wa.me/' + url.replace(/[^0-9]/g, '');
    return window.open(url, target || '_blank');
  }

  function save(next) {
    settings = deepMerge(EMPTY, next || {});
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next || {})); } catch (e) {}
    window.CATALISTICS.settings = settings;
    return settings;
  }
  function clearLocal() { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }

  function security() { return settings.security || {}; }
  function requireSignIn() { return !!security().requireSignIn; }
  // Compare a typed password with the one set on storage.html.
  // If sign-in is switched off, every check passes.
  function checkSecret(kind, value) {
    if (!requireSignIn()) return true;
    var expected = String(security()[kind] || '');
    if (!expected) return false;
    return String(value || '') === expected;
  }

  window.CATALISTICS = {
    STORAGE_KEY: STORAGE_KEY,
    DB_SLOTS: DB_SLOTS,
    TARGET_DEFS: TARGET_DEFS,
    LINK_DEFS: LINK_DEFS,
    settings: settings,
    readLocal: readLocal,
    save: save,
    clearLocal: clearLocal,
    deepMerge: deepMerge,
    provider: function () { return settings.provider || 'firebase'; },
    firebaseConfig: firebaseConfig,
    isConfigured: function (slot) { return isFirebaseConfigured((settings.firebase || {})[slot || 'primary']); },
    aws: function () { return Object.assign({}, settings.aws || {}); },
    aiEndpoint: function () { return String((settings.ai || {}).endpoint || '').trim(); },
    target: target,
    hasTarget: hasTarget,
    targetLabel: targetLabel,
    targetRatio: targetRatio,
    fmt: fmt,
    rag: rag,
    band: band,
    link: link,
    linkPath: linkPath,
    openLink: openLink,
    requireSignIn: requireSignIn,
    checkSecret: checkSecret
  };
  // Short alias used inside the pages.
  window.CX = window.CATALISTICS;

  // Fill any <span data-cx-target="key"> with the configured target ("Not set" when blank).
  function fillTargets() {
    var els = document.querySelectorAll('[data-cx-target]');
    for (var i = 0; i < els.length; i++) {
      var k = els[i].getAttribute('data-cx-target');
      els[i].textContent = targetLabel(k, els[i].getAttribute('data-cx-suffix') === null ? undefined : els[i].getAttribute('data-cx-suffix'));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fillTargets);
  else fillTargets();
})();
