// node_modules/marked/lib/marked.esm.js
function M() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var T = M();
function G(u) {
  T = u;
}
var _ = { exec: () => null };
function k(u, e = "") {
  let t = typeof u == "string" ? u : u.source, n = { replace: (r, i) => {
    let s = typeof i == "string" ? i : i.source;
    return s = s.replace(m.caret, "$1"), t = t.replace(r, s), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var be = (() => {
  try {
    return !!new RegExp("(?<=1)(?<!1)");
  } catch {
    return false;
  }
})();
var m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (u) => new RegExp(`^( {0,3}${u})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), hrRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), fencesBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}(?:\`\`\`|~~~)`), headingBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}#`), htmlBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}<(?:[a-z].*>|!--)`, "i"), blockquoteBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}>`) };
var Re = /^(?:[ \t]*(?:\n|$))+/;
var Te = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var Oe = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var C = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var we = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var Q = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
var se = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var ie = k(se).replace(/bull/g, Q).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var ye = k(se).replace(/bull/g, Q).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var j = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var Pe = /^[^\n]+/;
var F = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
var Se = k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", F).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var $e = k(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Q).getRegex();
var v = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var U = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var _e = k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))", "i").replace("comment", U).replace("tag", v).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var oe = k(j).replace("hr", C).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex();
var Le = k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", oe).getRegex();
var K = { blockquote: Le, code: Te, def: Se, fences: Oe, heading: we, hr: C, html: _e, lheading: ie, list: $e, newline: Re, paragraph: oe, table: _, text: Pe };
var ne = k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", C).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}\t)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex();
var Me = { ...K, lheading: ye, table: ne, paragraph: k(j).replace("hr", C).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", ne).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex() };
var ze = { ...K, html: k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", U).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: _, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: k(j).replace("hr", C).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ie).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Ee = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var Ie = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var ae = /^( {2,}|\\)\n(?!\s*$)/;
var Ae = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var z = /[\p{P}\p{S}]/u;
var H = /[\s\p{P}\p{S}]/u;
var W = /[^\s\p{P}\p{S}]/u;
var Ce = k(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, H).getRegex();
var le = /(?!~)[\p{P}\p{S}]/u;
var Be = /(?!~)[\s\p{P}\p{S}]/u;
var De = /(?:[^\s\p{P}\p{S}]|~)/u;
var qe = k(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", be ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var ue = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
var ve = k(ue, "u").replace(/punct/g, z).getRegex();
var He = k(ue, "u").replace(/punct/g, le).getRegex();
var pe = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var Ze = k(pe, "gu").replace(/notPunctSpace/g, W).replace(/punctSpace/g, H).replace(/punct/g, z).getRegex();
var Ge = k(pe, "gu").replace(/notPunctSpace/g, De).replace(/punctSpace/g, Be).replace(/punct/g, le).getRegex();
var Ne = k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, W).replace(/punctSpace/g, H).replace(/punct/g, z).getRegex();
var Qe = k(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, z).getRegex();
var je = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)";
var Fe = k(je, "gu").replace(/notPunctSpace/g, W).replace(/punctSpace/g, H).replace(/punct/g, z).getRegex();
var Ue = k(/\\(punct)/, "gu").replace(/punct/g, z).getRegex();
var Ke = k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var We = k(U).replace("(?:-->|$)", "-->").getRegex();
var Xe = k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", We).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var q = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/;
var Je = k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", q).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var ce = k(/^!?\[(label)\]\[(ref)\]/).replace("label", q).replace("ref", F).getRegex();
var he = k(/^!?\[(ref)\](?:\[\])?/).replace("ref", F).getRegex();
var Ve = k("reflink|nolink(?!\\()", "g").replace("reflink", ce).replace("nolink", he).getRegex();
var re = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var X = { _backpedal: _, anyPunctuation: Ue, autolink: Ke, blockSkip: qe, br: ae, code: Ie, del: _, delLDelim: _, delRDelim: _, emStrongLDelim: ve, emStrongRDelimAst: Ze, emStrongRDelimUnd: Ne, escape: Ee, link: Je, nolink: he, punctuation: Ce, reflink: ce, reflinkSearch: Ve, tag: Xe, text: Ae, url: _ };
var Ye = { ...X, link: k(/^!?\[(label)\]\((.*?)\)/).replace("label", q).getRegex(), reflink: k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", q).getRegex() };
var N = { ...X, emStrongRDelimAst: Ge, emStrongLDelim: He, delLDelim: Qe, delRDelim: Fe, url: k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", re).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: k(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", re).getRegex() };
var et = { ...N, br: k(ae).replace("{2,}", "*").getRegex(), text: k(N.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var B = { normal: K, gfm: Me, pedantic: ze };
var E = { normal: X, gfm: N, breaks: et, pedantic: Ye };
var tt = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var ke = (u) => tt[u];
function O(u, e) {
  if (e) {
    if (m.escapeTest.test(u))
      return u.replace(m.escapeReplace, ke);
  } else if (m.escapeTestNoEncode.test(u))
    return u.replace(m.escapeReplaceNoEncode, ke);
  return u;
}
function J(u) {
  try {
    u = encodeURI(u).replace(m.percentDecode, "%");
  } catch {
    return null;
  }
  return u;
}
function V(u, e) {
  let t = u.replace(m.findPipe, (i, s, a) => {
    let o = false, l = s;
    for (;--l >= 0 && a[l] === "\\"; )
      o = !o;
    return o ? "|" : " |";
  }), n = t.split(m.splitPipe), r = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e)
    if (n.length > e)
      n.splice(e);
    else
      for (;n.length < e; )
        n.push("");
  for (;r < n.length; r++)
    n[r] = n[r].trim().replace(m.slashPipe, "|");
  return n;
}
function I(u, e, t) {
  let n = u.length;
  if (n === 0)
    return "";
  let r = 0;
  for (;r < n; ) {
    let i = u.charAt(n - r - 1);
    if (i === e && !t)
      r++;
    else if (i !== e && t)
      r++;
    else
      break;
  }
  return u.slice(0, n - r);
}
function de(u, e) {
  if (u.indexOf(e[1]) === -1)
    return -1;
  let t = 0;
  for (let n = 0;n < u.length; n++)
    if (u[n] === "\\")
      n++;
    else if (u[n] === e[0])
      t++;
    else if (u[n] === e[1] && (t--, t < 0))
      return n;
  return t > 0 ? -2 : -1;
}
function ge(u, e = 0) {
  let t = e, n = "";
  for (let r of u)
    if (r === "\t") {
      let i = 4 - t % 4;
      n += " ".repeat(i), t += i;
    } else
      n += r, t++;
  return n;
}
function fe(u, e, t, n, r) {
  let i = e.href, s = e.title || null, a = u[1].replace(r.other.outputLinkReplace, "$1");
  n.state.inLink = true;
  let o = { type: u[0].charAt(0) === "!" ? "image" : "link", raw: t, href: i, title: s, text: a, tokens: n.inlineTokens(a) };
  return n.state.inLink = false, o;
}
function nt(u, e, t) {
  let n = u.match(t.other.indentCodeCompensation);
  if (n === null)
    return e;
  let r = n[1];
  return e.split(`
`).map((i) => {
    let s = i.match(t.other.beginningSpace);
    if (s === null)
      return i;
    let [a] = s;
    return a.length >= r.length ? i.slice(r.length) : i;
  }).join(`
`);
}
var w = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0)
      return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = t[0].replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: t[0], codeBlockStyle: "indented", text: this.options.pedantic ? n : I(n, `
`) };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], r = nt(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: r };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let r = I(n, "#");
        (this.options.pedantic || !r || this.rules.other.endingSpaceChar.test(r)) && (n = r.trim());
      }
      return { type: "heading", raw: t[0], depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t)
      return { type: "hr", raw: I(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = I(t[0], `
`).split(`
`), r = "", i = "", s = [];
      for (;n.length > 0; ) {
        let a = false, o = [], l;
        for (l = 0;l < n.length; l++)
          if (this.rules.other.blockquoteStart.test(n[l]))
            o.push(n[l]), a = true;
          else if (!a)
            o.push(n[l]);
          else
            break;
        n = n.slice(l);
        let p = o.join(`
`), c = p.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        r = r ? `${r}
${p}` : p, i = i ? `${i}
${c}` : c;
        let d = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(c, s, true), this.lexer.state.top = d, n.length === 0)
          break;
        let h = s.at(-1);
        if (h?.type === "code")
          break;
        if (h?.type === "blockquote") {
          let R = h, f = R.raw + `
` + n.join(`
`), S = this.blockquote(f);
          s[s.length - 1] = S, r = r.substring(0, r.length - R.raw.length) + S.raw, i = i.substring(0, i.length - R.text.length) + S.text;
          break;
        } else if (h?.type === "list") {
          let R = h, f = R.raw + `
` + n.join(`
`), S = this.list(f);
          s[s.length - 1] = S, r = r.substring(0, r.length - h.raw.length) + S.raw, i = i.substring(0, i.length - R.raw.length) + S.raw, n = f.substring(s.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: r, tokens: s, text: i };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim(), r = n.length > 1, i = { type: "list", raw: "", ordered: r, start: r ? +n.slice(0, -1) : "", loose: false, items: [] };
      n = r ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = r ? n : "[*+-]");
      let s = this.rules.other.listItemRegex(n), a = false;
      for (;e; ) {
        let l = false, p = "", c = "";
        if (!(t = s.exec(e)) || this.rules.block.hr.test(e))
          break;
        p = t[0], e = e.substring(p.length);
        let d = ge(t[2].split(`
`, 1)[0], t[1].length), h = e.split(`
`, 1)[0], R = !d.trim(), f = 0;
        if (this.options.pedantic ? (f = 2, c = d.trimStart()) : R ? f = t[1].length + 1 : (f = d.search(this.rules.other.nonSpaceChar), f = f > 4 ? 1 : f, c = d.slice(f), f += t[1].length), R && this.rules.other.blankLine.test(h) && (p += h + `
`, e = e.substring(h.length + 1), l = true), !l) {
          let S = this.rules.other.nextBulletRegex(f), Y = this.rules.other.hrRegex(f), ee = this.rules.other.fencesBeginRegex(f), te = this.rules.other.headingBeginRegex(f), me = this.rules.other.htmlBeginRegex(f), xe = this.rules.other.blockquoteBeginRegex(f);
          for (;e; ) {
            let Z = e.split(`
`, 1)[0], A;
            if (h = Z, this.options.pedantic ? (h = h.replace(this.rules.other.listReplaceNesting, "  "), A = h) : A = h.replace(this.rules.other.tabCharGlobal, "    "), ee.test(h) || te.test(h) || me.test(h) || xe.test(h) || S.test(h) || Y.test(h))
              break;
            if (A.search(this.rules.other.nonSpaceChar) >= f || !h.trim())
              c += `
` + A.slice(f);
            else {
              if (R || d.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ee.test(d) || te.test(d) || Y.test(d))
                break;
              c += `
` + h;
            }
            R = !h.trim(), p += Z + `
`, e = e.substring(Z.length + 1), d = A.slice(f);
          }
        }
        i.loose || (a ? i.loose = true : this.rules.other.doubleBlankLine.test(p) && (a = true)), i.items.push({ type: "list_item", raw: p, task: !!this.options.gfm && this.rules.other.listIsTask.test(c), loose: false, text: c, tokens: [] }), i.raw += p;
      }
      let o = i.items.at(-1);
      if (o)
        o.raw = o.raw.trimEnd(), o.text = o.text.trimEnd();
      else
        return;
      i.raw = i.raw.trimEnd();
      for (let l of i.items) {
        if (this.lexer.state.top = false, l.tokens = this.lexer.blockTokens(l.text, []), l.task) {
          if (l.text = l.text.replace(this.rules.other.listReplaceTask, ""), l.tokens[0]?.type === "text" || l.tokens[0]?.type === "paragraph") {
            l.tokens[0].raw = l.tokens[0].raw.replace(this.rules.other.listReplaceTask, ""), l.tokens[0].text = l.tokens[0].text.replace(this.rules.other.listReplaceTask, "");
            for (let c = this.lexer.inlineQueue.length - 1;c >= 0; c--)
              if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[c].src)) {
                this.lexer.inlineQueue[c].src = this.lexer.inlineQueue[c].src.replace(this.rules.other.listReplaceTask, "");
                break;
              }
          }
          let p = this.rules.other.listTaskCheckbox.exec(l.raw);
          if (p) {
            let c = { type: "checkbox", raw: p[0] + " ", checked: p[0] !== "[ ]" };
            l.checked = c.checked, i.loose ? l.tokens[0] && ["paragraph", "text"].includes(l.tokens[0].type) && "tokens" in l.tokens[0] && l.tokens[0].tokens ? (l.tokens[0].raw = c.raw + l.tokens[0].raw, l.tokens[0].text = c.raw + l.tokens[0].text, l.tokens[0].tokens.unshift(c)) : l.tokens.unshift({ type: "paragraph", raw: c.raw, text: c.raw, tokens: [c] }) : l.tokens.unshift(c);
          }
        }
        if (!i.loose) {
          let p = l.tokens.filter((d) => d.type === "space"), c = p.length > 0 && p.some((d) => this.rules.other.anyLine.test(d.raw));
          i.loose = c;
        }
      }
      if (i.loose)
        for (let l of i.items) {
          l.loose = true;
          for (let p of l.tokens)
            p.type === "text" && (p.type = "paragraph");
        }
      return i;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t)
      return { type: "html", block: true, raw: t[0], pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: t[0] };
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), r = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", i = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: t[0], href: r, title: i };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2]))
      return;
    let n = V(t[1]), r = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], s = { type: "table", raw: t[0], header: [], align: [], rows: [] };
    if (n.length === r.length) {
      for (let a of r)
        this.rules.other.tableAlignRight.test(a) ? s.align.push("right") : this.rules.other.tableAlignCenter.test(a) ? s.align.push("center") : this.rules.other.tableAlignLeft.test(a) ? s.align.push("left") : s.align.push(null);
      for (let a = 0;a < n.length; a++)
        s.header.push({ text: n[a], tokens: this.lexer.inline(n[a]), header: true, align: s.align[a] });
      for (let a of i)
        s.rows.push(V(a, s.header.length).map((o, l) => ({ text: o, tokens: this.lexer.inline(o), header: false, align: s.align[l] })));
      return s;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t) {
      let n = t[1].trim();
      return { type: "heading", raw: t[0], depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
    }
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t)
      return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t)
      return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t)
      return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n))
          return;
        let s = I(n.slice(0, -1), "\\");
        if ((n.length - s.length) % 2 === 0)
          return;
      } else {
        let s = de(t[2], "()");
        if (s === -2)
          return;
        if (s > -1) {
          let o = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + s;
          t[2] = t[2].substring(0, s), t[0] = t[0].substring(0, o).trim(), t[3] = "";
        }
      }
      let r = t[2], i = "";
      if (this.options.pedantic) {
        let s = this.rules.other.pedanticHrefTitle.exec(r);
        s && (r = s[1], i = s[3]);
      } else
        i = t[3] ? t[3].slice(1, -1) : "";
      return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? r = r.slice(1) : r = r.slice(1, -1)), fe(t, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: i && i.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let r = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), i = t[r.toLowerCase()];
      if (!i) {
        let s = n[0].charAt(0);
        return { type: "text", raw: s, text: s };
      }
      return fe(n, i, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let r = this.rules.inline.emStrongLDelim.exec(e);
    if (!r || !r[1] && !r[2] && !r[3] && !r[4] || r[4] && n.match(this.rules.other.unicodeAlphaNumeric))
      return;
    if (!(r[1] || r[3] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let s = [...r[0]].length - 1, a, o, l = s, p = 0, c = r[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + s);(r = c.exec(t)) != null; ) {
        if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a)
          continue;
        if (o = [...a].length, r[3] || r[4]) {
          l += o;
          continue;
        } else if ((r[5] || r[6]) && s % 3 && !((s + o) % 3)) {
          p += o;
          continue;
        }
        if (l -= o, l > 0)
          continue;
        o = Math.min(o, o + l + p);
        let d = [...r[0]][0].length, h = e.slice(0, s + r.index + d + o);
        if (Math.min(s, o) % 2) {
          let f = h.slice(1, -1);
          return { type: "em", raw: h, text: f, tokens: this.lexer.inlineTokens(f) };
        }
        let R = h.slice(2, -2);
        return { type: "strong", raw: h, text: R, tokens: this.lexer.inlineTokens(R) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), r = this.rules.other.nonSpaceChar.test(n), i = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return r && i && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t)
      return { type: "br", raw: t[0] };
  }
  del(e, t, n = "") {
    let r = this.rules.inline.delLDelim.exec(e);
    if (!r)
      return;
    if (!(r[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let s = [...r[0]].length - 1, a, o, l = s, p = this.rules.inline.delRDelim;
      for (p.lastIndex = 0, t = t.slice(-1 * e.length + s);(r = p.exec(t)) != null; ) {
        if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a || (o = [...a].length, o !== s))
          continue;
        if (r[3] || r[4]) {
          l += o;
          continue;
        }
        if (l -= o, l > 0)
          continue;
        o = Math.min(o, o + l);
        let c = [...r[0]][0].length, d = e.slice(0, s + r.index + c + o), h = d.slice(s, -s);
        return { type: "del", raw: d, text: h, tokens: this.lexer.inlineTokens(h) };
      }
    }
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, r;
      return t[2] === "@" ? (n = t[1], r = "mailto:" + n) : (n = t[1], r = n), { type: "link", raw: t[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, r;
      if (t[2] === "@")
        n = t[0], r = "mailto:" + n;
      else {
        let i;
        do
          i = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (i !== t[0]);
        n = t[0], t[1] === "www." ? r = "http://" + t[0] : r = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: t[0], escaped: n };
    }
  }
};
var x = class u {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(e) {
    this.tokens = [], this.tokens.links = Object.create(null), this.options = e || T, this.options.tokenizer = this.options.tokenizer || new w, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t = { other: m, block: B.normal, inline: E.normal };
    this.options.pedantic ? (t.block = B.pedantic, t.inline = E.pedantic) : this.options.gfm && (t.block = B.gfm, this.options.breaks ? t.inline = E.breaks : t.inline = E.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: B, inline: E };
  }
  static lex(e, t) {
    return new u(t).lex(e);
  }
  static lexInline(e, t) {
    return new u(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0;t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    for (this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));e; ) {
      let r;
      if (this.options.extensions?.block?.some((s) => (r = s.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false))
        continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        r.raw.length === 1 && s !== undefined ? s.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.raw, this.inlineQueue.at(-1).src = s.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let i = e;
      if (this.options.extensions?.startBlock) {
        let s = 1 / 0, a = e.slice(1), o;
        this.options.extensions.startBlock.forEach((l) => {
          o = l.call({ lexer: this }, a), typeof o == "number" && o >= 0 && (s = Math.min(s, o));
        }), s < 1 / 0 && s >= 0 && (i = e.substring(0, s + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(i))) {
        let s = t.at(-1);
        n && s?.type === "paragraph" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (e) {
        let s = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(s);
          break;
        } else
          throw new Error(s);
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  inlineTokens(e, t = []) {
    this.tokenizer.lexer = this;
    let n = e, r = null;
    if (this.tokens.links) {
      let o = Object.keys(this.tokens.links);
      if (o.length > 0)
        for (;(r = this.tokenizer.rules.inline.reflinkSearch.exec(n)) != null; )
          o.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (n = n.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (;(r = this.tokenizer.rules.inline.anyPunctuation.exec(n)) != null; )
      n = n.slice(0, r.index) + "++" + n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let i;
    for (;(r = this.tokenizer.rules.inline.blockSkip.exec(n)) != null; )
      i = r[2] ? r[2].length : 0, n = n.slice(0, r.index + i) + "[" + "a".repeat(r[0].length - i - 2) + "]" + n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let s = false, a = "";
    for (;e; ) {
      s || (a = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((p) => (o = p.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), true) : false))
        continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let p = t.at(-1);
        o.type === "text" && p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : t.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, n, a)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e, n, a)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      let l = e;
      if (this.options.extensions?.startInline) {
        let p = 1 / 0, c = e.slice(1), d;
        this.options.extensions.startInline.forEach((h) => {
          d = h.call({ lexer: this }, c), typeof d == "number" && d >= 0 && (p = Math.min(p, d));
        }), p < 1 / 0 && p >= 0 && (l = e.substring(0, p + 1));
      }
      if (o = this.tokenizer.inlineText(l)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (a = o.raw.slice(-1)), s = true;
        let p = t.at(-1);
        p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : t.push(o);
        continue;
      }
      if (e) {
        let p = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(p);
          break;
        } else
          throw new Error(p);
      }
    }
    return t;
  }
};
var y = class {
  options;
  parser;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let r = (t || "").match(m.notSpaceStart)?.[0], i = e.replace(m.endingNewline, "") + `
`;
    return r ? '<pre><code class="language-' + O(r) + '">' + (n ? i : O(i, true)) + `</code></pre>
` : "<pre><code>" + (n ? i : O(i, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let { ordered: t, start: n } = e, r = "";
    for (let a = 0;a < e.items.length; a++) {
      let o = e.items[a];
      r += this.listitem(o);
    }
    let i = t ? "ol" : "ul", s = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + i + s + `>
` + r + "</" + i + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let i = 0;i < e.header.length; i++)
      n += this.tablecell(e.header[i]);
    t += this.tablerow({ text: n });
    let r = "";
    for (let i = 0;i < e.rows.length; i++) {
      let s = e.rows[i];
      n = "";
      for (let a = 0;a < s.length; a++)
        n += this.tablecell(s[a]);
      r += this.tablerow({ text: n });
    }
    return r && (r = `<tbody>${r}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + r + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${O(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    let r = this.parser.parseInline(n), i = J(e);
    if (i === null)
      return r;
    e = i;
    let s = '<a href="' + e + '"';
    return t && (s += ' title="' + O(t) + '"'), s += ">" + r + "</a>", s;
  }
  image({ href: e, title: t, text: n, tokens: r }) {
    r && (n = this.parser.parseInline(r, this.parser.textRenderer));
    let i = J(e);
    if (i === null)
      return O(n);
    e = i;
    let s = `<img src="${e}" alt="${O(n)}"`;
    return t && (s += ` title="${O(t)}"`), s += ">", s;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : ("escaped" in e) && e.escaped ? e.text : O(e.text);
  }
};
var $ = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
};
var b = class u2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || T, this.options.renderer = this.options.renderer || new y, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new $;
  }
  static parse(e, t) {
    return new u2(t).parse(e);
  }
  static parseInline(e, t) {
    return new u2(t).parseInline(e);
  }
  parse(e) {
    this.renderer.parser = this;
    let t = "";
    for (let n = 0;n < e.length; n++) {
      let r = e[n];
      if (this.options.extensions?.renderers?.[r.type]) {
        let s = r, a = this.options.extensions.renderers[s.type].call({ parser: this }, s);
        if (a !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(s.type)) {
          t += a || "";
          continue;
        }
      }
      let i = r;
      switch (i.type) {
        case "space": {
          t += this.renderer.space(i);
          break;
        }
        case "hr": {
          t += this.renderer.hr(i);
          break;
        }
        case "heading": {
          t += this.renderer.heading(i);
          break;
        }
        case "code": {
          t += this.renderer.code(i);
          break;
        }
        case "table": {
          t += this.renderer.table(i);
          break;
        }
        case "blockquote": {
          t += this.renderer.blockquote(i);
          break;
        }
        case "list": {
          t += this.renderer.list(i);
          break;
        }
        case "checkbox": {
          t += this.renderer.checkbox(i);
          break;
        }
        case "html": {
          t += this.renderer.html(i);
          break;
        }
        case "def": {
          t += this.renderer.def(i);
          break;
        }
        case "paragraph": {
          t += this.renderer.paragraph(i);
          break;
        }
        case "text": {
          t += this.renderer.text(i);
          break;
        }
        default: {
          let s = 'Token with "' + i.type + '" type was not found.';
          if (this.options.silent)
            return console.error(s), "";
          throw new Error(s);
        }
      }
    }
    return t;
  }
  parseInline(e, t = this.renderer) {
    this.renderer.parser = this;
    let n = "";
    for (let r = 0;r < e.length; r++) {
      let i = e[r];
      if (this.options.extensions?.renderers?.[i.type]) {
        let a = this.options.extensions.renderers[i.type].call({ parser: this }, i);
        if (a !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(i.type)) {
          n += a || "";
          continue;
        }
      }
      let s = i;
      switch (s.type) {
        case "escape": {
          n += t.text(s);
          break;
        }
        case "html": {
          n += t.html(s);
          break;
        }
        case "link": {
          n += t.link(s);
          break;
        }
        case "image": {
          n += t.image(s);
          break;
        }
        case "checkbox": {
          n += t.checkbox(s);
          break;
        }
        case "strong": {
          n += t.strong(s);
          break;
        }
        case "em": {
          n += t.em(s);
          break;
        }
        case "codespan": {
          n += t.codespan(s);
          break;
        }
        case "br": {
          n += t.br(s);
          break;
        }
        case "del": {
          n += t.del(s);
          break;
        }
        case "text": {
          n += t.text(s);
          break;
        }
        default: {
          let a = 'Token with "' + s.type + '" type was not found.';
          if (this.options.silent)
            return console.error(a), "";
          throw new Error(a);
        }
      }
    }
    return n;
  }
};
var P = class {
  options;
  block;
  constructor(e) {
    this.options = e || T;
  }
  static passThroughHooks = new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer() {
    return this.block ? x.lex : x.lexInline;
  }
  provideParser() {
    return this.block ? b.parse : b.parseInline;
  }
};
var D = class {
  defaults = M();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = b;
  Renderer = y;
  TextRenderer = $;
  Lexer = x;
  Tokenizer = w;
  Hooks = P;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let r of e)
      switch (n = n.concat(t.call(this, r)), r.type) {
        case "table": {
          let i = r;
          for (let s of i.header)
            n = n.concat(this.walkTokens(s.tokens, t));
          for (let s of i.rows)
            for (let a of s)
              n = n.concat(this.walkTokens(a.tokens, t));
          break;
        }
        case "list": {
          let i = r;
          n = n.concat(this.walkTokens(i.items, t));
          break;
        }
        default: {
          let i = r;
          this.defaults.extensions?.childTokens?.[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((s) => {
            let a = i[s].flat(1 / 0);
            n = n.concat(this.walkTokens(a, t));
          }) : i.tokens && (n = n.concat(this.walkTokens(i.tokens, t)));
        }
      }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let r = { ...n };
      if (r.async = this.defaults.async || r.async || false, n.extensions && (n.extensions.forEach((i) => {
        if (!i.name)
          throw new Error("extension name required");
        if ("renderer" in i) {
          let s = t.renderers[i.name];
          s ? t.renderers[i.name] = function(...a) {
            let o = i.renderer.apply(this, a);
            return o === false && (o = s.apply(this, a)), o;
          } : t.renderers[i.name] = i.renderer;
        }
        if ("tokenizer" in i) {
          if (!i.level || i.level !== "block" && i.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          let s = t[i.level];
          s ? s.unshift(i.tokenizer) : t[i.level] = [i.tokenizer], i.start && (i.level === "block" ? t.startBlock ? t.startBlock.push(i.start) : t.startBlock = [i.start] : i.level === "inline" && (t.startInline ? t.startInline.push(i.start) : t.startInline = [i.start]));
        }
        "childTokens" in i && i.childTokens && (t.childTokens[i.name] = i.childTokens);
      }), r.extensions = t), n.renderer) {
        let i = this.defaults.renderer || new y(this.defaults);
        for (let s in n.renderer) {
          if (!(s in i))
            throw new Error(`renderer '${s}' does not exist`);
          if (["options", "parser"].includes(s))
            continue;
          let a = s, o = n.renderer[a], l = i[a];
          i[a] = (...p) => {
            let c = o.apply(i, p);
            return c === false && (c = l.apply(i, p)), c || "";
          };
        }
        r.renderer = i;
      }
      if (n.tokenizer) {
        let i = this.defaults.tokenizer || new w(this.defaults);
        for (let s in n.tokenizer) {
          if (!(s in i))
            throw new Error(`tokenizer '${s}' does not exist`);
          if (["options", "rules", "lexer"].includes(s))
            continue;
          let a = s, o = n.tokenizer[a], l = i[a];
          i[a] = (...p) => {
            let c = o.apply(i, p);
            return c === false && (c = l.apply(i, p)), c;
          };
        }
        r.tokenizer = i;
      }
      if (n.hooks) {
        let i = this.defaults.hooks || new P;
        for (let s in n.hooks) {
          if (!(s in i))
            throw new Error(`hook '${s}' does not exist`);
          if (["options", "block"].includes(s))
            continue;
          let a = s, o = n.hooks[a], l = i[a];
          P.passThroughHooks.has(s) ? i[a] = (p) => {
            if (this.defaults.async && P.passThroughHooksRespectAsync.has(s))
              return (async () => {
                let d = await o.call(i, p);
                return l.call(i, d);
              })();
            let c = o.call(i, p);
            return l.call(i, c);
          } : i[a] = (...p) => {
            if (this.defaults.async)
              return (async () => {
                let d = await o.apply(i, p);
                return d === false && (d = await l.apply(i, p)), d;
              })();
            let c = o.apply(i, p);
            return c === false && (c = l.apply(i, p)), c;
          };
        }
        r.hooks = i;
      }
      if (n.walkTokens) {
        let i = this.defaults.walkTokens, s = n.walkTokens;
        r.walkTokens = function(a) {
          let o = [];
          return o.push(s.call(this, a)), i && (o = o.concat(i.call(this, a))), o;
        };
      }
      this.defaults = { ...this.defaults, ...r };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return x.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return b.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, r) => {
      let i = { ...r }, s = { ...this.defaults, ...i }, a = this.onError(!!s.silent, !!s.async);
      if (this.defaults.async === true && i.async === false)
        return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null)
        return a(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string")
        return a(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (s.hooks && (s.hooks.options = s, s.hooks.block = e), s.async)
        return (async () => {
          let o = s.hooks ? await s.hooks.preprocess(n) : n, p = await (s.hooks ? await s.hooks.provideLexer() : e ? x.lex : x.lexInline)(o, s), c = s.hooks ? await s.hooks.processAllTokens(p) : p;
          s.walkTokens && await Promise.all(this.walkTokens(c, s.walkTokens));
          let h = await (s.hooks ? await s.hooks.provideParser() : e ? b.parse : b.parseInline)(c, s);
          return s.hooks ? await s.hooks.postprocess(h) : h;
        })().catch(a);
      try {
        s.hooks && (n = s.hooks.preprocess(n));
        let l = (s.hooks ? s.hooks.provideLexer() : e ? x.lex : x.lexInline)(n, s);
        s.hooks && (l = s.hooks.processAllTokens(l)), s.walkTokens && this.walkTokens(l, s.walkTokens);
        let c = (s.hooks ? s.hooks.provideParser() : e ? b.parse : b.parseInline)(l, s);
        return s.hooks && (c = s.hooks.postprocess(c)), c;
      } catch (o) {
        return a(o);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let r = "<p>An error occurred:</p><pre>" + O(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(r) : r;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
};
var L = new D;
function g(u3, e) {
  return L.parse(u3, e);
}
g.options = g.setOptions = function(u3) {
  return L.setOptions(u3), g.defaults = L.defaults, G(g.defaults), g;
};
g.getDefaults = M;
g.defaults = T;
g.use = function(...u3) {
  return L.use(...u3), g.defaults = L.defaults, G(g.defaults), g;
};
g.walkTokens = function(u3, e) {
  return L.walkTokens(u3, e);
};
g.parseInline = L.parseInline;
g.Parser = b;
g.parser = b.parse;
g.Renderer = y;
g.TextRenderer = $;
g.Lexer = x;
g.lexer = x.lex;
g.Tokenizer = w;
g.Hooks = P;
g.parse = g;
var Qt = g.options;
var jt = g.setOptions;
var Ft = g.use;
var Ut = g.walkTokens;
var Kt = g.parseInline;
var Xt = b.parse;
var Jt = x.lex;

// src/generated/bidi-data.ts
var latin1BidiTypes = [
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "S",
  "B",
  "S",
  "WS",
  "B",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "B",
  "B",
  "B",
  "S",
  "WS",
  "ON",
  "ON",
  "ET",
  "ET",
  "ET",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ES",
  "CS",
  "ES",
  "CS",
  "CS",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "CS",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "B",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "CS",
  "ON",
  "ET",
  "ET",
  "ET",
  "ET",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "ON",
  "ON",
  "BN",
  "ON",
  "ON",
  "ET",
  "ET",
  "EN",
  "EN",
  "ON",
  "L",
  "ON",
  "ON",
  "ON",
  "EN",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L"
];
var nonLatin1BidiRanges = [
  [697, 698, "ON"],
  [706, 719, "ON"],
  [722, 735, "ON"],
  [741, 749, "ON"],
  [751, 767, "ON"],
  [768, 879, "NSM"],
  [884, 885, "ON"],
  [894, 894, "ON"],
  [900, 901, "ON"],
  [903, 903, "ON"],
  [1014, 1014, "ON"],
  [1155, 1161, "NSM"],
  [1418, 1418, "ON"],
  [1421, 1422, "ON"],
  [1423, 1423, "ET"],
  [1424, 1424, "R"],
  [1425, 1469, "NSM"],
  [1470, 1470, "R"],
  [1471, 1471, "NSM"],
  [1472, 1472, "R"],
  [1473, 1474, "NSM"],
  [1475, 1475, "R"],
  [1476, 1477, "NSM"],
  [1478, 1478, "R"],
  [1479, 1479, "NSM"],
  [1480, 1535, "R"],
  [1536, 1541, "AN"],
  [1542, 1543, "ON"],
  [1544, 1544, "AL"],
  [1545, 1546, "ET"],
  [1547, 1547, "AL"],
  [1548, 1548, "CS"],
  [1549, 1549, "AL"],
  [1550, 1551, "ON"],
  [1552, 1562, "NSM"],
  [1563, 1610, "AL"],
  [1611, 1631, "NSM"],
  [1632, 1641, "AN"],
  [1642, 1642, "ET"],
  [1643, 1644, "AN"],
  [1645, 1647, "AL"],
  [1648, 1648, "NSM"],
  [1649, 1749, "AL"],
  [1750, 1756, "NSM"],
  [1757, 1757, "AN"],
  [1758, 1758, "ON"],
  [1759, 1764, "NSM"],
  [1765, 1766, "AL"],
  [1767, 1768, "NSM"],
  [1769, 1769, "ON"],
  [1770, 1773, "NSM"],
  [1774, 1775, "AL"],
  [1776, 1785, "EN"],
  [1786, 1808, "AL"],
  [1809, 1809, "NSM"],
  [1810, 1839, "AL"],
  [1840, 1866, "NSM"],
  [1867, 1957, "AL"],
  [1958, 1968, "NSM"],
  [1969, 1983, "AL"],
  [1984, 2026, "R"],
  [2027, 2035, "NSM"],
  [2036, 2037, "R"],
  [2038, 2041, "ON"],
  [2042, 2044, "R"],
  [2045, 2045, "NSM"],
  [2046, 2069, "R"],
  [2070, 2073, "NSM"],
  [2074, 2074, "R"],
  [2075, 2083, "NSM"],
  [2084, 2084, "R"],
  [2085, 2087, "NSM"],
  [2088, 2088, "R"],
  [2089, 2093, "NSM"],
  [2094, 2136, "R"],
  [2137, 2139, "NSM"],
  [2140, 2143, "R"],
  [2144, 2191, "AL"],
  [2192, 2193, "AN"],
  [2194, 2198, "AL"],
  [2199, 2207, "NSM"],
  [2208, 2249, "AL"],
  [2250, 2273, "NSM"],
  [2274, 2274, "AN"],
  [2275, 2306, "NSM"],
  [2362, 2362, "NSM"],
  [2364, 2364, "NSM"],
  [2369, 2376, "NSM"],
  [2381, 2381, "NSM"],
  [2385, 2391, "NSM"],
  [2402, 2403, "NSM"],
  [2433, 2433, "NSM"],
  [2492, 2492, "NSM"],
  [2497, 2500, "NSM"],
  [2509, 2509, "NSM"],
  [2530, 2531, "NSM"],
  [2546, 2547, "ET"],
  [2555, 2555, "ET"],
  [2558, 2558, "NSM"],
  [2561, 2562, "NSM"],
  [2620, 2620, "NSM"],
  [2625, 2626, "NSM"],
  [2631, 2632, "NSM"],
  [2635, 2637, "NSM"],
  [2641, 2641, "NSM"],
  [2672, 2673, "NSM"],
  [2677, 2677, "NSM"],
  [2689, 2690, "NSM"],
  [2748, 2748, "NSM"],
  [2753, 2757, "NSM"],
  [2759, 2760, "NSM"],
  [2765, 2765, "NSM"],
  [2786, 2787, "NSM"],
  [2801, 2801, "ET"],
  [2810, 2815, "NSM"],
  [2817, 2817, "NSM"],
  [2876, 2876, "NSM"],
  [2879, 2879, "NSM"],
  [2881, 2884, "NSM"],
  [2893, 2893, "NSM"],
  [2901, 2902, "NSM"],
  [2914, 2915, "NSM"],
  [2946, 2946, "NSM"],
  [3008, 3008, "NSM"],
  [3021, 3021, "NSM"],
  [3059, 3064, "ON"],
  [3065, 3065, "ET"],
  [3066, 3066, "ON"],
  [3072, 3072, "NSM"],
  [3076, 3076, "NSM"],
  [3132, 3132, "NSM"],
  [3134, 3136, "NSM"],
  [3142, 3144, "NSM"],
  [3146, 3149, "NSM"],
  [3157, 3158, "NSM"],
  [3170, 3171, "NSM"],
  [3192, 3198, "ON"],
  [3201, 3201, "NSM"],
  [3260, 3260, "NSM"],
  [3276, 3277, "NSM"],
  [3298, 3299, "NSM"],
  [3328, 3329, "NSM"],
  [3387, 3388, "NSM"],
  [3393, 3396, "NSM"],
  [3405, 3405, "NSM"],
  [3426, 3427, "NSM"],
  [3457, 3457, "NSM"],
  [3530, 3530, "NSM"],
  [3538, 3540, "NSM"],
  [3542, 3542, "NSM"],
  [3633, 3633, "NSM"],
  [3636, 3642, "NSM"],
  [3647, 3647, "ET"],
  [3655, 3662, "NSM"],
  [3761, 3761, "NSM"],
  [3764, 3772, "NSM"],
  [3784, 3790, "NSM"],
  [3864, 3865, "NSM"],
  [3893, 3893, "NSM"],
  [3895, 3895, "NSM"],
  [3897, 3897, "NSM"],
  [3898, 3901, "ON"],
  [3953, 3966, "NSM"],
  [3968, 3972, "NSM"],
  [3974, 3975, "NSM"],
  [3981, 3991, "NSM"],
  [3993, 4028, "NSM"],
  [4038, 4038, "NSM"],
  [4141, 4144, "NSM"],
  [4146, 4151, "NSM"],
  [4153, 4154, "NSM"],
  [4157, 4158, "NSM"],
  [4184, 4185, "NSM"],
  [4190, 4192, "NSM"],
  [4209, 4212, "NSM"],
  [4226, 4226, "NSM"],
  [4229, 4230, "NSM"],
  [4237, 4237, "NSM"],
  [4253, 4253, "NSM"],
  [4957, 4959, "NSM"],
  [5008, 5017, "ON"],
  [5120, 5120, "ON"],
  [5760, 5760, "WS"],
  [5787, 5788, "ON"],
  [5906, 5908, "NSM"],
  [5938, 5939, "NSM"],
  [5970, 5971, "NSM"],
  [6002, 6003, "NSM"],
  [6068, 6069, "NSM"],
  [6071, 6077, "NSM"],
  [6086, 6086, "NSM"],
  [6089, 6099, "NSM"],
  [6107, 6107, "ET"],
  [6109, 6109, "NSM"],
  [6128, 6137, "ON"],
  [6144, 6154, "ON"],
  [6155, 6157, "NSM"],
  [6158, 6158, "BN"],
  [6159, 6159, "NSM"],
  [6277, 6278, "NSM"],
  [6313, 6313, "NSM"],
  [6432, 6434, "NSM"],
  [6439, 6440, "NSM"],
  [6450, 6450, "NSM"],
  [6457, 6459, "NSM"],
  [6464, 6464, "ON"],
  [6468, 6469, "ON"],
  [6622, 6655, "ON"],
  [6679, 6680, "NSM"],
  [6683, 6683, "NSM"],
  [6742, 6742, "NSM"],
  [6744, 6750, "NSM"],
  [6752, 6752, "NSM"],
  [6754, 6754, "NSM"],
  [6757, 6764, "NSM"],
  [6771, 6780, "NSM"],
  [6783, 6783, "NSM"],
  [6832, 6877, "NSM"],
  [6880, 6891, "NSM"],
  [6912, 6915, "NSM"],
  [6964, 6964, "NSM"],
  [6966, 6970, "NSM"],
  [6972, 6972, "NSM"],
  [6978, 6978, "NSM"],
  [7019, 7027, "NSM"],
  [7040, 7041, "NSM"],
  [7074, 7077, "NSM"],
  [7080, 7081, "NSM"],
  [7083, 7085, "NSM"],
  [7142, 7142, "NSM"],
  [7144, 7145, "NSM"],
  [7149, 7149, "NSM"],
  [7151, 7153, "NSM"],
  [7212, 7219, "NSM"],
  [7222, 7223, "NSM"],
  [7376, 7378, "NSM"],
  [7380, 7392, "NSM"],
  [7394, 7400, "NSM"],
  [7405, 7405, "NSM"],
  [7412, 7412, "NSM"],
  [7416, 7417, "NSM"],
  [7616, 7679, "NSM"],
  [8125, 8125, "ON"],
  [8127, 8129, "ON"],
  [8141, 8143, "ON"],
  [8157, 8159, "ON"],
  [8173, 8175, "ON"],
  [8189, 8190, "ON"],
  [8192, 8202, "WS"],
  [8203, 8205, "BN"],
  [8207, 8207, "R"],
  [8208, 8231, "ON"],
  [8232, 8232, "WS"],
  [8233, 8233, "B"],
  [8234, 8238, "BN"],
  [8239, 8239, "CS"],
  [8240, 8244, "ET"],
  [8245, 8259, "ON"],
  [8260, 8260, "CS"],
  [8261, 8286, "ON"],
  [8287, 8287, "WS"],
  [8288, 8303, "BN"],
  [8304, 8304, "EN"],
  [8308, 8313, "EN"],
  [8314, 8315, "ES"],
  [8316, 8318, "ON"],
  [8320, 8329, "EN"],
  [8330, 8331, "ES"],
  [8332, 8334, "ON"],
  [8352, 8399, "ET"],
  [8400, 8432, "NSM"],
  [8448, 8449, "ON"],
  [8451, 8454, "ON"],
  [8456, 8457, "ON"],
  [8468, 8468, "ON"],
  [8470, 8472, "ON"],
  [8478, 8483, "ON"],
  [8485, 8485, "ON"],
  [8487, 8487, "ON"],
  [8489, 8489, "ON"],
  [8494, 8494, "ET"],
  [8506, 8507, "ON"],
  [8512, 8516, "ON"],
  [8522, 8525, "ON"],
  [8528, 8543, "ON"],
  [8585, 8587, "ON"],
  [8592, 8721, "ON"],
  [8722, 8722, "ES"],
  [8723, 8723, "ET"],
  [8724, 9013, "ON"],
  [9083, 9108, "ON"],
  [9110, 9257, "ON"],
  [9280, 9290, "ON"],
  [9312, 9351, "ON"],
  [9352, 9371, "EN"],
  [9450, 9899, "ON"],
  [9901, 10239, "ON"],
  [10496, 11123, "ON"],
  [11126, 11263, "ON"],
  [11493, 11498, "ON"],
  [11503, 11505, "NSM"],
  [11513, 11519, "ON"],
  [11647, 11647, "NSM"],
  [11744, 11775, "NSM"],
  [11776, 11869, "ON"],
  [11904, 11929, "ON"],
  [11931, 12019, "ON"],
  [12032, 12245, "ON"],
  [12272, 12287, "ON"],
  [12288, 12288, "WS"],
  [12289, 12292, "ON"],
  [12296, 12320, "ON"],
  [12330, 12333, "NSM"],
  [12336, 12336, "ON"],
  [12342, 12343, "ON"],
  [12349, 12351, "ON"],
  [12441, 12442, "NSM"],
  [12443, 12444, "ON"],
  [12448, 12448, "ON"],
  [12539, 12539, "ON"],
  [12736, 12773, "ON"],
  [12783, 12783, "ON"],
  [12829, 12830, "ON"],
  [12880, 12895, "ON"],
  [12924, 12926, "ON"],
  [12977, 12991, "ON"],
  [13004, 13007, "ON"],
  [13175, 13178, "ON"],
  [13278, 13279, "ON"],
  [13311, 13311, "ON"],
  [19904, 19967, "ON"],
  [42128, 42182, "ON"],
  [42509, 42511, "ON"],
  [42607, 42610, "NSM"],
  [42611, 42611, "ON"],
  [42612, 42621, "NSM"],
  [42622, 42623, "ON"],
  [42654, 42655, "NSM"],
  [42736, 42737, "NSM"],
  [42752, 42785, "ON"],
  [42888, 42888, "ON"],
  [43010, 43010, "NSM"],
  [43014, 43014, "NSM"],
  [43019, 43019, "NSM"],
  [43045, 43046, "NSM"],
  [43048, 43051, "ON"],
  [43052, 43052, "NSM"],
  [43064, 43065, "ET"],
  [43124, 43127, "ON"],
  [43204, 43205, "NSM"],
  [43232, 43249, "NSM"],
  [43263, 43263, "NSM"],
  [43302, 43309, "NSM"],
  [43335, 43345, "NSM"],
  [43392, 43394, "NSM"],
  [43443, 43443, "NSM"],
  [43446, 43449, "NSM"],
  [43452, 43453, "NSM"],
  [43493, 43493, "NSM"],
  [43561, 43566, "NSM"],
  [43569, 43570, "NSM"],
  [43573, 43574, "NSM"],
  [43587, 43587, "NSM"],
  [43596, 43596, "NSM"],
  [43644, 43644, "NSM"],
  [43696, 43696, "NSM"],
  [43698, 43700, "NSM"],
  [43703, 43704, "NSM"],
  [43710, 43711, "NSM"],
  [43713, 43713, "NSM"],
  [43756, 43757, "NSM"],
  [43766, 43766, "NSM"],
  [43882, 43883, "ON"],
  [44005, 44005, "NSM"],
  [44008, 44008, "NSM"],
  [44013, 44013, "NSM"],
  [64285, 64285, "R"],
  [64286, 64286, "NSM"],
  [64287, 64296, "R"],
  [64297, 64297, "ES"],
  [64298, 64335, "R"],
  [64336, 64450, "AL"],
  [64451, 64466, "ON"],
  [64467, 64829, "AL"],
  [64830, 64847, "ON"],
  [64848, 64911, "AL"],
  [64912, 64913, "ON"],
  [64914, 64967, "AL"],
  [64968, 64975, "ON"],
  [64976, 65007, "BN"],
  [65008, 65020, "AL"],
  [65021, 65023, "ON"],
  [65024, 65039, "NSM"],
  [65040, 65049, "ON"],
  [65056, 65071, "NSM"],
  [65072, 65103, "ON"],
  [65104, 65104, "CS"],
  [65105, 65105, "ON"],
  [65106, 65106, "CS"],
  [65108, 65108, "ON"],
  [65109, 65109, "CS"],
  [65110, 65118, "ON"],
  [65119, 65119, "ET"],
  [65120, 65121, "ON"],
  [65122, 65123, "ES"],
  [65124, 65126, "ON"],
  [65128, 65128, "ON"],
  [65129, 65130, "ET"],
  [65131, 65131, "ON"],
  [65136, 65278, "AL"],
  [65279, 65279, "BN"],
  [65281, 65282, "ON"],
  [65283, 65285, "ET"],
  [65286, 65290, "ON"],
  [65291, 65291, "ES"],
  [65292, 65292, "CS"],
  [65293, 65293, "ES"],
  [65294, 65295, "CS"],
  [65296, 65305, "EN"],
  [65306, 65306, "CS"],
  [65307, 65312, "ON"],
  [65339, 65344, "ON"],
  [65371, 65381, "ON"],
  [65504, 65505, "ET"],
  [65506, 65508, "ON"],
  [65509, 65510, "ET"],
  [65512, 65518, "ON"],
  [65520, 65528, "BN"],
  [65529, 65533, "ON"],
  [65534, 65535, "BN"],
  [65793, 65793, "ON"],
  [65856, 65932, "ON"],
  [65936, 65948, "ON"],
  [65952, 65952, "ON"],
  [66045, 66045, "NSM"],
  [66272, 66272, "NSM"],
  [66273, 66299, "EN"],
  [66422, 66426, "NSM"],
  [67584, 67870, "R"],
  [67871, 67871, "ON"],
  [67872, 68096, "R"],
  [68097, 68099, "NSM"],
  [68100, 68100, "R"],
  [68101, 68102, "NSM"],
  [68103, 68107, "R"],
  [68108, 68111, "NSM"],
  [68112, 68151, "R"],
  [68152, 68154, "NSM"],
  [68155, 68158, "R"],
  [68159, 68159, "NSM"],
  [68160, 68324, "R"],
  [68325, 68326, "NSM"],
  [68327, 68408, "R"],
  [68409, 68415, "ON"],
  [68416, 68863, "R"],
  [68864, 68899, "AL"],
  [68900, 68903, "NSM"],
  [68904, 68911, "AL"],
  [68912, 68921, "AN"],
  [68922, 68927, "AL"],
  [68928, 68937, "AN"],
  [68938, 68968, "R"],
  [68969, 68973, "NSM"],
  [68974, 68974, "ON"],
  [68975, 69215, "R"],
  [69216, 69246, "AN"],
  [69247, 69290, "R"],
  [69291, 69292, "NSM"],
  [69293, 69311, "R"],
  [69312, 69327, "AL"],
  [69328, 69336, "ON"],
  [69337, 69369, "AL"],
  [69370, 69375, "NSM"],
  [69376, 69423, "R"],
  [69424, 69445, "AL"],
  [69446, 69456, "NSM"],
  [69457, 69487, "AL"],
  [69488, 69505, "R"],
  [69506, 69509, "NSM"],
  [69510, 69631, "R"],
  [69633, 69633, "NSM"],
  [69688, 69702, "NSM"],
  [69714, 69733, "ON"],
  [69744, 69744, "NSM"],
  [69747, 69748, "NSM"],
  [69759, 69761, "NSM"],
  [69811, 69814, "NSM"],
  [69817, 69818, "NSM"],
  [69826, 69826, "NSM"],
  [69888, 69890, "NSM"],
  [69927, 69931, "NSM"],
  [69933, 69940, "NSM"],
  [70003, 70003, "NSM"],
  [70016, 70017, "NSM"],
  [70070, 70078, "NSM"],
  [70089, 70092, "NSM"],
  [70095, 70095, "NSM"],
  [70191, 70193, "NSM"],
  [70196, 70196, "NSM"],
  [70198, 70199, "NSM"],
  [70206, 70206, "NSM"],
  [70209, 70209, "NSM"],
  [70367, 70367, "NSM"],
  [70371, 70378, "NSM"],
  [70400, 70401, "NSM"],
  [70459, 70460, "NSM"],
  [70464, 70464, "NSM"],
  [70502, 70508, "NSM"],
  [70512, 70516, "NSM"],
  [70587, 70592, "NSM"],
  [70606, 70606, "NSM"],
  [70608, 70608, "NSM"],
  [70610, 70610, "NSM"],
  [70625, 70626, "NSM"],
  [70712, 70719, "NSM"],
  [70722, 70724, "NSM"],
  [70726, 70726, "NSM"],
  [70750, 70750, "NSM"],
  [70835, 70840, "NSM"],
  [70842, 70842, "NSM"],
  [70847, 70848, "NSM"],
  [70850, 70851, "NSM"],
  [71090, 71093, "NSM"],
  [71100, 71101, "NSM"],
  [71103, 71104, "NSM"],
  [71132, 71133, "NSM"],
  [71219, 71226, "NSM"],
  [71229, 71229, "NSM"],
  [71231, 71232, "NSM"],
  [71264, 71276, "ON"],
  [71339, 71339, "NSM"],
  [71341, 71341, "NSM"],
  [71344, 71349, "NSM"],
  [71351, 71351, "NSM"],
  [71453, 71453, "NSM"],
  [71455, 71455, "NSM"],
  [71458, 71461, "NSM"],
  [71463, 71467, "NSM"],
  [71727, 71735, "NSM"],
  [71737, 71738, "NSM"],
  [71995, 71996, "NSM"],
  [71998, 71998, "NSM"],
  [72003, 72003, "NSM"],
  [72148, 72151, "NSM"],
  [72154, 72155, "NSM"],
  [72160, 72160, "NSM"],
  [72193, 72198, "NSM"],
  [72201, 72202, "NSM"],
  [72243, 72248, "NSM"],
  [72251, 72254, "NSM"],
  [72263, 72263, "NSM"],
  [72273, 72278, "NSM"],
  [72281, 72283, "NSM"],
  [72330, 72342, "NSM"],
  [72344, 72345, "NSM"],
  [72544, 72544, "NSM"],
  [72546, 72548, "NSM"],
  [72550, 72550, "NSM"],
  [72752, 72758, "NSM"],
  [72760, 72765, "NSM"],
  [72850, 72871, "NSM"],
  [72874, 72880, "NSM"],
  [72882, 72883, "NSM"],
  [72885, 72886, "NSM"],
  [73009, 73014, "NSM"],
  [73018, 73018, "NSM"],
  [73020, 73021, "NSM"],
  [73023, 73029, "NSM"],
  [73031, 73031, "NSM"],
  [73104, 73105, "NSM"],
  [73109, 73109, "NSM"],
  [73111, 73111, "NSM"],
  [73459, 73460, "NSM"],
  [73472, 73473, "NSM"],
  [73526, 73530, "NSM"],
  [73536, 73536, "NSM"],
  [73538, 73538, "NSM"],
  [73562, 73562, "NSM"],
  [73685, 73692, "ON"],
  [73693, 73696, "ET"],
  [73697, 73713, "ON"],
  [78912, 78912, "NSM"],
  [78919, 78933, "NSM"],
  [90398, 90409, "NSM"],
  [90413, 90415, "NSM"],
  [92912, 92916, "NSM"],
  [92976, 92982, "NSM"],
  [94031, 94031, "NSM"],
  [94095, 94098, "NSM"],
  [94178, 94178, "ON"],
  [94180, 94180, "NSM"],
  [113821, 113822, "NSM"],
  [113824, 113827, "BN"],
  [117760, 117973, "ON"],
  [118000, 118009, "EN"],
  [118010, 118012, "ON"],
  [118016, 118451, "ON"],
  [118458, 118480, "ON"],
  [118496, 118512, "ON"],
  [118528, 118573, "NSM"],
  [118576, 118598, "NSM"],
  [119143, 119145, "NSM"],
  [119155, 119162, "BN"],
  [119163, 119170, "NSM"],
  [119173, 119179, "NSM"],
  [119210, 119213, "NSM"],
  [119273, 119274, "ON"],
  [119296, 119361, "ON"],
  [119362, 119364, "NSM"],
  [119365, 119365, "ON"],
  [119552, 119638, "ON"],
  [120513, 120513, "ON"],
  [120539, 120539, "ON"],
  [120571, 120571, "ON"],
  [120597, 120597, "ON"],
  [120629, 120629, "ON"],
  [120655, 120655, "ON"],
  [120687, 120687, "ON"],
  [120713, 120713, "ON"],
  [120745, 120745, "ON"],
  [120771, 120771, "ON"],
  [120782, 120831, "EN"],
  [121344, 121398, "NSM"],
  [121403, 121452, "NSM"],
  [121461, 121461, "NSM"],
  [121476, 121476, "NSM"],
  [121499, 121503, "NSM"],
  [121505, 121519, "NSM"],
  [122880, 122886, "NSM"],
  [122888, 122904, "NSM"],
  [122907, 122913, "NSM"],
  [122915, 122916, "NSM"],
  [122918, 122922, "NSM"],
  [123023, 123023, "NSM"],
  [123184, 123190, "NSM"],
  [123566, 123566, "NSM"],
  [123628, 123631, "NSM"],
  [123647, 123647, "ET"],
  [124140, 124143, "NSM"],
  [124398, 124399, "NSM"],
  [124643, 124643, "NSM"],
  [124646, 124646, "NSM"],
  [124654, 124655, "NSM"],
  [124661, 124661, "NSM"],
  [124928, 125135, "R"],
  [125136, 125142, "NSM"],
  [125143, 125251, "R"],
  [125252, 125258, "NSM"],
  [125259, 126063, "R"],
  [126064, 126143, "AL"],
  [126144, 126207, "R"],
  [126208, 126287, "AL"],
  [126288, 126463, "R"],
  [126464, 126703, "AL"],
  [126704, 126705, "ON"],
  [126706, 126719, "AL"],
  [126720, 126975, "R"],
  [126976, 127019, "ON"],
  [127024, 127123, "ON"],
  [127136, 127150, "ON"],
  [127153, 127167, "ON"],
  [127169, 127183, "ON"],
  [127185, 127221, "ON"],
  [127232, 127242, "EN"],
  [127243, 127247, "ON"],
  [127279, 127279, "ON"],
  [127338, 127343, "ON"],
  [127405, 127405, "ON"],
  [127584, 127589, "ON"],
  [127744, 128728, "ON"],
  [128732, 128748, "ON"],
  [128752, 128764, "ON"],
  [128768, 128985, "ON"],
  [128992, 129003, "ON"],
  [129008, 129008, "ON"],
  [129024, 129035, "ON"],
  [129040, 129095, "ON"],
  [129104, 129113, "ON"],
  [129120, 129159, "ON"],
  [129168, 129197, "ON"],
  [129200, 129211, "ON"],
  [129216, 129217, "ON"],
  [129232, 129240, "ON"],
  [129280, 129623, "ON"],
  [129632, 129645, "ON"],
  [129648, 129660, "ON"],
  [129664, 129674, "ON"],
  [129678, 129734, "ON"],
  [129736, 129736, "ON"],
  [129741, 129756, "ON"],
  [129759, 129770, "ON"],
  [129775, 129784, "ON"],
  [129792, 129938, "ON"],
  [129940, 130031, "ON"],
  [130032, 130041, "EN"],
  [130042, 130042, "ON"],
  [131070, 131071, "BN"],
  [196606, 196607, "BN"],
  [262142, 262143, "BN"],
  [327678, 327679, "BN"],
  [393214, 393215, "BN"],
  [458750, 458751, "BN"],
  [524286, 524287, "BN"],
  [589822, 589823, "BN"],
  [655358, 655359, "BN"],
  [720894, 720895, "BN"],
  [786430, 786431, "BN"],
  [851966, 851967, "BN"],
  [917502, 917759, "BN"],
  [917760, 917999, "NSM"],
  [918000, 921599, "BN"],
  [983038, 983039, "BN"],
  [1048574, 1048575, "BN"],
  [1114110, 1114111, "BN"]
];

// src/bidi.ts
function classifyCodePoint(codePoint) {
  if (codePoint <= 255)
    return latin1BidiTypes[codePoint];
  let lo = 0;
  let hi = nonLatin1BidiRanges.length - 1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    const range = nonLatin1BidiRanges[mid];
    if (codePoint < range[0]) {
      hi = mid - 1;
      continue;
    }
    if (codePoint > range[1]) {
      lo = mid + 1;
      continue;
    }
    return range[2];
  }
  return "L";
}
function computeBidiLevels(str) {
  const len = str.length;
  if (len === 0)
    return null;
  const types = new Array(len);
  let sawBidi = false;
  for (let i = 0;i < len; ) {
    const first = str.charCodeAt(i);
    let codePoint = first;
    let codeUnitLength = 1;
    if (first >= 55296 && first <= 56319 && i + 1 < len) {
      const second = str.charCodeAt(i + 1);
      if (second >= 56320 && second <= 57343) {
        codePoint = (first - 55296 << 10) + (second - 56320) + 65536;
        codeUnitLength = 2;
      }
    }
    const t = classifyCodePoint(codePoint);
    if (t === "R" || t === "AL" || t === "AN")
      sawBidi = true;
    for (let j2 = 0;j2 < codeUnitLength; j2++) {
      types[i + j2] = t;
    }
    i += codeUnitLength;
  }
  if (!sawBidi)
    return null;
  let startLevel = 0;
  for (let i = 0;i < len; i++) {
    const t = types[i];
    if (t === "L") {
      startLevel = 0;
      break;
    }
    if (t === "R" || t === "AL") {
      startLevel = 1;
      break;
    }
  }
  const levels = new Int8Array(len);
  for (let i = 0;i < len; i++)
    levels[i] = startLevel;
  const e = startLevel & 1 ? "R" : "L";
  const sor = e;
  let lastType = sor;
  for (let i = 0;i < len; i++) {
    if (types[i] === "NSM")
      types[i] = lastType;
    else
      lastType = types[i];
  }
  lastType = sor;
  for (let i = 0;i < len; i++) {
    const t = types[i];
    if (t === "EN")
      types[i] = lastType === "AL" ? "AN" : "EN";
    else if (t === "R" || t === "L" || t === "AL")
      lastType = t;
  }
  for (let i = 0;i < len; i++) {
    if (types[i] === "AL")
      types[i] = "R";
  }
  for (let i = 1;i < len - 1; i++) {
    if (types[i] === "ES" && types[i - 1] === "EN" && types[i + 1] === "EN") {
      types[i] = "EN";
    }
    if (types[i] === "CS" && (types[i - 1] === "EN" || types[i - 1] === "AN") && types[i + 1] === types[i - 1]) {
      types[i] = types[i - 1];
    }
  }
  for (let i = 0;i < len; i++) {
    if (types[i] !== "EN")
      continue;
    let j2;
    for (j2 = i - 1;j2 >= 0 && types[j2] === "ET"; j2--)
      types[j2] = "EN";
    for (j2 = i + 1;j2 < len && types[j2] === "ET"; j2++)
      types[j2] = "EN";
  }
  for (let i = 0;i < len; i++) {
    const t = types[i];
    if (t === "WS" || t === "ES" || t === "ET" || t === "CS")
      types[i] = "ON";
  }
  lastType = sor;
  for (let i = 0;i < len; i++) {
    const t = types[i];
    if (t === "EN")
      types[i] = lastType === "L" ? "L" : "EN";
    else if (t === "R" || t === "L")
      lastType = t;
  }
  for (let i = 0;i < len; i++) {
    if (types[i] !== "ON")
      continue;
    let end = i + 1;
    while (end < len && types[end] === "ON")
      end++;
    const before = i > 0 ? types[i - 1] : sor;
    const after = end < len ? types[end] : sor;
    const bDir = before !== "L" ? "R" : "L";
    const aDir = after !== "L" ? "R" : "L";
    if (bDir === aDir) {
      for (let j2 = i;j2 < end; j2++)
        types[j2] = bDir;
    }
    i = end - 1;
  }
  for (let i = 0;i < len; i++) {
    if (types[i] === "ON")
      types[i] = e;
  }
  for (let i = 0;i < len; i++) {
    const t = types[i];
    if ((levels[i] & 1) === 0) {
      if (t === "R")
        levels[i]++;
      else if (t === "AN" || t === "EN")
        levels[i] += 2;
    } else if (t === "L" || t === "AN" || t === "EN") {
      levels[i]++;
    }
  }
  return levels;
}
function computeSegmentLevels(normalized, segStarts) {
  const bidiLevels = computeBidiLevels(normalized);
  if (bidiLevels === null)
    return null;
  const segLevels = new Int8Array(segStarts.length);
  for (let i = 0;i < segStarts.length; i++) {
    segLevels[i] = bidiLevels[segStarts[i]];
  }
  return segLevels;
}

// src/analysis.ts
var collapsibleWhitespaceRunRe = /[ \t\n\r\f]+/g;
var needsWhitespaceNormalizationRe = /[\t\n\r\f]| {2,}|^ | $/;
function getWhiteSpaceProfile(whiteSpace) {
  const mode = whiteSpace ?? "normal";
  return mode === "pre-wrap" ? { mode, preserveOrdinarySpaces: true, preserveHardBreaks: true } : { mode, preserveOrdinarySpaces: false, preserveHardBreaks: false };
}
function normalizeWhitespaceNormal(text) {
  if (!needsWhitespaceNormalizationRe.test(text))
    return text;
  let normalized = text.replace(collapsibleWhitespaceRunRe, " ");
  if (normalized.charCodeAt(0) === 32) {
    normalized = normalized.slice(1);
  }
  if (normalized.length > 0 && normalized.charCodeAt(normalized.length - 1) === 32) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}
function normalizeWhitespacePreWrap(text) {
  if (!/[\r\f]/.test(text))
    return text.replace(/\r\n/g, `
`);
  return text.replace(/\r\n/g, `
`).replace(/[\r\f]/g, `
`);
}
var sharedWordSegmenter = null;
var segmenterLocale;
function getSharedWordSegmenter() {
  if (sharedWordSegmenter === null) {
    sharedWordSegmenter = new Intl.Segmenter(segmenterLocale, { granularity: "word" });
  }
  return sharedWordSegmenter;
}
var arabicScriptRe = /\p{Script=Arabic}/u;
var combiningMarkRe = /\p{M}/u;
var decimalDigitRe = /\p{Nd}/u;
function containsArabicScript(text) {
  return arabicScriptRe.test(text);
}
function isCJKCodePoint(codePoint) {
  return codePoint >= 19968 && codePoint <= 40959 || codePoint >= 13312 && codePoint <= 19903 || codePoint >= 131072 && codePoint <= 173791 || codePoint >= 173824 && codePoint <= 177983 || codePoint >= 177984 && codePoint <= 178207 || codePoint >= 178208 && codePoint <= 183983 || codePoint >= 183984 && codePoint <= 191471 || codePoint >= 191472 && codePoint <= 192093 || codePoint >= 194560 && codePoint <= 195103 || codePoint >= 196608 && codePoint <= 201551 || codePoint >= 201552 && codePoint <= 205743 || codePoint >= 205744 && codePoint <= 210041 || codePoint >= 63744 && codePoint <= 64255 || codePoint >= 12288 && codePoint <= 12351 || codePoint >= 12352 && codePoint <= 12447 || codePoint >= 12448 && codePoint <= 12543 || codePoint >= 44032 && codePoint <= 55215 || codePoint >= 65280 && codePoint <= 65519;
}
function isCJK(s) {
  for (let i = 0;i < s.length; i++) {
    const first = s.charCodeAt(i);
    if (first < 12288)
      continue;
    if (first >= 55296 && first <= 56319 && i + 1 < s.length) {
      const second = s.charCodeAt(i + 1);
      if (second >= 56320 && second <= 57343) {
        const codePoint = (first - 55296 << 10) + (second - 56320) + 65536;
        if (isCJKCodePoint(codePoint))
          return true;
        i++;
        continue;
      }
    }
    if (isCJKCodePoint(first))
      return true;
  }
  return false;
}
function endsWithLineStartProhibitedText(text) {
  let last = "";
  for (const ch of text)
    last = ch;
  return last.length > 0 && (kinsokuStart.has(last) || leftStickyPunctuation.has(last));
}
var keepAllGlueChars = new Set([
  " ",
  " ",
  "⁠",
  "\uFEFF"
]);
function containsCJKText(text) {
  return isCJK(text);
}
function endsWithKeepAllGlueText(text) {
  let last = "";
  for (const ch of text)
    last = ch;
  return last.length > 0 && keepAllGlueChars.has(last);
}
function canContinueKeepAllTextRun(previousText) {
  return !endsWithLineStartProhibitedText(previousText) && !endsWithKeepAllGlueText(previousText);
}
var kinsokuStart = new Set([
  "，",
  "．",
  "！",
  "：",
  "；",
  "？",
  "、",
  "。",
  "・",
  "）",
  "〕",
  "〉",
  "》",
  "」",
  "』",
  "】",
  "〗",
  "〙",
  "〛",
  "ー",
  "々",
  "〻",
  "ゝ",
  "ゞ",
  "ヽ",
  "ヾ"
]);
var kinsokuEnd = new Set([
  '"',
  "(",
  "[",
  "{",
  "“",
  "‘",
  "«",
  "‹",
  "（",
  "〔",
  "〈",
  "《",
  "「",
  "『",
  "【",
  "〖",
  "〘",
  "〚"
]);
var forwardStickyGlue = new Set([
  "'",
  "’"
]);
var leftStickyPunctuation = new Set([
  ".",
  ",",
  "!",
  "?",
  ":",
  ";",
  "،",
  "؛",
  "؟",
  "।",
  "॥",
  "၊",
  "။",
  "၌",
  "၍",
  "၏",
  ")",
  "]",
  "}",
  "%",
  '"',
  "”",
  "’",
  "»",
  "›",
  "…"
]);
var arabicNoSpaceTrailingPunctuation = new Set([
  ":",
  ".",
  "،",
  "؛"
]);
var myanmarMedialGlue = new Set([
  "၏"
]);
var closingQuoteChars = new Set([
  "”",
  "’",
  "»",
  "›",
  "」",
  "』",
  "】",
  "》",
  "〉",
  "〕",
  "）"
]);
function isLeftStickyPunctuationSegment(segment) {
  if (isEscapedQuoteClusterSegment(segment))
    return true;
  let sawPunctuation = false;
  for (const ch of segment) {
    if (leftStickyPunctuation.has(ch)) {
      sawPunctuation = true;
      continue;
    }
    if (sawPunctuation && combiningMarkRe.test(ch))
      continue;
    return false;
  }
  return sawPunctuation;
}
function isCJKLineStartProhibitedSegment(segment) {
  for (const ch of segment) {
    if (!kinsokuStart.has(ch) && !leftStickyPunctuation.has(ch))
      return false;
  }
  return segment.length > 0;
}
function isForwardStickyClusterSegment(segment) {
  if (isEscapedQuoteClusterSegment(segment))
    return true;
  for (const ch of segment) {
    if (!kinsokuEnd.has(ch) && !forwardStickyGlue.has(ch) && !combiningMarkRe.test(ch))
      return false;
  }
  return segment.length > 0;
}
function isEscapedQuoteClusterSegment(segment) {
  let sawQuote = false;
  for (const ch of segment) {
    if (ch === "\\" || combiningMarkRe.test(ch))
      continue;
    if (kinsokuEnd.has(ch) || leftStickyPunctuation.has(ch) || forwardStickyGlue.has(ch)) {
      sawQuote = true;
      continue;
    }
    return false;
  }
  return sawQuote;
}
function previousCodePointStart(text, end) {
  const last = end - 1;
  if (last <= 0)
    return Math.max(last, 0);
  const lastCodeUnit = text.charCodeAt(last);
  if (lastCodeUnit < 56320 || lastCodeUnit > 57343)
    return last;
  const maybeHigh = last - 1;
  if (maybeHigh < 0)
    return last;
  const highCodeUnit = text.charCodeAt(maybeHigh);
  return highCodeUnit >= 55296 && highCodeUnit <= 56319 ? maybeHigh : last;
}
function getLastCodePoint(text) {
  if (text.length === 0)
    return null;
  const start = previousCodePointStart(text, text.length);
  return text.slice(start);
}
function splitTrailingForwardStickyCluster(text) {
  const chars = Array.from(text);
  let splitIndex = chars.length;
  while (splitIndex > 0) {
    const ch = chars[splitIndex - 1];
    if (combiningMarkRe.test(ch)) {
      splitIndex--;
      continue;
    }
    if (kinsokuEnd.has(ch) || forwardStickyGlue.has(ch)) {
      splitIndex--;
      continue;
    }
    break;
  }
  if (splitIndex <= 0 || splitIndex === chars.length)
    return null;
  return {
    head: chars.slice(0, splitIndex).join(""),
    tail: chars.slice(splitIndex).join("")
  };
}
function isRepeatedSingleCharRun(segment, ch) {
  if (segment.length === 0)
    return false;
  for (const part of segment) {
    if (part !== ch)
      return false;
  }
  return true;
}
function endsWithArabicNoSpacePunctuation(segment) {
  if (!containsArabicScript(segment) || segment.length === 0)
    return false;
  const lastCodePoint = getLastCodePoint(segment);
  return lastCodePoint !== null && arabicNoSpaceTrailingPunctuation.has(lastCodePoint);
}
function endsWithMyanmarMedialGlue(segment) {
  const lastCodePoint = getLastCodePoint(segment);
  return lastCodePoint !== null && myanmarMedialGlue.has(lastCodePoint);
}
function splitLeadingSpaceAndMarks(segment) {
  if (segment.length < 2 || segment[0] !== " ")
    return null;
  const marks = segment.slice(1);
  if (/^\p{M}+$/u.test(marks)) {
    return { space: " ", marks };
  }
  return null;
}
function endsWithClosingQuote(text) {
  let end = text.length;
  while (end > 0) {
    const start = previousCodePointStart(text, end);
    const ch = text.slice(start, end);
    if (closingQuoteChars.has(ch))
      return true;
    if (!leftStickyPunctuation.has(ch))
      return false;
    end = start;
  }
  return false;
}
function classifySegmentBreakChar(ch, whiteSpaceProfile) {
  if (whiteSpaceProfile.preserveOrdinarySpaces || whiteSpaceProfile.preserveHardBreaks) {
    if (ch === " ")
      return "preserved-space";
    if (ch === "\t")
      return "tab";
    if (whiteSpaceProfile.preserveHardBreaks && ch === `
`)
      return "hard-break";
  }
  if (ch === " ")
    return "space";
  if (ch === " " || ch === " " || ch === "⁠" || ch === "\uFEFF") {
    return "glue";
  }
  if (ch === "​")
    return "zero-width-break";
  if (ch === "­")
    return "soft-hyphen";
  return "text";
}
var breakCharRe = /[\x20\t\n\xA0\xAD\u200B\u202F\u2060\uFEFF]/;
function joinTextParts(parts) {
  return parts.length === 1 ? parts[0] : parts.join("");
}
function splitSegmentByBreakKind(segment, isWordLike, start, whiteSpaceProfile) {
  if (!breakCharRe.test(segment)) {
    return [{ text: segment, isWordLike, kind: "text", start }];
  }
  const pieces = [];
  let currentKind = null;
  let currentTextParts = [];
  let currentStart = start;
  let currentWordLike = false;
  let offset = 0;
  for (const ch of segment) {
    const kind = classifySegmentBreakChar(ch, whiteSpaceProfile);
    const wordLike = kind === "text" && isWordLike;
    if (currentKind !== null && kind === currentKind && wordLike === currentWordLike) {
      currentTextParts.push(ch);
      offset += ch.length;
      continue;
    }
    if (currentKind !== null) {
      pieces.push({
        text: joinTextParts(currentTextParts),
        isWordLike: currentWordLike,
        kind: currentKind,
        start: currentStart
      });
    }
    currentKind = kind;
    currentTextParts = [ch];
    currentStart = start + offset;
    currentWordLike = wordLike;
    offset += ch.length;
  }
  if (currentKind !== null) {
    pieces.push({
      text: joinTextParts(currentTextParts),
      isWordLike: currentWordLike,
      kind: currentKind,
      start: currentStart
    });
  }
  return pieces;
}
function isTextRunBoundary(kind) {
  return kind === "space" || kind === "preserved-space" || kind === "zero-width-break" || kind === "hard-break";
}
var urlSchemeSegmentRe = /^[A-Za-z][A-Za-z0-9+.-]*:$/;
function isUrlLikeRunStart(segmentation, index) {
  const text = segmentation.texts[index];
  if (text.startsWith("www."))
    return true;
  return urlSchemeSegmentRe.test(text) && index + 1 < segmentation.len && segmentation.kinds[index + 1] === "text" && segmentation.texts[index + 1] === "//";
}
function isUrlQueryBoundarySegment(text) {
  return text.includes("?") && (text.includes("://") || text.startsWith("www."));
}
function mergeUrlLikeRuns(segmentation) {
  const texts = segmentation.texts.slice();
  const isWordLike = segmentation.isWordLike.slice();
  const kinds = segmentation.kinds.slice();
  const starts = segmentation.starts.slice();
  for (let i = 0;i < segmentation.len; i++) {
    if (kinds[i] !== "text" || !isUrlLikeRunStart(segmentation, i))
      continue;
    const mergedParts = [texts[i]];
    let j2 = i + 1;
    while (j2 < segmentation.len && !isTextRunBoundary(kinds[j2])) {
      mergedParts.push(texts[j2]);
      isWordLike[i] = true;
      const endsQueryPrefix = texts[j2].includes("?");
      kinds[j2] = "text";
      texts[j2] = "";
      j2++;
      if (endsQueryPrefix)
        break;
    }
    texts[i] = joinTextParts(mergedParts);
  }
  let compactLen = 0;
  for (let read = 0;read < texts.length; read++) {
    const text = texts[read];
    if (text.length === 0)
      continue;
    if (compactLen !== read) {
      texts[compactLen] = text;
      isWordLike[compactLen] = isWordLike[read];
      kinds[compactLen] = kinds[read];
      starts[compactLen] = starts[read];
    }
    compactLen++;
  }
  texts.length = compactLen;
  isWordLike.length = compactLen;
  kinds.length = compactLen;
  starts.length = compactLen;
  return {
    len: compactLen,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function mergeUrlQueryRuns(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  for (let i = 0;i < segmentation.len; i++) {
    const text = segmentation.texts[i];
    texts.push(text);
    isWordLike.push(segmentation.isWordLike[i]);
    kinds.push(segmentation.kinds[i]);
    starts.push(segmentation.starts[i]);
    if (!isUrlQueryBoundarySegment(text))
      continue;
    const nextIndex = i + 1;
    if (nextIndex >= segmentation.len || isTextRunBoundary(segmentation.kinds[nextIndex])) {
      continue;
    }
    const queryParts = [];
    const queryStart = segmentation.starts[nextIndex];
    let j2 = nextIndex;
    while (j2 < segmentation.len && !isTextRunBoundary(segmentation.kinds[j2])) {
      queryParts.push(segmentation.texts[j2]);
      j2++;
    }
    if (queryParts.length > 0) {
      texts.push(joinTextParts(queryParts));
      isWordLike.push(true);
      kinds.push("text");
      starts.push(queryStart);
      i = j2 - 1;
    }
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
var numericJoinerChars = new Set([
  ":",
  "-",
  "/",
  "×",
  ",",
  ".",
  "+",
  "–",
  "—"
]);
var asciiPunctuationChainSegmentRe = /^[A-Za-z0-9_]+[,:;]*$/;
var asciiPunctuationChainTrailingJoinersRe = /[,:;]+$/;
function segmentContainsDecimalDigit(text) {
  for (const ch of text) {
    if (decimalDigitRe.test(ch))
      return true;
  }
  return false;
}
function isNumericRunSegment(text) {
  if (text.length === 0)
    return false;
  for (const ch of text) {
    if (decimalDigitRe.test(ch) || numericJoinerChars.has(ch))
      continue;
    return false;
  }
  return true;
}
function mergeNumericRuns(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  for (let i = 0;i < segmentation.len; i++) {
    const text = segmentation.texts[i];
    const kind = segmentation.kinds[i];
    if (kind === "text" && isNumericRunSegment(text) && segmentContainsDecimalDigit(text)) {
      const mergedParts = [text];
      let j2 = i + 1;
      while (j2 < segmentation.len && segmentation.kinds[j2] === "text" && isNumericRunSegment(segmentation.texts[j2])) {
        mergedParts.push(segmentation.texts[j2]);
        j2++;
      }
      texts.push(joinTextParts(mergedParts));
      isWordLike.push(true);
      kinds.push("text");
      starts.push(segmentation.starts[i]);
      i = j2 - 1;
      continue;
    }
    texts.push(text);
    isWordLike.push(segmentation.isWordLike[i]);
    kinds.push(kind);
    starts.push(segmentation.starts[i]);
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function mergeAsciiPunctuationChains(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  for (let i = 0;i < segmentation.len; i++) {
    const text = segmentation.texts[i];
    const kind = segmentation.kinds[i];
    const wordLike = segmentation.isWordLike[i];
    if (kind === "text" && wordLike && asciiPunctuationChainSegmentRe.test(text)) {
      const mergedParts = [text];
      let endsWithJoiners = asciiPunctuationChainTrailingJoinersRe.test(text);
      let j2 = i + 1;
      while (endsWithJoiners && j2 < segmentation.len && segmentation.kinds[j2] === "text" && segmentation.isWordLike[j2] && asciiPunctuationChainSegmentRe.test(segmentation.texts[j2])) {
        const nextText = segmentation.texts[j2];
        mergedParts.push(nextText);
        endsWithJoiners = asciiPunctuationChainTrailingJoinersRe.test(nextText);
        j2++;
      }
      texts.push(joinTextParts(mergedParts));
      isWordLike.push(true);
      kinds.push("text");
      starts.push(segmentation.starts[i]);
      i = j2 - 1;
      continue;
    }
    texts.push(text);
    isWordLike.push(wordLike);
    kinds.push(kind);
    starts.push(segmentation.starts[i]);
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function splitHyphenatedNumericRuns(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  for (let i = 0;i < segmentation.len; i++) {
    const text = segmentation.texts[i];
    if (segmentation.kinds[i] === "text" && text.includes("-")) {
      const parts = text.split("-");
      let shouldSplit = parts.length > 1;
      for (let j2 = 0;j2 < parts.length; j2++) {
        const part = parts[j2];
        if (!shouldSplit)
          break;
        if (part.length === 0 || !segmentContainsDecimalDigit(part) || !isNumericRunSegment(part)) {
          shouldSplit = false;
        }
      }
      if (shouldSplit) {
        let offset = 0;
        for (let j2 = 0;j2 < parts.length; j2++) {
          const part = parts[j2];
          const splitText = j2 < parts.length - 1 ? `${part}-` : part;
          texts.push(splitText);
          isWordLike.push(true);
          kinds.push("text");
          starts.push(segmentation.starts[i] + offset);
          offset += splitText.length;
        }
        continue;
      }
    }
    texts.push(text);
    isWordLike.push(segmentation.isWordLike[i]);
    kinds.push(segmentation.kinds[i]);
    starts.push(segmentation.starts[i]);
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function mergeGlueConnectedTextRuns(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  let read = 0;
  while (read < segmentation.len) {
    const textParts = [segmentation.texts[read]];
    let wordLike = segmentation.isWordLike[read];
    let kind = segmentation.kinds[read];
    let start = segmentation.starts[read];
    if (kind === "glue") {
      const glueParts = [textParts[0]];
      const glueStart = start;
      read++;
      while (read < segmentation.len && segmentation.kinds[read] === "glue") {
        glueParts.push(segmentation.texts[read]);
        read++;
      }
      const glueText = joinTextParts(glueParts);
      if (read < segmentation.len && segmentation.kinds[read] === "text") {
        textParts[0] = glueText;
        textParts.push(segmentation.texts[read]);
        wordLike = segmentation.isWordLike[read];
        kind = "text";
        start = glueStart;
        read++;
      } else {
        texts.push(glueText);
        isWordLike.push(false);
        kinds.push("glue");
        starts.push(glueStart);
        continue;
      }
    } else {
      read++;
    }
    if (kind === "text") {
      while (read < segmentation.len && segmentation.kinds[read] === "glue") {
        const glueParts = [];
        while (read < segmentation.len && segmentation.kinds[read] === "glue") {
          glueParts.push(segmentation.texts[read]);
          read++;
        }
        const glueText = joinTextParts(glueParts);
        if (read < segmentation.len && segmentation.kinds[read] === "text") {
          textParts.push(glueText, segmentation.texts[read]);
          wordLike = wordLike || segmentation.isWordLike[read];
          read++;
          continue;
        }
        textParts.push(glueText);
      }
    }
    texts.push(joinTextParts(textParts));
    isWordLike.push(wordLike);
    kinds.push(kind);
    starts.push(start);
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function carryTrailingForwardStickyAcrossCJKBoundary(segmentation) {
  const texts = segmentation.texts.slice();
  const isWordLike = segmentation.isWordLike.slice();
  const kinds = segmentation.kinds.slice();
  const starts = segmentation.starts.slice();
  for (let i = 0;i < texts.length - 1; i++) {
    if (kinds[i] !== "text" || kinds[i + 1] !== "text")
      continue;
    if (!isCJK(texts[i]) || !isCJK(texts[i + 1]))
      continue;
    const split = splitTrailingForwardStickyCluster(texts[i]);
    if (split === null)
      continue;
    texts[i] = split.head;
    texts[i + 1] = split.tail + texts[i + 1];
    starts[i + 1] = starts[i] + split.head.length;
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function buildMergedSegmentation(normalized, profile, whiteSpaceProfile) {
  const wordSegmenter = getSharedWordSegmenter();
  let mergedLen = 0;
  const mergedTexts = [];
  const mergedWordLike = [];
  const mergedKinds = [];
  const mergedStarts = [];
  for (const s of wordSegmenter.segment(normalized)) {
    for (const piece of splitSegmentByBreakKind(s.segment, s.isWordLike ?? false, s.index, whiteSpaceProfile)) {
      const isText = piece.kind === "text";
      if (profile.carryCJKAfterClosingQuote && isText && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && isCJK(piece.text) && isCJK(mergedTexts[mergedLen - 1]) && endsWithClosingQuote(mergedTexts[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
        mergedWordLike[mergedLen - 1] = mergedWordLike[mergedLen - 1] || piece.isWordLike;
      } else if (isText && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && isCJKLineStartProhibitedSegment(piece.text) && isCJK(mergedTexts[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
        mergedWordLike[mergedLen - 1] = mergedWordLike[mergedLen - 1] || piece.isWordLike;
      } else if (isText && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && endsWithMyanmarMedialGlue(mergedTexts[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
        mergedWordLike[mergedLen - 1] = mergedWordLike[mergedLen - 1] || piece.isWordLike;
      } else if (isText && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && piece.isWordLike && containsArabicScript(piece.text) && endsWithArabicNoSpacePunctuation(mergedTexts[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
        mergedWordLike[mergedLen - 1] = true;
      } else if (isText && !piece.isWordLike && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && piece.text.length === 1 && piece.text !== "-" && piece.text !== "—" && isRepeatedSingleCharRun(mergedTexts[mergedLen - 1], piece.text)) {
        mergedTexts[mergedLen - 1] += piece.text;
      } else if (isText && !piece.isWordLike && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && (isLeftStickyPunctuationSegment(piece.text) || piece.text === "-" && mergedWordLike[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
      } else {
        mergedTexts[mergedLen] = piece.text;
        mergedWordLike[mergedLen] = piece.isWordLike;
        mergedKinds[mergedLen] = piece.kind;
        mergedStarts[mergedLen] = piece.start;
        mergedLen++;
      }
    }
  }
  for (let i = 1;i < mergedLen; i++) {
    if (mergedKinds[i] === "text" && !mergedWordLike[i] && isEscapedQuoteClusterSegment(mergedTexts[i]) && mergedKinds[i - 1] === "text") {
      mergedTexts[i - 1] += mergedTexts[i];
      mergedWordLike[i - 1] = mergedWordLike[i - 1] || mergedWordLike[i];
      mergedTexts[i] = "";
    }
  }
  for (let i = mergedLen - 2;i >= 0; i--) {
    if (mergedKinds[i] === "text" && !mergedWordLike[i] && isForwardStickyClusterSegment(mergedTexts[i])) {
      let j2 = i + 1;
      while (j2 < mergedLen && mergedTexts[j2] === "")
        j2++;
      if (j2 < mergedLen && mergedKinds[j2] === "text") {
        mergedTexts[j2] = mergedTexts[i] + mergedTexts[j2];
        mergedStarts[j2] = mergedStarts[i];
        mergedTexts[i] = "";
      }
    }
  }
  let compactLen = 0;
  for (let read = 0;read < mergedLen; read++) {
    const text = mergedTexts[read];
    if (text.length === 0)
      continue;
    if (compactLen !== read) {
      mergedTexts[compactLen] = text;
      mergedWordLike[compactLen] = mergedWordLike[read];
      mergedKinds[compactLen] = mergedKinds[read];
      mergedStarts[compactLen] = mergedStarts[read];
    }
    compactLen++;
  }
  mergedTexts.length = compactLen;
  mergedWordLike.length = compactLen;
  mergedKinds.length = compactLen;
  mergedStarts.length = compactLen;
  const compacted = mergeGlueConnectedTextRuns({
    len: compactLen,
    texts: mergedTexts,
    isWordLike: mergedWordLike,
    kinds: mergedKinds,
    starts: mergedStarts
  });
  const withMergedUrls = carryTrailingForwardStickyAcrossCJKBoundary(mergeAsciiPunctuationChains(splitHyphenatedNumericRuns(mergeNumericRuns(mergeUrlQueryRuns(mergeUrlLikeRuns(compacted))))));
  for (let i = 0;i < withMergedUrls.len - 1; i++) {
    const split = splitLeadingSpaceAndMarks(withMergedUrls.texts[i]);
    if (split === null)
      continue;
    if (withMergedUrls.kinds[i] !== "space" && withMergedUrls.kinds[i] !== "preserved-space" || withMergedUrls.kinds[i + 1] !== "text" || !containsArabicScript(withMergedUrls.texts[i + 1])) {
      continue;
    }
    withMergedUrls.texts[i] = split.space;
    withMergedUrls.isWordLike[i] = false;
    withMergedUrls.kinds[i] = withMergedUrls.kinds[i] === "preserved-space" ? "preserved-space" : "space";
    withMergedUrls.texts[i + 1] = split.marks + withMergedUrls.texts[i + 1];
    withMergedUrls.starts[i + 1] = withMergedUrls.starts[i] + split.space.length;
  }
  return withMergedUrls;
}
function compileAnalysisChunks(segmentation, whiteSpaceProfile) {
  if (segmentation.len === 0)
    return [];
  if (!whiteSpaceProfile.preserveHardBreaks) {
    return [{
      startSegmentIndex: 0,
      endSegmentIndex: segmentation.len,
      consumedEndSegmentIndex: segmentation.len
    }];
  }
  const chunks = [];
  let startSegmentIndex = 0;
  for (let i = 0;i < segmentation.len; i++) {
    if (segmentation.kinds[i] !== "hard-break")
      continue;
    chunks.push({
      startSegmentIndex,
      endSegmentIndex: i,
      consumedEndSegmentIndex: i + 1
    });
    startSegmentIndex = i + 1;
  }
  if (startSegmentIndex < segmentation.len) {
    chunks.push({
      startSegmentIndex,
      endSegmentIndex: segmentation.len,
      consumedEndSegmentIndex: segmentation.len
    });
  }
  return chunks;
}
function mergeKeepAllTextSegments(segmentation) {
  if (segmentation.len <= 1)
    return segmentation;
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  for (let i = 0;i < segmentation.len; i++) {
    const text = segmentation.texts[i];
    const kind = segmentation.kinds[i];
    const wordLike = segmentation.isWordLike[i];
    const start = segmentation.starts[i];
    const previousIndex = texts.length - 1;
    if (kind === "text" && previousIndex >= 0 && kinds[previousIndex] === "text" && canContinueKeepAllTextRun(texts[previousIndex]) && containsCJKText(texts[previousIndex])) {
      texts[previousIndex] += text;
      isWordLike[previousIndex] = isWordLike[previousIndex] || wordLike;
      continue;
    }
    texts.push(text);
    isWordLike.push(wordLike);
    kinds.push(kind);
    starts.push(start);
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function analyzeText(text, profile, whiteSpace = "normal", wordBreak = "normal") {
  const whiteSpaceProfile = getWhiteSpaceProfile(whiteSpace);
  const normalized = whiteSpaceProfile.mode === "pre-wrap" ? normalizeWhitespacePreWrap(text) : normalizeWhitespaceNormal(text);
  if (normalized.length === 0) {
    return {
      normalized,
      chunks: [],
      len: 0,
      texts: [],
      isWordLike: [],
      kinds: [],
      starts: []
    };
  }
  const segmentation = wordBreak === "keep-all" ? mergeKeepAllTextSegments(buildMergedSegmentation(normalized, profile, whiteSpaceProfile)) : buildMergedSegmentation(normalized, profile, whiteSpaceProfile);
  return {
    normalized,
    chunks: compileAnalysisChunks(segmentation, whiteSpaceProfile),
    ...segmentation
  };
}

// src/measurement.ts
var measureContext = null;
var segmentMetricCaches = new Map;
var cachedEngineProfile = null;
var emojiPresentationRe = /\p{Emoji_Presentation}/u;
var maybeEmojiRe = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u20E3]/u;
var sharedGraphemeSegmenter = null;
var emojiCorrectionCache = new Map;
function getMeasureContext() {
  if (measureContext !== null)
    return measureContext;
  if (typeof OffscreenCanvas !== "undefined") {
    measureContext = new OffscreenCanvas(1, 1).getContext("2d");
    return measureContext;
  }
  if (typeof document !== "undefined") {
    measureContext = document.createElement("canvas").getContext("2d");
    return measureContext;
  }
  throw new Error("Text measurement requires OffscreenCanvas or a DOM canvas context.");
}
function getSegmentMetricCache(font) {
  let cache = segmentMetricCaches.get(font);
  if (!cache) {
    cache = new Map;
    segmentMetricCaches.set(font, cache);
  }
  return cache;
}
function getSegmentMetrics(seg, cache) {
  let metrics = cache.get(seg);
  if (metrics === undefined) {
    const ctx = getMeasureContext();
    metrics = {
      width: ctx.measureText(seg).width,
      containsCJK: isCJK(seg)
    };
    cache.set(seg, metrics);
  }
  return metrics;
}
function getEngineProfile() {
  if (cachedEngineProfile !== null)
    return cachedEngineProfile;
  if (typeof navigator === "undefined") {
    cachedEngineProfile = {
      lineFitEpsilon: 0.005,
      carryCJKAfterClosingQuote: false,
      preferPrefixWidthsForBreakableRuns: false,
      preferEarlySoftHyphenBreak: false
    };
    return cachedEngineProfile;
  }
  const ua = navigator.userAgent;
  const vendor = navigator.vendor;
  const isSafari = vendor === "Apple Computer, Inc." && ua.includes("Safari/") && !ua.includes("Chrome/") && !ua.includes("Chromium/") && !ua.includes("CriOS/") && !ua.includes("FxiOS/") && !ua.includes("EdgiOS/");
  const isChromium = ua.includes("Chrome/") || ua.includes("Chromium/") || ua.includes("CriOS/") || ua.includes("Edg/");
  cachedEngineProfile = {
    lineFitEpsilon: isSafari ? 1 / 64 : 0.005,
    carryCJKAfterClosingQuote: isChromium,
    preferPrefixWidthsForBreakableRuns: isSafari,
    preferEarlySoftHyphenBreak: isSafari
  };
  return cachedEngineProfile;
}
function parseFontSize(font) {
  const m2 = font.match(/(\d+(?:\.\d+)?)\s*px/);
  return m2 ? parseFloat(m2[1]) : 16;
}
function getSharedGraphemeSegmenter() {
  if (sharedGraphemeSegmenter === null) {
    sharedGraphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  }
  return sharedGraphemeSegmenter;
}
function isEmojiGrapheme(g2) {
  return emojiPresentationRe.test(g2) || g2.includes("️");
}
function textMayContainEmoji(text) {
  return maybeEmojiRe.test(text);
}
function getEmojiCorrection(font, fontSize) {
  let correction = emojiCorrectionCache.get(font);
  if (correction !== undefined)
    return correction;
  const ctx = getMeasureContext();
  ctx.font = font;
  const canvasW = ctx.measureText("\uD83D\uDE00").width;
  correction = 0;
  if (canvasW > fontSize + 0.5 && typeof document !== "undefined" && document.body !== null) {
    const span = document.createElement("span");
    span.style.font = font;
    span.style.display = "inline-block";
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.textContent = "\uD83D\uDE00";
    document.body.appendChild(span);
    const domW = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    if (canvasW - domW > 0.5) {
      correction = canvasW - domW;
    }
  }
  emojiCorrectionCache.set(font, correction);
  return correction;
}
function countEmojiGraphemes(text) {
  let count = 0;
  const graphemeSegmenter = getSharedGraphemeSegmenter();
  for (const g2 of graphemeSegmenter.segment(text)) {
    if (isEmojiGrapheme(g2.segment))
      count++;
  }
  return count;
}
function getEmojiCount(seg, metrics) {
  if (metrics.emojiCount === undefined) {
    metrics.emojiCount = countEmojiGraphemes(seg);
  }
  return metrics.emojiCount;
}
function getCorrectedSegmentWidth(seg, metrics, emojiCorrection) {
  if (emojiCorrection === 0)
    return metrics.width;
  return metrics.width - getEmojiCount(seg, metrics) * emojiCorrection;
}
function getSegmentGraphemeWidths(seg, metrics, cache, emojiCorrection) {
  if (metrics.graphemeWidths !== undefined)
    return metrics.graphemeWidths;
  const widths = [];
  const graphemeSegmenter = getSharedGraphemeSegmenter();
  for (const gs of graphemeSegmenter.segment(seg)) {
    const graphemeMetrics = getSegmentMetrics(gs.segment, cache);
    widths.push(getCorrectedSegmentWidth(gs.segment, graphemeMetrics, emojiCorrection));
  }
  metrics.graphemeWidths = widths.length > 1 ? widths : null;
  return metrics.graphemeWidths;
}
function getSegmentGraphemePrefixWidths(seg, metrics, cache, emojiCorrection) {
  if (metrics.graphemePrefixWidths !== undefined)
    return metrics.graphemePrefixWidths;
  const prefixWidths = [];
  const graphemeSegmenter = getSharedGraphemeSegmenter();
  let prefix = "";
  for (const gs of graphemeSegmenter.segment(seg)) {
    prefix += gs.segment;
    const prefixMetrics = getSegmentMetrics(prefix, cache);
    prefixWidths.push(getCorrectedSegmentWidth(prefix, prefixMetrics, emojiCorrection));
  }
  metrics.graphemePrefixWidths = prefixWidths.length > 1 ? prefixWidths : null;
  return metrics.graphemePrefixWidths;
}
function getFontMeasurementState(font, needsEmojiCorrection) {
  const ctx = getMeasureContext();
  ctx.font = font;
  const cache = getSegmentMetricCache(font);
  const fontSize = parseFontSize(font);
  const emojiCorrection = needsEmojiCorrection ? getEmojiCorrection(font, fontSize) : 0;
  return { cache, fontSize, emojiCorrection };
}

// src/line-break.ts
function normalizeSimpleLineStartSegmentIndex(prepared, segmentIndex) {
  while (segmentIndex < prepared.widths.length) {
    const kind = prepared.kinds[segmentIndex];
    if (kind !== "space" && kind !== "zero-width-break" && kind !== "soft-hyphen")
      break;
    segmentIndex++;
  }
  return segmentIndex;
}
function getTabAdvance(lineWidth, tabStopAdvance) {
  if (tabStopAdvance <= 0)
    return 0;
  const remainder = lineWidth % tabStopAdvance;
  if (Math.abs(remainder) <= 0.000001)
    return tabStopAdvance;
  return tabStopAdvance - remainder;
}
function fitSoftHyphenBreak(graphemeWidths, initialWidth, maxWidth, lineFitEpsilon, discretionaryHyphenWidth, cumulativeWidths) {
  let fitCount = 0;
  let fittedWidth = initialWidth;
  while (fitCount < graphemeWidths.length) {
    const nextWidth = cumulativeWidths ? initialWidth + graphemeWidths[fitCount] : fittedWidth + graphemeWidths[fitCount];
    const nextLineWidth = fitCount + 1 < graphemeWidths.length ? nextWidth + discretionaryHyphenWidth : nextWidth;
    if (nextLineWidth > maxWidth + lineFitEpsilon)
      break;
    fittedWidth = nextWidth;
    fitCount++;
  }
  return { fitCount, fittedWidth };
}
function findChunkIndexForStart(prepared, segmentIndex) {
  let lo = 0;
  let hi = prepared.chunks.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (segmentIndex < prepared.chunks[mid].consumedEndSegmentIndex) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo < prepared.chunks.length ? lo : -1;
}
function normalizeLineStartInChunk(prepared, chunkIndex, cursor) {
  let segmentIndex = cursor.segmentIndex;
  if (cursor.graphemeIndex > 0)
    return chunkIndex;
  const chunk = prepared.chunks[chunkIndex];
  if (chunk.startSegmentIndex === chunk.endSegmentIndex && segmentIndex === chunk.startSegmentIndex) {
    cursor.segmentIndex = segmentIndex;
    cursor.graphemeIndex = 0;
    return chunkIndex;
  }
  if (segmentIndex < chunk.startSegmentIndex)
    segmentIndex = chunk.startSegmentIndex;
  while (segmentIndex < chunk.endSegmentIndex) {
    const kind = prepared.kinds[segmentIndex];
    if (kind !== "space" && kind !== "zero-width-break" && kind !== "soft-hyphen") {
      cursor.segmentIndex = segmentIndex;
      cursor.graphemeIndex = 0;
      return chunkIndex;
    }
    segmentIndex++;
  }
  if (chunk.consumedEndSegmentIndex >= prepared.widths.length)
    return -1;
  cursor.segmentIndex = chunk.consumedEndSegmentIndex;
  cursor.graphemeIndex = 0;
  return chunkIndex + 1;
}
function normalizeLineStartChunkIndex(prepared, cursor) {
  if (cursor.segmentIndex >= prepared.widths.length)
    return -1;
  const chunkIndex = findChunkIndexForStart(prepared, cursor.segmentIndex);
  if (chunkIndex < 0)
    return -1;
  return normalizeLineStartInChunk(prepared, chunkIndex, cursor);
}
function normalizeLineStartChunkIndexFromHint(prepared, chunkIndex, cursor) {
  if (cursor.segmentIndex >= prepared.widths.length)
    return -1;
  let nextChunkIndex = chunkIndex;
  while (nextChunkIndex < prepared.chunks.length && cursor.segmentIndex >= prepared.chunks[nextChunkIndex].consumedEndSegmentIndex) {
    nextChunkIndex++;
  }
  if (nextChunkIndex >= prepared.chunks.length)
    return -1;
  return normalizeLineStartInChunk(prepared, nextChunkIndex, cursor);
}
function countPreparedLines(prepared, maxWidth) {
  if (prepared.simpleLineWalkFastPath) {
    return walkPreparedLinesSimple(prepared, maxWidth);
  }
  return walkPreparedLines(prepared, maxWidth);
}
function walkPreparedLinesSimple(prepared, maxWidth, onLine) {
  const { widths, kinds, breakableWidths, breakablePrefixWidths } = prepared;
  if (widths.length === 0)
    return 0;
  const engineProfile = getEngineProfile();
  const lineFitEpsilon = engineProfile.lineFitEpsilon;
  const fitLimit = maxWidth + lineFitEpsilon;
  let lineCount = 0;
  let lineW = 0;
  let hasContent = false;
  let lineStartSegmentIndex = 0;
  let lineStartGraphemeIndex = 0;
  let lineEndSegmentIndex = 0;
  let lineEndGraphemeIndex = 0;
  let pendingBreakSegmentIndex = -1;
  let pendingBreakPaintWidth = 0;
  function clearPendingBreak() {
    pendingBreakSegmentIndex = -1;
    pendingBreakPaintWidth = 0;
  }
  function emitCurrentLine(endSegmentIndex = lineEndSegmentIndex, endGraphemeIndex = lineEndGraphemeIndex, width = lineW) {
    lineCount++;
    onLine?.({
      startSegmentIndex: lineStartSegmentIndex,
      startGraphemeIndex: lineStartGraphemeIndex,
      endSegmentIndex,
      endGraphemeIndex,
      width
    });
    lineW = 0;
    hasContent = false;
    clearPendingBreak();
  }
  function startLineAtSegment(segmentIndex, width) {
    hasContent = true;
    lineStartSegmentIndex = segmentIndex;
    lineStartGraphemeIndex = 0;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
    lineW = width;
  }
  function startLineAtGrapheme(segmentIndex, graphemeIndex, width) {
    hasContent = true;
    lineStartSegmentIndex = segmentIndex;
    lineStartGraphemeIndex = graphemeIndex;
    lineEndSegmentIndex = segmentIndex;
    lineEndGraphemeIndex = graphemeIndex + 1;
    lineW = width;
  }
  function appendWholeSegment(segmentIndex, width) {
    if (!hasContent) {
      startLineAtSegment(segmentIndex, width);
      return;
    }
    lineW += width;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
  }
  function appendBreakableSegmentFrom(segmentIndex, startGraphemeIndex) {
    const gWidths = breakableWidths[segmentIndex];
    const gPrefixWidths = breakablePrefixWidths[segmentIndex] ?? null;
    let previousPrefixWidth = gPrefixWidths === null || startGraphemeIndex === 0 ? 0 : gPrefixWidths[startGraphemeIndex - 1];
    for (let g2 = startGraphemeIndex;g2 < gWidths.length; g2++) {
      const gw = gPrefixWidths === null ? gWidths[g2] : gPrefixWidths[g2] - previousPrefixWidth;
      if (!hasContent) {
        startLineAtGrapheme(segmentIndex, g2, gw);
      } else if (lineW + gw > fitLimit) {
        emitCurrentLine();
        startLineAtGrapheme(segmentIndex, g2, gw);
      } else {
        lineW += gw;
        lineEndSegmentIndex = segmentIndex;
        lineEndGraphemeIndex = g2 + 1;
      }
      if (gPrefixWidths !== null)
        previousPrefixWidth = gPrefixWidths[g2];
    }
    if (hasContent && lineEndSegmentIndex === segmentIndex && lineEndGraphemeIndex === gWidths.length) {
      lineEndSegmentIndex = segmentIndex + 1;
      lineEndGraphemeIndex = 0;
    }
  }
  let i = 0;
  while (i < widths.length) {
    if (!hasContent) {
      i = normalizeSimpleLineStartSegmentIndex(prepared, i);
      if (i >= widths.length)
        break;
    }
    const w2 = widths[i];
    const kind = kinds[i];
    const breakAfter = kind === "space" || kind === "preserved-space" || kind === "tab" || kind === "zero-width-break" || kind === "soft-hyphen";
    if (!hasContent) {
      if (w2 > maxWidth && breakableWidths[i] !== null) {
        appendBreakableSegmentFrom(i, 0);
      } else {
        startLineAtSegment(i, w2);
      }
      if (breakAfter) {
        pendingBreakSegmentIndex = i + 1;
        pendingBreakPaintWidth = lineW - w2;
      }
      i++;
      continue;
    }
    const newW = lineW + w2;
    if (newW > fitLimit) {
      if (breakAfter) {
        appendWholeSegment(i, w2);
        emitCurrentLine(i + 1, 0, lineW - w2);
        i++;
        continue;
      }
      if (pendingBreakSegmentIndex >= 0) {
        if (lineEndSegmentIndex > pendingBreakSegmentIndex || lineEndSegmentIndex === pendingBreakSegmentIndex && lineEndGraphemeIndex > 0) {
          emitCurrentLine();
          continue;
        }
        emitCurrentLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
        continue;
      }
      if (w2 > maxWidth && breakableWidths[i] !== null) {
        emitCurrentLine();
        appendBreakableSegmentFrom(i, 0);
        i++;
        continue;
      }
      emitCurrentLine();
      continue;
    }
    appendWholeSegment(i, w2);
    if (breakAfter) {
      pendingBreakSegmentIndex = i + 1;
      pendingBreakPaintWidth = lineW - w2;
    }
    i++;
  }
  if (hasContent)
    emitCurrentLine();
  return lineCount;
}
function walkPreparedLines(prepared, maxWidth, onLine) {
  if (prepared.simpleLineWalkFastPath) {
    return walkPreparedLinesSimple(prepared, maxWidth, onLine);
  }
  const {
    widths,
    lineEndFitAdvances,
    lineEndPaintAdvances,
    kinds,
    breakableWidths,
    breakablePrefixWidths,
    discretionaryHyphenWidth,
    tabStopAdvance,
    chunks
  } = prepared;
  if (widths.length === 0 || chunks.length === 0)
    return 0;
  const engineProfile = getEngineProfile();
  const lineFitEpsilon = engineProfile.lineFitEpsilon;
  const fitLimit = maxWidth + lineFitEpsilon;
  let lineCount = 0;
  let lineW = 0;
  let hasContent = false;
  let lineStartSegmentIndex = 0;
  let lineStartGraphemeIndex = 0;
  let lineEndSegmentIndex = 0;
  let lineEndGraphemeIndex = 0;
  let pendingBreakSegmentIndex = -1;
  let pendingBreakFitWidth = 0;
  let pendingBreakPaintWidth = 0;
  let pendingBreakKind = null;
  function clearPendingBreak() {
    pendingBreakSegmentIndex = -1;
    pendingBreakFitWidth = 0;
    pendingBreakPaintWidth = 0;
    pendingBreakKind = null;
  }
  function emitCurrentLine(endSegmentIndex = lineEndSegmentIndex, endGraphemeIndex = lineEndGraphemeIndex, width = lineW) {
    lineCount++;
    onLine?.({
      startSegmentIndex: lineStartSegmentIndex,
      startGraphemeIndex: lineStartGraphemeIndex,
      endSegmentIndex,
      endGraphemeIndex,
      width
    });
    lineW = 0;
    hasContent = false;
    clearPendingBreak();
  }
  function startLineAtSegment(segmentIndex, width) {
    hasContent = true;
    lineStartSegmentIndex = segmentIndex;
    lineStartGraphemeIndex = 0;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
    lineW = width;
  }
  function startLineAtGrapheme(segmentIndex, graphemeIndex, width) {
    hasContent = true;
    lineStartSegmentIndex = segmentIndex;
    lineStartGraphemeIndex = graphemeIndex;
    lineEndSegmentIndex = segmentIndex;
    lineEndGraphemeIndex = graphemeIndex + 1;
    lineW = width;
  }
  function appendWholeSegment(segmentIndex, width) {
    if (!hasContent) {
      startLineAtSegment(segmentIndex, width);
      return;
    }
    lineW += width;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
  }
  function updatePendingBreakForWholeSegment(kind, breakAfter, segmentIndex, segmentWidth) {
    if (!breakAfter)
      return;
    const fitAdvance = kind === "tab" ? 0 : lineEndFitAdvances[segmentIndex];
    const paintAdvance = kind === "tab" ? segmentWidth : lineEndPaintAdvances[segmentIndex];
    pendingBreakSegmentIndex = segmentIndex + 1;
    pendingBreakFitWidth = lineW - segmentWidth + fitAdvance;
    pendingBreakPaintWidth = lineW - segmentWidth + paintAdvance;
    pendingBreakKind = kind;
  }
  function appendBreakableSegmentFrom(segmentIndex, startGraphemeIndex) {
    const gWidths = breakableWidths[segmentIndex];
    const gPrefixWidths = breakablePrefixWidths[segmentIndex] ?? null;
    let previousPrefixWidth = gPrefixWidths === null || startGraphemeIndex === 0 ? 0 : gPrefixWidths[startGraphemeIndex - 1];
    for (let g2 = startGraphemeIndex;g2 < gWidths.length; g2++) {
      const gw = gPrefixWidths === null ? gWidths[g2] : gPrefixWidths[g2] - previousPrefixWidth;
      if (!hasContent) {
        startLineAtGrapheme(segmentIndex, g2, gw);
      } else if (lineW + gw > fitLimit) {
        emitCurrentLine();
        startLineAtGrapheme(segmentIndex, g2, gw);
      } else {
        lineW += gw;
        lineEndSegmentIndex = segmentIndex;
        lineEndGraphemeIndex = g2 + 1;
      }
      if (gPrefixWidths !== null)
        previousPrefixWidth = gPrefixWidths[g2];
    }
    if (hasContent && lineEndSegmentIndex === segmentIndex && lineEndGraphemeIndex === gWidths.length) {
      lineEndSegmentIndex = segmentIndex + 1;
      lineEndGraphemeIndex = 0;
    }
  }
  function continueSoftHyphenBreakableSegment(segmentIndex) {
    if (pendingBreakKind !== "soft-hyphen")
      return false;
    const gWidths = breakableWidths[segmentIndex];
    if (gWidths === null)
      return false;
    const fitWidths = breakablePrefixWidths[segmentIndex] ?? gWidths;
    const usesPrefixWidths = fitWidths !== gWidths;
    const { fitCount, fittedWidth } = fitSoftHyphenBreak(fitWidths, lineW, maxWidth, lineFitEpsilon, discretionaryHyphenWidth, usesPrefixWidths);
    if (fitCount === 0)
      return false;
    lineW = fittedWidth;
    lineEndSegmentIndex = segmentIndex;
    lineEndGraphemeIndex = fitCount;
    clearPendingBreak();
    if (fitCount === gWidths.length) {
      lineEndSegmentIndex = segmentIndex + 1;
      lineEndGraphemeIndex = 0;
      return true;
    }
    emitCurrentLine(segmentIndex, fitCount, fittedWidth + discretionaryHyphenWidth);
    appendBreakableSegmentFrom(segmentIndex, fitCount);
    return true;
  }
  function emitEmptyChunk(chunk) {
    lineCount++;
    onLine?.({
      startSegmentIndex: chunk.startSegmentIndex,
      startGraphemeIndex: 0,
      endSegmentIndex: chunk.consumedEndSegmentIndex,
      endGraphemeIndex: 0,
      width: 0
    });
    clearPendingBreak();
  }
  for (let chunkIndex = 0;chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    if (chunk.startSegmentIndex === chunk.endSegmentIndex) {
      emitEmptyChunk(chunk);
      continue;
    }
    hasContent = false;
    lineW = 0;
    lineStartSegmentIndex = chunk.startSegmentIndex;
    lineStartGraphemeIndex = 0;
    lineEndSegmentIndex = chunk.startSegmentIndex;
    lineEndGraphemeIndex = 0;
    clearPendingBreak();
    let i = chunk.startSegmentIndex;
    while (i < chunk.endSegmentIndex) {
      const kind = kinds[i];
      const breakAfter = kind === "space" || kind === "preserved-space" || kind === "tab" || kind === "zero-width-break" || kind === "soft-hyphen";
      const w2 = kind === "tab" ? getTabAdvance(lineW, tabStopAdvance) : widths[i];
      if (kind === "soft-hyphen") {
        if (hasContent) {
          lineEndSegmentIndex = i + 1;
          lineEndGraphemeIndex = 0;
          pendingBreakSegmentIndex = i + 1;
          pendingBreakFitWidth = lineW + discretionaryHyphenWidth;
          pendingBreakPaintWidth = lineW + discretionaryHyphenWidth;
          pendingBreakKind = kind;
        }
        i++;
        continue;
      }
      if (!hasContent) {
        if (w2 > maxWidth && breakableWidths[i] !== null) {
          appendBreakableSegmentFrom(i, 0);
        } else {
          startLineAtSegment(i, w2);
        }
        updatePendingBreakForWholeSegment(kind, breakAfter, i, w2);
        i++;
        continue;
      }
      const newW = lineW + w2;
      if (newW > fitLimit) {
        const currentBreakFitWidth = lineW + (kind === "tab" ? 0 : lineEndFitAdvances[i]);
        const currentBreakPaintWidth = lineW + (kind === "tab" ? w2 : lineEndPaintAdvances[i]);
        if (pendingBreakKind === "soft-hyphen" && engineProfile.preferEarlySoftHyphenBreak && pendingBreakFitWidth <= fitLimit) {
          emitCurrentLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
          continue;
        }
        if (pendingBreakKind === "soft-hyphen" && continueSoftHyphenBreakableSegment(i)) {
          i++;
          continue;
        }
        if (breakAfter && currentBreakFitWidth <= fitLimit) {
          appendWholeSegment(i, w2);
          emitCurrentLine(i + 1, 0, currentBreakPaintWidth);
          i++;
          continue;
        }
        if (pendingBreakSegmentIndex >= 0 && pendingBreakFitWidth <= fitLimit) {
          if (lineEndSegmentIndex > pendingBreakSegmentIndex || lineEndSegmentIndex === pendingBreakSegmentIndex && lineEndGraphemeIndex > 0) {
            emitCurrentLine();
            continue;
          }
          const nextSegmentIndex = pendingBreakSegmentIndex;
          emitCurrentLine(nextSegmentIndex, 0, pendingBreakPaintWidth);
          i = nextSegmentIndex;
          continue;
        }
        if (w2 > maxWidth && breakableWidths[i] !== null) {
          emitCurrentLine();
          appendBreakableSegmentFrom(i, 0);
          i++;
          continue;
        }
        emitCurrentLine();
        continue;
      }
      appendWholeSegment(i, w2);
      updatePendingBreakForWholeSegment(kind, breakAfter, i, w2);
      i++;
    }
    if (hasContent) {
      const finalPaintWidth = pendingBreakSegmentIndex === chunk.consumedEndSegmentIndex ? pendingBreakPaintWidth : lineW;
      emitCurrentLine(chunk.consumedEndSegmentIndex, 0, finalPaintWidth);
    }
  }
  return lineCount;
}
function stepPreparedChunkLineGeometry(prepared, cursor, chunkIndex, maxWidth) {
  const chunk = prepared.chunks[chunkIndex];
  if (chunk.startSegmentIndex === chunk.endSegmentIndex) {
    cursor.segmentIndex = chunk.consumedEndSegmentIndex;
    cursor.graphemeIndex = 0;
    return 0;
  }
  const {
    widths,
    lineEndFitAdvances,
    lineEndPaintAdvances,
    kinds,
    breakableWidths,
    breakablePrefixWidths,
    discretionaryHyphenWidth,
    tabStopAdvance
  } = prepared;
  const engineProfile = getEngineProfile();
  const lineFitEpsilon = engineProfile.lineFitEpsilon;
  const fitLimit = maxWidth + lineFitEpsilon;
  let lineW = 0;
  let hasContent = false;
  let lineEndSegmentIndex = cursor.segmentIndex;
  let lineEndGraphemeIndex = cursor.graphemeIndex;
  let pendingBreakSegmentIndex = -1;
  let pendingBreakFitWidth = 0;
  let pendingBreakPaintWidth = 0;
  let pendingBreakKind = null;
  function clearPendingBreak() {
    pendingBreakSegmentIndex = -1;
    pendingBreakFitWidth = 0;
    pendingBreakPaintWidth = 0;
    pendingBreakKind = null;
  }
  function finishLine(endSegmentIndex = lineEndSegmentIndex, endGraphemeIndex = lineEndGraphemeIndex, width = lineW) {
    if (!hasContent)
      return null;
    cursor.segmentIndex = endSegmentIndex;
    cursor.graphemeIndex = endGraphemeIndex;
    return width;
  }
  function startLineAtSegment(segmentIndex, width) {
    hasContent = true;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
    lineW = width;
  }
  function startLineAtGrapheme(segmentIndex, graphemeIndex, width) {
    hasContent = true;
    lineEndSegmentIndex = segmentIndex;
    lineEndGraphemeIndex = graphemeIndex + 1;
    lineW = width;
  }
  function appendWholeSegment(segmentIndex, width) {
    if (!hasContent) {
      startLineAtSegment(segmentIndex, width);
      return;
    }
    lineW += width;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
  }
  function updatePendingBreakForWholeSegment(kind, breakAfter, segmentIndex, segmentWidth) {
    if (!breakAfter)
      return;
    const fitAdvance = kind === "tab" ? 0 : lineEndFitAdvances[segmentIndex];
    const paintAdvance = kind === "tab" ? segmentWidth : lineEndPaintAdvances[segmentIndex];
    pendingBreakSegmentIndex = segmentIndex + 1;
    pendingBreakFitWidth = lineW - segmentWidth + fitAdvance;
    pendingBreakPaintWidth = lineW - segmentWidth + paintAdvance;
    pendingBreakKind = kind;
  }
  function appendBreakableSegmentFrom(segmentIndex, startGraphemeIndex) {
    const gWidths = breakableWidths[segmentIndex];
    const gPrefixWidths = breakablePrefixWidths[segmentIndex] ?? null;
    let previousPrefixWidth = gPrefixWidths === null || startGraphemeIndex === 0 ? 0 : gPrefixWidths[startGraphemeIndex - 1];
    for (let g2 = startGraphemeIndex;g2 < gWidths.length; g2++) {
      const gw = gPrefixWidths === null ? gWidths[g2] : gPrefixWidths[g2] - previousPrefixWidth;
      if (!hasContent) {
        startLineAtGrapheme(segmentIndex, g2, gw);
      } else {
        if (lineW + gw > fitLimit) {
          return finishLine();
        }
        lineW += gw;
        lineEndSegmentIndex = segmentIndex;
        lineEndGraphemeIndex = g2 + 1;
      }
      if (gPrefixWidths !== null)
        previousPrefixWidth = gPrefixWidths[g2];
    }
    if (hasContent && lineEndSegmentIndex === segmentIndex && lineEndGraphemeIndex === gWidths.length) {
      lineEndSegmentIndex = segmentIndex + 1;
      lineEndGraphemeIndex = 0;
    }
    return null;
  }
  function maybeFinishAtSoftHyphen(segmentIndex) {
    if (pendingBreakKind !== "soft-hyphen" || pendingBreakSegmentIndex < 0)
      return null;
    const gWidths = breakableWidths[segmentIndex] ?? null;
    if (gWidths !== null) {
      const fitWidths = breakablePrefixWidths[segmentIndex] ?? gWidths;
      const usesPrefixWidths = fitWidths !== gWidths;
      const { fitCount, fittedWidth } = fitSoftHyphenBreak(fitWidths, lineW, maxWidth, lineFitEpsilon, discretionaryHyphenWidth, usesPrefixWidths);
      if (fitCount === gWidths.length) {
        lineW = fittedWidth;
        lineEndSegmentIndex = segmentIndex + 1;
        lineEndGraphemeIndex = 0;
        clearPendingBreak();
        return null;
      }
      if (fitCount > 0) {
        return finishLine(segmentIndex, fitCount, fittedWidth + discretionaryHyphenWidth);
      }
    }
    if (pendingBreakFitWidth <= fitLimit) {
      return finishLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
    }
    return null;
  }
  for (let i = cursor.segmentIndex;i < chunk.endSegmentIndex; i++) {
    const kind = kinds[i];
    const breakAfter = kind === "space" || kind === "preserved-space" || kind === "tab" || kind === "zero-width-break" || kind === "soft-hyphen";
    const startGraphemeIndex = i === cursor.segmentIndex ? cursor.graphemeIndex : 0;
    const w2 = kind === "tab" ? getTabAdvance(lineW, tabStopAdvance) : widths[i];
    if (kind === "soft-hyphen" && startGraphemeIndex === 0) {
      if (hasContent) {
        lineEndSegmentIndex = i + 1;
        lineEndGraphemeIndex = 0;
        pendingBreakSegmentIndex = i + 1;
        pendingBreakFitWidth = lineW + discretionaryHyphenWidth;
        pendingBreakPaintWidth = lineW + discretionaryHyphenWidth;
        pendingBreakKind = kind;
      }
      continue;
    }
    if (!hasContent) {
      if (startGraphemeIndex > 0) {
        const line = appendBreakableSegmentFrom(i, startGraphemeIndex);
        if (line !== null)
          return line;
      } else if (w2 > maxWidth && breakableWidths[i] !== null) {
        const line = appendBreakableSegmentFrom(i, 0);
        if (line !== null)
          return line;
      } else {
        startLineAtSegment(i, w2);
      }
      updatePendingBreakForWholeSegment(kind, breakAfter, i, w2);
      continue;
    }
    const newW = lineW + w2;
    if (newW > fitLimit) {
      const currentBreakFitWidth = lineW + (kind === "tab" ? 0 : lineEndFitAdvances[i]);
      const currentBreakPaintWidth = lineW + (kind === "tab" ? w2 : lineEndPaintAdvances[i]);
      if (pendingBreakKind === "soft-hyphen" && engineProfile.preferEarlySoftHyphenBreak && pendingBreakFitWidth <= fitLimit) {
        return finishLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
      }
      const softBreakLine = maybeFinishAtSoftHyphen(i);
      if (softBreakLine !== null)
        return softBreakLine;
      if (breakAfter && currentBreakFitWidth <= fitLimit) {
        appendWholeSegment(i, w2);
        return finishLine(i + 1, 0, currentBreakPaintWidth);
      }
      if (pendingBreakSegmentIndex >= 0 && pendingBreakFitWidth <= fitLimit) {
        if (lineEndSegmentIndex > pendingBreakSegmentIndex || lineEndSegmentIndex === pendingBreakSegmentIndex && lineEndGraphemeIndex > 0) {
          return finishLine();
        }
        return finishLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
      }
      if (w2 > maxWidth && breakableWidths[i] !== null) {
        const currentLine = finishLine();
        if (currentLine !== null)
          return currentLine;
        const line = appendBreakableSegmentFrom(i, 0);
        if (line !== null)
          return line;
      }
      return finishLine();
    }
    appendWholeSegment(i, w2);
    updatePendingBreakForWholeSegment(kind, breakAfter, i, w2);
  }
  if (pendingBreakSegmentIndex === chunk.consumedEndSegmentIndex && lineEndGraphemeIndex === 0) {
    return finishLine(chunk.consumedEndSegmentIndex, 0, pendingBreakPaintWidth);
  }
  return finishLine(chunk.consumedEndSegmentIndex, 0, lineW);
}
function stepPreparedSimpleLineGeometry(prepared, cursor, maxWidth) {
  const { widths, kinds, breakableWidths, breakablePrefixWidths } = prepared;
  const engineProfile = getEngineProfile();
  const lineFitEpsilon = engineProfile.lineFitEpsilon;
  const fitLimit = maxWidth + lineFitEpsilon;
  let lineW = 0;
  let hasContent = false;
  let lineEndSegmentIndex = cursor.segmentIndex;
  let lineEndGraphemeIndex = cursor.graphemeIndex;
  let pendingBreakSegmentIndex = -1;
  let pendingBreakPaintWidth = 0;
  for (let i = cursor.segmentIndex;i < widths.length; i++) {
    const w2 = widths[i];
    const kind = kinds[i];
    const breakAfter = kind === "space" || kind === "preserved-space" || kind === "tab" || kind === "zero-width-break" || kind === "soft-hyphen";
    const startGraphemeIndex = i === cursor.segmentIndex ? cursor.graphemeIndex : 0;
    const breakableWidth = breakableWidths[i];
    if (!hasContent) {
      if (startGraphemeIndex > 0 || w2 > maxWidth && breakableWidth !== null) {
        const gWidths = breakableWidth;
        const gPrefixWidths = breakablePrefixWidths[i] ?? null;
        let previousPrefixWidth = gPrefixWidths === null || startGraphemeIndex === 0 ? 0 : gPrefixWidths[startGraphemeIndex - 1];
        const firstGraphemeWidth = gPrefixWidths === null ? gWidths[startGraphemeIndex] : gPrefixWidths[startGraphemeIndex] - previousPrefixWidth;
        hasContent = true;
        lineW = firstGraphemeWidth;
        lineEndSegmentIndex = i;
        lineEndGraphemeIndex = startGraphemeIndex + 1;
        if (gPrefixWidths !== null)
          previousPrefixWidth = gPrefixWidths[startGraphemeIndex];
        for (let g2 = startGraphemeIndex + 1;g2 < gWidths.length; g2++) {
          const gw = gPrefixWidths === null ? gWidths[g2] : gPrefixWidths[g2] - previousPrefixWidth;
          if (lineW + gw > fitLimit) {
            cursor.segmentIndex = lineEndSegmentIndex;
            cursor.graphemeIndex = lineEndGraphemeIndex;
            return lineW;
          }
          lineW += gw;
          lineEndSegmentIndex = i;
          lineEndGraphemeIndex = g2 + 1;
          if (gPrefixWidths !== null)
            previousPrefixWidth = gPrefixWidths[g2];
        }
        if (lineEndSegmentIndex === i && lineEndGraphemeIndex === gWidths.length) {
          lineEndSegmentIndex = i + 1;
          lineEndGraphemeIndex = 0;
        }
      } else {
        hasContent = true;
        lineW = w2;
        lineEndSegmentIndex = i + 1;
        lineEndGraphemeIndex = 0;
      }
      if (breakAfter) {
        pendingBreakSegmentIndex = i + 1;
        pendingBreakPaintWidth = lineW - w2;
      }
      continue;
    }
    if (lineW + w2 > fitLimit) {
      if (breakAfter) {
        cursor.segmentIndex = i + 1;
        cursor.graphemeIndex = 0;
        return lineW;
      }
      if (pendingBreakSegmentIndex >= 0) {
        if (lineEndSegmentIndex > pendingBreakSegmentIndex || lineEndSegmentIndex === pendingBreakSegmentIndex && lineEndGraphemeIndex > 0) {
          cursor.segmentIndex = lineEndSegmentIndex;
          cursor.graphemeIndex = lineEndGraphemeIndex;
          return lineW;
        }
        cursor.segmentIndex = pendingBreakSegmentIndex;
        cursor.graphemeIndex = 0;
        return pendingBreakPaintWidth;
      }
      cursor.segmentIndex = lineEndSegmentIndex;
      cursor.graphemeIndex = lineEndGraphemeIndex;
      return lineW;
    }
    lineW += w2;
    lineEndSegmentIndex = i + 1;
    lineEndGraphemeIndex = 0;
    if (breakAfter) {
      pendingBreakSegmentIndex = i + 1;
      pendingBreakPaintWidth = lineW - w2;
    }
  }
  if (!hasContent)
    return null;
  cursor.segmentIndex = lineEndSegmentIndex;
  cursor.graphemeIndex = lineEndGraphemeIndex;
  return lineW;
}
function layoutNextLineRange(prepared, start, maxWidth) {
  const end = {
    segmentIndex: start.segmentIndex,
    graphemeIndex: start.graphemeIndex
  };
  const chunkIndex = normalizeLineStartChunkIndex(prepared, end);
  if (chunkIndex < 0)
    return null;
  const lineStartSegmentIndex = end.segmentIndex;
  const lineStartGraphemeIndex = end.graphemeIndex;
  const width = prepared.simpleLineWalkFastPath ? stepPreparedSimpleLineGeometry(prepared, end, maxWidth) : stepPreparedChunkLineGeometry(prepared, end, chunkIndex, maxWidth);
  if (width === null)
    return null;
  return {
    startSegmentIndex: lineStartSegmentIndex,
    startGraphemeIndex: lineStartGraphemeIndex,
    endSegmentIndex: end.segmentIndex,
    endGraphemeIndex: end.graphemeIndex,
    width
  };
}
function stepPreparedLineGeometry(prepared, cursor, maxWidth) {
  const chunkIndex = normalizeLineStartChunkIndex(prepared, cursor);
  if (chunkIndex < 0)
    return null;
  if (prepared.simpleLineWalkFastPath) {
    return stepPreparedSimpleLineGeometry(prepared, cursor, maxWidth);
  }
  return stepPreparedChunkLineGeometry(prepared, cursor, chunkIndex, maxWidth);
}
function measurePreparedLineGeometry(prepared, maxWidth) {
  if (prepared.widths.length === 0) {
    return {
      lineCount: 0,
      maxLineWidth: 0
    };
  }
  const cursor = {
    segmentIndex: 0,
    graphemeIndex: 0
  };
  let lineCount = 0;
  let maxLineWidth = 0;
  if (!prepared.simpleLineWalkFastPath) {
    let chunkIndex = normalizeLineStartChunkIndex(prepared, cursor);
    while (chunkIndex >= 0) {
      const lineWidth = stepPreparedChunkLineGeometry(prepared, cursor, chunkIndex, maxWidth);
      if (lineWidth === null) {
        return {
          lineCount,
          maxLineWidth
        };
      }
      lineCount++;
      if (lineWidth > maxLineWidth)
        maxLineWidth = lineWidth;
      chunkIndex = normalizeLineStartChunkIndexFromHint(prepared, chunkIndex, cursor);
    }
    return {
      lineCount,
      maxLineWidth
    };
  }
  while (true) {
    const lineWidth = stepPreparedLineGeometry(prepared, cursor, maxWidth);
    if (lineWidth === null) {
      return {
        lineCount,
        maxLineWidth
      };
    }
    lineCount++;
    if (lineWidth > maxLineWidth)
      maxLineWidth = lineWidth;
  }
}

// src/layout.ts
var sharedGraphemeSegmenter2 = null;
var sharedLineTextCaches = new WeakMap;
function getSharedGraphemeSegmenter2() {
  if (sharedGraphemeSegmenter2 === null) {
    sharedGraphemeSegmenter2 = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  }
  return sharedGraphemeSegmenter2;
}
function createEmptyPrepared(includeSegments) {
  if (includeSegments) {
    return {
      widths: [],
      lineEndFitAdvances: [],
      lineEndPaintAdvances: [],
      kinds: [],
      simpleLineWalkFastPath: true,
      segLevels: null,
      breakableWidths: [],
      breakablePrefixWidths: [],
      discretionaryHyphenWidth: 0,
      tabStopAdvance: 0,
      chunks: [],
      segments: []
    };
  }
  return {
    widths: [],
    lineEndFitAdvances: [],
    lineEndPaintAdvances: [],
    kinds: [],
    simpleLineWalkFastPath: true,
    segLevels: null,
    breakableWidths: [],
    breakablePrefixWidths: [],
    discretionaryHyphenWidth: 0,
    tabStopAdvance: 0,
    chunks: []
  };
}
function buildBaseCjkUnits(segText, engineProfile) {
  const units = [];
  let unitText = "";
  let unitStart = 0;
  function pushUnit() {
    if (unitText.length === 0)
      return;
    units.push({ text: unitText, start: unitStart });
    unitText = "";
  }
  for (const gs of getSharedGraphemeSegmenter2().segment(segText)) {
    const grapheme = gs.segment;
    if (unitText.length === 0) {
      unitText = grapheme;
      unitStart = gs.index;
      continue;
    }
    if (kinsokuEnd.has(unitText) || kinsokuStart.has(grapheme) || leftStickyPunctuation.has(grapheme) || engineProfile.carryCJKAfterClosingQuote && isCJK(grapheme) && endsWithClosingQuote(unitText)) {
      unitText += grapheme;
      continue;
    }
    if (!isCJK(unitText) && !isCJK(grapheme)) {
      unitText += grapheme;
      continue;
    }
    pushUnit();
    unitText = grapheme;
    unitStart = gs.index;
  }
  pushUnit();
  return units;
}
function mergeKeepAllTextUnits(units) {
  if (units.length <= 1)
    return units;
  const merged = [{ ...units[0] }];
  for (let i = 1;i < units.length; i++) {
    const next = units[i];
    const previous = merged[merged.length - 1];
    if (canContinueKeepAllTextRun(previous.text) && isCJK(previous.text)) {
      previous.text += next.text;
      continue;
    }
    merged.push({ ...next });
  }
  return merged;
}
function measureAnalysis(analysis, font, includeSegments, wordBreak) {
  const engineProfile = getEngineProfile();
  const { cache, emojiCorrection } = getFontMeasurementState(font, textMayContainEmoji(analysis.normalized));
  const discretionaryHyphenWidth = getCorrectedSegmentWidth("-", getSegmentMetrics("-", cache), emojiCorrection);
  const spaceWidth = getCorrectedSegmentWidth(" ", getSegmentMetrics(" ", cache), emojiCorrection);
  const tabStopAdvance = spaceWidth * 8;
  if (analysis.len === 0)
    return createEmptyPrepared(includeSegments);
  const widths = [];
  const lineEndFitAdvances = [];
  const lineEndPaintAdvances = [];
  const kinds = [];
  let simpleLineWalkFastPath = analysis.chunks.length <= 1;
  const segStarts = includeSegments ? [] : null;
  const breakableWidths = [];
  const breakablePrefixWidths = [];
  const segments = includeSegments ? [] : null;
  const preparedStartByAnalysisIndex = Array.from({ length: analysis.len });
  function pushMeasuredSegment(text, width, lineEndFitAdvance, lineEndPaintAdvance, kind, start, breakable, breakablePrefix) {
    if (kind !== "text" && kind !== "space" && kind !== "zero-width-break") {
      simpleLineWalkFastPath = false;
    }
    widths.push(width);
    lineEndFitAdvances.push(lineEndFitAdvance);
    lineEndPaintAdvances.push(lineEndPaintAdvance);
    kinds.push(kind);
    segStarts?.push(start);
    breakableWidths.push(breakable);
    breakablePrefixWidths.push(breakablePrefix);
    if (segments !== null)
      segments.push(text);
  }
  function pushMeasuredTextSegment(text, kind, start, wordLike, allowOverflowBreaks) {
    const textMetrics = getSegmentMetrics(text, cache);
    const width = getCorrectedSegmentWidth(text, textMetrics, emojiCorrection);
    const lineEndFitAdvance = kind === "space" || kind === "preserved-space" || kind === "zero-width-break" ? 0 : width;
    const lineEndPaintAdvance = kind === "space" || kind === "zero-width-break" ? 0 : width;
    if (allowOverflowBreaks && wordLike && text.length > 1) {
      const graphemeWidths = getSegmentGraphemeWidths(text, textMetrics, cache, emojiCorrection);
      const graphemePrefixWidths = engineProfile.preferPrefixWidthsForBreakableRuns || isNumericRunSegment(text) ? getSegmentGraphemePrefixWidths(text, textMetrics, cache, emojiCorrection) : null;
      pushMeasuredSegment(text, width, lineEndFitAdvance, lineEndPaintAdvance, kind, start, graphemeWidths, graphemePrefixWidths);
      return;
    }
    pushMeasuredSegment(text, width, lineEndFitAdvance, lineEndPaintAdvance, kind, start, null, null);
  }
  for (let mi = 0;mi < analysis.len; mi++) {
    preparedStartByAnalysisIndex[mi] = widths.length;
    const segText = analysis.texts[mi];
    const segWordLike = analysis.isWordLike[mi];
    const segKind = analysis.kinds[mi];
    const segStart = analysis.starts[mi];
    if (segKind === "soft-hyphen") {
      pushMeasuredSegment(segText, 0, discretionaryHyphenWidth, discretionaryHyphenWidth, segKind, segStart, null, null);
      continue;
    }
    if (segKind === "hard-break") {
      pushMeasuredSegment(segText, 0, 0, 0, segKind, segStart, null, null);
      continue;
    }
    if (segKind === "tab") {
      pushMeasuredSegment(segText, 0, 0, 0, segKind, segStart, null, null);
      continue;
    }
    const segMetrics = getSegmentMetrics(segText, cache);
    if (segKind === "text" && segMetrics.containsCJK) {
      const baseUnits = buildBaseCjkUnits(segText, engineProfile);
      const measuredUnits = wordBreak === "keep-all" ? mergeKeepAllTextUnits(baseUnits) : baseUnits;
      for (let i = 0;i < measuredUnits.length; i++) {
        const unit = measuredUnits[i];
        pushMeasuredTextSegment(unit.text, "text", segStart + unit.start, segWordLike, wordBreak === "keep-all" || !isCJK(unit.text));
      }
      continue;
    }
    pushMeasuredTextSegment(segText, segKind, segStart, segWordLike, true);
  }
  const chunks = mapAnalysisChunksToPreparedChunks(analysis.chunks, preparedStartByAnalysisIndex, widths.length);
  const segLevels = segStarts === null ? null : computeSegmentLevels(analysis.normalized, segStarts);
  if (segments !== null) {
    return {
      widths,
      lineEndFitAdvances,
      lineEndPaintAdvances,
      kinds,
      simpleLineWalkFastPath,
      segLevels,
      breakableWidths,
      breakablePrefixWidths,
      discretionaryHyphenWidth,
      tabStopAdvance,
      chunks,
      segments
    };
  }
  return {
    widths,
    lineEndFitAdvances,
    lineEndPaintAdvances,
    kinds,
    simpleLineWalkFastPath,
    segLevels,
    breakableWidths,
    breakablePrefixWidths,
    discretionaryHyphenWidth,
    tabStopAdvance,
    chunks
  };
}
function mapAnalysisChunksToPreparedChunks(chunks, preparedStartByAnalysisIndex, preparedEndSegmentIndex) {
  const preparedChunks = [];
  for (let i = 0;i < chunks.length; i++) {
    const chunk = chunks[i];
    const startSegmentIndex = chunk.startSegmentIndex < preparedStartByAnalysisIndex.length ? preparedStartByAnalysisIndex[chunk.startSegmentIndex] : preparedEndSegmentIndex;
    const endSegmentIndex = chunk.endSegmentIndex < preparedStartByAnalysisIndex.length ? preparedStartByAnalysisIndex[chunk.endSegmentIndex] : preparedEndSegmentIndex;
    const consumedEndSegmentIndex = chunk.consumedEndSegmentIndex < preparedStartByAnalysisIndex.length ? preparedStartByAnalysisIndex[chunk.consumedEndSegmentIndex] : preparedEndSegmentIndex;
    preparedChunks.push({
      startSegmentIndex,
      endSegmentIndex,
      consumedEndSegmentIndex
    });
  }
  return preparedChunks;
}
function prepareInternal(text, font, includeSegments, options) {
  const wordBreak = options?.wordBreak ?? "normal";
  const analysis = analyzeText(text, getEngineProfile(), options?.whiteSpace, wordBreak);
  return measureAnalysis(analysis, font, includeSegments, wordBreak);
}
function prepare(text, font, options) {
  return prepareInternal(text, font, false, options);
}
function prepareWithSegments(text, font, options) {
  return prepareInternal(text, font, true, options);
}
function getInternalPrepared(prepared) {
  return prepared;
}
function layout(prepared, maxWidth, lineHeight) {
  const lineCount = countPreparedLines(getInternalPrepared(prepared), maxWidth);
  return { lineCount, height: lineCount * lineHeight };
}
function getSegmentGraphemes(segmentIndex, segments, cache) {
  let graphemes = cache.get(segmentIndex);
  if (graphemes !== undefined)
    return graphemes;
  graphemes = [];
  const graphemeSegmenter = getSharedGraphemeSegmenter2();
  for (const gs of graphemeSegmenter.segment(segments[segmentIndex])) {
    graphemes.push(gs.segment);
  }
  cache.set(segmentIndex, graphemes);
  return graphemes;
}
function getLineTextCache(prepared) {
  let cache = sharedLineTextCaches.get(prepared);
  if (cache !== undefined)
    return cache;
  cache = new Map;
  sharedLineTextCaches.set(prepared, cache);
  return cache;
}
function lineHasDiscretionaryHyphen(kinds, startSegmentIndex, startGraphemeIndex, endSegmentIndex) {
  return endSegmentIndex > 0 && kinds[endSegmentIndex - 1] === "soft-hyphen" && !(startSegmentIndex === endSegmentIndex && startGraphemeIndex > 0);
}
function buildLineTextFromRange(segments, kinds, cache, startSegmentIndex, startGraphemeIndex, endSegmentIndex, endGraphemeIndex) {
  let text = "";
  const endsWithDiscretionaryHyphen = lineHasDiscretionaryHyphen(kinds, startSegmentIndex, startGraphemeIndex, endSegmentIndex);
  for (let i = startSegmentIndex;i < endSegmentIndex; i++) {
    if (kinds[i] === "soft-hyphen" || kinds[i] === "hard-break")
      continue;
    if (i === startSegmentIndex && startGraphemeIndex > 0) {
      text += getSegmentGraphemes(i, segments, cache).slice(startGraphemeIndex).join("");
    } else {
      text += segments[i];
    }
  }
  if (endGraphemeIndex > 0) {
    if (endsWithDiscretionaryHyphen)
      text += "-";
    text += getSegmentGraphemes(endSegmentIndex, segments, cache).slice(startSegmentIndex === endSegmentIndex ? startGraphemeIndex : 0, endGraphemeIndex).join("");
  } else if (endsWithDiscretionaryHyphen) {
    text += "-";
  }
  return text;
}
function createLayoutLine(prepared, cache, width, startSegmentIndex, startGraphemeIndex, endSegmentIndex, endGraphemeIndex) {
  return {
    text: buildLineTextFromRange(prepared.segments, prepared.kinds, cache, startSegmentIndex, startGraphemeIndex, endSegmentIndex, endGraphemeIndex),
    width,
    start: {
      segmentIndex: startSegmentIndex,
      graphemeIndex: startGraphemeIndex
    },
    end: {
      segmentIndex: endSegmentIndex,
      graphemeIndex: endGraphemeIndex
    }
  };
}
function materializeLayoutLine(prepared, cache, line) {
  return createLayoutLine(prepared, cache, line.width, line.startSegmentIndex, line.startGraphemeIndex, line.endSegmentIndex, line.endGraphemeIndex);
}
function toLayoutLineRange(line) {
  return {
    width: line.width,
    start: {
      segmentIndex: line.startSegmentIndex,
      graphemeIndex: line.startGraphemeIndex
    },
    end: {
      segmentIndex: line.endSegmentIndex,
      graphemeIndex: line.endGraphemeIndex
    }
  };
}
function materializeLineRange(prepared, line) {
  return createLayoutLine(prepared, getLineTextCache(prepared), line.width, line.start.segmentIndex, line.start.graphemeIndex, line.end.segmentIndex, line.end.graphemeIndex);
}
function walkLineRanges(prepared, maxWidth, onLine) {
  if (prepared.widths.length === 0)
    return 0;
  return walkPreparedLines(getInternalPrepared(prepared), maxWidth, (line) => {
    onLine(toLayoutLineRange(line));
  });
}
function measureLineStats(prepared, maxWidth) {
  return measurePreparedLineGeometry(getInternalPrepared(prepared), maxWidth);
}
function measureNaturalWidth(prepared) {
  let maxWidth = 0;
  walkLineRanges(prepared, Number.POSITIVE_INFINITY, (line) => {
    if (line.width > maxWidth)
      maxWidth = line.width;
  });
  return maxWidth;
}
function layoutNextLine(prepared, start, maxWidth) {
  const line = layoutNextLineRange2(prepared, start, maxWidth);
  if (line === null)
    return null;
  return materializeLineRange(prepared, line);
}
function layoutNextLineRange2(prepared, start, maxWidth) {
  const line = layoutNextLineRange(prepared, start, maxWidth);
  if (line === null)
    return null;
  return toLayoutLineRange(line);
}
function layoutWithLines(prepared, maxWidth, lineHeight) {
  const lines = [];
  if (prepared.widths.length === 0)
    return { lineCount: 0, height: 0, lines };
  const graphemeCache = getLineTextCache(prepared);
  const lineCount = walkPreparedLines(getInternalPrepared(prepared), maxWidth, (line) => {
    lines.push(materializeLayoutLine(prepared, graphemeCache, line));
  });
  return { lineCount, height: lineCount * lineHeight, lines };
}

// src/rich-inline.ts
var COLLAPSIBLE_BOUNDARY_RE = /[ \t\n\f\r]+/;
var LEADING_COLLAPSIBLE_BOUNDARY_RE = /^[ \t\n\f\r]+/;
var TRAILING_COLLAPSIBLE_BOUNDARY_RE = /[ \t\n\f\r]+$/;
var EMPTY_LAYOUT_CURSOR = { segmentIndex: 0, graphemeIndex: 0 };
var RICH_INLINE_START_CURSOR = {
  itemIndex: 0,
  segmentIndex: 0,
  graphemeIndex: 0
};
function getInternalPreparedRichInline(prepared) {
  return prepared;
}
function cloneCursor(cursor) {
  return {
    segmentIndex: cursor.segmentIndex,
    graphemeIndex: cursor.graphemeIndex
  };
}
function isLineStartCursor(cursor) {
  return cursor.segmentIndex === 0 && cursor.graphemeIndex === 0;
}
function getCollapsedSpaceWidth(font, cache) {
  const cached = cache.get(font);
  if (cached !== undefined)
    return cached;
  const joinedWidth = measureNaturalWidth(prepareWithSegments("A A", font));
  const compactWidth = measureNaturalWidth(prepareWithSegments("AA", font));
  const collapsedWidth = Math.max(0, joinedWidth - compactWidth);
  cache.set(font, collapsedWidth);
  return collapsedWidth;
}
function prepareWholeItemLine(prepared) {
  const line = layoutNextLineRange(prepared, EMPTY_LAYOUT_CURSOR, Number.POSITIVE_INFINITY);
  if (line === null)
    return null;
  return {
    endGraphemeIndex: line.endGraphemeIndex,
    endSegmentIndex: line.endSegmentIndex,
    width: line.width
  };
}
function endsInsideFirstSegment(segmentIndex, graphemeIndex) {
  return segmentIndex === 0 && graphemeIndex > 0;
}
function prepareRichInline(items) {
  const preparedItems = [];
  const itemsBySourceItemIndex = Array.from({ length: items.length });
  const collapsedSpaceWidthCache = new Map;
  let pendingGapWidth = 0;
  for (let index = 0;index < items.length; index++) {
    const item = items[index];
    const hasLeadingWhitespace = LEADING_COLLAPSIBLE_BOUNDARY_RE.test(item.text);
    const hasTrailingWhitespace = TRAILING_COLLAPSIBLE_BOUNDARY_RE.test(item.text);
    const trimmedText = item.text.replace(LEADING_COLLAPSIBLE_BOUNDARY_RE, "").replace(TRAILING_COLLAPSIBLE_BOUNDARY_RE, "");
    if (trimmedText.length === 0) {
      if (COLLAPSIBLE_BOUNDARY_RE.test(item.text) && pendingGapWidth === 0) {
        pendingGapWidth = getCollapsedSpaceWidth(item.font, collapsedSpaceWidthCache);
      }
      continue;
    }
    const gapBefore = pendingGapWidth > 0 ? pendingGapWidth : hasLeadingWhitespace ? getCollapsedSpaceWidth(item.font, collapsedSpaceWidthCache) : 0;
    const prepared = prepareWithSegments(trimmedText, item.font);
    const wholeLine = prepareWholeItemLine(prepared);
    if (wholeLine === null) {
      pendingGapWidth = hasTrailingWhitespace ? getCollapsedSpaceWidth(item.font, collapsedSpaceWidthCache) : 0;
      continue;
    }
    const preparedItem = {
      break: item.break ?? "normal",
      endGraphemeIndex: wholeLine.endGraphemeIndex,
      endSegmentIndex: wholeLine.endSegmentIndex,
      extraWidth: item.extraWidth ?? 0,
      gapBefore,
      naturalWidth: wholeLine.width,
      prepared,
      sourceItemIndex: index
    };
    preparedItems.push(preparedItem);
    itemsBySourceItemIndex[index] = preparedItem;
    pendingGapWidth = hasTrailingWhitespace ? getCollapsedSpaceWidth(item.font, collapsedSpaceWidthCache) : 0;
  }
  return {
    items: preparedItems,
    itemsBySourceItemIndex
  };
}
function stepRichInlineLine(flow, maxWidth, cursor, collectFragment) {
  if (flow.items.length === 0 || cursor.itemIndex >= flow.items.length)
    return null;
  const safeWidth = Math.max(1, maxWidth);
  let lineWidth = 0;
  let remainingWidth = safeWidth;
  let itemIndex = cursor.itemIndex;
  const textCursor = {
    segmentIndex: cursor.segmentIndex,
    graphemeIndex: cursor.graphemeIndex
  };
  lineLoop:
    while (itemIndex < flow.items.length) {
      const item = flow.items[itemIndex];
      if (!isLineStartCursor(textCursor) && textCursor.segmentIndex === item.endSegmentIndex && textCursor.graphemeIndex === item.endGraphemeIndex) {
        itemIndex++;
        textCursor.segmentIndex = 0;
        textCursor.graphemeIndex = 0;
        continue;
      }
      const gapBefore = lineWidth === 0 ? 0 : item.gapBefore;
      const atItemStart = isLineStartCursor(textCursor);
      if (item.break === "never") {
        if (!atItemStart) {
          itemIndex++;
          textCursor.segmentIndex = 0;
          textCursor.graphemeIndex = 0;
          continue;
        }
        const occupiedWidth = item.naturalWidth + item.extraWidth;
        const totalWidth = gapBefore + occupiedWidth;
        if (lineWidth > 0 && totalWidth > remainingWidth)
          break lineLoop;
        collectFragment?.(item, gapBefore, occupiedWidth, cloneCursor(EMPTY_LAYOUT_CURSOR), {
          segmentIndex: item.endSegmentIndex,
          graphemeIndex: item.endGraphemeIndex
        });
        lineWidth += totalWidth;
        remainingWidth = Math.max(0, safeWidth - lineWidth);
        itemIndex++;
        textCursor.segmentIndex = 0;
        textCursor.graphemeIndex = 0;
        continue;
      }
      const reservedWidth = gapBefore + item.extraWidth;
      if (lineWidth > 0 && reservedWidth >= remainingWidth)
        break lineLoop;
      if (atItemStart) {
        const totalWidth = reservedWidth + item.naturalWidth;
        if (totalWidth <= remainingWidth) {
          collectFragment?.(item, gapBefore, item.naturalWidth + item.extraWidth, cloneCursor(EMPTY_LAYOUT_CURSOR), {
            segmentIndex: item.endSegmentIndex,
            graphemeIndex: item.endGraphemeIndex
          });
          lineWidth += totalWidth;
          remainingWidth = Math.max(0, safeWidth - lineWidth);
          itemIndex++;
          textCursor.segmentIndex = 0;
          textCursor.graphemeIndex = 0;
          continue;
        }
      }
      const availableWidth = Math.max(1, remainingWidth - reservedWidth);
      const line = layoutNextLineRange(item.prepared, textCursor, availableWidth);
      if (line === null) {
        itemIndex++;
        textCursor.segmentIndex = 0;
        textCursor.graphemeIndex = 0;
        continue;
      }
      if (textCursor.segmentIndex === line.endSegmentIndex && textCursor.graphemeIndex === line.endGraphemeIndex) {
        itemIndex++;
        textCursor.segmentIndex = 0;
        textCursor.graphemeIndex = 0;
        continue;
      }
      if (lineWidth > 0 && atItemStart && gapBefore > 0 && endsInsideFirstSegment(line.endSegmentIndex, line.endGraphemeIndex)) {
        const freshLine = layoutNextLineRange(item.prepared, EMPTY_LAYOUT_CURSOR, Math.max(1, safeWidth - item.extraWidth));
        if (freshLine !== null && (freshLine.endSegmentIndex > line.endSegmentIndex || freshLine.endSegmentIndex === line.endSegmentIndex && freshLine.endGraphemeIndex > line.endGraphemeIndex)) {
          break lineLoop;
        }
      }
      collectFragment?.(item, gapBefore, line.width + item.extraWidth, cloneCursor(textCursor), {
        segmentIndex: line.endSegmentIndex,
        graphemeIndex: line.endGraphemeIndex
      });
      lineWidth += gapBefore + line.width + item.extraWidth;
      remainingWidth = Math.max(0, safeWidth - lineWidth);
      if (line.endSegmentIndex === item.endSegmentIndex && line.endGraphemeIndex === item.endGraphemeIndex) {
        itemIndex++;
        textCursor.segmentIndex = 0;
        textCursor.graphemeIndex = 0;
        continue;
      }
      textCursor.segmentIndex = line.endSegmentIndex;
      textCursor.graphemeIndex = line.endGraphemeIndex;
      break;
    }
  if (lineWidth === 0)
    return null;
  cursor.itemIndex = itemIndex;
  cursor.segmentIndex = textCursor.segmentIndex;
  cursor.graphemeIndex = textCursor.graphemeIndex;
  return lineWidth;
}
function stepRichInlineLineStats(flow, maxWidth, cursor) {
  if (flow.items.length === 0 || cursor.itemIndex >= flow.items.length)
    return null;
  const safeWidth = Math.max(1, maxWidth);
  let lineWidth = 0;
  let remainingWidth = safeWidth;
  let itemIndex = cursor.itemIndex;
  lineLoop:
    while (itemIndex < flow.items.length) {
      const item = flow.items[itemIndex];
      if (!isLineStartCursor(cursor) && cursor.segmentIndex === item.endSegmentIndex && cursor.graphemeIndex === item.endGraphemeIndex) {
        itemIndex++;
        cursor.segmentIndex = 0;
        cursor.graphemeIndex = 0;
        continue;
      }
      const gapBefore = lineWidth === 0 ? 0 : item.gapBefore;
      const atItemStart = isLineStartCursor(cursor);
      if (item.break === "never") {
        if (!atItemStart) {
          itemIndex++;
          cursor.segmentIndex = 0;
          cursor.graphemeIndex = 0;
          continue;
        }
        const occupiedWidth = item.naturalWidth + item.extraWidth;
        const totalWidth = gapBefore + occupiedWidth;
        if (lineWidth > 0 && totalWidth > remainingWidth)
          break lineLoop;
        lineWidth += totalWidth;
        remainingWidth = Math.max(0, safeWidth - lineWidth);
        itemIndex++;
        cursor.segmentIndex = 0;
        cursor.graphemeIndex = 0;
        continue;
      }
      const reservedWidth = gapBefore + item.extraWidth;
      if (lineWidth > 0 && reservedWidth >= remainingWidth)
        break lineLoop;
      if (atItemStart) {
        const totalWidth = reservedWidth + item.naturalWidth;
        if (totalWidth <= remainingWidth) {
          lineWidth += totalWidth;
          remainingWidth = Math.max(0, safeWidth - lineWidth);
          itemIndex++;
          cursor.segmentIndex = 0;
          cursor.graphemeIndex = 0;
          continue;
        }
      }
      const availableWidth = Math.max(1, remainingWidth - reservedWidth);
      const lineEnd = {
        segmentIndex: cursor.segmentIndex,
        graphemeIndex: cursor.graphemeIndex
      };
      const lineWidthForItem = stepPreparedLineGeometry(item.prepared, lineEnd, availableWidth);
      if (lineWidthForItem === null) {
        itemIndex++;
        cursor.segmentIndex = 0;
        cursor.graphemeIndex = 0;
        continue;
      }
      if (cursor.segmentIndex === lineEnd.segmentIndex && cursor.graphemeIndex === lineEnd.graphemeIndex) {
        itemIndex++;
        cursor.segmentIndex = 0;
        cursor.graphemeIndex = 0;
        continue;
      }
      if (lineWidth > 0 && atItemStart && gapBefore > 0 && endsInsideFirstSegment(lineEnd.segmentIndex, lineEnd.graphemeIndex)) {
        const freshLineEnd = {
          segmentIndex: 0,
          graphemeIndex: 0
        };
        const freshLineWidth = stepPreparedLineGeometry(item.prepared, freshLineEnd, Math.max(1, safeWidth - item.extraWidth));
        if (freshLineWidth !== null && (freshLineEnd.segmentIndex > lineEnd.segmentIndex || freshLineEnd.segmentIndex === lineEnd.segmentIndex && freshLineEnd.graphemeIndex > lineEnd.graphemeIndex)) {
          break lineLoop;
        }
      }
      lineWidth += gapBefore + lineWidthForItem + item.extraWidth;
      remainingWidth = Math.max(0, safeWidth - lineWidth);
      if (lineEnd.segmentIndex === item.endSegmentIndex && lineEnd.graphemeIndex === item.endGraphemeIndex) {
        itemIndex++;
        cursor.segmentIndex = 0;
        cursor.graphemeIndex = 0;
        continue;
      }
      cursor.segmentIndex = lineEnd.segmentIndex;
      cursor.graphemeIndex = lineEnd.graphemeIndex;
      break;
    }
  if (lineWidth === 0)
    return null;
  cursor.itemIndex = itemIndex;
  return lineWidth;
}
function layoutNextRichInlineLineRange(prepared, maxWidth, start = RICH_INLINE_START_CURSOR) {
  const flow = getInternalPreparedRichInline(prepared);
  const end = {
    itemIndex: start.itemIndex,
    segmentIndex: start.segmentIndex,
    graphemeIndex: start.graphemeIndex
  };
  const fragments = [];
  const width = stepRichInlineLine(flow, maxWidth, end, (item, gapBefore, occupiedWidth, fragmentStart, fragmentEnd) => {
    fragments.push({
      itemIndex: item.sourceItemIndex,
      gapBefore,
      occupiedWidth,
      start: fragmentStart,
      end: fragmentEnd
    });
  });
  if (width === null)
    return null;
  return {
    fragments,
    width,
    end
  };
}
function materializeFragmentText(item, fragment) {
  const line = materializeLineRange(item.prepared, {
    width: fragment.occupiedWidth - item.extraWidth,
    start: fragment.start,
    end: fragment.end
  });
  return line.text;
}
function materializeRichInlineLineRange(prepared, line) {
  const flow = getInternalPreparedRichInline(prepared);
  return {
    fragments: line.fragments.map((fragment) => {
      const item = flow.itemsBySourceItemIndex[fragment.itemIndex];
      if (item === undefined)
        throw new Error("Missing rich-text inline item for fragment");
      return {
        ...fragment,
        text: materializeFragmentText(item, fragment)
      };
    }),
    width: line.width,
    end: line.end
  };
}
function walkRichInlineLineRanges(prepared, maxWidth, onLine) {
  let lineCount = 0;
  let cursor = RICH_INLINE_START_CURSOR;
  while (true) {
    const line = layoutNextRichInlineLineRange(prepared, maxWidth, cursor);
    if (line === null)
      return lineCount;
    onLine(line);
    lineCount++;
    cursor = line.end;
  }
}
function measureRichInlineStats(prepared, maxWidth) {
  const flow = getInternalPreparedRichInline(prepared);
  let lineCount = 0;
  let maxLineWidth = 0;
  const cursor = {
    itemIndex: 0,
    segmentIndex: 0,
    graphemeIndex: 0
  };
  while (true) {
    const lineWidth = stepRichInlineLineStats(flow, maxWidth, cursor);
    if (lineWidth === null) {
      return {
        lineCount,
        maxLineWidth
      };
    }
    lineCount++;
    if (lineWidth > maxLineWidth)
      maxLineWidth = lineWidth;
  }
}

// pages/demos/markdown-chat.data.ts
function message(role, ...lines) {
  return {
    role,
    markdown: lines.join(`
`)
  };
}
var BASE_MESSAGE_SPECS = [
  message("user", "Can we treat the rich-text inline flow helper (`rich-inline`) as a real primitive, or is it only good for one tiny demo?", "", "I mostly care about:", "- exact bubble heights", "- virtualization without DOM reads", "- markdown-ish inline styling"),
  message("assistant", "Short answer: **yes, inside a bounded corridor**.", "", "It already handles rich-text inline flow, `code`, and links like [Pretext](https://github.com/chenglou/pretext), while keeping pills and badges atomic. The real pressure starts once a chat bubble stops being one paragraph."),
  message("user", "Right. My side is usually short, but your side has the weird stuff: Beijing 北京, Arabic مرحبا, emoji \uD83D\uDC69‍\uD83D\uDE80, and long URLs like https://example.com/reports/q3?lang=ar&mode=full"),
  message("assistant", "### What a chat renderer actually needs", "", "1. Parse markdown somewhere else.", "2. Normalize it into blocks and inline runs.", "3. Use the rich-text inline flow helper (`rich-inline`) for paragraph-ish content.", "4. Use the `pre-wrap` path for fenced code."),
  message("user", "Then let’s stress it with **real markdown**: ***nested emphasis***, ~~deletions~~, `inline code`, [links](https://openai.com/), and a couple messages that are obviously richer on the AI side than on mine."),
  message("assistant", "> If we know the exact height in advance, then virtualization is no longer guesswork.", ">", "> It becomes geometry.", "", "That is the whole reason to keep the primitive low-level and composable."),
  message("user", "Okay, but the design matters too. The left side should feel lighter and more editorial, while my side can stay bubble-y."),
  message("assistant", "```ts", "const frame = buildConversationFrame(templates, width)", "const visible = findVisibleRange(frame, scrollTop, viewportHeight, topMask, bottomMask)", "renderMessages(frame, visible.start, visible.end)", "```"),
  message("user", "I also want code fences, quotes, and lists to show up often enough that the 10k-thread run actually teaches us something."),
  message("assistant", "That part is important.", "", "- paragraph layout is one leaf", "- code fences are another leaf", "- the chat message is the block-level container above both", "", "The assistant side is the real stress test because it keeps hitting headings, bullets, quotes, code fences, and occasional long explanations."),
  message("user", "Try a checklist too. A product chat is full of little status updates."),
  message("assistant", "Current polish pass:", "", "- lighter body copy is in", "- the assistant lane is bubble-less", "- exact height prediction is wired up", "- mobile screenshot smoke tests still remain"),
  message("user", "Can we keep top-level bullets flush? I do not want them shoved way in from the left like an old email client."),
  message("assistant", "Yes. The top-level list should read almost like paragraph rhythm with markers, not like a nested document outline.", "", "Nested lists can still step in when they actually nest."),
  message("user", "I want a structured status block too. It does not need table syntax if we are not really rendering tables here."),
  message("assistant", "```yaml", "paragraph_leaf: rich-text-inline-flow", "code_leaf: pre-wrap", "quote_wrapper: block shell", "virtualization: exact-height-first", "```"),
  message("user", "What about images or chips? Even if they are fake, I want to know the primitive can hold an atomic thing."),
  message("assistant", "It can. Something like ![diagram](https://example.com/mock-wireframe.png) behaves more like an inline chip than a splittable word, which is exactly the right stress case."),
  message("user", "Throw in a messy status message too: deploys, timestamps, a ticket number, and maybe one escaped quote like \\\"ship it\\\"."),
  message("assistant", "Status snapshot:", "", "- deploy window 7:00-9:00", "- owner `RICH-431`", "- locale mix `24×7` and `२४×७`", "- comment: \\\"ship it\\\" after the Safari check"),
  message("user", "I still think the width negotiation matters more than the parser. If widths are wrong, everything feels fake."),
  message("assistant", "Agreed. The parser is just an upstream producer.", "", "The hard contract is: once width and fonts are known, the layout layer should answer height exactly enough that virtualization never has to ask the DOM for help."),
  message("user", "Give me one answer that feels more structured, almost like a mini design review."),
  message("assistant", "## Design review", "", "The strongest signal so far is that **assistant messages want a different presentation contract from user messages**. The human side reads well as compact bubbles. The assistant side reads better as content on a surface with room to breathe.", "", "That split also maps nicely to the measurement model because user messages are usually short and AI responses are much more likely to hit rich block transitions."),
  message("user", "And one answer that feels operational, like we are handing this to another engineer."),
  message("assistant", "```json", "{", '  "parser": "marked",', '  "paragraphLeaf": "rich-text-inline-flow",', '  "codeLeaf": "pre-wrap",', '  "virtualization": "exact-height-first",', '  "openRisk": "long-scroll-device-smoke"', "}", "```"),
  message("user", "We should probably include a short answer too, otherwise every assistant message looks essay-shaped."),
  message("assistant", "Yep. Short answers are a useful canary because they should not inherit giant block spacing or overbuilt chrome."),
  message("user", "Try a message with HTML-ish content too. Not because we love it, just because users paste odd things."),
  message("assistant", "<aside>Escaped HTML still needs a stable fallback path.</aside>", "", "If it comes through as a block token, we can still route it through a plain-text or code-like presentation instead of pretending we have a full browser renderer."),
  message("user", "I also want more than one quote style in the loop. Otherwise we are tuning for a single canned example."),
  message("assistant", "> The nice version of exact measurement is smooth scrolling.", ">", "> The brutal version is that every wrong guess accumulates.", "", "> In a 10k thread, accumulation is the enemy."),
  message("user", "Can you make one answer about search or citations? AI chats have that vibe a lot now."),
  message("assistant", "Sure. A citation-heavy answer is mostly the same inline problem with a little more link density:", "", "- [spec note](https://example.com/spec)", "- [issue thread](https://example.com/issues/431)", "- [benchmark doc](https://example.com/benchmarks)"),
  message("user", "Maybe a message that mixes scripts more aggressively: English, 日本語, العربية, and a little emoji."),
  message("assistant", "Mixed-script sample: English for the framing, 日本語 for compact line breaks, العربية for punctuation clusters, and emoji like \uD83E\uDDEA\uD83D\uDCD0 to keep the grapheme path honest."),
  message("user", "I want at least one answer that uses nested bullets so we can see whether the second level still reads okay."),
  message("assistant", "Things to watch:", "", "- top-level bullets should feel close to body text", "- nested bullets can indent, but only when they truly nest", "  - this second level should not explode the width math", "  - the marker still needs a clean left gutter", "- quotes and code fences should tuck closer to the lead-in paragraph"),
  message("user", "Can we include a very plain human message too? Real threads have those."),
  message("assistant", "Absolutely."),
  message("user", "cool. also make sure the scroll still feels stable when widths change"),
  message("assistant", "That is one of the better parts of the demo right now: width changes rebuild the frame, preserve relative scroll intent, and remount only the visible window."),
  message("user", "One last thing: mention the hypothesis space. I still care a lot about not painting ourselves into a corner."),
  message("assistant", "The good version of this alpha API is not “we solved rich text.” It is “we found a low-level paragraph leaf that keeps the hypothesis space open for a richer block model above it.”")
];

// pages/demos/markdown-chat.model.ts
var MAX_CHAT_WIDTH = 860;
var TOTAL_MESSAGE_COUNT = 1e4;
var OCCLUSION_BANNER_HEIGHT = 61;
var PAGE_MARGIN = 28;
var MESSAGE_SIDE_PADDING = 22;
var COMPACT_OCCLUSION_BANNER_HEIGHT = 43;
var COMPACT_OCCLUSION_VIEWPORT_HEIGHT = 460;
var CHAT_TOP_PADDING_OFFSET = 14;
var CHAT_BOTTOM_PADDING_OFFSET = 10;
var MESSAGE_GAP = 12;
var BUBBLE_MAX_RATIO = 0.78;
var BUBBLE_PADDING_X = 16;
var BUBBLE_PADDING_Y = 10;
var BODY_LINE_HEIGHT = 22;
var HEADING_ONE_LINE_HEIGHT = 28;
var HEADING_TWO_LINE_HEIGHT = 25;
var HARD_BREAK_GAP = 4;
var BLOCK_GAP = 12;
var RICH_BLOCK_GAP = 2;
var LIST_ITEM_GAP = 4;
var LIST_NESTING_INDENT = 18;
var BLOCKQUOTE_INDENT = 18;
var LIST_MARKER_GAP = 10;
var CODE_LINE_HEIGHT = 18;
var CODE_BLOCK_PADDING_X = 12;
var CODE_BLOCK_PADDING_Y = 8;
var RULE_HEIGHT = 18;
var RAIL_OFFSET = 5;
var SANS_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
var SERIF_FAMILY = '"Iowan Old Style", Georgia, "Times New Roman", serif';
var MONO_FAMILY = '"SF Mono", ui-monospace, Menlo, Monaco, monospace';
var INLINE_CODE_FONT = `600 12px ${MONO_FAMILY}`;
var INLINE_CODE_EXTRA_WIDTH = 12;
var IMAGE_FONT = `700 11px ${SANS_FAMILY}`;
var IMAGE_EXTRA_WIDTH = 14;
var MARKER_FONT = `600 11px ${MONO_FAMILY}`;
var EMPTY_MARK_STATE = {
  bold: false,
  italic: false,
  strike: false,
  href: null
};
var markerWidthCache = new Map;
function createPreparedChatTemplates(specs = BASE_MESSAGE_SPECS) {
  return specs.map((spec) => ({
    blocks: parseMarkdownBlocks(spec.markdown),
    role: spec.role
  }));
}
function getMaxChatWidth(viewportWidth) {
  return Math.max(240, Math.min(MAX_CHAT_WIDTH, viewportWidth - PAGE_MARGIN * 2));
}
function buildConversationFrame(templates, chatWidth, occlusionBannerHeight = OCCLUSION_BANNER_HEIGHT) {
  const messageCount = TOTAL_MESSAGE_COUNT;
  const laneWidth = Math.max(120, chatWidth - MESSAGE_SIDE_PADDING * 2);
  const userFrameWidth = Math.min(laneWidth, Math.max(240, Math.floor(chatWidth * BUBBLE_MAX_RATIO)));
  const assistantFrameWidth = laneWidth;
  const messages = new Array(messageCount);
  const chatTopPadding = occlusionBannerHeight + CHAT_TOP_PADDING_OFFSET;
  const chatBottomPadding = occlusionBannerHeight + CHAT_BOTTOM_PADDING_OFFSET;
  let y2 = chatTopPadding;
  for (let ordinal = 0;ordinal < messageCount; ordinal++) {
    const templateIndex = ordinal % templates.length;
    const template = templates[templateIndex];
    const contentInsetX = template.role === "assistant" ? 0 : BUBBLE_PADDING_X;
    const frameWidth = template.role === "assistant" ? assistantFrameWidth : userFrameWidth;
    const contentWidth = Math.max(120, frameWidth - contentInsetX * 2);
    const messageFrame = layoutTemplateFrame(template, frameWidth, contentWidth, contentInsetX);
    const top = y2;
    const bottom = top + messageFrame.totalHeight;
    messages[ordinal] = {
      bottom,
      frame: messageFrame,
      prepared: template,
      top
    };
    y2 = bottom;
    y2 += MESSAGE_GAP;
  }
  const totalHeight = messages.length === 0 ? chatTopPadding + chatBottomPadding : y2 - MESSAGE_GAP + chatBottomPadding;
  return {
    chatWidth,
    messages,
    occlusionBannerHeight,
    totalHeight
  };
}
function getOcclusionBannerHeight(viewportHeight) {
  return viewportHeight <= COMPACT_OCCLUSION_VIEWPORT_HEIGHT ? COMPACT_OCCLUSION_BANNER_HEIGHT : OCCLUSION_BANNER_HEIGHT;
}
function findVisibleRange(frame, scrollTop, viewportHeight, topOcclusionHeight, bottomOcclusionHeight) {
  if (frame.messages.length === 0)
    return { start: 0, end: 0 };
  const minY = Math.max(0, scrollTop + topOcclusionHeight);
  const maxY = Math.max(minY, scrollTop + viewportHeight - bottomOcclusionHeight);
  let low = 0;
  let high = frame.messages.length;
  while (low < high) {
    const mid = low + high >> 1;
    if (frame.messages[mid].bottom > minY) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  const start = low;
  low = start;
  high = frame.messages.length;
  while (low < high) {
    const mid = low + high >> 1;
    if (frame.messages[mid].top >= maxY) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return { start, end: low };
}
function parseMarkdownBlocks(markdown) {
  const tokens = g.lexer(markdown, { gfm: true });
  return parseBlockTokens(tokens, { listDepth: 0, quoteDepth: 0 });
}
function parseBlockTokens(tokens, ctx) {
  const blocks = [];
  for (let index = 0;index < tokens.length; index++) {
    const token = tokens[index];
    switch (token.type) {
      case "space":
      case "def": {
        continue;
      }
      case "paragraph": {
        appendBlockGroup(blocks, buildInlineBlocks(token.tokens ?? [], "body", ctx), BLOCK_GAP);
        continue;
      }
      case "heading": {
        appendBlockGroup(blocks, buildInlineBlocks(token.tokens ?? [], headingVariant(token.depth), ctx), BLOCK_GAP + 4);
        continue;
      }
      case "code": {
        appendBlockGroup(blocks, [buildCodeBlock(token.text, ctx)], RICH_BLOCK_GAP);
        continue;
      }
      case "list": {
        appendBlockGroup(blocks, buildListBlocks(token, ctx), BLOCK_GAP);
        continue;
      }
      case "blockquote": {
        appendBlockGroup(blocks, parseBlockTokens(token.tokens ?? [], {
          listDepth: ctx.listDepth,
          quoteDepth: ctx.quoteDepth + 1
        }), RICH_BLOCK_GAP);
        continue;
      }
      case "hr": {
        appendBlockGroup(blocks, [buildRuleBlock(ctx)], BLOCK_GAP + 2);
        continue;
      }
      case "table": {
        appendBlockGroup(blocks, [buildCodeBlock(formatTable(token), ctx)], RICH_BLOCK_GAP);
        continue;
      }
      case "html": {
        const htmlText = token.text.trim().length > 0 ? token.text : token.raw;
        const isPre = "pre" in token && token.pre === true;
        if (token.block || isPre) {
          appendBlockGroup(blocks, [buildCodeBlock(htmlText, ctx)], RICH_BLOCK_GAP);
        } else {
          appendBlockGroup(blocks, buildPlainTextBlocks(htmlText, "body", ctx), BLOCK_GAP);
        }
        continue;
      }
      case "text": {
        if (Array.isArray(token.tokens) && token.tokens.length > 0) {
          appendBlockGroup(blocks, buildInlineBlocks(token.tokens, "body", ctx), BLOCK_GAP);
        } else {
          appendBlockGroup(blocks, buildPlainTextBlocks(token.text, "body", ctx), BLOCK_GAP);
        }
        continue;
      }
      default: {
        const fallbackText = fallbackTextForToken(token);
        if (fallbackText.length > 0) {
          appendBlockGroup(blocks, buildPlainTextBlocks(fallbackText, "body", ctx), BLOCK_GAP);
        }
      }
    }
  }
  return blocks;
}
function buildListBlocks(token, ctx) {
  const blocks = [];
  const itemCtx = {
    listDepth: ctx.listDepth + 1,
    quoteDepth: ctx.quoteDepth
  };
  for (let index = 0;index < token.items.length; index++) {
    const item = token.items[index];
    let itemBlocks = parseBlockTokens(item.tokens, itemCtx);
    if (itemBlocks.length === 0) {
      itemBlocks = buildPlainTextBlocks(item.text, "body", itemCtx);
    }
    decorateListItemBlocks(itemBlocks, resolveListMarkerText(token, item, index), resolveListMarkerClassName(token, item));
    appendBlockGroup(blocks, itemBlocks, LIST_ITEM_GAP);
  }
  return blocks;
}
function decorateListItemBlocks(blocks, markerText, markerClassName) {
  if (blocks.length === 0)
    return;
  const markerArea = measureMarkerWidth(markerText) + LIST_MARKER_GAP;
  for (let index = 0;index < blocks.length; index++) {
    blocks[index] = shiftBlock(blocks[index], markerArea);
  }
  const firstBlock = blocks[0];
  blocks[0] = {
    ...firstBlock,
    markerClassName,
    markerLeft: firstBlock.contentLeft - markerArea,
    markerText
  };
}
function buildPlainTextBlocks(text, variant, ctx) {
  const piece = createTextPiece(text, EMPTY_MARK_STATE, variant);
  if (piece === null)
    return [];
  return buildPreparedInlineBlocks([[piece]], variant, ctx);
}
function buildInlineBlocks(tokens, variant, ctx) {
  const lines = collectInlinePieceLines(tokens, variant);
  return buildPreparedInlineBlocks(lines, variant, ctx);
}
function buildPreparedInlineBlocks(lines, variant, ctx) {
  const blocks = [];
  for (let index = 0;index < lines.length; index++) {
    const block = buildPreparedInlineBlock(lines[index], variant, ctx);
    if (block === null)
      continue;
    blocks.push({
      ...block,
      marginTop: blocks.length === 0 ? 0 : HARD_BREAK_GAP
    });
  }
  return blocks;
}
function buildPreparedInlineBlock(pieces, variant, ctx) {
  if (pieces.length === 0)
    return null;
  return {
    ...createBlockBase(ctx),
    classNames: pieces.map((piece) => piece.className),
    flow: prepareRichInline(pieces.map((piece) => ({
      text: piece.text,
      font: piece.font,
      break: piece.breakMode,
      extraWidth: piece.extraWidth
    }))),
    hrefs: pieces.map((piece) => piece.href),
    kind: "inline",
    lineHeight: lineHeightForVariant(variant)
  };
}
function buildCodeBlock(text, ctx) {
  return {
    ...createBlockBase(ctx),
    kind: "code",
    lineHeight: CODE_LINE_HEIGHT,
    prepared: prepareWithSegments(stripSingleTrailingNewline(text), `500 12px ${MONO_FAMILY}`, {
      whiteSpace: "pre-wrap"
    })
  };
}
function buildRuleBlock(ctx) {
  return {
    ...createBlockBase(ctx),
    height: RULE_HEIGHT,
    kind: "rule"
  };
}
function createBlockBase(ctx) {
  const listIndent = Math.max(0, ctx.listDepth - 1) * LIST_NESTING_INDENT;
  const contentLeft = listIndent + ctx.quoteDepth * BLOCKQUOTE_INDENT;
  const quoteRailLefts = [];
  for (let depth = 0;depth < ctx.quoteDepth; depth++) {
    quoteRailLefts.push(listIndent + depth * BLOCKQUOTE_INDENT + RAIL_OFFSET);
  }
  return {
    contentLeft,
    marginTop: 0,
    markerClassName: null,
    markerLeft: null,
    markerText: null,
    quoteRailLefts
  };
}
function collectInlinePieceLines(tokens, variant) {
  const lines = [[]];
  function currentLine() {
    return lines[lines.length - 1];
  }
  function pushLineBreak() {
    lines.push([]);
  }
  function pushPiece(piece) {
    if (piece === null)
      return;
    const line = currentLine();
    const previous = line[line.length - 1];
    if (previous !== undefined && canMergeInlinePieces(previous, piece)) {
      previous.text += piece.text;
      return;
    }
    line.push(piece);
  }
  function walk(tokenList, marks) {
    for (let index = 0;index < tokenList.length; index++) {
      const token = tokenList[index];
      switch (token.type) {
        case "text": {
          if (Array.isArray(token.tokens) && token.tokens.length > 0) {
            walk(token.tokens, marks);
          } else {
            pushPiece(createTextPiece(token.text, marks, variant));
          }
          continue;
        }
        case "escape": {
          pushPiece(createTextPiece(token.text, marks, variant));
          continue;
        }
        case "strong": {
          walk(token.tokens ?? [], { ...marks, bold: true });
          continue;
        }
        case "em": {
          walk(token.tokens ?? [], { ...marks, italic: true });
          continue;
        }
        case "del": {
          walk(token.tokens ?? [], { ...marks, strike: true });
          continue;
        }
        case "codespan": {
          pushPiece(createCodePiece(token.text));
          continue;
        }
        case "link": {
          walk(token.tokens ?? [], { ...marks, href: token.href });
          continue;
        }
        case "image": {
          pushPiece(createImagePiece(token.text.length > 0 ? token.text : token.href));
          continue;
        }
        case "br": {
          pushLineBreak();
          continue;
        }
        case "checkbox": {
          pushPiece(createTextPiece(token.checked ? "[x] " : "[ ] ", marks, variant));
          continue;
        }
        case "html": {
          pushPiece(createTextPiece(token.text, marks, variant));
          continue;
        }
        default: {
          const fallback = fallbackTextForToken(token);
          if (fallback.length > 0) {
            pushPiece(createTextPiece(fallback, marks, variant));
          }
        }
      }
    }
  }
  walk(tokens, EMPTY_MARK_STATE);
  while (lines.length > 0 && lines[lines.length - 1].length === 0) {
    lines.pop();
  }
  return lines;
}
function createTextPiece(text, marks, variant) {
  if (text.length === 0)
    return null;
  return {
    breakMode: "normal",
    className: resolveTextClassName(variant, marks),
    extraWidth: 0,
    font: resolveTextFont(variant, marks),
    href: marks.href,
    text
  };
}
function createCodePiece(text) {
  if (text.length === 0)
    return null;
  return {
    breakMode: "normal",
    className: "frag frag--code",
    extraWidth: INLINE_CODE_EXTRA_WIDTH,
    font: INLINE_CODE_FONT,
    href: null,
    text
  };
}
function createImagePiece(text) {
  return {
    breakMode: "never",
    className: "frag frag--chip",
    extraWidth: IMAGE_EXTRA_WIDTH,
    font: IMAGE_FONT,
    href: null,
    text: text.length > 0 ? text : "image"
  };
}
function canMergeInlinePieces(a, b2) {
  return a.breakMode === b2.breakMode && a.className === b2.className && a.extraWidth === b2.extraWidth && a.font === b2.font && a.href === b2.href;
}
function resolveTextFont(variant, marks) {
  const italicPrefix = marks.italic ? "italic " : "";
  switch (variant) {
    case "heading-1": {
      const weight = marks.bold ? 800 : 700;
      return `${italicPrefix}${weight} 20px ${SERIF_FAMILY}`;
    }
    case "heading-2": {
      const weight = marks.bold ? 800 : 700;
      return `${italicPrefix}${weight} 17px ${SERIF_FAMILY}`;
    }
    case "body": {
      const weight = marks.bold ? 700 : marks.href === null ? 400 : 500;
      return `${italicPrefix}${weight} 14px ${SANS_FAMILY}`;
    }
  }
}
function resolveTextClassName(variant, marks) {
  let className = "frag";
  switch (variant) {
    case "heading-1":
      className += " frag--heading-1";
      break;
    case "heading-2":
      className += " frag--heading-2";
      break;
    case "body":
      className += " frag--body";
      break;
  }
  if (marks.href !== null)
    className += " is-link";
  if (marks.bold)
    className += " is-strong";
  if (marks.italic)
    className += " is-em";
  if (marks.strike)
    className += " is-del";
  return className;
}
function headingVariant(depth) {
  if (depth <= 1)
    return "heading-1";
  if (depth === 2)
    return "heading-2";
  return "body";
}
function lineHeightForVariant(variant) {
  switch (variant) {
    case "heading-1":
      return HEADING_ONE_LINE_HEIGHT;
    case "heading-2":
      return HEADING_TWO_LINE_HEIGHT;
    case "body":
      return BODY_LINE_HEIGHT;
  }
}
function appendBlockGroup(target, group, firstMargin) {
  if (group.length === 0)
    return;
  for (let index = 0;index < group.length; index++) {
    const block = group[index];
    target.push({
      ...block,
      marginTop: index === 0 ? target.length === 0 ? 0 : firstMargin : block.marginTop
    });
  }
}
function shiftBlock(block, delta) {
  return {
    ...block,
    contentLeft: block.contentLeft + delta
  };
}
function resolveListMarkerText(list, item, index) {
  if (item.task)
    return item.checked ? "☑" : "☐";
  if (list.ordered) {
    const start = typeof list.start === "number" ? list.start : 1;
    return `${start + index}.`;
  }
  return "•";
}
function resolveListMarkerClassName(list, item) {
  if (item.task)
    return "block-marker block-marker--task";
  return list.ordered ? "block-marker block-marker--ordered" : "block-marker block-marker--bullet";
}
function measureMarkerWidth(text) {
  const cached = markerWidthCache.get(text);
  if (cached !== undefined)
    return cached;
  const width = measureNaturalWidth(prepareWithSegments(text, MARKER_FONT));
  markerWidthCache.set(text, width);
  return width;
}
function fallbackTextForToken(token) {
  if ("text" in token && typeof token.text === "string")
    return token.text;
  return token.raw ?? "";
}
function formatTable(token) {
  const header = token.header.map((cell) => inlineTokensToPlainText(cell.tokens)).join(" | ");
  const divider = token.header.map(() => "---").join(" | ");
  const rows = token.rows.map((row) => row.map((cell) => inlineTokensToPlainText(cell.tokens)).join(" | "));
  return [header, divider, ...rows].join(`
`);
}
function inlineTokensToPlainText(tokens) {
  let text = "";
  for (let index = 0;index < tokens.length; index++) {
    const token = tokens[index];
    switch (token.type) {
      case "strong":
      case "em":
      case "del":
      case "link":
        text += inlineTokensToPlainText(token.tokens ?? []);
        break;
      case "codespan":
      case "escape":
      case "text":
      case "html":
        text += token.text;
        break;
      case "br":
        text += `
`;
        break;
      case "image":
        text += token.text;
        break;
      default:
        text += fallbackTextForToken(token);
    }
  }
  return text;
}
function stripSingleTrailingNewline(text) {
  return text.endsWith(`
`) ? text.slice(0, -1) : text;
}
function layoutTemplateFrame(template, maxFrameWidth, maxContentWidth, contentInsetX) {
  let y2 = BUBBLE_PADDING_Y;
  const blocks = [];
  let usedContentWidth = 0;
  for (let index = 0;index < template.blocks.length; index++) {
    const block = template.blocks[index];
    y2 += block.marginTop;
    const blockFrame = layoutBlockFrame(block, maxContentWidth, y2);
    blocks.push(blockFrame);
    y2 += blockFrame.height;
    usedContentWidth = Math.max(usedContentWidth, getUsedBlockWidth(blockFrame));
  }
  const bubbleHeight = y2 + BUBBLE_PADDING_Y;
  const frameWidth = template.role === "assistant" ? maxFrameWidth : Math.min(maxFrameWidth, contentInsetX * 2 + Math.max(1, usedContentWidth));
  return {
    blocks,
    bubbleHeight,
    contentInsetX,
    frameWidth,
    layoutContentWidth: maxContentWidth,
    role: template.role,
    totalHeight: bubbleHeight
  };
}
function layoutBlockFrame(block, contentWidth, top) {
  switch (block.kind) {
    case "inline": {
      const lineWidth = Math.max(1, contentWidth - block.contentLeft);
      const { lineCount, maxLineWidth } = measureRichInlineStats(block.flow, lineWidth);
      return {
        contentLeft: block.contentLeft,
        height: lineCount * block.lineHeight,
        kind: "inline",
        lineHeight: block.lineHeight,
        markerClassName: block.markerClassName,
        markerLeft: block.markerLeft,
        markerText: block.markerText,
        quoteRailLefts: block.quoteRailLefts,
        top,
        usedWidth: maxLineWidth
      };
    }
    case "code": {
      const boxWidth = Math.max(1, contentWidth - block.contentLeft);
      const innerWidth = Math.max(1, boxWidth - CODE_BLOCK_PADDING_X * 2);
      const { lineCount, maxLineWidth } = measureLineStats(block.prepared, innerWidth);
      return {
        contentLeft: block.contentLeft,
        height: lineCount * block.lineHeight + CODE_BLOCK_PADDING_Y * 2,
        kind: "code",
        lineHeight: block.lineHeight,
        markerClassName: block.markerClassName,
        markerLeft: block.markerLeft,
        markerText: block.markerText,
        quoteRailLefts: block.quoteRailLefts,
        top,
        width: maxLineWidth + CODE_BLOCK_PADDING_X * 2
      };
    }
    case "rule": {
      return {
        contentLeft: block.contentLeft,
        height: block.height,
        kind: "rule",
        markerClassName: block.markerClassName,
        markerLeft: block.markerLeft,
        markerText: block.markerText,
        quoteRailLefts: block.quoteRailLefts,
        top,
        width: Math.max(1, contentWidth - block.contentLeft)
      };
    }
  }
}
function getUsedBlockWidth(block) {
  switch (block.kind) {
    case "inline":
      return block.contentLeft + block.usedWidth;
    case "code":
      return block.contentLeft + block.width;
    case "rule":
      return block.contentLeft + block.width;
  }
}
function materializeTemplateBlocks(message2) {
  return message2.prepared.blocks.map((block, index) => materializeBlockLayout(block, message2.frame.blocks[index], message2.frame.layoutContentWidth));
}
function materializeBlockLayout(block, frame, contentWidth) {
  switch (frame.kind) {
    case "inline": {
      if (block.kind !== "inline")
        throw new Error("Inline block/frame mismatch");
      const lineWidth = Math.max(1, contentWidth - frame.contentLeft);
      const lines = [];
      walkRichInlineLineRanges(block.flow, lineWidth, (range) => {
        const line = materializeRichInlineLineRange(block.flow, range);
        lines.push({
          fragments: line.fragments.map((fragment) => ({
            className: block.classNames[fragment.itemIndex],
            href: block.hrefs[fragment.itemIndex] ?? null,
            leadingGap: fragment.gapBefore,
            text: fragment.text
          })),
          width: line.width
        });
      });
      return {
        contentLeft: frame.contentLeft,
        height: frame.height,
        kind: "inline",
        lineHeight: frame.lineHeight,
        lines,
        markerClassName: frame.markerClassName,
        markerLeft: frame.markerLeft,
        markerText: frame.markerText,
        quoteRailLefts: frame.quoteRailLefts,
        top: frame.top,
        usedWidth: frame.usedWidth
      };
    }
    case "code": {
      if (block.kind !== "code")
        throw new Error("Code block/frame mismatch");
      const boxWidth = Math.max(1, contentWidth - frame.contentLeft);
      const innerWidth = Math.max(1, boxWidth - CODE_BLOCK_PADDING_X * 2);
      const layout2 = layoutWithLines(block.prepared, innerWidth, frame.lineHeight);
      return {
        contentLeft: frame.contentLeft,
        height: frame.height,
        kind: "code",
        lines: layout2.lines,
        markerClassName: frame.markerClassName,
        markerLeft: frame.markerLeft,
        markerText: frame.markerText,
        quoteRailLefts: frame.quoteRailLefts,
        top: frame.top,
        usedWidth: frame.width,
        width: frame.width
      };
    }
    case "rule": {
      if (block.kind !== "rule")
        throw new Error("Rule block/frame mismatch");
      return {
        contentLeft: frame.contentLeft,
        height: frame.height,
        kind: "rule",
        markerClassName: frame.markerClassName,
        markerLeft: frame.markerLeft,
        markerText: frame.markerText,
        quoteRailLefts: frame.quoteRailLefts,
        top: frame.top,
        width: frame.width
      };
    }
  }
}

// pages/demos/markdown-chat.ts
var domCache = {
  root: document.documentElement,
  shell: getRequiredElement("chat-shell"),
  viewport: getRequiredDiv("chat-viewport"),
  canvas: getRequiredDiv("chat-canvas"),
  toggleButton: getRequiredButton("virtualization-toggle"),
  rows: [],
  mountedStart: 0,
  mountedEnd: 0
};
var templates = createPreparedChatTemplates();
var st = {
  events: {
    toggleVisualization: false
  },
  frame: null,
  isVisualizationOn: false
};
var scheduledRaf = null;
domCache.root.style.setProperty("--message-side-padding", `${MESSAGE_SIDE_PADDING}px`);
domCache.toggleButton.addEventListener("click", () => {
  st.events.toggleVisualization = true;
  scheduleRender();
});
domCache.viewport.addEventListener("scroll", scheduleRender, { passive: true });
window.addEventListener("resize", scheduleRender);
await document.fonts.ready;
scheduleRender();
function getRequiredDiv(id) {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLDivElement))
    throw new Error(`Missing div #${id}`);
  return element;
}
function getRequiredElement(id) {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement))
    throw new Error(`Missing element #${id}`);
  return element;
}
function getRequiredButton(id) {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLButtonElement))
    throw new Error(`Missing button #${id}`);
  return element;
}
function scheduleRender() {
  if (scheduledRaf !== null)
    return;
  scheduledRaf = requestAnimationFrame(function renderMarkdownChatFrame() {
    scheduledRaf = null;
    render();
  });
}
function render() {
  const viewportWidth = domCache.viewport.clientWidth;
  const viewportHeight = domCache.viewport.clientHeight;
  const scrollTop = domCache.viewport.scrollTop;
  const occlusionBannerHeight = getOcclusionBannerHeight(viewportHeight);
  const isCompactOcclusionChrome = occlusionBannerHeight < OCCLUSION_BANNER_HEIGHT;
  let isVisualizationOn = st.isVisualizationOn;
  if (st.events.toggleVisualization)
    isVisualizationOn = !isVisualizationOn;
  const chatWidth = getMaxChatWidth(viewportWidth);
  const previousFrame = st.frame;
  const canReuseFrame = previousFrame !== null && previousFrame.chatWidth === chatWidth && previousFrame.occlusionBannerHeight === occlusionBannerHeight;
  const frame = canReuseFrame ? previousFrame : buildConversationFrame(templates, chatWidth, occlusionBannerHeight);
  const needsRelayout = !canReuseFrame;
  const { start, end } = findVisibleRange(frame, scrollTop, viewportHeight, occlusionBannerHeight, occlusionBannerHeight);
  st.frame = frame;
  st.isVisualizationOn = isVisualizationOn;
  st.events.toggleVisualization = false;
  domCache.root.style.setProperty("--chat-width", `${frame.chatWidth}px`);
  domCache.root.style.setProperty("--occlusion-banner-height", `${occlusionBannerHeight}px`);
  domCache.root.style.setProperty("--occlusion-banner-padding-block", isCompactOcclusionChrome ? "6px" : "12px");
  domCache.root.style.setProperty("--virtualization-toggle-padding-block", isCompactOcclusionChrome ? "8px" : "10px");
  domCache.root.style.setProperty("--virtualization-toggle-padding-inline", isCompactOcclusionChrome ? "12px" : "14px");
  domCache.root.style.setProperty("--virtualization-toggle-font-size", isCompactOcclusionChrome ? "11px" : "12px");
  domCache.shell.dataset["visualization"] = isVisualizationOn ? "on" : "off";
  domCache.canvas.style.height = `${frame.totalHeight}px`;
  domCache.toggleButton.textContent = isVisualizationOn ? "Hide virtualization mask" : "Show virtualization mask";
  domCache.toggleButton.setAttribute("aria-pressed", String(isVisualizationOn));
  projectVisibleRows(frame, start, end, needsRelayout);
}
function projectVisibleRows(frame, start, end, needsRelayout) {
  const previousStart = domCache.mountedStart;
  const previousEnd = domCache.mountedEnd;
  const overlapStart = Math.max(start, previousStart);
  const overlapEnd = Math.min(end, previousEnd);
  for (let index = previousStart;index < Math.min(previousEnd, start); index++) {
    const node = domCache.rows[index];
    if (node === undefined)
      continue;
    node.row.remove();
    domCache.rows[index] = undefined;
  }
  for (let index = Math.max(previousStart, end);index < previousEnd; index++) {
    const node = domCache.rows[index];
    if (node === undefined)
      continue;
    node.row.remove();
    domCache.rows[index] = undefined;
  }
  if (overlapStart >= overlapEnd) {
    for (let index = start;index < end; index++) {
      const cachedRow = prepareRow(frame.messages[index], index, needsRelayout);
      projectMessageNode(cachedRow, frame.messages[index].frame, frame.messages[index].top);
      if (cachedRow.row.parentNode === null)
        domCache.canvas.append(cachedRow.row);
    }
  } else {
    let anchorRow = domCache.rows[overlapStart]?.row ?? null;
    for (let index = overlapStart - 1;index >= start; index--) {
      const cachedRow = prepareRow(frame.messages[index], index, needsRelayout);
      projectMessageNode(cachedRow, frame.messages[index].frame, frame.messages[index].top);
      if (anchorRow === null) {
        if (cachedRow.row.parentNode === null)
          domCache.canvas.append(cachedRow.row);
      } else if (cachedRow.row.parentNode !== domCache.canvas || cachedRow.row.nextSibling !== anchorRow) {
        domCache.canvas.insertBefore(cachedRow.row, anchorRow);
      }
      anchorRow = cachedRow.row;
    }
    for (let index = overlapStart;index < overlapEnd; index++) {
      const cachedRow = prepareRow(frame.messages[index], index, needsRelayout);
      projectMessageNode(cachedRow, frame.messages[index].frame, frame.messages[index].top);
    }
    for (let index = overlapEnd;index < end; index++) {
      const cachedRow = prepareRow(frame.messages[index], index, needsRelayout);
      projectMessageNode(cachedRow, frame.messages[index].frame, frame.messages[index].top);
      if (cachedRow.row.parentNode === null)
        domCache.canvas.append(cachedRow.row);
    }
  }
  domCache.mountedStart = start;
  domCache.mountedEnd = end;
}
function prepareRow(message2, index, needsRelayout) {
  let cachedRow = domCache.rows[index];
  if (cachedRow === undefined) {
    cachedRow = createMessageShell(message2.frame.role);
    domCache.rows[index] = cachedRow;
    renderMessageContents(cachedRow.bubble, message2);
    return cachedRow;
  }
  if (needsRelayout)
    renderMessageContents(cachedRow.bubble, message2);
  return cachedRow;
}
function createMessageShell(role) {
  const row = document.createElement("article");
  row.className = `msg msg--${role}`;
  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  row.append(bubble);
  return { bubble, row };
}
function renderMessageContents(bubble, message2) {
  const blocks = materializeTemplateBlocks(message2);
  const fragment = document.createDocumentFragment();
  for (let index = 0;index < blocks.length; index++) {
    fragment.append(renderBlock(blocks[index], message2.frame.contentInsetX));
  }
  bubble.replaceChildren(fragment);
}
function projectMessageNode(cachedRow, frame, top) {
  cachedRow.row.style.top = `${top}px`;
  cachedRow.row.style.height = `${frame.totalHeight}px`;
  cachedRow.bubble.style.width = `${frame.frameWidth}px`;
  cachedRow.bubble.style.height = `${frame.bubbleHeight}px`;
}
function renderBlock(block, contentInsetX) {
  switch (block.kind) {
    case "inline":
      return renderInlineBlock(block, contentInsetX);
    case "code":
      return renderCodeBlock(block, contentInsetX);
    case "rule":
      return renderRuleBlock(block, contentInsetX);
  }
}
function renderInlineBlock(block, contentInsetX) {
  const wrapper = createBlockShell(block, "block block--inline", contentInsetX);
  for (let lineIndex = 0;lineIndex < block.lines.length; lineIndex++) {
    const line = block.lines[lineIndex];
    const row = document.createElement("div");
    row.className = "line-row";
    row.style.height = `${block.lineHeight}px`;
    row.style.left = `${contentInsetX + block.contentLeft}px`;
    row.style.top = `${lineIndex * block.lineHeight}px`;
    for (let fragmentIndex = 0;fragmentIndex < line.fragments.length; fragmentIndex++) {
      row.append(renderInlineFragment(line.fragments[fragmentIndex]));
    }
    wrapper.append(row);
  }
  return wrapper;
}
function renderCodeBlock(block, contentInsetX) {
  const wrapper = createBlockShell(block, "block block--code-shell", contentInsetX);
  const codeBox = document.createElement("div");
  codeBox.className = "code-box";
  codeBox.style.left = `${contentInsetX + block.contentLeft}px`;
  codeBox.style.width = `${block.width}px`;
  codeBox.style.height = `${block.height}px`;
  for (let lineIndex = 0;lineIndex < block.lines.length; lineIndex++) {
    const line = block.lines[lineIndex];
    const row = document.createElement("div");
    row.className = "code-line";
    row.style.left = `${CODE_BLOCK_PADDING_X}px`;
    row.style.top = `${CODE_BLOCK_PADDING_Y + lineIndex * CODE_LINE_HEIGHT}px`;
    row.textContent = line.text;
    codeBox.append(row);
  }
  wrapper.append(codeBox);
  return wrapper;
}
function renderRuleBlock(block, contentInsetX) {
  const wrapper = createBlockShell(block, "block block--rule-shell", contentInsetX);
  const rule = document.createElement("div");
  rule.className = "rule-line";
  rule.style.left = `${contentInsetX + block.contentLeft}px`;
  rule.style.top = `${Math.floor(block.height / 2)}px`;
  rule.style.width = `${block.width}px`;
  wrapper.append(rule);
  return wrapper;
}
function createBlockShell(block, className, contentInsetX) {
  const wrapper = document.createElement("div");
  wrapper.className = className;
  wrapper.style.top = `${block.top}px`;
  wrapper.style.height = `${block.height}px`;
  appendRails(wrapper, block, contentInsetX);
  appendMarker(wrapper, block, contentInsetX);
  return wrapper;
}
function appendRails(wrapper, block, contentInsetX) {
  for (let index = 0;index < block.quoteRailLefts.length; index++) {
    const rail = document.createElement("div");
    rail.className = "quote-rail";
    rail.style.left = `${contentInsetX + block.quoteRailLefts[index]}px`;
    wrapper.append(rail);
  }
}
function appendMarker(wrapper, block, contentInsetX) {
  if (block.markerText === null || block.markerLeft === null || block.markerClassName === null)
    return;
  const marker = document.createElement("span");
  marker.className = block.markerClassName;
  marker.style.left = `${contentInsetX + block.markerLeft}px`;
  marker.style.top = `${markerTop(block)}px`;
  marker.textContent = block.markerText;
  wrapper.append(marker);
}
function markerTop(block) {
  switch (block.kind) {
    case "code":
      return CODE_BLOCK_PADDING_Y;
    case "inline":
      return Math.max(0, Math.round((block.lineHeight - 12) / 2));
    case "rule":
      return 0;
  }
}
function renderInlineFragment(fragment) {
  const node = fragment.href === null ? document.createElement("span") : document.createElement("a");
  node.className = fragment.className;
  if (fragment.leadingGap > 0) {
    node.style.marginLeft = `${fragment.leadingGap}px`;
  }
  node.textContent = fragment.text;
  if (node instanceof HTMLAnchorElement && fragment.href !== null) {
    node.href = fragment.href;
    node.target = "_blank";
    node.rel = "noreferrer";
  }
  return node;
}
