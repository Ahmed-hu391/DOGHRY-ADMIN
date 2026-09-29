'use strict';
// IMPORTANT: use only the publishable key in the browser. Never place the service_role/secret key here.
const SUPABASE_URL = 'https://ubwutnxafcrcpylpvqgs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NSZ3i0xOCLLx9bH3zgGJuQ_rWCjJoRJ';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============ إعدادات سهلة التعديل ============ */
// المساهمة بتظهر في لوحة المساهمين لما تكون "معتمدة" ومش مخفية (show_on_board).
const isVisibleOnSite = (row) => row.status === 'approved' && row.show_on_board !== false;
const BOARD_SQL = `alter table public.contributions add column if not exists show_on_board boolean not null default true;

create or replace view public.approved_contributors_public as
select contributor_name, points
from public.contributions
where status = 'approved' and show_on_board = true;`;
const boardReady = () => !state.rows.length || state.rows.some((r) => 'show_on_board' in r);
const personKey = (r) => digits(r.phone) || ('n:' + (r.contributor_name || '').trim());
function summaryOf(r) {
  const d = r.data || {};
  if (r.type === 'route') return [d.routeFrom, d.routeTo].filter(Boolean).join(' ← ');
  if (r.type === 'stop') return [d.stopName, d.stopArea].filter(Boolean).join(' — ');
  if (r.type === 'correction') return d.correctionSubject || '';
  if (r.type === 'driver') return d.driverRoute || '';
  return '';
}
const PAGE_SIZE = 30;
const AUTO_REFRESH_MS = 60000;

const typeLabels = {
  route: 'أضاف خط مواصلات',
  stop: 'أضاف موقف أو نقطة ركوب',
  correction: 'صحّح معلومة',
  driver: 'سائق'
};
const statusLabels = { pending: 'تحت المراجعة', approved: 'معتمدة', rejected: 'مرفوضة' };
const fieldLabels = {
  routeFrom: 'من', routeTo: 'إلى', routeStops: 'المواقف', routeTransport: 'نوع المواصلات', routeFare: 'الأجرة',
  stopName: 'اسم الموقف', stopArea: 'المنطقة', stopDetails: 'تفاصيل', stopTransport: 'نوع المواصلات',
  correctionSubject: 'المعلومة', correctionDetails: 'التصحيح',
  driverRoute: 'الخط', driverTransport: 'نوع المواصلات', driverDetails: 'التفاصيل', driverExtra: 'ملاحظات'
};

