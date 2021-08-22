function _compress(o, r, n) {
	if (null == o)
		return "";
	var e, t, i, s = {}, p = {}, u = "", c = "", a = "", l = 2, f = 3, h = 2, d = [], m = 0, v = 0;
	for (i = 0; i < o.length; i += 1)
		if (u = o.charAt(i),
		Object.prototype.hasOwnProperty.call(s, u) || (s[u] = f++,
		p[u] = !0),
		c = a + u,
		Object.prototype.hasOwnProperty.call(s, c))
			a = c;
		else {
			if (Object.prototype.hasOwnProperty.call(p, a)) {
				if (a.charCodeAt(0) < 256) {
					for (e = 0; h > e; e++)
						m <<= 1,
						v == r - 1 ? (v = 0,
						d.push(n(m)),
						m = 0) : v++;
					for (t = a.charCodeAt(0),
					e = 0; 8 > e; e++)
						m = m << 1 | 1 & t,
						v == r - 1 ? (v = 0,
						d.push(n(m)),
						m = 0) : v++,
						t >>= 1
				} else {
					for (t = 1,
					e = 0; h > e; e++)
						m = m << 1 | t,
						v == r - 1 ? (v = 0,
						d.push(n(m)),
						m = 0) : v++,
						t = 0;
					for (t = a.charCodeAt(0),
					e = 0; 16 > e; e++)
						m = m << 1 | 1 & t,
						v == r - 1 ? (v = 0,
						d.push(n(m)),
						m = 0) : v++,
						t >>= 1
				}
				l--,
				0 == l && (l = Math.pow(2, h),
				h++),
				delete p[a]
			} else
				for (t = s[a],
				e = 0; h > e; e++)
					m = m << 1 | 1 & t,
					v == r - 1 ? (v = 0,
					d.push(n(m)),
					m = 0) : v++,
					t >>= 1;
			l--,
			0 == l && (l = Math.pow(2, h),
			h++),
			s[c] = f++,
			a = String(u)
		}
	if ("" !== a) {
		if (Object.prototype.hasOwnProperty.call(p, a)) {
			if (a.charCodeAt(0) < 256) {
				for (e = 0; h > e; e++)
					m <<= 1,
					v == r - 1 ? (v = 0,
					d.push(n(m)),
					m = 0) : v++;
				for (t = a.charCodeAt(0),
				e = 0; 8 > e; e++)
					m = m << 1 | 1 & t,
					v == r - 1 ? (v = 0,
					d.push(n(m)),
					m = 0) : v++,
					t >>= 1
			} else {
				for (t = 1,
				e = 0; h > e; e++)
					m = m << 1 | t,
					v == r - 1 ? (v = 0,
					d.push(n(m)),
					m = 0) : v++,
					t = 0;
				for (t = a.charCodeAt(0),
				e = 0; 16 > e; e++)
					m = m << 1 | 1 & t,
					v == r - 1 ? (v = 0,
					d.push(n(m)),
					m = 0) : v++,
					t >>= 1
			}
			l--,
			0 == l && (l = Math.pow(2, h),
			h++),
			delete p[a]
		} else
			for (t = s[a],
			e = 0; h > e; e++)
				m = m << 1 | 1 & t,
				v == r - 1 ? (v = 0,
				d.push(n(m)),
				m = 0) : v++,
				t >>= 1;
		l--,
		0 == l && (l = Math.pow(2, h),
		h++)
	}
	for (t = 2,
	e = 0; h > e; e++)
		m = m << 1 | 1 & t,
		v == r - 1 ? (v = 0,
		d.push(n(m)),
		m = 0) : v++,
		t >>= 1;
	for (; ; ) {
		if (m <<= 1,
		v == r - 1) {
			d.push(n(m));
			break
		}
		v++
	}
	return d.join("")
}
function compress(o) {
	return _compress(o, 16, function(o) {
		return String.fromCharCode(o);
	})
}