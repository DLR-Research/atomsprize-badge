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
  seed(donor.user_id)
  const hue1 = range(palette[0], palette[1])
  const hue2 = range(palette[2], palette[3])
  const sat1 = range(palette[4], palette[5])
  const sat2 = range(palette[6], palette[7])
  const n_lines = range(3000, 10000)
  let v1 = 0,
    v2 = 0,
    angle1 = 0,
    angle2 = 0
  context.lineWidth = context.canvas.width / 9000

  for (let i = 0; i < n_lines; i++) {
    const hue = range(hue1, hue2)
    const sat = range(sat1, sat2)
    const val = range(30, 100)
    const alpha = range(0.5, 1)
    v1 = v1 * 0.995 + gaussian() * 0.0005
    v2 = v2 * 0.995 + gaussian() * 0.0005
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

var m_w = 123456789
var m_z = 987654321
var mask = 0xffffffff

function seed(i) {
  m_w = (123456789 + i) & mask
  m_z = (987654321 - i) & mask
  for (let i = 0; i < 1000; i++) random()
}

function random() {
  m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask
  m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask
  var result = ((m_z << 16) + (m_w & 65535)) >>> 0
  result /= 4294967296
  return result
}

function gaussian() {
  var u = 0,
    v = 0
  while (u === 0) u = random()
  while (v === 0) v = random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function range(low, high) {
  return random() * (high - low) + low
}