/* ============ أدوات صغيرة ============ */
const $ = (id) => document.getElementById(id);
const root = document.documentElement;
const ICONS = {
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.2A8 8 0 1 1 21 12z"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4"/><path d="M6.6 6.7C3.7 8.6 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4-.9"/><path d="m3 3 18 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  undo: '<path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7"/>'
};
const ic = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const digits = (s) => String(s ?? '').replace(/\D/g, '');
function waNumber(p) {
  let d = digits(p);
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = '20' + d.slice(1);
  return d;
}
function fullDate(v) {
  try { return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v)); }
  catch { return v || ''; }
}
function relTime(v) {
  const t = new Date(v).getTime();
  if (!t) return '';
  const s = Math.round((t - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('ar-EG', { numeric: 'auto' });
  const a = Math.abs(s);
  if (a < 60) return 'دلوقتي';
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
  if (a < 7 * 86400) return rtf.format(Math.round(s / 86400), 'day');
  return fullDate(v);
}
const typeName = (t) => typeLabels[t] || t || 'مساهمة';
const pts = (r) => (Number.isFinite(Number(r.points)) ? Number(r.points) : 0);
const idEq = (a, b) => String(a) === String(b);
const valueText = (v) => (v !== null && typeof v === 'object') ? JSON.stringify(v) : String(v ?? '');
const detailEntries = (row) => Object.entries(row.data || {}).filter(([k, v]) => k !== 'phone' && valueText(v).trim() !== '');

/* ============ الحالة ============ */
const state = {
  rows: [], loaded: false, tab: 'contrib', filter: 'all', type: 'all', sort: 'new',
  q: '', selected: new Set(), active: null, limit: PAGE_SIZE, editingId: null
};
const byId = (id) => state.rows.find((r) => idEq(r.id, id));

function searchText(r) {
  return [r.contributor_name, r.phone, typeName(r.type), ...Object.values(r.data || {}).map(valueText)].join(' ').toLowerCase();
}
function getFiltered() {
  const q = state.q.trim().toLowerCase();
  const list = state.rows.filter((r) =>
    (state.filter === 'all' || r.status === state.filter) &&
    (state.type === 'all' || r.type === state.type) &&
    (!q || searchText(r).includes(q)));
  const time = (r) => new Date(r.created_at).getTime() || 0;
  if (state.sort === 'old') list.sort((a, b) => time(a) - time(b));
  else if (state.sort === 'points') list.sort((a, b) => pts(b) - pts(a) || time(b) - time(a));
  else list.sort((a, b) => time(b) - time(a));
  return list;
}
function getPeople() {
  const map = new Map();
  for (const r of state.rows) {
    const key = personKey(r);
    let p = map.get(key);
    if (!p) { p = { key, name: r.contributor_name, phone: r.phone, total: 0, approved: 0, pending: 0, rejected: 0, points: 0, shown: 0, last: 0 }; map.set(key, p); }
    const t = new Date(r.created_at).getTime() || 0;
    if (t >= p.last) { p.last = t; p.name = r.contributor_name || p.name; }
    p.total++; p[r.status] = (p[r.status] || 0) + 1;
    if (r.status === 'approved') p.points += pts(r);
    if (isVisibleOnSite(r)) p.shown++;
  }
  const q = state.q.trim().toLowerCase();
  return [...map.values()]
    .filter((p) => !q || `${p.name} ${p.phone}`.toLowerCase().includes(q))
    .sort((a, b) => b.points - a.points || b.approved - a.approved);
}

/* ============ Toast / Dialog ============ */
function toast(msg, opts = {}) {
  const t = $('toast');
  t.textContent = '';
  t.classList.toggle('err', !!opts.error);
  const s = document.createElement('span'); s.textContent = msg; t.append(s);
  if (opts.undo) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'تراجع';
    b.onclick = () => { t.classList.remove('show'); opts.undo(); };
    t.append(b);
  }
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), opts.undo ? 6500 : 3400);
}
function confirmDialog({ title, message, ok = 'تأكيد', danger = false }) {
  return new Promise((resolve) => {
    $('dlgTitle').textContent = title; $('dlgMsg').textContent = message;
    const okBtn = $('dlgOk'); okBtn.textContent = ok; okBtn.className = 'btn ' + (danger ? 'bad' : 'primary');
    const bd = $('dialogBackdrop'); bd.classList.add('open'); okBtn.focus();
    const done = (v) => { bd.classList.remove('open'); okBtn.onclick = $('dlgCancel').onclick = bd.onclick = null; state.dialogCancel = null; resolve(v); };
    okBtn.onclick = () => done(true);
    $('dlgCancel').onclick = () => done(false);
    bd.onclick = (e) => { if (e.target === bd) done(false); };
    state.dialogCancel = () => done(false);
  });
}

/* ============ الثيم ============ */
function applyTheme(theme) {
  root.dataset.theme = theme;
  $('themeToggle').innerHTML = ic(theme === 'dark' ? 'sun' : 'moon');
  try { localStorage.setItem('dughri-admin-theme', theme); } catch {}
}
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('dughri-admin-theme'); } catch {}
  applyTheme(saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  $('themeToggle').addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
})();

/* ============ تحميل البيانات ============ */
async function load({ silent = false } = {}) {
  if (!silent) $('list').innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div>';
  const { data, error } = await sb.from('contributions').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error(error);
    if (!silent || !state.loaded) $('list').innerHTML = '<div class="empty"><strong>مقدرناش نحمّل البيانات</strong>اتأكد من النت أو من صلاحيات Supabase وبعدين اضغط تحديث.</div>';
    toast(error.message || 'تعذر تحميل البيانات', { error: true });
    return;
  }
  const rows = data || [];
  if (silent && state.loaded) {
    const known = new Set(state.rows.map((r) => String(r.id)));
    const fresh = rows.filter((r) => !known.has(String(r.id)) && r.status === 'pending').length;
    if (fresh) toast(fresh === 1 ? 'وصلت مساهمة جديدة' : `وصلت ${fresh} مساهمات جديدة`);
  }
  state.rows = rows; state.loaded = true;
  state.selected = new Set([...state.selected].filter((id) => byId(id)));
  if (state.active !== null && !byId(state.active)) state.active = null;
  render();
}

