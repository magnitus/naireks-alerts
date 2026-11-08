/* Naireks 8-bit alerts: shared JS.
   Paste this file, unchanged, into the JS tab of every StreamElements alert.
   The alert's HTML tab only sets data-type (follow / sub / gift / tip / bits / raid). */
(function () {
  'use strict';

  var COLORS = { follow: '#5ee1ff', sub: '#a970ff', gift: '#ff6ad5', tip: '#3ddc97', bits: '#ffb547', raid: '#ff4d6d' };

  var TEXT = {
    follow: { tab: 'NEW PLAYER!', hud: 'BONUS' },
    sub:    { tab: 'LEVEL UP!',   hud: 'LEVEL' },
    gift:   { tab: 'ITEM DROP!',  hud: 'ITEMS' },
    tip:    { tab: 'COIN GET!',   hud: 'COINS' },
    bits:   { tab: 'POWER UP!',   hud: 'POWER' },
    raid:   { tab: 'RAID INCOMING!', hud: 'PARTY' },
  };

  // 16x16 pixel sprites. o = outline, c = type color, l = light, d = dark, w = white, . = empty
  var SPRITES = {
    follow: [ // heart
      '................',
      '..oooo....oooo..',
      '.occcco..occcco.',
      'ocwwcccoocccccdo',
      'ocwccccccccccddo',
      'occcccccccccccdo',
      'occcccccccccccdo',
      '.occcccccccccdo.',
      '..occcccccccdo..',
      '...occcccccdo...',
      '....occcccdo....',
      '.....occcdo.....',
      '......ocdo......',
      '.......oo.......',
      '................',
      '................',
    ],
    sub: [ // star
      '.......oo.......',
      '......owco......',
      '......occo......',
      '.....owccco.....',
      'ooooooowcccoooo.',
      'olwwwwwccccccdo.',
      '.olccccccccccdo.',
      '..olccccccccdo..',
      '...occcccccdo...',
      '...occcccccco...',
      '..occccoocccdo..',
      '..occdo..odcdo..',
      '.occoo....ooddo.',
      '.ooo........ooo.',
      '................',
      '................',
    ],
    gift: [ // present
      '................',
      '...ooo....ooo...',
      '..olllo..olllo..',
      '...oolloolloo...',
      '.oooooolloooooo.',
      '.owccccllccccdo.',
      '.oooooolloooooo.',
      '..owcccllcccdo..',
      '..occccllccccdo.',
      '..occccllccccdo.',
      '..occccllccccdo.',
      '..odddcllcddddo.',
      '..oooooooooooo..',
      '................',
      '................',
      '................',
    ],
    tip: [ // coin
      '................',
      '.....oooooo.....',
      '...ooccccccoo...',
      '..occwwccccdco..',
      '.occwccllccccdo.',
      '.ocwccclldcccdo.',
      '.ocwccclldcccdo.',
      '.ocwccclldcccdo.',
      '.ocwccclldcccdo.',
      '.ocwccclldcccdo.',
      '.occccclldcccdo.',
      '..occccccccddo..',
      '...ooddddddoo...',
      '.....oooooo.....',
      '................',
      '................',
    ],
    bits: [ // gem
      '................',
      '................',
      '....oooooooo....',
      '...owwlcclcco...',
      '..owwlccclccco..',
      '.oooooooooooooo.',
      '.owlcccclccccdo.',
      '..olcccclcccdo..',
      '...occcclccdo...',
      '....occclcdo....',
      '.....occcdo.....',
      '......ocdo......',
      '.......oo.......',
      '................',
      '................',
      '................',
    ],
    raid: [ // lightning bolt
      '..........ooooo.',
      '.........owwco..',
      '........owcco...',
      '.......owcco....',
      '......owcco.....',
      '.....owccooooo..',
      '....owcccccco...',
      '...oooooccco....',
      '.......occo.....',
      '......occo......',
      '.....occo.......',
      '....ocdo........',
      '...ocdo.........',
      '..odo...........',
      '..oo............',
      '................',
    ],
  };
  var SPARKLE = ['..w..', '..l..', 'wlclw', '..l..', '..w..'];

  function spriteSVG(rows) {
    var w = 0, out = '';
    for (var y = 0; y < rows.length; y++) {
      var r = rows[y], x = 0;
      if (r.length > w) w = r.length;
      while (x < r.length) {
        var ch = r[x];
        if (!/[ocldw]/.test(ch)) { x++; continue; }
        var s = x;
        while (x < r.length && r[x] === ch) x++;
        out += '<rect x="' + s + '" y="' + y + '" width="' + (x - s) + '" height="1" class="na-px-' + ch + '"/>';
      }
    }
    return '<svg viewBox="0 0 ' + w + ' ' + rows.length + '" shape-rendering="crispEdges" aria-hidden="true">' + out + '</svg>';
  }

  var LOGO = '<svg class="na-logo" viewBox="0 0 100 100" aria-hidden="true">' +
    '<polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="#1f5fd6" stroke="#050814" stroke-width="6"/>' +
    '<polygon points="32,14 68,14 86,32 86,68 68,86 32,86 14,68 14,32" fill="none" stroke="#fff" stroke-width="7"/>' +
    '<path d="M31 72 V28 H41 L59 55 V28 H69 V72 H59 L41 45 V72 Z" fill="#fff"/></svg>';

  // ---------- helpers ----------
  function rgb(hex) {
    hex = String(hex || '').replace('#', '');
    if (hex.length === 3) hex = hex.replace(/./g, '$&$&');
    var n = parseInt(hex, 16);
    return isNaN(n) ? [94, 225, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }).join(',') + ')';
  }
  // A placeholder SE didn't fill in ("{{sender}}") counts as empty
  function clean(s) {
    s = String(s == null ? '' : s).trim();
    return /\{\{\s*\w+\s*\}\}/.test(s) ? '' : s;
  }
  function num(s) { var n = parseFloat(String(s).replace(',', '.')); return isNaN(n) ? 0 : n; }
  function fmtInt(n) { return Math.round(n).toLocaleString('en-US'); }
  function money(amount, cur) {
    cur = (cur || '$').trim();
    var n = num(amount);
    if (/^[A-Za-z]{3}$/.test(cur)) {
      try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur.toUpperCase() }).format(n); } catch (e) {}
    }
    var val = n % 1 ? n.toFixed(2) : String(n);
    // word-like symbols go after the number, the way they're written ("50 kr"); "$" / "€" / "£" go before
    return /^[A-Za-z.]+$/.test(cur) ? val + ' ' + cur : cur + val;
  }
  function stripCheers(s) { return s.replace(/(^|\s)[A-Za-z]+\d+(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim(); }
  function make(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /** What each alert says. d = { type, name, amount, message, sender, currency } */
  function describe(d) {
    var n = num(d.amount), name = d.name || 'Someone';
    switch (d.type) {
      case 'sub':
        return { name: name, line: n > 1 ? 'resubscribed for ' + fmtInt(n) + ' months!' : 'just subscribed!', score: String(Math.max(1, Math.round(n))) };
      case 'gift':
        if (d.sender && d.sender.toLowerCase() !== name.toLowerCase())
          return { name: d.sender, line: 'gifted a sub to ' + name + '!', score: 'x1' };
        n = Math.max(1, Math.round(n));
        return { name: name, line: n > 1 ? 'gifted ' + fmtInt(n) + ' subs to the party!' : 'gifted a sub!', score: 'x' + fmtInt(n) };
      case 'tip':
        return { name: name, line: 'tipped ' + money(d.amount, d.currency) + '!', score: money(d.amount, d.currency) };
      case 'bits':
        return { name: name, line: 'cheered ' + fmtInt(n) + ' bits!', score: fmtInt(n) };
      case 'raid':
        return { name: name, line: 'is raiding with ' + fmtInt(n) + ' players!', score: 'x' + fmtInt(n) };
      default:
        return { name: name, line: 'joined the party!', score: '+1UP' };
    }
  }

  function burst(host, count, colors) {
    for (var i = 0; i < count; i++) {
      var p = make('i');
      var a = Math.random() * Math.PI * 2, r = 90 + Math.random() * 170;
      var s = [4, 8, 8, 12][Math.floor(Math.random() * 4)];
      p.style.cssText = '--dx:' + Math.round(Math.cos(a) * r / 4) * 4 + 'px;--dy:' + Math.round(Math.sin(a) * r * 0.75 / 4) * 4 +
        'px;--s:' + s + 'px;--pc:' + colors[i % colors.length] + ';--dl:' + (0.3 + Math.random() * 0.25).toFixed(2) + 's';
      host.appendChild(p);
    }
  }

  /**
   * Render one alert into `host`. Returns the alert element.
   * opts.duration = total ms on screen (match the SE alert duration, minus ~300ms)
   */
  function play(host, data, opts) {
    opts = opts || {};
    var type = SPRITES[data.type] ? data.type : 'follow';
    var dur = Math.max(3000, opts.duration || 7000);
    var d = describe({
      type: type, name: clean(data.name), amount: clean(data.amount), sender: clean(data.sender),
      message: clean(data.message), currency: clean(data.currency),
    });
    // variation overrides: custom line text with {name} {amount} {sender}
    var amt = clean(data.amount);
    var amtText = type === 'tip' ? money(amt, clean(data.currency)) : fmtInt(num(amt));
    var lineTpl = clean(data.line);
    if (lineTpl) {
      d.line = lineTpl.replace(/\{name\}/g, clean(data.name) || 'Someone')
        .replace(/\{amount\}/g, amtText).replace(/\{sender\}/g, clean(data.sender) || 'Someone');
    }
    var tabText = clean(data.tab) || TEXT[type].tab;
    var hype = Math.max(1, Math.min(3, parseInt(data.hype, 10) || 1));
    var msg = clean(data.message);
    if (type === 'bits') msg = stripCheers(msg);
    if (type === 'follow' || type === 'raid') msg = '';

    var c = rgb(data.color || COLORS[type]);
    // classes for custom CSS: .na-t-<type>, .na-hype-<1-3>, .na-v-<variation name> (none on the default alert)
    var vname = clean(data.variation).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var alert = make('div', 'na-alert na-t-' + type + ' na-hype-' + hype + (vname ? ' na-v-' + vname : ''));
    alert.style.cssText = '--c:' + mix(c, c, 0) + ';--cl:' + mix(c, [255, 255, 255], 0.5) + ';--cd:' + mix(c, [0, 0, 0], 0.45) +
      ';--glow:rgba(' + c.join(',') + ',.55);--dur:' + dur + 'ms';

    // header tab
    var spark = spriteSVG(SPARKLE);
    var tab = make('div', 'na-tabwrap na-notch', '<div class="na-tab na-notch">' + LOGO + '<span></span><i class="na-spark">' + spark + '</i></div>');
    tab.querySelector('span').textContent = tabText;

    // box
    var box = make('div', 'na-box na-notch');
    var emote = clean(data.emote);
    if (emote) {
      // streamer emote as the "character", pixel icon as a badge
      var spr = make('div', 'na-sprite has-emote', '<img class="na-emote" alt=""><div class="na-badge">' + spriteSVG(SPRITES[type]) + '</div>');
      spr.querySelector('img').src = emote;
      box.appendChild(spr);
    } else {
      box.appendChild(make('div', 'na-sprite', spriteSVG(SPRITES[type])));
    }

    var text = make('div', 'na-text');
    var nameEl = make('div', 'na-name');
    var nm = d.name.slice(0, 25);
    // long names shrink relative to the (customizable) name size
    nameEl.style.fontSize = nm.length > 18 ? 'calc(var(--na-name-size, 46px) * .65)' : nm.length > 13 ? 'calc(var(--na-name-size, 46px) * .78)' : '';
    for (var i = 0; i < nm.length; i++) {
      var ch = make('span');
      ch.textContent = nm[i] === ' ' ? ' ' : nm[i];
      ch.style.animationDelay = (0.45 + i * 0.035).toFixed(3) + 's';
      nameEl.appendChild(ch);
    }
    var line = make('div', 'na-line'); line.textContent = d.line;
    text.appendChild(nameEl); text.appendChild(line);
    var msgEl = null;
    var tts = data.tts === true || data.tts === 'true' || data.tts === '1' || data.tts === 1;
    if (msg) {
      var msgRow = make('div', 'na-msgrow');
      if (tts) msgRow.appendChild(make('div', 'na-tts', spriteSVG(['..c.....', '.cc..c..', 'ccc...c.', 'ccc.c.c.', 'ccc...c.', '.cc..c..', '..c.....'])));
      msgEl = make('div', 'na-msg');
      msgRow.appendChild(msgEl);
      text.appendChild(msgRow);
    }
    box.appendChild(text);

    var score = make('div', 'na-score', '<small></small><b></b>');
    score.querySelector('small').textContent = TEXT[type].hud;
    score.querySelector('b').textContent = d.score;
    box.appendChild(score);
    box.appendChild(make('div', 'na-bar', '<i></i>'));
    box.appendChild(make('div', 'na-cursor', spriteSVG(['ooooo', '.ooo.', '..o..'])));

    var frame = make('div', 'na-frame na-notch'); frame.appendChild(box);
    var shell = make('div', 'na-shell na-notch'); shell.appendChild(frame);

    var fx = make('div', 'na-burst');
    burst(fx, (type === 'raid' ? 34 : type === 'follow' ? 16 : 24) * hype,
      hype === 3 ? ['var(--c)', '#ff4d6d', '#ffb547', '#3ddc97', '#5ee1ff', '#a970ff', '#fff'] : ['var(--c)', 'var(--cl)', '#fff', 'var(--c)']);
    if (hype > 1) { // second wave of confetti
      var fx2 = make('div', 'na-burst na-burst2');
      burst(fx2, 12 * hype, ['#fff', 'var(--cl)', 'var(--c)']);
      alert.appendChild(fx2);
    }

    // rave lights: laser beams + disco sparkles behind the box, pulsing at 128 BPM
    var rave = data.rave === true || data.rave === 'true' || data.rave === '1' || data.rave === 1;
    if (rave) {
      alert.classList.add('na-rave');
      var NEON = ['#ff2bd6', '#00f0ff', '#7dff3a', '#ffe14a', '#9b5cff', '#ff4d6d'];
      var lights = make('div', 'na-lights');
      for (var b = 0; b < 10; b++) {
        var beam = make('i', 'na-beam');
        beam.style.cssText = '--r:' + (b * 36 + 18) + 'deg;--bc:' + NEON[b % NEON.length] + ';animation-delay:' + (-b * 0.37).toFixed(2) + 's,' + (b % 4) * 0.117 + 's';
        lights.appendChild(beam);
      }
      for (var s = 0; s < 28; s++) {
        var dot = make('b', 'na-disco');
        var sz = [4, 4, 8][s % 3];
        dot.style.cssText = 'left:' + Math.round((Math.random() * 1.3 - 0.15) * 190) * 4 + 'px;top:' + Math.round((Math.random() * 1.6 - 0.3) * 50) * 4 +
          'px;width:' + sz + 'px;height:' + sz + 'px;background:' + NEON[s % NEON.length] + ';color:' + NEON[s % NEON.length] + ';animation-delay:' + (Math.random() * 0.94).toFixed(2) + 's';
        lights.appendChild(dot);
      }
      alert.appendChild(lights);
    }

    alert.appendChild(tab); alert.appendChild(shell); alert.appendChild(fx);
    host.appendChild(alert);

    // RPG-style typewriter for the viewer's message
    var timers = [];
    if (msgEl) {
      var full = msg.slice(0, 140), k = 0;
      msgEl.classList.add('typing');
      var start = 1100 + nm.length * 35;
      var step = Math.max(14, Math.min(40, (dur - start - 1800) / Math.max(1, full.length)));
      var tick = function () {
        k++;
        msgEl.textContent = full.slice(0, k);
        if (k < full.length) timers.push(setTimeout(tick, step));
        else msgEl.classList.remove('typing');
      };
      timers.push(setTimeout(tick, start));
    }
    timers.push(setTimeout(function () { alert.classList.add('na-out'); }, dur - 550));
    alert._naStop = function () { timers.forEach(clearTimeout); };
    return alert;
  }

  // ---------- StreamElements AlertBox: auto-run from the HTML tab ----------
  // Replays: SE's Replay / the dock's Replay / Emulate re-send the event as a normal alert.
  // Nothing here remembers past events, so an identical replay plays in full again.
  // An alert is skipped only while one is still on screen in that same box, and only for the same data.
  function signature(root) {
    return Array.prototype.map.call(root.querySelectorAll('.na-src'), function (n) { return n.textContent; }).join('\u0001');
  }
  // On-screen diagnostics: the HTML tab carries a .na-diag box that says "JS didn't run".
  // Once the alert plays it's removed; if something is wrong it says what instead.
  function diag(root, msg) {
    var d = root.querySelector('.na-diag');
    if (!d) return;
    if (msg == null) { d.parentNode.removeChild(d); return; }
    var text = 'NAIREKS ALERT: ' + msg;
    if (d.textContent !== text) d.textContent = text; // only on change: the page watcher would otherwise loop
    d.style.animation = 'none'; d.style.visibility = 'visible';
  }
  function auto() {
    var roots = document.querySelectorAll('.na-root');
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      try { runRoot(root); } catch (err) { diag(root, 'error in the JS tab: ' + (err && err.message || err)); }
    }
  }
  function runRoot(root) {
    var sig = signature(root);
    var running = root.querySelector('.na-alert:not(.na-out)');
    if (running && root._naSig === sig) return;
    root._naSig = sig;
    // the type and the event data are also in class names, in case data-* attributes get stripped
    var cls = root.className.match(/\bna-type-(\w+)/);
    var type = root.getAttribute('data-type') || (cls && cls[1]);
    if (!type) { diag(root, 'the HTML tab has no alert type. Paste the full HTML for this alert again.'); return; }
    var attr = function (k) { return root.getAttribute('data-' + k) || ''; };
    var get = function (k) { var n = root.querySelector('[data-k="' + k + '"]') || root.querySelector('.na-k-' + k); return n ? n.textContent : ''; };
    var probe = root.querySelector('.na-src');
    if (probe && window.getComputedStyle && getComputedStyle(probe).display !== 'none') {
      // the CSS may still be loading (CDN @import): wait up to 4s before calling it missing
      root._naWait = (root._naWait || 0) + 1;
      if (root._naWait <= 40) { root._naSig = null; setTimeout(auto, 100); return; }
      diag(root, 'the CSS tab is missing or incomplete. Paste the CSS file for this alert into the CSS tab.');
      return;
    }
    root._naWait = 0;
    var old = root.querySelectorAll('.na-alert');
    for (var j = 0; j < old.length; j++) { if (old[j]._naStop) old[j]._naStop(); old[j].parentNode.removeChild(old[j]); }
    var data = {
      type: type,
      name: get('name'), amount: get('amount'), message: get('message'), sender: get('sender'),
      currency: attr('currency') || '$', color: attr('color'), emote: attr('emote'), tab: attr('tab'), line: attr('line'),
      hype: attr('hype') || 1, rave: attr('rave'), tts: attr('tts'), variation: attr('variation'),
    };
    // Auto tiers: the default HTML carries every variation from config.js (base64 JSON, so SE's {placeholders}
    // can't touch it) and picks one by amount. The same HTML then works in any SE variation of this alert.
    var packed = attr('variations');
    if (packed && !data.variation) {
      var pack = JSON.parse(decodeURIComponent(escape(atob(packed))));
      var v = pick(pack.v, data.amount);
      if (v) {
        ['tab', 'line', 'color', 'hype', 'rave', 'tts'].forEach(function (k) { if (v[k] != null) data[k] = v[k]; });
        if (v.emote && pack.e[v.emote]) data.emote = pack.e[v.emote];
        data.variation = v.name || '';
      }
    }
    play(root, data, { duration: parseInt(attr('duration'), 10) || 7000 });
    diag(root, null);
  }

  /** Which variation an amount triggers: an exact match wins, otherwise the highest startingAt. null = default */
  function pick(variations, amount) {
    var n = num(amount), best = null;
    (variations || []).forEach(function (v) {
      if (v.exact != null && num(v.exact) === n) best = { v: v, exact: true };
    });
    if (best) return best.v;
    (variations || []).forEach(function (v) {
      var s = v.startingAt != null ? v.startingAt : v.from;
      if (s != null && v.exact == null && n >= num(s) && (!best || num(s) > num(best.startingAt != null ? best.startingAt : best.from))) best = v;
    });
    return best;
  }

  window.NairAlert = { play: play, describe: describe, pick: pick, COLORS: COLORS, TEXT: TEXT };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto);
  else auto();

  // If SE reuses the page between alerts (re-inserting or refilling the HTML), pick that up too.
  if (!window.__naWatch && window.MutationObserver) {
    var queued = false;
    window.__naWatch = new MutationObserver(function (muts) {
      for (var m = 0; m < muts.length; m++) {
        var t = muts[m].target;
        var el = t.nodeType === 1 ? t : t.parentNode;
        // ignore our own animation DOM
        if (el && el.closest && el.closest('.na-alert')) continue;
        if (!queued) { queued = true; setTimeout(function () { queued = false; auto(); }, 0); }
        return;
      }
    });
    window.__naWatch.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }
})();
