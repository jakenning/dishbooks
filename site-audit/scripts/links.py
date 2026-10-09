import json, sys, subprocess, collections, urllib.parse, concurrent.futures as cf
d = json.load(open(sys.argv[1]))
idsby = {r['path']: set(r.get('ids', [])) for r in d}
uses = collections.defaultdict(set)   # url -> pages using it
texts = {}
anchor_issues = []; empty = collections.Counter(); http_links = collections.defaultdict(set); blank_noopener = []
for r in d:
    for l in r.get('links', []):
        h = l['href']
        if h is None or h.strip() in ('', '#'):
            if l['vis']: empty[(r['path'], l['text'])] += 1
            continue
        if h.startswith(('mailto:', 'tel:', 'javascript:')): continue
        absu = l['abs']
        u = urllib.parse.urlsplit(absu)
        if u.fragment and u.netloc == 'dishbooks.com':
            tgt = u.path.rstrip('/') or '/'
            if tgt in idsby and u.fragment not in idsby[tgt]: anchor_issues.append((r['path'], h))
        if absu.startswith('http://'): http_links[absu].add(r['path'])
        key = urllib.parse.urlunsplit((u.scheme, u.netloc, u.path, u.query, ''))
        uses[key].add(r['path']); texts[key] = l['text']
def check(u):
    out = subprocess.run(['curl', '-sS', '-o', '/dev/null', '-L', '-m', '20', '-A', 'Mozilla/5.0 (Macintosh) Chrome/130', '-w', '%{http_code} %{num_redirects} %{url_effective}', u], capture_output=True, text=True)
    return u, (out.stdout or out.stderr).strip()
res = {}
with cf.ThreadPoolExecutor(8) as ex:
    for u, s in ex.map(check, uses): res[u] = s
bad = {u: s for u, s in res.items() if not s.startswith(('200', '999'))}
redir = {u: s for u, s in res.items() if s.startswith('200') and s.split()[1] != '0'}
print('checked', len(res), 'unique URLs')
print('\nBROKEN / non-200:')
for u, s in sorted(bad.items()): print(' ', s.split()[0], u, '| text:', texts[u], '| on', len(uses[u]), 'pages:', sorted(uses[u])[:6])
print('\nREDIRECTING links (200 after redirect):')
for u, s in sorted(redir.items()): print(' ', u, '->', s.split()[2], f'({s.split()[1]} hops) on', len(uses[u]), 'pages')
print('\nhttp:// links:', {k: sorted(v)[:5] for k, v in http_links.items()})
print('\nmissing anchors:', anchor_issues[:20])
print('\nvisible href="#"/empty links:', sum(empty.values()), dict(list(empty.items())[:15]))
json.dump({'bad': bad, 'redir': redir, 'uses': {k: sorted(v) for k, v in uses.items()}, 'anchors': anchor_issues, 'empty': [list(k) + [v] for k, v in empty.items()]}, open(sys.argv[2], 'w'), indent=1)