/* ============ العرض ============ */
function render() {
  renderBanner(); renderStats(); renderTabsAndToolbar();
  if (state.tab === 'people') renderPeople(); else renderList();
  renderDetail(); renderBulk();
}
function renderBanner() {
  const b = $('setupBanner'); b.hidden = boardReady();
}
function renderStats() {
  const c = { all: state.rows.length, pending: 0, approved: 0, rejected: 0 };
  state.rows.forEach((r) => { if (c[r.status] !== undefined) c[r.status]++; });
  const items = [
    ['all', 'كل المساهمات', 'الإجمالي', ''],
    ['pending', 'تحت المراجعة', c.pending ? 'محتاجة قرارك' : 'مفيش حاجة مستنية', 'pending'],
    ['approved', 'معتمدة', 'ظاهرة في موقع المساهمين', 'approved'],
    ['rejected', 'مرفوضة', 'مش بتتحسب', 'rejected']
  ];
  $('stats').innerHTML = items.map(([k, l, h, cls]) =>
    `<button type="button" class="stat ${cls} ${state.filter === k && state.tab === 'contrib' ? 'on' : ''}" data-filter="${k}"><span class="l">${l}</span><span class="v num">${c[k]}</span><span class="h">${h}</span></button>`).join('');
  document.title = (c.pending ? `(${c.pending}) ` : '') + 'دُغري | لوحة الإدارة';
}
function renderTabsAndToolbar() {
  $('tabContrib').classList.toggle('on', state.tab === 'contrib');
  $('tabPeople').classList.toggle('on', state.tab === 'people');
  $('tabContribN').textContent = state.rows.length;
  $('tabPeopleN').textContent = getPeople().length;
  const people = state.tab === 'people';
  $('typeFilter').hidden = people; $('sortSel').hidden = people;
  $('layout').classList.toggle('has-detail', !people);
  $('detail').hidden = people;
  $('exportBtn').hidden = people;
}
function typeOptions() {
  return '<option value="all">كل الأنواع</option>' + Object.entries(typeLabels).map(([k, v]) => `<option value="${k}">${escapeHtml(v)}</option>`).join('');
}
function avatarOf(name) { return escapeHtml((name || 'د').trim().charAt(0).toUpperCase()); }

function renderList() {
  const rows = getFiltered();
  const shown = rows.slice(0, state.limit);
  $('moreBtn').hidden = rows.length <= state.limit;
  $('moreBtn').textContent = `عرض المزيد (${rows.length - state.limit})`;
  const allSel = shown.length > 0 && shown.every((r) => state.selected.has(String(r.id)));
  $('listHead').innerHTML = `<label><input type="checkbox" id="selAll" ${allSel ? 'checked' : ''} ${shown.length ? '' : 'disabled'}> تحديد الكل</label><span class="sp"></span><span class="num">${shown.length} من ${rows.length}</span>`;
  if (!rows.length) {
    const filtered = state.q || state.filter !== 'all' || state.type !== 'all';
    $('list').innerHTML = filtered
      ? '<div class="empty"><strong>مفيش نتايج</strong>غيّر البحث أو الفلتر وجرب تاني.</div>'
      : '<div class="empty"><strong>لسه مفيش مساهمات</strong>أول ما حد يبعت مساهمة هتظهر هنا.</div>';
    return;
  }
  $('list').innerHTML = shown.map((r) => {
    const vis = isVisibleOnSite(r);
    return `<div class="row ${idEq(r.id, state.active) ? 'active' : ''}" data-open="${escapeHtml(r.id)}" tabindex="0" role="button">
      <label class="pick"><input type="checkbox" data-sel="${escapeHtml(r.id)}" ${state.selected.has(String(r.id)) ? 'checked' : ''} aria-label="تحديد"></label>
      <div class="av">${avatarOf(r.contributor_name)}</div>
      <div class="row-main"><strong>${escapeHtml(r.contributor_name)}</strong><span>${escapeHtml(typeName(r.type))} · ${escapeHtml(relTime(r.created_at))}</span>${summaryOf(r) ? `<span class="sum">${escapeHtml(summaryOf(r))}</span>` : ''}</div>
      <div class="row-side"><span class="badge ${escapeHtml(r.status)}">${escapeHtml(statusLabels[r.status] || r.status)}</span><span class="vis ${vis ? 'on' : ''}">${ic(vis ? 'eye' : 'eyeoff')}${vis ? 'على اللوحة' : (r.status === 'approved' ? 'مخفية' : 'مش على اللوحة')}</span></div>
    </div>`;
  }).join('');
}

function renderPeople() {
  const people = getPeople();
  $('moreBtn').hidden = true;
  $('listHead').innerHTML = `<span>مرتبين بالنقاط المعتمدة</span><span class="sp"></span><span class="num">${people.length} مساهم</span>`;
  if (!people.length) { $('list').innerHTML = '<div class="empty"><strong>مفيش مساهمين</strong>جرّب تغيّر البحث.</div>'; return; }
  $('list').innerHTML = people.map((p, i) => {
    const vis = p.shown > 0;
    const canToggle = p.approved > 0;
    return `<div class="row" data-person="${escapeHtml(p.key)}" tabindex="0" role="button">
      <div class="rank num">${i + 1}</div>
      <div class="av">${avatarOf(p.name)}</div>
      <div class="row-main"><strong>${escapeHtml(p.name)}</strong><span dir="ltr" style="text-align:right">${escapeHtml(p.phone)}</span>
        <div class="chips"><span class="chip gold num">${p.points} نقطة</span><span class="chip num">${p.total} مساهمة</span><span class="chip num">${p.approved} معتمدة</span>${p.pending ? `<span class="chip num">${p.pending} تحت المراجعة</span>` : ''}</div></div>
      <div class="row-side"><span class="vis ${vis ? 'on' : ''}" style="font-size:13px">${ic(vis ? 'eye' : 'eyeoff')}${vis ? 'ظاهر على اللوحة' : (canToggle ? 'مخفي' : 'مفيش معتمد')}</span>
        ${canToggle ? `<button class="btn" style="height:34px" data-board="${escapeHtml(p.key)}" data-show="${vis ? '0' : '1'}">${vis ? 'إخفاء' : 'إظهار'}</button>` : ''}</div>
    </div>`;
  }).join('');
}

