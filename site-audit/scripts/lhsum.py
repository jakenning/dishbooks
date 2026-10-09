import json, glob, os, statistics, sys, collections
D = sys.argv[1]
rows = collections.defaultdict(list)
for f in sorted(glob.glob(os.path.join(D, '*-r*.json'))):
    name, form, r = os.path.basename(f)[:-5].rsplit('-', 2)
    try: j = json.load(open(f))
    except Exception as e: print('bad', f, e); continue
    if j.get('runtimeError'): print('runtimeError', f, j['runtimeError']); continue
    a = j['audits']; c = j['categories']
    items = a['network-requests']['details']['items'] if a.get('network-requests', {}).get('details') else []
    rows[(name, form)].append(dict(
        perf=c['performance']['score'], a11y=c['accessibility']['score'], bp=c['best-practices']['score'], seo=c['seo']['score'],
        fcp=a['first-contentful-paint']['numericValue'], lcp=a['largest-contentful-paint']['numericValue'],
        tbt=a['total-blocking-time']['numericValue'], cls=a['cumulative-layout-shift']['numericValue'], si=a['speed-index']['numericValue'],
        bytes=a['total-byte-weight']['numericValue'], reqs=len(items), file=os.path.basename(f)))
out = {}
for (name, form), rs in sorted(rows.items()):
    med = {k: statistics.median([r[k] for r in rs]) for k in rs[0] if k != 'file'}
    # representative run = the one whose perf score is the median
    rep = sorted(rs, key=lambda r: r['perf'])[len(rs) // 2]['file']
    med['n'] = len(rs); med['rep'] = rep
    out[f'{name}-{form}'] = med
    print(f"{name:8} {form:7} n={len(rs)} P{round(med['perf']*100):3} A{round(med['a11y']*100):3} BP{round(med['bp']*100):3} SEO{round(med['seo']*100):3} "
          f"FCP {med['fcp']/1000:4.1f}s LCP {med['lcp']/1000:4.1f}s TBT {med['tbt']:5.0f}ms CLS {med['cls']:.3f} SI {med['si']/1000:4.1f}s {med['bytes']/1048576:5.2f}MB {med['reqs']:.0f}req  perf-spread {[round(r['perf']*100) for r in rs]}")
json.dump(out, open(os.path.join(D, 'summary.json'), 'w'), indent=1)
