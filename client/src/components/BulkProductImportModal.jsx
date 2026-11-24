import React, { useMemo, useState } from 'react';
import { Download, LoaderCircle, Upload, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const TEMPLATE = [
  'name,brand,category,subCategory,priceGHS,priceUSD,sizes,colors,description,photos,estimatedDays',
  'Air Jordan 1 Retro,Nike,Sneakers,High Top,2500,160,35|36|37|38,Chicago Red|White|Black,Chicago colorway,aj1-red.jpg:Chicago Red|aj1-white.jpg:White,10-18 days'
].join('\n');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(value.trim()); value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(value.trim());
      if (row.some(cell => cell !== '')) rows.push(row);
      row = []; value = '';
    } else value += char;
  }
  row.push(value.trim());
  if (row.some(cell => cell !== '')) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows.shift().map(header => header.trim().toLowerCase());
  return rows.map(cells => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])));
}

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
  reader.readAsDataURL(file);
});

export default function BulkProductImportModal({ token, onClose, onComplete }) {
  const [csvFile, setCsvFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const rows = useMemo(() => csvFile ? parseCsv(csvFile.text) : [], [csvFile]);

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'earlyclaim-products-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProducts = async () => {
    const fileMap = new Map(imageFiles.map(file => [file.name.trim().toLowerCase(), file]));
    const errors = [];
    const referenced = new Set();
    rows.forEach((row, index) => {
      if (!row.name || !row.category || !Number(row.priceghs) || Number(row.priceghs) <= 0) {
        errors.push(`Row ${index + 2}: name, category and a positive priceGHS are required.`);
      }
      const photos = (row.photos || '').split('|').map(entry => entry.trim()).filter(Boolean);
      if (!photos.length) errors.push(`Row ${index + 2}: add at least one photo in the photos column.`);
      photos.forEach(entry => {
        const colon = entry.lastIndexOf(':');
        const filename = (colon >= 0 ? entry.slice(0, colon) : entry).trim();
        if (!fileMap.has(filename.toLowerCase())) errors.push(`Row ${index + 2}: selected files do not include “${filename}”.`);
        else referenced.add(filename.toLowerCase());
      });
    });
    if (errors.length) { setResult({ errors }); return; }
    if (!rows.length) { setResult({ errors: ['Choose a CSV with at least one product row.'] }); return; }

    setBusy(true);
    setResult(null);
    const uploaded = new Map();
    const failures = [];
    let created = 0;
    try {
      for (const filename of referenced) {
        const file = fileMap.get(filename);
        if (!file || file.size > 5 * 1024 * 1024) {
          failures.push(`${file?.name || filename}: image must be 5 MB or smaller.`);
          continue;
        }
        setProgress(`Uploading ${uploaded.size + 1} of ${referenced.size}: ${file.name}`);
        const res = await fetch(`${API_BASE_URL}/api/products/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dataUrl: await readAsDataUrl(file), filename: file.name })
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.url) throw new Error(data.message || `Could not upload ${file.name}`);
        uploaded.set(filename, data.url);
      }

      for (const [index, row] of rows.entries()) {
        const photos = (row.photos || '').split('|').map(entry => entry.trim()).filter(Boolean).map(entry => {
          const colon = entry.lastIndexOf(':');
          const filename = (colon >= 0 ? entry.slice(0, colon) : entry).trim();
          return { url: uploaded.get(filename.toLowerCase()), color: colon >= 0 ? entry.slice(colon + 1).trim() : '' };
        });
        if (photos.some(photo => !photo.url)) {
          failures.push(`Row ${index + 2} (${row.name}): one or more photos could not be uploaded.`);
          continue;
        }

        setProgress(`Creating draft ${index + 1} of ${rows.length}: ${row.name}`);
        const res = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: row.name,
            brand: row.brand || 'Luxury Brand',
            category: row.category,
            subCategory: row.subcategory || 'General',
            priceGHS: Number(row.priceghs),
            priceUSD: row.priceusd ? Number(row.priceusd) : undefined,
            description: row.description || '',
            estimatedDays: row.estimateddays || '10–18 Days',
            sizes: row.sizes ? row.sizes.split('|').map(value => value.trim()).filter(Boolean) : undefined,
            colors: row.colors ? row.colors.split('|').map(value => value.trim()).filter(Boolean) : undefined,
            images: photos.map(photo => photo.url),
            imageColors: photos.map(photo => photo.color),
            visibility: 'draft'
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) failures.push(`Row ${index + 2} (${row.name}): ${data.message || 'product was not created'}`);
        else created += 1;
      }

      setResult({ created, failed: failures.length, errors: failures });
      if (created) onComplete();
    } catch (error) {
      setResult({ created, failed: failures.length + 1, errors: [...failures, error.message || 'Import stopped unexpectedly.'] });
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 p-5 sm:p-7 space-y-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">Bulk product import</h2>
            <p className="text-xs text-zinc-500 mt-1">Upload a CSV and matching photos. Products are created as drafts for review.</p>
          </div>
          <button type="button" disabled={busy} onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-bold">
          <Download className="w-4 h-4" /> Download CSV template
        </button>

        <label className="block rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4 space-y-2">
          <span className="block text-xs font-bold">1. Choose the completed CSV file</span>
          <input type="file" accept=".csv,text/csv" disabled={busy} onChange={async e => {
            const file = e.target.files?.[0];
            if (file) setCsvFile({ name: file.name, text: await file.text() });
          }} className="block w-full text-xs" />
          <span className="block text-[10px] text-zinc-500">Use | between sizes, colors, and photos. Photo entries use filename:Color, for example shoe-black.jpg:Black.</span>
        </label>

        <label className="block rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4 space-y-2">
          <span className="block text-xs font-bold">2. Choose all matching product photos</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e => setImageFiles(Array.from(e.target.files || []))} className="block w-full text-xs" />
          <span className="block text-[10px] text-zinc-500">JPG, PNG, or WebP; maximum 5 MB per photo. Filenames must match the CSV.</span>
        </label>

        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-600 dark:text-zinc-300">
          Ready: {rows.length} product rows and {imageFiles.length} selected photos. New products stay hidden until you review and publish them.
        </div>

        {progress && <p className="flex items-center gap-2 text-xs font-semibold text-blue-700"><LoaderCircle className="w-4 h-4 animate-spin" />{progress}</p>}
        {result && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 space-y-2 text-xs">
            <p className="font-bold">{result.created ? `Created ${result.created} draft products.` : 'Import needs attention.'}{result.failed ? ` ${result.failed} issue(s).` : ''}</p>
            {!!result.errors?.length && <ul className="list-disc pl-5 space-y-1 text-red-600">{result.errors.map((error, index) => <li key={index}>{error}</li>)}</ul>}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" disabled={busy} onClick={onClose} className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-bold">Close</button>
          <button type="button" disabled={busy || !csvFile || !imageFiles.length} onClick={importProducts} className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase disabled:opacity-40 inline-flex items-center gap-2">
            {busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload and create drafts
          </button>
        </div>
      </div>
    </div>
  );
}
