import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const phoneRoot = path.resolve(here, '..');
const srcDir = path.join(phoneRoot, 'src');
const require = createRequire(path.join(phoneRoot, 'package.json'));
const { parse } = require('@babel/parser');
const traverseModule = require('@babel/traverse');
const traverse = traverseModule.default ?? traverseModule;

const MIN_TARGET = 44;
const MIN_SENTENCE_FONT = 18;
const TIMER_FNS = new Set(['setTimeout', 'setInterval', 'setImmediate']);
const TOUCHABLES = new Set(['Pressable', 'TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback', 'TextInput', 'Button']);
const ANIMATION_IDS = ['Animated', 'LayoutAnimation', 'requestAnimationFrame', 'useAnimatedStyle', 'withTiming', 'withSpring'];
const ANIMATION_MODULES = ['react-native-reanimated', 'moti', 'react-native-animatable'];
const REQUIRED = {
  'App.tsx': [
    ['hub URL input', /<TextInput\b/],
    ['ring/phone source segment', /s\.segBtn\b/],
    ['on-screen ring button', /accessibilityLabel="Ring button"/],
    ['reticle', /s\.reticle\b/],
  ],
  'RingScreen.tsx': [
    ['ring status pill', /s\.pill\b/],
    ['ring viewer', /s\.viewer\b/],
    ['SayPanel', /<SayPanel\b/],
    ['NetworkLine', /<NetworkLine\b/],
  ],
  'SayPanel.tsx': [
    ['quick phrases', /quickPhrases/],
    ['item card', /s\.itemRow\b/],
    ['intents', /s\.intent\b/],
    ['sentences', /s\.sentence\b/],
    ['take picture', /onTakePicture/],
  ],
  'ContactsScreen.tsx': [
    ['back button', /s\.back\b/],
    ['contact rows', /s\.row\b/],
    ['primary action', /s\.primary\b/],
  ],
  'NetworkLine.tsx': [['status line', /s\.line\b/]],
};

const files = readdirSync(srcDir).filter((f) => f.endsWith('.tsx')).sort();
const failures = [];
const infos = [];
const checked = { targets: 0, texts: 0, timers: 0 };

const num = (node) => {
  if (!node) return undefined;
  if (node.type === 'NumericLiteral') return node.value;
  if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'NumericLiteral') return -node.argument.value;
  return undefined;
};

const collectStyleRefs = (node, out, conditional = false) => {
  if (!node) return;
  switch (node.type) {
    case 'MemberExpression':
      if (node.object.type === 'Identifier' && node.property.type === 'Identifier') out.push({ obj: node.object.name, key: node.property.name, conditional });
      return;
    case 'ArrayExpression':
      node.elements.forEach((e) => collectStyleRefs(e, out, conditional));
      return;
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      if (node.body.type === 'BlockStatement') {
        node.body.body.forEach((st) => st.type === 'ReturnStatement' && collectStyleRefs(st.argument, out, conditional));
      } else collectStyleRefs(node.body, out, conditional);
      return;
    case 'LogicalExpression':
      collectStyleRefs(node.right, out, true);
      return;
    case 'ConditionalExpression':
      collectStyleRefs(node.consequent, out, true);
      collectStyleRefs(node.alternate, out, true);
      return;
    case 'ObjectExpression':
      out.push({ inline: node, conditional });
      return;
    case 'JSXExpressionContainer':
      collectStyleRefs(node.expression, out, conditional);
      return;
    default:
      return;
  }
};

const objProps = (obj) => {
  const props = {};
  for (const p of obj.properties) {
    if (p.type !== 'ObjectProperty' || p.key.type !== 'Identifier') continue;
    const v = num(p.value);
    if (v !== undefined) props[p.key.name] = v;
  }
  return props;
};

