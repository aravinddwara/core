export async function N(e) {
    try {
        if (!e) return '';
        let t = (function (e) {
            let t = atob(e.replace(/\s+/g, '')),
                n = t.length,
                r = new Uint8Array(n);
            for (let e = 0; e < n; e++) r[e] = t.charCodeAt(e);
            return r;
        })(e);
        if (t.length <= 28) return '';
        let n = t.slice(0, 12),
            r = t.slice(12, 28),
            a = t.slice(28),
            i = new Uint8Array(a.length + r.length);
        (i.set(a, 0), i.set(r, a.length));
        let s = new TextEncoder(),
            l = await crypto.subtle.digest('SHA-256', s.encode(E)),
            o = await crypto.subtle.importKey(
                'raw',
                l,
                {
                    name: 'AES-GCM',
                },
                !1,
                ['decrypt']
            ),
            c = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: n,
                    tagLength: 128,
                },
                o,
                i
            );
        return new TextDecoder().decode(c);
    } catch (e) {
        return '';
    }
}
