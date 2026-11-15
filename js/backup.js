/*
 * SORVETERIA MANAGER — BACKUP COMPLETO, FOTOS E RESTAURAÇÃO
 * Não usa CDN, servidor ou bibliotecas externas.
 * Backups ZIP contêm banco JSON, Excel, relatório HTML e fotografias locais.
 * Fotos importadas e restauradas ficam no IndexedDB do dispositivo.
 */
'use strict';
const SorvBackup = (() => {
  const encoder = new TextEncoder(), decoder = new TextDecoder();
  const storeName = 'fotos', idbName = 'devkayko_sorveteria_fotos_v1';
  const cachedPhotos = new Map();
  let storeAvailable = true, observer = null;
  const acceptablePath = p => typeof p === 'string' && /^assets\/(picoles|sabores|milkshakes|paletas|produtos)\/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g)$/i.test(p) && !p.includes('..');
  function openStore() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(Error('IndexedDB indisponível'));
      const req = indexedDB.open(idbName, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(storeName);
      req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
  }
  async function savePhotos(entries) {
    if (!entries.length) return;
    const idb = await openStore();
    try {      
await new Promise((resolve, reject) => {
        const tx = idb.transaction(storeName, 'readwrite'); const store = tx.objectStore(storeName);
        for (const [path, bytes] of entries) store.put(bytes, path);
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || Error('Falha no armazenamento das fotos'));
      });    
} finally { idb.close(); }
  }
  async function readPhotos() {
    const idb = await openStore();
    try {      
return await new Promise((resolve, reject) => {
        const tx = idb.transaction(storeName, 'readonly'), req = tx.objectStore(storeName).getAllKeys();
        req.onsuccess = () => {          
const keys = req.result; const results = [];
          if (!keys.length) { resolve(results); return; }
          let remaining = keys.length;
          for (const key of keys) {            
const r = tx.objectStore(storeName).get(key);
            r.onsuccess = () => { results.push([key, new Uint8Array(r.result)]); if (!--remaining) resolve(results); };
            r.onerror = () => reject(r.error);
          }
        };
        req.onerror = () => reject(req.error); tx.onerror = () => reject(tx.error);
      });    
} finally { idb.close(); }
  }
  function assetType(path) { return /\.png$/i.test(path) ? 'image/png' : /\.jpe?g$/i.test(path) ? 'image/jpeg' : 'image/webp'; }
  function getUrl(path, bytes) {
    const old = cachedPhotos.get(path); if (old) URL.revokeObjectURL(old);
    const url = URL.createObjectURL(new Blob([bytes], { type: assetType(path) })); cachedPhotos.set(path, url); return url;
  }
  function patchImages(root = document) {
    const nodes = [];
    if (root.nodeType === 1 && root.matches?.('img[src]')) nodes.push(root);
    root.querySelectorAll?.('img[src]').forEach(n => nodes.push(n));
    for (const img of nodes) {
      const path = img.dataset.photoPath || img.getAttribute('src');
      if (!acceptablePath(path)) continue;
      const url = cachedPhotos.get(path);
      if (url && img.src !== url) { img.dataset.photoPath = path; img.src = url; }
    }
  }
  async function initialize() {
    try { for (const [path, bytes] of await readPhotos()) if (acceptablePath(path)) getUrl(path, bytes); } catch (e) { storeAvailable = false; console.warn('Fotos locais indisponíveis:', e); }
    patchImages();
    observer = new MutationObserver(records => {
      for (const r of records) {
        if (r.type === 'attributes') patchImages(r.target);
        else r.addedNodes.forEach(n => { if (n.nodeType === 1) patchImages(n); });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  }
  // Fotos escolhidas no computador são compactadas e salvas no IndexedDB.
  // O caminho virtual permanece no registro do produto e no backup completo.
  async function saveLocalImage(file, kind = 'produtos') {
    if (!['produtos', 'sabores', 'milkshakes'].includes(kind)) throw Error('Categoria de imagem inválida.');
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) throw Error('Escolha uma foto JPG, PNG ou WebP.');
    if (file.size > 12 * 1024 * 1024) throw Error('A foto deve ter no máximo 12 MB.');
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, 960 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d'); if (!ctx) throw Error('Não foi possível converter a foto.');
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .82));
      if (!blob) throw Error('Falha ao converter a foto.');
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(36).slice(2);
      const path = `assets/${kind}/local-${id}.webp`;
      await savePhotos([[path, bytes]]);
      getUrl(path, bytes);
      patchImages();
      return path;
    } finally { bitmap.close(); }
  }
  function refreshImages() { patchImages(); }
  // No Chrome/Edge a janela 'Salvar como' permite escolher a pasta de destino.
  // A permissão é solicitada apenas após o clique no botão de backup.
  async function chooseBackupFile(filename) {
    if (typeof window.showSaveFilePicker !== 'function') return null;
    try { return await window.showSaveFilePicker({ suggestedName: filename, types: [{ description: 'Backup completo da sorveteria', accept: { 'application/zip': ['.zip'] } }] }); }
    catch (error) { if (error.name === 'AbortError') throw Error('Salvamento cancelado.'); throw error; }
  }
  function uint16(a, o) { return a[o] | (a[o + 1] << 8); }
  function uint32(a, o) { return (a[o] | (a[o + 1] << 8) | (a[o + 2] << 16) | (a[o + 3] << 24)) >>> 0; }
  function put16(a, o, n) { a[o] = n & 255; a[o + 1] = (n >>> 8) & 255; }
  function put32(a, o, n) { put16(a, o, n & 65535); put16(a, o + 2, n >>> 16); }
  function buildZip(entries) {
    const pieces = [], center = []; let position = 0;
    for (const [name, contents] of entries) {
      const nameBytes = encoder.encode(name), data = contents instanceof Uint8Array ? contents : encoder.encode(contents);
      if (data.byteLength > 200 * 1024 * 1024) throw Error('Arquivo muito grande para backup.');
      const crc = crc32(data);
      const local = new Uint8Array(30 + nameBytes.length);
      put32(local, 0, 0x04034b50); put16(local, 4, 20); put16(local, 6, 0x0800); put16(local, 8, 0);
      put32(local, 14, crc); put32(local, 18, data.length); put32(local, 22, data.length); put16(local, 26, nameBytes.length); local.set(nameBytes, 30);
      const directory = new Uint8Array(46 + nameBytes.length);
      put32(directory, 0, 0x02014b50); put16(directory, 4, 20); put16(directory, 6, 20); put16(directory, 8, 0x0800); put16(directory, 10, 0);
      put32(directory, 16, crc); put32(directory, 20, data.length); put32(directory, 24, data.length); put16(directory, 28, nameBytes.length);
      put32(directory, 42, position); directory.set(nameBytes, 46);
      pieces.push(local, data); center.push(directory); position += local.length + data.length;
    }
    if (entries.length > 65000) throw Error('Quantidade de arquivos excedida.');
    const centerSize = center.reduce((s, c) => s + c.length, 0), end = new Uint8Array(22);
    put32(end, 0, 0x06054b50); put16(end, 8, center.length); put16(end, 10, center.length);
    put32(end, 12, centerSize); put32(end, 16, position);
    return new Blob([...pieces, ...center, end], { type: 'application/zip' });
  }
  function parseZip(bytes) {
    const files = new Map(); let offset = 0;
    while (offset + 30 < bytes.length && uint32(bytes, offset) === 0x04034b50) {
      const method = uint16(bytes, offset + 8), size = uint32(bytes, offset + 18), nameLen = uint16(bytes, offset + 26), extraLen = uint16(bytes, offset + 28);
      const name = decoder.decode(bytes.slice(offset + 30, offset + 30 + nameLen)), start = offset + 30 + nameLen + extraLen;
      if (method !== 0 || start + size > bytes.length || !name || name.includes('..')) throw Error('ZIP incompatível. Use o backup completo gerado pelo sistema.');
      const data = bytes.slice(start, start + size);
      if (crc32(data) !== uint32(bytes, offset + 14)) throw Error('O ZIP está danificado (verificação CRC).');
      files.set(name, data); offset = start + size;
      if (files.size > 2000) throw Error('ZIP contém arquivos demais.');
    }
    return files;
  }
  function imagePaths(snapshot) {
    return [...new Set([
      ...snapshot.products.map(p => p.image),
      ...snapshot.flavors.map(f => f.image),
      ...(snapshot.milkshakes?.flavors || []).map(f => f.image)
    ].filter(acceptablePath))];
  }
  function safeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function reportHtml(snapshot) {
    const lines = [
      ['Produtos', snapshot.products.map(p => [p.name, p.code || '', p.category || '', p.stock, p.price])],
      ['Sabores', snapshot.flavors.map(f => [f.name, f.category || '', f.image || ''])],
      ['Vendas', snapshot.sales.map(s => [s.date, s.id, s.operatorName || '', s.payment || '', s.total, s.voided ? 'Cancelada' : 'Concluída'])],
      ['Movimentações', snapshot.movements.map(m => [m.date, m.type, m.description, m.category || '', m.amount])],
      ['Fechamentos', snapshot.sessions.map(s => [s.openedAt, s.closedAt || '', s.opening, s.expected ?? '', s.counted ?? ''])],
      ['Funcionários', snapshot.employees.map(e => [e.name, e.department || '', e.role || '', e.status || '', e.hiredAt || '', e.salary || 0])]
    ];
    return '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Relatório completo</title><style>body{font:13px Arial;padding:20mm;color:#222}h2{break-before:page}table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #ccc;padding:5px;overflow-wrap:anywhere}@page{size:A4;margin:18mm}tr{break-inside:avoid}</style><h1>' + safeHtml(snapshot.settings.name) + '</h1><p>Relatório completo de arquivo — ' + safeHtml(new Date().toLocaleString('pt-BR')) + '</p>' + lines.map(([title, rows]) => '<h2>' + safeHtml(title) + '</h2><p>' + rows.length + ' registros</p><table>' + rows.map(row => '<tr>' + row.map(cell => '<td>' + safeHtml(cell) + '</td>').join('') + '</tr>').join('') + '</table>').join('') + '</html>';
  }
  function download(blob, filename) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
  async function exportComplete() {
    if (!Access.requireOwner()) return;
    const button = document.getElementById('completeBackup'); if (button) { button.disabled = true; button.textContent = 'Preparando fotos e relatórios…'; }
    try {
      const filename = `sorveteria-backup-COMPLETO-${new Date().toLocaleDateString('sv-SE')}.zip`;
      // Solicitar a pasta logo após o clique, antes de operações demoradas.
      const fileHandle = await chooseBackupFile(filename);
      const snapshot = structuredClone(db), paths = imagePaths(snapshot), stored = new Map(await readPhotos().catch(() => []));
      const photos = [], missing = [];
      for (const path of paths) {
        if (stored.has(path)) { photos.push([path, stored.get(path)]); continue; }
        try {          
const response = await fetch(path, { cache: 'no-store' }); if (!response.ok) throw Error('Foto não encontrada');
          const data = new Uint8Array(await response.arrayBuffer()); if (data.length > 15 * 1024 * 1024) throw Error('Imagem grande demais');
          photos.push([path, data]);
        } catch (e) { missing.push(path); }
      }
      const xlsx = new Uint8Array(await makeXlsx(excelSheetData({ type: 'all', value: '' })).arrayBuffer());
      const entries = [
        ['dados/sorveteria.json', JSON.stringify(snapshot, null, 2)],
        ['relatorios/historico-completo.xlsx', xlsx],
        ['relatorios/relatorio-para-imprimir.html', reportHtml(snapshot)],
        ['LEIA-ME.txt', `Backup de ${snapshot.settings.name}\nData: ${new Date().toLocaleString('pt-BR')}\nFotos incluídas: ${photos.length}/${paths.length}\nFotos não encontradas:\n${missing.join('\n') || 'Nenhuma'}\n\nPara restaurar no mesmo site, use Configurações > Restaurar backup completo ZIP.\nAs fotos restauradas permanecem no armazenamento local do dispositivo.\nMantenha este ZIP em local seguro: pode conter dados financeiros e salários.`],
        ...photos
      ];
      const zip = buildZip(entries);
      if (fileHandle) { const writer = await fileHandle.createWritable(); await writer.write(zip); await writer.close(); }
      else download(zip, filename);
      if (missing.length) { alert(`Backup gerado com ${photos.length} fotos, mas ${missing.length} imagem(ns) não foram encontradas. Confira LEIA-ME.txt e os arquivos de fotos ausentes.`); }
      else toast(`Backup completo gerado com ${photos.length} fotos, dados e Excel.`);
      commit(() => { db.lastBackup = new Date().toISOString(); });
    } catch (error) { alert('Falha ao criar backup completo: ' + error.message); }
    finally { if (button) { button.disabled = false; button.textContent = '↓ Backup completo ZIP + fotos + Excel'; } }
  }
  async function importComplete(file) {
    if (!Access.requireOwner()) return;
    if (file.size > 150 * 1024 * 1024) throw Error('Limite de backup ZIP: 150 MB.');
    const entries = parseZip(new Uint8Array(await file.arrayBuffer()));
    if (!entries.has('dados/sorveteria.json')) throw Error('Este ZIP não contém o banco da sorveteria.');
    let parsed; try { parsed = JSON.parse(decoder.decode(entries.get('dados/sorveteria.json'))); } catch { throw Error('Dados do ZIP inválidos.'); }
    if (!validData(parsed)) throw Error('Este ZIP não é compatível com a Sorveteria Manager.');
    const photos = [...entries].filter(([name]) => acceptablePath(name));
    if (!confirm(`Restaurar ${parsed.sales.length} vendas, ${parsed.products.length} produtos e ${photos.length} fotos? Isto SUBSTITUI os registros atuais deste navegador. Faça um backup dos dados atuais primeiro.`)) return;
    // Prepara as fotos antes de substituir dados; não altera os registros antigos se falhar.
    await savePhotos(photos);
    const old = db; db = normalizeData(parsed);
    if (!saveData()) { db = old; throw Error('Dados não foram gravados. Verifique espaço do navegador.'); }
    alert('Backup completo restaurado. A página será recarregada para atualizar fotos, produtos e relatórios.');
    location.reload();
  }
  function bind() {
    const complete = document.getElementById('completeBackup'), restore = document.getElementById('importCompleteBackup');
    complete?.addEventListener('click', exportComplete);
    restore?.addEventListener('change', async event => {
      const file = event.target.files[0]; event.target.value = ''; if (!file) return;
      try { await importComplete(file); } catch (error) { alert('Não foi possível restaurar o ZIP: ' + error.message); }
    });
  }
  return { initialize, bind, exportComplete, saveLocalImage, refreshImages };
})();
document.addEventListener('DOMContentLoaded', () => { SorvBackup.initialize(); SorvBackup.bind(); });