for (const file of files) {
  const full = path.join(srcDir, file);
  const code = readFileSync(full, 'utf8');
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  const sheets = {};
  const localFns = {};

  traverse(ast, {
    VariableDeclarator(p) {
      const { id, init } = p.node;
      if (id.type !== 'Identifier' || !init) return;
      if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') localFns[id.name] = init;
      if (init.type === 'CallExpression' && init.callee.type === 'MemberExpression' && init.callee.object.name === 'StyleSheet' && init.callee.property.name === 'create' && init.arguments[0]?.type === 'ObjectExpression') {
        const sheet = {};
        for (const prop of init.arguments[0].properties) {
          if (prop.type !== 'ObjectProperty' || prop.key.type !== 'Identifier' || prop.value.type !== 'ObjectExpression') continue;
          sheet[prop.key.name] = { line: prop.loc.start.line, props: objProps(prop.value) };
        }
        sheets[id.name] = sheet;
      }
    },
  });

  const resolve = (attrNode) => {
    const refs = [];
    collectStyleRefs(attrNode, refs);
    const merged = { base: {}, all: {}, names: [], lines: [] };
    for (const r of refs) {
      let props;
      let name;
      if (r.inline) {
        props = objProps(r.inline);
        name = `{inline:${r.inline.loc.start.line}}`;
      } else {
        const entry = sheets[r.obj]?.[r.key];
        if (!entry) continue;
        props = entry.props;
        name = `${r.obj}.${r.key}`;
        merged.lines.push(entry.line);
      }
      merged.names.push(name + (r.conditional ? '?' : ''));
      Object.assign(merged.all, props);
      if (!r.conditional) Object.assign(merged.base, props);
    }
    return merged;
  };

  const sizeOf = (props) => {
    const h = Math.max(props.height ?? -Infinity, props.minHeight ?? -Infinity);
    const w = Math.max(props.width ?? -Infinity, props.minWidth ?? -Infinity);
    return { h: Number.isFinite(h) ? h : undefined, w: Number.isFinite(w) ? w : undefined };
  };

  const timerBodyHasSetter = (cb, depth = 0) => {
    if (!cb || depth > 2) return [];
    let fn = cb;
    if (cb.type === 'Identifier') fn = localFns[cb.name];
    if (!fn) return [];
    const setters = [];
    const walk = (n) => {
      if (!n || typeof n.type !== 'string') return;
      if (n.type === 'CallExpression') {
        const c = n.callee;
        if (c.type === 'Identifier' && /^set[A-Z]/.test(c.name) && !TIMER_FNS.has(c.name)) setters.push(c.name);
        if (c.type === 'Identifier' && localFns[c.name] && depth < 2) setters.push(...timerBodyHasSetter(c, depth + 1).map((s) => `${c.name}→${s}`));
      }
      for (const k of Object.keys(n)) {
        if (k === 'loc' || k === 'type') continue;
        const v = n[k];
        if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v.type === 'string') walk(v);
      }
    };
    walk(fn.body);
    return setters;
  };

  traverse(ast, {
    ImportDeclaration(p) {
      const src = p.node.source.value;
      if (ANIMATION_MODULES.includes(src)) failures.push({ file, line: p.node.loc.start.line, kind: 'animation', msg: `imports animation module '${src}'` });
      for (const sp of p.node.specifiers) {
        const n = sp.imported?.name ?? sp.local.name;
        if (ANIMATION_IDS.includes(n)) failures.push({ file, line: p.node.loc.start.line, kind: 'animation', msg: `imports '${n}' from '${src}'` });
      }
    },
    Identifier(p) {
      if (p.node.name === 'requestAnimationFrame' && p.parent.type === 'CallExpression') failures.push({ file, line: p.node.loc.start.line, kind: 'animation', msg: 'requestAnimationFrame call' });
    },
    CallExpression(p) {
      const c = p.node.callee;
      if (c.type === 'Identifier' && (c.name === 'setTimeout' || c.name === 'setInterval')) {
        checked.timers++;
        const delay = num(p.node.arguments[1]);
        const setters = timerBodyHasSetter(p.node.arguments[0]);
        const where = { file, line: p.node.loc.start.line };
        if (setters.length) failures.push({ ...where, kind: 'timer', msg: `${c.name}(${delay ?? '?'}ms) changes state without input: ${[...new Set(setters)].join(', ')}` });
        else infos.push({ ...where, kind: 'timer-ok', msg: `${c.name}(${delay ?? '?'}ms) touches no state setter` });
      }
    },
    JSXOpeningElement(p) {
      const nameNode = p.node.name;
      const tag = nameNode.type === 'JSXIdentifier' ? nameNode.name : null;
      if (!tag) return;
      const styleAttr = p.node.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === 'style');
      const line = p.node.loc.start.line;
      if (TOUCHABLES.has(tag)) {
        checked.targets++;
        const hasHitSlop = p.node.attributes.some((a) => a.type === 'JSXAttribute' && a.name.name === 'hitSlop');
        const st = styleAttr ? resolve(styleAttr.value) : { base: {}, all: {}, names: [], lines: [] };
        const { h, w } = sizeOf(st.base);
        const label = `${tag} [${st.names.join(', ') || 'no style'}]`;
        if (h === undefined) {
          infos.push({ file, line, kind: 'target-unsized', msg: `${label}: no height/minHeight; size comes from content${hasHitSlop ? ' (has hitSlop)' : ''}` });
        } else if (h < MIN_TARGET && !hasHitSlop) {
          failures.push({ file, line, kind: 'target', msg: `${label}: height ${h} < ${MIN_TARGET} (style at line ${st.lines.join('/')})` });
        }
        if (w !== undefined && w < MIN_TARGET && !hasHitSlop) failures.push({ file, line, kind: 'target', msg: `${label}: width ${w} < ${MIN_TARGET}` });
      }
      if (tag === 'Text') {
        checked.texts++;
        const st = styleAttr ? resolve(styleAttr.value) : { base: {}, all: {}, names: [], lines: [] };
        const fs = st.base.fontSize ?? st.all.fontSize;
        const isSentence = st.names.some((n) => /sentence/i.test(n));
        if (fs === undefined) infos.push({ file, line, kind: 'text-unsized', msg: `Text [${st.names.join(', ') || 'no style'}]: no fontSize (RN default 14)` });
        else if (isSentence && fs < MIN_SENTENCE_FONT) failures.push({ file, line, kind: 'sentence-font', msg: `sentence Text [${st.names.join(', ')}]: fontSize ${fs} < ${MIN_SENTENCE_FONT}` });
        else if (fs < MIN_SENTENCE_FONT) infos.push({ file, line, kind: 'text-small', msg: `Text [${st.names.join(', ')}]: fontSize ${fs} < ${MIN_SENTENCE_FONT}` });
      }
    },
  });

  for (const [label, re] of REQUIRED[file] ?? []) {
    if (!re.test(code)) failures.push({ file, line: 1, kind: 'missing-block', msg: `required block '${label}' not found (${re})` });
    else infos.push({ file, line: code.slice(0, code.search(re)).split('\n').length, kind: 'block-ok', msg: `required block '${label}' present` });
  }
}

