function render_the_badge(donor) {
  var canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')

  context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  const rx = context.canvas.width / 2
  const ry = context.canvas.height / 2

  const palette =
    donor.total_donated < 100 ? BRONZE_PALETTE : donor.total_donated < 1000 ? SILVER_PALETTE : GOLD_PALETTE
  const rng = create_random(donor.user_id.toString())
  const hue1 = rng.range(palette[0], palette[1])
  const hue2 = rng.range(palette[2], palette[3])
  const sat1 = rng.range(palette[4], palette[5])
  const sat2 = rng.range(palette[6], palette[7])
  const n_lines = rng.range(3000, 10000)
  let v1 = 0,
    v2 = 0,
    angle1 = 0,
    angle2 = 0
  context.lineWidth = context.canvas.width / 9000

  for (let i = 0; i < n_lines; i++) {
    const hue = rng.range(hue1, hue2)
    const sat = rng.range(sat1, sat2)
    const val = rng.range(30, 100)
    const alpha = rng.range(0.5, 1)
    v1 = v1 * 0.995 + rng.gaussian() * 0.0005
    v2 = v2 * 0.995 + rng.gaussian() * 0.0005
    angle1 += v1
    angle2 += v2
    context.strokeStyle = `hsla(${hue}, ${sat}%, ${val}%, ${alpha})`
    context.beginPath()
    context.moveTo(rx * (1 + Math.sin(angle1)), ry * (1 + Math.cos(angle1)))
    context.lineTo(rx * (1 + Math.sin(angle2)), ry * (1 + Math.cos(angle2)))
    context.stroke()
  }

  return canvas.toDataURL()
}

const GOLD_PALETTE = [38, 45, 47, 54, 40, 65, 65, 100]
const SILVER_PALETTE = [247, 254, 256, 263, 0, 10, 10, 20]
const BRONZE_PALETTE = [29, 36, 36, 43, 0, 36, 36, 72]

function create_random(seed) {
  const r = new uheprng(seed)

  function range(low, high) {
    return r.random() * (high - low) + low
  }

  function gaussian() {
    var u = 0,
      v = 0
    while (u === 0) u = r.random()
    while (v === 0) v = r.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }

  return { range, gaussian }
}

var stringify, serializer, Mash, uheprng
;(function () {
  var n = this
  ;(n.stringify = function (n, r, t, e) {
    return JSON.stringify(n, serializer(r, e), t)
  }),
    (n.serializer = function (e, i) {
      var o = [],
        u = []
      return (
        null == i &&
          (i = function (n, r) {
            return o[0] === r ? '[Circular ~]' : '[Circular ~.' + u.slice(0, o.indexOf(r)).join('.') + ']'
          }),
        function (n, r) {
          var t
          return (
            0 < o.length
              ? (~(t = o.indexOf(this)) ? o.splice(t + 1) : o.push(this),
                ~t ? u.splice(t, 1 / 0, n) : u.push(n),
                ~o.indexOf(r) && (r = i.call(this, n, r)))
              : o.push(r),
            null == e ? r : e.call(this, n, r)
          )
        }
      )
    }),
    (n.Mash = function () {
      var e = 4022871197
      return function (n) {
        if (n) {
          n = n.toString()
          for (var r = 0; r < n.length; r++) {
            var t = 0.02519603282416938 * (e += n.charCodeAt(r))
            ;(t -= e = t >>> 0), (e = (t *= e) >>> 0), (e += 4294967296 * (t -= e))
          }
          return 2.3283064365386963e-10 * (e >>> 0)
        }
        e = 4022871197
      }
    }),
    (n.uheprng = function (n) {
      return (function () {
        for (var r, t = 48, e = 1, i = t, o = new Array(t), u = 0, a = new Mash(), f = 0; f < t; f++)
          o[f] = a(Math.random())
        function c() {
          ++i >= t && (i = 0)
          var n = 1768863 * o[i] + 2.3283064365386963e-10 * e
          return (o[i] = n - (e = 0 | n))
        }
        function l(n) {
          return Math.floor(n * (c() + 11102230246251565e-32 * ((2097152 * c()) | 0)))
        }
        return (
          (l.string = function (n) {
            for (var r = '', t = 0; t < n; t++) r += String.fromCharCode(33 + l(94))
            return r
          }),
          (l.cleanString = function (n) {
            return (n = (n = n.replace(/(^\s*)|(\s*$)/gi, '')).replace(/[\x00-\x1F]/gi, '')).replace(/\n /, '\n')
          }),
          (l.hashString = function (n) {
            for (n = l.cleanString(n), a(n), f = 0; f < n.length; f++)
              for (u = n.charCodeAt(f), r = 0; r < t; r++) (o[r] -= a(u)), o[r] < 0 && (o[r] += 1)
          }),
          (l.seed = function (n) {
            null == n && (n = Math.random()),
              'string' != typeof n &&
                (n = stringify(n, function (n, r) {
                  return 'function' == typeof r ? r.toString() : r
                })),
              l.initState(),
              l.hashString(n)
          }),
          (l.addEntropy = function () {
            var n = []
            for (f = 0; f < arguments.length; f++) n.push(arguments[f])
            !(function () {
              var n = Array.prototype.slice.call(arguments)
              for (f = 0; f < n.length; f++) for (r = 0; r < t; r++) (o[r] -= a(n[f])), o[r] < 0 && (o[r] += 1)
            })(u++ + new Date().getTime() + n.join('') + Math.random())
          }),
          (l.initState = function () {
            for (a(), f = 0; f < t; f++) o[f] = a(' ')
            ;(e = 1), (i = t)
          }),
          (l.done = function () {
            a = null
          }),
          void 0 !== n && l.seed(n),
          ((l.range = l).random = function () {
            return l(Number.MAX_VALUE - 1) / Number.MAX_VALUE
          }),
          (l.floatBetween = function (n, r) {
            return l.random() * (r - n) + n
          }),
          (l.intBetween = function (n, r) {
            return Math.floor(l.random() * (r - n + 1)) + n
          }),
          l
        )
      })()
    })
}.call(this))