function renderBulk() {
  const n = state.selected.size;
  $('bulkBar').hidden = !n || state.tab !== 'contrib';
  $('bulkCount').textContent = `تم تحديد ${n}`;
}

function visInfo(r) {
  const p = pts(r);
  if (r.status === 'approved' && r.show_on_board === false) return ['mute', 'eyeoff', 'معتمدة بس مخفية من اللوحة', 'مش بتظهر ولا بتتحسب نقاطها في لوحة المساهمين لحد ما تظهرها.'];
  if (r.status === 'approved') return ['ok', 'check', 'ظاهرة في لوحة المساهمين', `المساهم بيظهر باسمه ونقاطه (${p} نقطة من المساهمة دي).`];
  if (r.status === 'pending') return ['warn', 'eyeoff', 'لسه مش على اللوحة', 'هتظهر في لوحة المساهمين أول ما تعتمدها.'];
  return ['bad', 'x', 'مش على اللوحة', 'المساهمة مرفوضة ومش بتتحسب للمساهم.'];
}

function renderDetail() {
  const el = $('detail');
  const r = state.active !== null ? byId(state.active) : null;
  if (!r) {
    el.classList.remove('open'); $('scrim').classList.remove('on');
    el.innerHTML = '<div class="d-empty"><strong>اختار مساهمة من القايمة</strong>هتلاقي هنا كل تفاصيلها وأزرار الاعتماد والرفض.<div class="hint" style="margin-top:10px">اختصارات: ↑ ↓ للتنقل · A اعتماد · R رفض</div></div>';
    return;
  }
  const [vcls, vic, vtitle, vtext] = visInfo(r);
  const list = getFiltered(); const idx = list.findIndex((x) => idEq(x.id, r.id));
  const entries = detailEntries(r);
  const phone = digits(r.phone);
  const id = escapeHtml(r.id);
  let actions;
  if (r.status === 'pending') actions = `<button class="btn ok" data-act="approved">${ic('check')}اعتماد</button><button class="btn bad" data-act="rejected">${ic('x')}رفض</button>`;
  else if (r.status === 'approved') actions = `<button class="btn" data-act="pending">${ic('undo')}رجوع للمراجعة</button><button class="btn bad" data-act="rejected">${ic('x')}رفض</button>`;
  else actions = `<button class="btn ok" data-act="approved">${ic('check')}اعتماد</button><button class="btn" data-act="pending">${ic('undo')}رجوع للمراجعة</button>`;

  el.innerHTML = `<div class="scroll"><div class="pad">
      <div class="d-head"><div class="av">${avatarOf(r.contributor_name)}</div>
        <div class="grow"><h3>${escapeHtml(r.contributor_name)}</h3><p>${escapeHtml(typeName(r.type))}</p></div>
        <span class="badge ${escapeHtml(r.status)}">${escapeHtml(statusLabels[r.status] || r.status)}</span>
        <button class="btn icon sheet-close" data-act="close" aria-label="إغلاق">${ic('x')}</button></div>
      <div class="visbox ${vcls}">${ic(vic)}<div><strong>${vtitle}</strong><span>${vtext}</span></div></div>
      <div class="sec"><h4>لوحة المساهمين</h4>
        <div class="switch-row"><div><strong>إظهار في لوحة المساهمين</strong><div class="hint">${r.status === 'approved' ? 'قفلها لو مش عايز الاسم والنقاط دي تظهر للناس.' : 'متاح بعد اعتماد المساهمة.'}</div></div>
        <button class="switch ${r.status === 'approved' && r.show_on_board !== false ? 'on' : ''}" role="switch" aria-checked="${r.status === 'approved' && r.show_on_board !== false}" data-act="toggleboard" ${r.status === 'approved' ? '' : 'disabled'} aria-label="إظهار في لوحة المساهمين"></button></div></div>
      <div class="sec"><h4>التواصل مع المساهم</h4><div class="contact"><span class="ph" dir="ltr">${escapeHtml(r.phone)}</span>
        ${phone ? `<a class="btn" href="tel:${phone}">${ic('phone')}اتصال</a><a class="btn" href="https://wa.me/${waNumber(r.phone)}" target="_blank" rel="noopener noreferrer">${ic('chat')}واتساب</a>` : ''}</div></div>
      <div class="sec"><h4>تفاصيل المساهمة</h4>${entries.length
        ? `<dl class="fields">${entries.map(([k, v]) => `<div><dt>${escapeHtml(fieldLabels[k] || k)}</dt><dd>${escapeHtml(valueText(v))}</dd></div>`).join('')}</dl>`
        : '<div class="hint">المساهم مبعتش تفاصيل إضافية.</div>'}</div>
      <div class="sec"><h4>النقاط</h4><div class="pts"><input id="ptsInput" type="number" min="0" step="1" inputmode="numeric" value="${pts(r)}" aria-label="النقاط"><button class="btn" data-act="savepts">حفظ النقاط</button></div>
        <div class="hint" style="margin-top:6px">النقاط بتتحسب للمساهم في الموقع بس لما المساهمة تبقى معتمدة.</div></div>
    </div></div>
    <div class="d-actions">${actions}<button class="btn" data-act="edit">${ic('edit')}تعديل</button><button class="btn bad" data-act="delete">${ic('trash')}حذف</button></div>
    <div class="d-foot"><span>وصلت ${escapeHtml(fullDate(r.created_at))}</span><span class="sp"></span>
      <button class="btn icon" data-act="prev" ${idx <= 0 ? 'disabled' : ''} aria-label="السابقة">${ic('up')}</button>
      <button class="btn icon" data-act="next" ${idx < 0 || idx >= list.length - 1 ? 'disabled' : ''} aria-label="التالية">${ic('down')}</button></div>`;
}