const fmt = (r) => `- ${r.file}:${r.line} [${r.kind}] ${r.msg}`;
const byKind = (list, kind) => list.filter((r) => r.kind === kind);
const lines = [];
lines.push('# Phone app layout audit (static)');
lines.push('');
lines.push(`Generated by \`node phone/scripts/layout-audit.mjs\` on ${new Date().toISOString()}.`);
lines.push('');
lines.push('Method: static AST audit of phone/src/*.tsx with @babel/parser + @babel/traverse (installed under phone/node_modules). No renderer is installed (no jest-expo, react-test-renderer, react-dom or react-native-web), so sizes are read from StyleSheet.create numbers referenced by each Pressable/Touchable/TextInput and Text, not from laid-out boxes. Conditional styles (`cond && s.x`, pressed-state) are marked with `?` and excluded from the base size.');
lines.push('');
lines.push(`Files: ${files.join(', ')}`);
lines.push(`Checked: ${checked.targets} touch targets, ${checked.texts} Text elements, ${checked.timers} timers.`);
lines.push('');
lines.push('Limits: a Pressable with no height/minHeight is reported as unsized, not failed, because its size depends on content; Text sizes are fontSize values, not rendered glyph heights; timers are flagged when their callback (or a local function it calls) invokes a React state setter. A rendered check would need jest-expo + react-test-renderer (or react-native-web + react-dom for expo export --platform web) installed under phone/, which are not present.');
lines.push('');
lines.push(`## Result: ${failures.length === 0 ? 'PASS' : `FAIL (${failures.length} findings)`}`);
lines.push('');
for (const kind of ['target', 'sentence-font', 'animation', 'timer', 'missing-block']) {
  const rows = byKind(failures, kind);
  lines.push(`### ${kind}: ${rows.length}`);
  lines.push(rows.length ? rows.map(fmt).join('\n') : '- none');
  lines.push('');
}
lines.push('## Informational');
lines.push('');
for (const kind of ['target-unsized', 'text-small', 'text-unsized', 'timer-ok', 'block-ok']) {
  const rows = byKind(infos, kind);
  lines.push(`### ${kind}: ${rows.length}`);
  lines.push(rows.length ? rows.map(fmt).join('\n') : '- none');
  lines.push('');
}
const report = lines.join('\n');
const outArg = process.argv.indexOf('--out');
if (outArg !== -1 && process.argv[outArg + 1]) {
  const out = path.resolve(process.cwd(), process.argv[outArg + 1]);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, report);
  console.log(`wrote ${out}`);
}
console.log(report);
process.exit(failures.length ? 1 : 0);
