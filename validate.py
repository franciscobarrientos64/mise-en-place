#!/usr/bin/env python3
"""Pre-push validator for Mise en Place — catches real Babel-breaking errors."""
import re, sys

def validate(path):
    with open(path,'r') as f:
        content = f.read()

    script_start = content.find('<script type="text/babel">') + len('<script type="text/babel">')
    script_end   = content.rfind('</script>')
    script = content[script_start:script_end]
    errors = []

    # ── 1. Literal newlines inside JS regex literals ───────────────────
    # Only flag when a regex contains a backtick or quote followed by a literal newline
    # Pattern: /...`...newline or /..."...newline  (inside actual JS regex, not JSX)
    for m in re.finditer(r'replace\([^)]*\n[^)]*\)', script):
        line = script[:m.start()].count('\n') + 1
        snippet = m.group()[:80].replace('\n','↵')
        errors.append(f"LITERAL_NEWLINE_IN_REPLACE at line {line}: {snippet}")

    for m in re.finditer(r'match\([^)]*\n[^)]*\)', script):
        line = script[:m.start()].count('\n') + 1
        snippet = m.group()[:80].replace('\n','↵')
        errors.append(f"LITERAL_NEWLINE_IN_MATCH at line {line}: {snippet}")

    # ── 2. Double brace wrapping JSX expressions ───────────────────────
    # e.g. {{view==="gallery"&&<Gallery .../>}} — breaks JSX parsing
    for m in re.finditer(r'\{\{(?:view|nav|tab)===', script):
        line = script[:m.start()].count('\n') + 1
        errors.append(f"DOUBLE_BRACE at line {line}: {script[m.start():m.start()+50]}")

    # ── 3. Variables used in component but not declared in its props ───
    TRACKED_PROPS = ['sbSyncing','sbReady','onForceSync','onBatch','onBatchJSON','setRec']
    # Find function components and their bodies
    for m in re.finditer(r'function (\w+)\(\{([^}]*)\}\)', script):
        name   = m.group(1)
        params = m.group(2)
        # Get component body (until next top-level function)
        body_start = m.end()
        next_fn = re.search(r'\nfunction \w+\(', script[body_start:])
        body = script[body_start: body_start + (next_fn.start() if next_fn else len(script))]
        for prop in TRACKED_PROPS:
            used     = bool(re.search(r'\b' + prop + r'\b', body))
            declared = prop in params
            if used and not declared:
                errors.append(f"MISSING_PROP '{prop}' in {name}() — used but not in signature")

    # ── 4. DEMO_R bracket balance ──────────────────────────────────────
    demo_s = content.find('const DEMO_R=[')
    demo_e = content.find('\n];', demo_s)
    if demo_s != -1 and demo_e != -1:
        demo = content[demo_s:demo_e]
        opens  = demo.count('{') + demo.count('[') - demo.count('"{') - demo.count("'{")
        closes = demo.count('}') + demo.count(']') - demo.count('}"') - demo.count("}'")
        if abs(opens - closes) > 8:
            errors.append(f"DEMO_R BRACKET IMBALANCE: {opens} opens vs {closes} closes")

    # ── 5. Required global functions ─────────────────────────────────────
    REQUIRED_GLOBALS = ['loadIngredients','loadPairings','savePairing','sbBatch','sbUpsert','sbLoad','gid']
    for fn in REQUIRED_GLOBALS:
        if fn not in script:
            errors.append(f"MISSING_GLOBAL '{fn}' — function not defined in script")

    # ── 6. Duplicate function definitions ────────────────────────────────
    import re as _re
    fn_names = _re.findall(r'function (\w+)\s*\(', script)
    seen = set(); dupes = set()
    for fn in fn_names:
        if fn in seen: dupes.add(fn)
        seen.add(fn)
    if dupes:
        errors.append(f"DUPLICATE FUNCTIONS: {', '.join(dupes)} — defined more than once")

    # ── Result ─────────────────────────────────────────────────────────
    lines = len(script.splitlines())
    if errors:
        print(f"❌ VALIDATION FAILED ({lines} lines):")
        for e in errors: print(f"   • {e}")
        return False
    print(f"✅ OK — {lines} script lines, no errors found")
    return True

if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
    sys.exit(0 if validate(path) else 1)