/* ============ فتح / إغلاق التفاصيل ============ */
function openRow(id, { sheet = true } = {}) {
  state.active = id;
  renderList(); renderDetail();
  if (sheet && matchMedia('(max-width:999px)').matches) { $('detail').classList.add('open'); $('scrim').classList.add('on'); }
}
function closeSheet() { $('detail').classList.remove('open'); $('scrim').classList.remove('on'); }
function move(delta) {
  const list = getFiltered(); if (!list.length) return;
  const i = list.findIndex((x) => idEq(x.id, state.active));
  const n = list[Math.max(0, Math.min(list.length - 1, i < 0 ? 0 : i + delta))];
  if (n) { state.active = n.id; renderList(); renderDetail(); if (matchMedia('(max-width:999px)').matches) { $('detail').classList.add('open'); $('scrim').classList.add('on'); }
    document.querySelector('.row.active')?.scrollIntoView({ block: 'nearest' }); }
}

/* ============ تغيير الحالة (فوري + تراجع) ============ */
async function setStatus(ids, status, { undoable = true } = {}) {
  const rows = ids.map(byId).filter((r) => r && r.status !== status);
  if (!rows.length) return;
  const prev = rows.map((r) => ({ id: r.id, status: r.status }));
  // حدّد المساهمة اللي هتتفتح بعد كده لو الحالية هتختفي من الفلتر
  const before = getFiltered(); const at = before.findIndex((x) => idEq(x.id, state.active));
  rows.forEach((r) => { r.status = status; });
  state.selected.clear();
  const after = getFiltered();
  if (state.active !== null && !after.some((x) => idEq(x.id, state.active))) {
    const nxt = after[Math.min(Math.max(at, 0), after.length - 1)];
    state.active = nxt ? nxt.id : null;
    if (!nxt) closeSheet();
  }
  render();
  const { data, error } = await sb.from('contributions').update({ status }).in('id', rows.map((r) => r.id)).select('id');
  if (error || !data || data.length !== rows.length) {
    console.error(error);
    prev.forEach((p) => { const r = byId(p.id); if (r) r.status = p.status; });
    render();
    toast(error ? 'فشل تحديث الحالة. اتأكد من النت والصلاحيات.' : 'السيرفر رفض التعديل. راجع صلاحيات Supabase (RLS).', { error: true });
    return;
  }
  const n = rows.length;
  const msg = status === 'approved' ? (n > 1 ? `تم اعتماد ${n} مساهمات` : 'تم اعتماد المساهمة')
            : status === 'rejected' ? (n > 1 ? `تم رفض ${n} مساهمات` : 'تم رفض المساهمة')
            : 'رجعت للمراجعة';
  toast(msg, undoable ? { undo: async () => {
    for (const s of ['pending', 'approved', 'rejected']) {
      const group = prev.filter((p) => p.status === s).map((p) => p.id);
      if (group.length) await setStatus(group, s, { undoable: false });
    }
  } } : {});
}

