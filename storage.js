export const categories = [
  'Paita', 'T-paita', 'Toppi', 'Pusero', 'Kauluspaita',
  'Neule', 'Neuletakki', 'Huppari', 'Collegepaita',
  'Housut', 'Farkut', 'Leggingsit', 'Shortsit', 'Hame',
  'Mekko', 'Haalari', 'Bleiseri', 'Liivi', 'Takki',
  'Sadetakki', 'Urheiluvaate', 'Yöasu', 'Alusvaate',
  'Sukat / sukkahousut', 'Kengät', 'Lenkkarit',
  'Saappaat / nilkkurit', 'Sandaalit', 'Laukku', 'Reppu',
  'Huivi', 'Päähine', 'Käsineet', 'Vyö', 'Koru',
  'Muu asuste', 'Muu'
];

export const legacyCategories = [
  'Yläosa', 'Alaosa', 'Mekko / haalari',
  'Päällysvaate', 'Asuste', 'T-paita / toppi'
];

export const colors = [
  'Ei määritelty', 'Musta', 'Valkoinen', 'Harmaa',
  'Beige', 'Ruskea', 'Sininen', 'Vihreä', 'Punainen',
  'Vaaleanpunainen', 'Keltainen', 'Violetti',
  'Oranssi', 'Monivärinen'
];

export const materials = [
  'Ei tiedossa', 'Puuvilla', 'Villa', 'Pellava',
  'Silkki', 'Viskoosi', 'Polyesteri', 'Nahka',
  'Sekoite', 'Muu'
];

export const conditions = [
  'Hyvä', 'Uudenveroinen', 'Kulunut', 'Korjattava'
];

export const ages = [
  'Ei tiedossa', 'Alle vuosi', '1–3 vuotta',
  '4–6 vuotta', 'Yli 6 vuotta'
];

export function validateItem(item) {
  if (
    !item ||
    typeof item.id !== 'string' ||
    !item.id ||
    item.id.length > 100
  ) {
    throw Error('Vaatteen tunniste puuttuu.');
  }

  for (const [key, max] of [['name', 100], ['notes', 1000]]) {
    if (
      typeof item[key] !== 'string' ||
      item[key].length > max
    ) {
      throw Error('Vaatteen tekstitiedot ovat virheellisiä.');
    }
  }

  if (!item.name.trim()) {
    throw Error('Anna vaatteelle nimi.');
  }

  for (const [key, values] of [
    ['category', [...categories, ...legacyCategories]],
    ['color', colors],
    ['material', materials],
    ['condition', conditions],
    ['age', ages]
  ]) {
    if (!values.includes(item[key])) {
      throw Error('Vaatteen valintatiedot ovat virheellisiä.');
    }
  }

  if (
    typeof item.image !== 'string' ||
    item.image.length > 4000000 ||
    !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(item.image)
  ) {
    throw Error('Vaatteen kuva ei ole kelvollinen JPEG-kuva.');
  }

  return Object.fromEntries(
    [
      'id', 'name', 'notes', 'category', 'color',
      'material', 'condition', 'age', 'image'
    ].map(key => [key, item[key]])
  );
}

export function parseBackup(text) {
  const data = JSON.parse(text);

  if (
    data?.format !== 'oma-vaatekaappi' ||
    data.version !== 1 ||
    !Array.isArray(data.items) ||
    data.items.length > 2000
  ) {
    throw Error('Tiedosto ei ole tuettu vaatekaapin varmuuskopio.');
  }

  const items = data.items.map(validateItem);

  if (new Set(items.map(i => i.id)).size !== items.length) {
    throw Error('Varmuuskopiossa on päällekkäisiä tunnisteita.');
  }

  return items;
}

export function openStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('oma-vaatekaappi', 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore('items', { keyPath: 'id' });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    request.onblocked = () => reject(
      Error('Sulje muut sovelluksen välilehdet ja yritä uudelleen.')
    );
  });
}

export function transaction(db, mode, action) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('items', mode);
    const store = tx.objectStore('items');

    let result;

    try {
      result = action(store);
    } catch (error) {
      tx.abort();
      reject(error);
      return;
    }

    tx.oncomplete = () => resolve(result?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(
      tx.error || Error('Tallennus keskeytyi.')
    );
  });
}
