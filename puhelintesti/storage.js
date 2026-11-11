export const categories = ['Paita','T-paita','Toppi','Pusero','Kauluspaita','Neule','Neuletakki','Huppari','Collegepaita','Housut','Farkut','Leggingsit','Shortsit','Hame','Mekko','Haalari','Bleiseri','Liivi','Takki','Sadetakki','Urheiluvaate','Yöasu','Alusvaate','Sukat / sukkahousut','Kengät','Lenkkarit','Saappaat / nilkkurit','Sandaalit','Laukku','Reppu','Huivi','Päähine','Käsineet','Vyö','Koru','Muu asuste','Muu'];
export const legacyCategories = ['Yläosa','Alaosa','Mekko / haalari','Päällysvaate','Asuste','T-paita / toppi'];
export const colors = ['Ei määritelty','Musta','Valkoinen','Harmaa','Beige','Ruskea','Sininen','Vihreä','Punainen','Vaaleanpunainen','Keltainen','Violetti','Oranssi','Monivärinen'];
export const materials = ['Ei tiedossa','Puuvilla','Villa','Pellava','Silkki','Viskoosi','Polyesteri','Nahka','Sekoite','Muu'];
export const conditions = ['Ei arvioitu','Hyvä','Uudenveroinen','Kulunut','Korjattava'];
export const ages = ['Ei tiedossa','Alle vuosi','1–3 vuotta','4–6 vuotta','Yli 6 vuotta'];
export function validateInventory(value) {
  if (!value || value.version!==1 || !Array.isArray(value.originalCells) || !Array.isArray(value.fields) || value.fields.length!==value.originalCells.length || !value.locked || typeof value.sheet!=='string' || !Number.isInteger(value.row)) throw Error('Inventaarion lähdetiedot ovat virheellisiä.');
  const validValue=v=>v===null || typeof v==='string' || typeof v==='boolean' || (typeof v==='number' && Number.isFinite(v));
  for(let i=0;i<value.originalCells.length;i++){
    const a=value.originalCells[i],b=value.fields[i];
    if(a.column!==i+1 || b.column!==a.column || a.header!==b.header || !(a.header===null || typeof a.header==='string') || !validValue(a.value) || !validValue(b.value)) throw Error('Inventaarion kenttä on virheellinen.');
    if(['ID','Kuva-ID','Kuva-ID / tiedostonimi'].includes(a.header) && a.value!==b.value) throw Error('Lukittua tunnistetta ei saa muuttaa.');
  }
  const source=header=>value.originalCells.find(c=>c.header===header)?.value;
  if(typeof value.locked.excelId!=='string' || !value.locked.excelId || value.locked.excelId!==source('ID')) throw Error('Alkuperäinen vaate-ID ei täsmää.');
  const photo=source('Kuva-ID / tiedostonimi') ?? source('Kuva-ID') ?? null;
  const approved=value.imageMatch?.method==='user-confirmed' && value.imageMatch.imageId===photo && value.imageMatch.filename===value.locked.filename;
  if(value.locked.imageId!==photo || !(value.locked.filename===null || typeof value.locked.filename==='string') || (value.locked.filename!==null && value.locked.filename!==photo && !approved)) throw Error('Kuva-ID tai tiedostonimi ei täsmää.');
  if(!['photo','placeholder'].includes(value.imageKind) || (value.imageKind==='photo' && !value.locked.filename)) throw Error('Kuvan lähdetieto puuttuu.');
  return structuredClone(value);
}
export function validateItem(item) {
  if (!item || typeof item.id !== 'string' || !item.id || item.id.length > 100) throw Error('Vaatteen tunniste puuttuu.');
  for (const [key,max] of [['name',100],['notes',1000]]) if(typeof item[key] !== 'string' || item[key].length > max) throw Error('Vaatteen tekstitiedot ovat virheellisiä.');
  if (!item.name.trim()) throw Error('Anna vaatteelle nimi.');
  for (const [key,values] of [['category',[...categories,...legacyCategories]],['color',colors],['material',materials],['condition',conditions],['age',ages]]) if(!values.includes(item[key])) throw Error('Vaatteen valintatiedot ovat virheellisiä.');
  if(typeof item.image !== 'string' || item.image.length > 4000000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(item.image)) throw Error('Vaatteen kuva ei ole kelvollinen JPEG-kuva.');
  const result = Object.fromEntries(['id','name','notes','category','color','material','condition','age','image'].map(key=>[key,item[key]]));
  if(item.inventory!==undefined) result.inventory=validateInventory(item.inventory);
  if(item.userSource!==undefined){
    const source=item.userSource;
    if(item.inventory || !source || source.version!==1 || typeof source.key!=='string' || !source.key || typeof source.filename!=='string' || !source.filename || typeof source.description!=='string')throw Error('Käyttäjältä saadun vaatteen lähdetiedot ovat virheelliset.');
    result.userSource=structuredClone(source);
  }
  return result;
}
export function parseBackup(text) {
  const data=JSON.parse(text);
  if(data?.format!=='oma-vaatekaappi' || ![1,2].includes(data.version) || !Array.isArray(data.items) || data.items.length>2000) throw Error('Tiedosto ei ole tuettu vaatekaapin varmuuskopio.');
  const items=data.items.map(validateItem);
  if(new Set(items.map(i=>i.id)).size!==items.length) throw Error('Varmuuskopiossa on päällekkäisiä tunnisteita.');
  const sourceIds=items.filter(i=>i.inventory).map(i=>i.inventory.locked.excelId);
  if(new Set(sourceIds).size!==sourceIds.length) throw Error('Varmuuskopiossa on päällekkäisiä alkuperäisiä vaate-ID-tunnuksia.');
  const userKeys=items.filter(i=>i.userSource).map(i=>i.userSource.key);
  if(new Set(userKeys).size!==userKeys.length)throw Error('Varmuuskopiossa on sama käyttäjän lisäämä vaate kahdesti.');
  return items;
}
export function openStore(name='oma-vaatekaappi') {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(name,1);
    request.onupgradeneeded=()=>request.result.createObjectStore('items',{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(Error('Sulje muut sovelluksen välilehdet ja yritä uudelleen.'));
  });
}
export function transaction(db,mode,action) {
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('items',mode), store=tx.objectStore('items');
    let result; try {result=action(store);} catch(error){tx.abort();reject(error);return;}
    tx.oncomplete=()=>resolve(result?.result);
    tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error || Error('Tallennus keskeytyi.'));
  });
}