async function setBoard(ids, show, { undoable = true } = {}) {
  const rows = ids.map(byId).filter((r) => r && (r.show_on_board !== false) !== show);
  if (!rows.length) return;
  const prev = rows.map((r) => ({ id: r.id, v: r.show_on_board }));
  rows.forEach((r) => { r.show_on_board = show; });
  render();
  const { data, error } = await sb.from('contributions').update({ show_on_board: show }).in('id', rows.map((r) => r.id)).select('id');
  if (error || !data || data.length !== rows.length) {
    console.error(error);
    prev.forEach((p) => { const r = byId(p.id); if (r) { if (p.v === undefined) delete r.show_on_board; else r.show_on_board = p.v; } });
    render();
    toast(/show_on_board/.test(error?.message || '') ? 'لازم تشغّل كود SQL الأول (الزرار الأصفر فوق).' : 'فشل التحديث. راجع الاتصال أو صلاحيات Supabase.', { error: true });
    return;
  }
  toast(show ? 'رجعت تظهر في لوحة المساهمين' : 'اتخفت من لوحة المساهمين', undoable ? { undo: () => setBoard(prev.map((p) => p.id), !show, { undoable: false }) } : {});
}

async function savePoints() {
  const r = byId(state.active); if (!r) return;
  const v = Math.max(0, parseInt($('ptsInput').value, 10) || 0);
  const old = r.points;
  const { data, error } = await sb.from('contributions').update({ points: v }).eq('id', r.id).select('id');
  if (error || !data?.length) { console.error(error); toast('فشل حفظ النقاط', { error: true }); return; }
  r.points = v; render(); toast(`تم حفظ النقاط (${v})`, { undo: async () => {
    const res = await sb.from('contributions').update({ points: old ?? 0 }).eq('id', r.id).select('id');
    if (!res.error) { r.points = old; render(); }
  } });
}

async function removeRow(id) {
  const r = byId(id); if (!r) return;
  const ok = await confirmDialog({ title: 'حذف المساهمة؟', message: `هتتحذف مساهمة "${r.contributor_name}" نهائيًا ومش هتقدر ترجعها.`, ok: 'احذف نهائيًا', danger: true });
  if (!ok) return;
  const list = getFiltered(); const at = list.findIndex((x) => idEq(x.id, id));
  const { data, error } = await sb.from('contributions').delete().eq('id', r.id).select('id');
  if (error || !data?.length) { console.error(error); toast(error ? 'فشل حذف المساهمة' : 'السيرفر رفض الحذف. راجع صلاحيات Supabase (RLS).', { error: true }); return; }
  state.rows = state.rows.filter((x) => !idEq(x.id, id)); state.selected.delete(String(id));
  const after = getFiltered(); const nxt = after[Math.min(Math.max(at, 0), after.length - 1)];
  state.active = nxt ? nxt.id : null; if (!nxt) closeSheet();
  render(); toast('تم حذف المساهمة');
}

/* ============ التعديل ============ */
function openEdit(row) {
  state.editingId = row.id;
  $('editType').innerHTML = Object.entries(typeLabels).map(([k, v]) => `<option value="${k}">${escapeHtml(v)}</option>`).join('');
  $('editName').value = row.contributor_name || '';
  $('editPhone').value = row.phone || '';
  $('editType').value = row.type || 'route';
  $('editStatus').value = row.status || 'pending';
  $('editPoints').value = pts(row);
  const entries = Object.entries(row.data || {});
  $('editSub').hidden = !entries.length;
  $('editFields').innerHTML = entries.map(([k, v], i) => {
    const isObj = v !== null && typeof v === 'object';
    const val = isObj ? JSON.stringify(v, null, 2) : String(v ?? '');
    const long = isObj || val.length > 50 || /details|stops|extra/i.test(k);
    const attrs = `id="ef${i}" data-key="${escapeHtml(k)}" data-type="${isObj ? 'json' : typeof v}"`;
    return `<div><label for="ef${i}">${escapeHtml(fieldLabels[k] || k)}</label>${long ? `<textarea ${attrs}${isObj ? ' dir="ltr"' : ''}>${escapeHtml(val)}</textarea>` : `<input ${attrs} value="${escapeHtml(val)}">`}</div>`;
  }).join('');
  $('editBackdrop').classList.add('open'); $('editName').focus();
}
function closeEdit() { state.editingId = null; $('editBackdrop').classList.remove('open'); }

$('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = byId(state.editingId); if (!r) return;
  const data = { ...(r.data || {}) };
  for (const f of $('editFields').querySelectorAll('[data-key]')) {
    const t = f.dataset.type; let v = f.value;
    if (t === 'json') { try { v = JSON.parse(v || 'null'); } catch { toast(`الحقل "${fieldLabels[f.dataset.key] || f.dataset.key}" مش صيغة صحيحة`, { error: true }); f.focus(); return; } }
    else if (t === 'number') v = Number(v) || 0;
    else if (t === 'boolean') v = v === 'true';
    data[f.dataset.key] = v;
  }
  const payload = {
    contributor_name: $('editName').value.trim(), phone: $('editPhone').value.trim(),
    type: $('editType').value, status: $('editStatus').value,
    points: Math.max(0, parseInt($('editPoints').value, 10) || 0), data
  };
  const btn = $('saveEdit'); btn.disabled = true; btn.textContent = 'جاري الحفظ...';
  const { data: res, error } = await sb.from('contributions').update(payload).eq('id', r.id).select('id');
  btn.disabled = false; btn.textContent = 'حفظ التعديلات';
  if (error || !res?.length) { console.error(error); toast(error ? 'فشل حفظ التعديلات' : 'السيرفر رفض التعديل. راجع صلاحيات Supabase (RLS).', { error: true }); return; }
  Object.assign(r, payload); closeEdit(); render(); toast('تم حفظ التعديلات');
});

