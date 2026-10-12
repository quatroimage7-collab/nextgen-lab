/* Creates a standard, uncompressed ZIP from the public text files. */
'use strict';
const files = ['README.txt', 'azuredeploy.json', 'checklist.txt', 'validation.txt'];
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function makeZip(entries) {
  const chunks = [], directory = [];
  let offset = 0, directorySize = 0;
  for (const [name, data] of entries) {
    const filename = new TextEncoder().encode('outlook-ai/' + name);
    const crc = crc32(data);
    const local = new Uint8Array(30 + filename.length), l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true);
    l.setUint16(12, 0x5d4c, true);
    l.setUint32(14, crc, true); l.setUint32(18, data.length, true);
    l.setUint32(22, data.length, true); l.setUint16(26, filename.length, true);
    local.set(filename, 30);
    const central = new Uint8Array(46 + filename.length), c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true);
    c.setUint16(14, 0x5d4c, true); c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, filename.length, true); c.setUint32(42, offset, true);
    central.set(filename, 46);
    chunks.push(local, data); directory.push(central);
    offset += local.length + data.length; directorySize += central.length;
  }
  const end = new Uint8Array(22), e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true);
  e.setUint16(10, entries.length, true); e.setUint32(12, directorySize, true);
  e.setUint32(16, offset, true);
  return new Blob([...chunks, ...directory, end], {type: 'application/zip'});
}
document.getElementById('download').addEventListener('click', async function () {
  const status = document.getElementById('status');
  this.disabled = true; status.textContent = 'ダウンロードを準備しています…';
  try {
    const entries = await Promise.all(files.map(async name => {
      const response = await fetch(name);
      if (!response.ok) throw new Error('Download failed');
      return [name, new Uint8Array(await response.arrayBuffer())];
    }));
    const url = URL.createObjectURL(makeZip(entries));
    const a = document.createElement('a');
    a.href = url; a.download = 'outlook-ai-public.zip'; document.body.append(a);
    a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    status.textContent = 'ダウンロードを開始しました。';
  } catch (_) {
    status.textContent = '一括ダウンロードに失敗しました。下のリンクから個別に取得できます。';
  } finally { this.disabled = false; }
});