/* ============ تصدير CSV ============ */
function exportCsv() {
  const rows = getFiltered();
  if (!rows.length) { toast('مفيش بيانات للتصدير', { error: true }); return; }
  const safe = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const head = ['الاسم', 'الموبايل', 'النوع', 'الحالة', 'النقاط', 'ظاهر في الموقع', 'التاريخ', 'التفاصيل'];
  const lines = [head.map(safe).join(',')].concat(rows.map((r) => [
    r.contributor_name, r.phone, typeName(r.type), statusLabels[r.status] || r.status, pts(r),
    isVisibleOnSite(r) ? 'نعم' : 'لا', fullDate(r.created_at),
    detailEntries(r).map(([k, v]) => `${fieldLabels[k] || k}: ${valueText(v)}`).join(' | ')
  ].map(safe).join(',')));
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `dughri-contributions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(`تم تصدير ${rows.length} مساهمة`);
}

/* ============ الأحداث ============ */
$('stats').addEventListener('click', (e) => {
  const b = e.target.closest('[data-filter]'); if (!b) return;
  state.tab = 'contrib'; state.filter = b.dataset.filter; state.limit = PAGE_SIZE;
  state.selected.clear(); render();
});
document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => { state.tab = t.dataset.tab; state.selected.clear(); render(); }));

let searchTimer;
$('searchInput').addEventListener('input', (e) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.q = e.target.value; state.limit = PAGE_SIZE; render(); }, 160); });
$('typeFilter').addEventListener('change', (e) => { state.type = e.target.value; state.limit = PAGE_SIZE; render(); });
$('sortSel').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
$('moreBtn').addEventListener('click', () => { state.limit += PAGE_SIZE; renderList(); });
$('refreshBtn').addEventListener('click', () => load());
$('exportBtn').addEventListener('click', exportCsv);
$('scrim').addEventListener('click', closeSheet);
$('copySql').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(BOARD_SQL); toast('اتنسخ الكود. الصقه في Supabase → SQL Editor واضغط Run'); }
  catch { toast('مقدرتش أنسخ. انسخه يدويًا من README', { error: true }); }
});

$('list').addEventListener('click', (e) => {
  const boardBtn = e.target.closest('[data-board]');
  if (boardBtn) {
    const ids = state.rows.filter((r) => personKey(r) === boardBtn.dataset.board && r.status === 'approved').map((r) => r.id);
    setBoard(ids, boardBtn.dataset.show === '1'); return;
  }
  const person = e.target.closest('[data-person]');
  if (person) {
    const p = getPeople().find((x) => x.key === person.dataset.person);
    state.tab = 'contrib'; state.filter = 'all'; state.type = 'all'; $('typeFilter').value = 'all';
    state.q = p ? (digits(p.phone) || p.name || '') : ''; $('searchInput').value = state.q; state.limit = PAGE_SIZE; render(); return;
  }
  const sel = e.target.closest('[data-sel]');
  if (sel) { const k = String(sel.dataset.sel); sel.checked ? state.selected.add(k) : state.selected.delete(k); renderBulk(); renderList(); return; }
  if (e.target.closest('.pick')) return;
  const row = e.target.closest('[data-open]'); if (row) openRow(byId(row.dataset.open)?.id ?? row.dataset.open);
});
$('list').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.target.matches('input')) return;
  e.target.closest('[data-open],[data-person]')?.click();
});
$('listHead').addEventListener('change', (e) => {
  if (e.target.id !== 'selAll') return;
  const shown = getFiltered().slice(0, state.limit);
  shown.forEach((r) => e.target.checked ? state.selected.add(String(r.id)) : state.selected.delete(String(r.id)));
  renderList(); renderBulk();
});
$('bulkBar').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-bulk]'); if (!b) return;
  if (b.dataset.bulk === 'show' || b.dataset.bulk === 'hide') {
    const ids = [...state.selected].map((s) => byId(s)).filter((r) => r && r.status === 'approved').map((r) => r.id);
    if (!ids.length) { toast('اختار مساهمات معتمدة الأول', { error: true }); return; }
    setBoard(ids, b.dataset.bulk === 'show'); return;
  }
  if (b.dataset.bulk === 'clear') { state.selected.clear(); renderList(); renderBulk(); return; }
  const ids = [...state.selected].map((s) => byId(s)?.id).filter((x) => x !== undefined);
  if (ids.length > 1 && b.dataset.bulk === 'rejected') {
    if (!await confirmDialog({ title: `رفض ${ids.length} مساهمات؟`, message: 'هيتم رفض كل المساهمات المحددة. تقدر تتراجع بعدها مباشرة.', ok: 'ارفض', danger: true })) return;
  }
  setStatus(ids, b.dataset.bulk);
});

$('detail').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const r = byId(state.active); const act = b.dataset.act;
  if (act === 'close') return closeSheet();
  if (act === 'prev') return move(-1);
  if (act === 'next') return move(1);
  if (!r) return;
  if (act === 'edit') return openEdit(r);
  if (act === 'delete') return removeRow(r.id);
  if (act === 'savepts') return savePoints();
  if (act === 'toggleboard') return setBoard([r.id], r.show_on_board === false);
  setStatus([r.id], act);
});

$('editClose').addEventListener('click', closeEdit);
$('cancelEdit').addEventListener('click', closeEdit);
$('editBackdrop').addEventListener('click', (e) => { if (e.target === $('editBackdrop')) closeEdit(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.dialogCancel) return state.dialogCancel();
    if ($('editBackdrop').classList.contains('open')) return closeEdit();
    return closeSheet();
  }
  if ($('app').hidden || $('editBackdrop').classList.contains('open') || $('dialogBackdrop').classList.contains('open')) return;
  if (e.target.matches('input,textarea,select') || e.ctrlKey || e.metaKey || e.altKey || state.tab !== 'contrib') return;
  const r = byId(state.active);
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
  else if (r && (e.key === 'a' || e.key === 'A' || e.key === 'ش')) setStatus([r.id], 'approved');
  else if (r && (e.key === 'r' || e.key === 'R' || e.key === 'ق')) setStatus([r.id], 'rejected');
});

/* ============ الدخول والخروج ============ */
let appShown = false, pollTimer = null, channel = null;
function showApp() {
  if (appShown) return; appShown = true;
  $('loginScreen').classList.add('hidden'); $('app').hidden = false; $('splash').hidden = true;
  load();
  clearInterval(pollTimer);
  pollTimer = setInterval(() => { if (!document.hidden) load({ silent: true }); }, AUTO_REFRESH_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && appShown) load({ silent: true }); });
  try {
    channel = sb.channel('contributions-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, () => { clearTimeout(showApp.t); showApp.t = setTimeout(() => load({ silent: true }), 400); })
      .subscribe();
  } catch (err) { console.warn('realtime unavailable', err); }
}
function showLogin() {
  appShown = false; clearInterval(pollTimer);
  if (channel) { try { sb.removeChannel(channel); } catch {} channel = null; }
  state.rows = []; state.loaded = false; state.active = null; state.selected.clear();
  $('app').hidden = true; $('splash').hidden = true; $('loginScreen').classList.remove('hidden');
}

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('loginErr'); err.hidden = true;
  const email = $('email').value.trim(), password = $('password').value;
  if (!email || !password) { err.textContent = 'اكتب البريد وكلمة المرور.'; err.hidden = false; return; }
  const btn = $('loginBtn'); btn.disabled = true; btn.textContent = 'جاري الدخول...';
  const { error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled = false; btn.textContent = 'دخول';
  if (error) {
    console.error(error);
    err.textContent = /network|fetch/i.test(error.message) ? 'مفيش اتصال بالنت. جرّب تاني.' : 'البريد أو كلمة المرور غير صحيحة.';
    err.hidden = false; return;
  }
  $('password').value = '';
});
$('logoutBtn').addEventListener('click', async () => {
  if (!await confirmDialog({ title: 'تسجيل الخروج؟', message: 'هتحتاج تسجل دخولك تاني عشان ترجع للوحة.', ok: 'خروج' })) return;
  await sb.auth.signOut();
});
let pwVisible = false;
$('pwToggle').innerHTML = ic('eye');
$('pwToggle').addEventListener('click', () => {
  pwVisible = !pwVisible; $('password').type = pwVisible ? 'text' : 'password'; $('pwToggle').innerHTML = ic(pwVisible ? 'eyeoff' : 'eye');
});

/* ============ تشغيل ============ */
$('refreshBtn').innerHTML = ic('refresh');
$('exportIc').innerHTML = ic('download');
$('logoutIc').innerHTML = ic('logout');
$('searchIc').innerHTML = ic('search');
$('editClose').innerHTML = ic('x');
$('typeFilter').innerHTML = typeOptions();
renderDetail();

sb.auth.onAuthStateChange((_event, session) => { if (session) showApp(); else showLogin(); });
(async () => {
  try { const { data } = await sb.auth.getSession(); if (data.session) showApp(); else showLogin(); }
  catch (err) { console.error(err); showLogin(); }
})();
