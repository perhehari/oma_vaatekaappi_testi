import {validateTrips,tripSignature} from './trip-model.js?v=10';
import {validateItem} from './storage.js';
export const groups=['Paidat','Neuletakit ja puserot','Jakut','Takit','Housut','Mekot ja hameet','Urheiluvaatteet','Sukat ja sukkahousut','Alusvaatteet','Yö- ja kylpyvaatteet','Huivit','Asusteet','Juhla-asut','Kengät'];
export const sportsTypes=['Jumppahousut','Jumppatoppi','Kerrastohousut','Kerrastopaita','Partiopaita','Pyöräilyhousut','Sadehousut','Sadetakki','Toppahame','Toppashortsit','Ulkoiluhousut','Ulkoilutakki','Urheiluliivi','Verryttelyasu'];
export const states=['Käytössä','Säilytetään','Säilytetään toistaiseksi','Korjattava','Myyntiin','Lahjoitukseen','Kierrätykseen','Poistettu'];
export const actionOptions=['Pestävä','Silitettävä','Korjattava','Myytävä','Lahjoitukseen','Tekstiilikeräykseen','Säilytyksessä'];
export function garmentActions(item){
 if(Array.isArray(item.actions))return [...item.actions];
 const state=item.state==='Poistettu'?item.previousState:item.state;
 const legacy={Myyntiin:'Myytävä',Myynnissä:'Myytävä',Myytävä:'Myytävä',Korjattava:'Korjattava',Lahjoitukseen:'Lahjoitukseen',Säilytetään:'Säilytyksessä','Säilytetään toistaiseksi':'Säilytyksessä',Säilytyksessä:'Säilytyksessä',Kierrätykseen:'Kierrätykseen (aiempi merkintä)'};
 return legacy[state]?[legacy[state]]:[];
}
export const lockedHeaders=['ID','Kuva-ID','Kuva-ID / tiedostonimi'];
export const detailHeaders=['Koko','Malli / leikkaus','Kuosi','Materiaali','Pesulämpötila','Rumpukuivaus','Silitys','Erityishoito / pesuohje','Pesuohjeen lähde','Ostopaikka','Ostopäivä','Ostovuosi','Hankintahinta (€)','Käyttötarkoitus','Vuodenaika(t)'];
export function sourceFields(item){return item.inventory?.fields??item.extraFields??[];}
const aliases={brand:['Merkki'],name:['Tunnistenimi'],category:['Alaryhmä / tyyppi','Alaryhmä/tyyppi'],color:['Pääväri'],material:['Materiaali'],condition:['Kunto'],state:['Tila'],storage:['Säilytyspaikka'],notes:['Huomiot']};
const limits={purchaseYear:200,purchaseDate:200,brand:500,name:100,category:200,group:200,color:200,material:1000,condition:200,state:200,storage:500,notes:1000};
const scalar=v=>v===null?'':String(v);
export function fieldValue(item,key){
 const field=sourceFields(item).find(f=>aliases[key]?.includes(f.header));
 return field?scalar(field.value):String(item[key]??'');
}
export function fromLegacy(raw,now=new Date().toISOString()){
 const item=structuredClone(raw);
 for(const key of Object.keys(aliases))item[key]=fieldValue(item,key);
 item.group=item.group ?? item.inventory?.sheet ?? (item.category==='Yöasu'?'Yö- ja kylpyvaatteet':item.category==='Sukat / sukkahousut'?'Sukat ja sukkahousut':item.category==='Paita'?'Paidat':'Muut');
 item.photoKind=item.photoKind ?? item.inventory?.imageKind ?? 'photo';item.phoneSchema=1;item.revision=1;item.updatedAt=now;
 return validateRecord(item);
}
export function validateRecord(item){
 if(item?.extraFields!==undefined && (!Array.isArray(item.extraFields)||item.extraFields.length>100||item.extraFields.some((f,i)=>f.column!==i+1||typeof f.header!=='string'||lockedHeaders.includes(f.header)||!(f.value===null||['string','number','boolean'].includes(typeof f.value))||String(f.value??'').length>10000)))throw Error('Lisätiedot ovat virheellisiä.');
 if(!item || !['photo','placeholder'].includes(item.photoKind) || item.phoneSchema!==1 || !Number.isInteger(item.revision) || item.revision<1 || typeof item.updatedAt!=='string' || !Number.isFinite(Date.parse(item.updatedAt)))throw Error('Vaatteen muutosseuranta on virheellinen.');
 for(const [key,max] of Object.entries(limits))if(!(['brand','purchaseYear','purchaseDate'].includes(key)&&item[key]===undefined) && (typeof item[key]!=='string' || item[key].length>max))throw Error(`Vaatteen kenttä on virheellinen: ${key}`);
 // Hyödynnä yhteistä kuva- ja lähdetunnistevalidointia; puhelimen nykyarvot sallivat Excelin tarkat värit ja materiaalit.
 for(const key of ['purposes','seasons','actions'])if(item[key]!==undefined&&!validList(item[key]))throw Error('Monivalinta on virheellinen.');
 validateItem({...item,category:'Muu',color:'Ei määritelty',material:'Ei tiedossa',condition:'Ei arvioitu'});
 for(const key of Object.keys(aliases).filter(k=>k!=='brand'))if(item.inventory?.fields.some(f=>aliases[key].includes(f.header)) && item[key]!==fieldValue(item,key))throw Error(`Kortin ja lähdekentän nykyarvot eroavat: ${key}`);
 return structuredClone(item);
}
export function editRecord(before,patch,now=new Date().toISOString(),fieldChanges=[]){
 validateRecord(before);const next=structuredClone(before);let changed=false;
 for(const [key,value] of Object.entries(patch)){
  if(Object.hasOwn(purchaseHeaders,key)){
   if(typeof value!=='string'||value.length>200)throw Error('Ostotieto on virheellinen.');
   if(purchaseValue(next,key)===value)continue;
   next[key]=value;changed=true;
   for(const field of sourceFields(next))if(purchaseHeaders[key].includes(field.header))field.value=key==='purchaseYear'&&(typeof field.value==='number'||typeof next.inventory?.originalCells.find(f=>f.column===field.column)?.value==='number')?(value===''?null:Number(value)):value;
   continue;
  }
  if(key==='actions'){if(!validList(value))throw Error('Toimenpiteet ovat virheelliset.');if(JSON.stringify(garmentActions(next))===JSON.stringify(value))continue;next.actions=[...value];changed=true;continue;}
  if(Object.hasOwn(selectionHeaders,key)){
   if(!validList(value))throw Error('Monivalinta on virheellinen.');
   if(JSON.stringify(next[key])===JSON.stringify(value))continue;
   next[key]=[...value];changed=true;
   for(const field of sourceFields(next))if(selectionHeaders[key].includes(field.header))field.value=value.join(', ');
   continue;
  }
  if(!Object.hasOwn(limits,key) && key!=='image' && key!=='photoKind')throw Error('Tätä tunnistetta tai lähdetietoa ei saa muuttaa.');
  if(next[key]===value)continue;changed=true;next[key]=value;
  const field=sourceFields(next).find(f=>aliases[key]?.includes(f.header));if(field)field.value=value;
 }
 for(const change of fieldChanges){
  const field=sourceFields(next).find(f=>f.column===change.column);
  if(!field||lockedHeaders.includes(field.header))throw Error('Lukittua tunnistetta ei saa muuttaa.');
  const value=change.value;
  if(!(value===null||['string','number','boolean'].includes(typeof value)) || typeof value==='number'&&!Number.isFinite(value))throw Error('Lisätiedon arvo on virheellinen.');
  if(field.value!==value){field.value=value;changed=true;}
 }
 for(const key of Object.keys(aliases))if(sourceFields(next).some(f=>aliases[key].includes(f.header)))next[key]=fieldValue(next,key);
 if(Object.keys(patch).some(k=>Object.hasOwn(purchaseHeaders,k)))validatePurchase(purchaseValue(next,'purchaseYear'),purchaseValue(next,'purchaseDate'));
 if(!changed)return next;
 if(next.state==='Poistettu' && before.state!=='Poistettu')next.previousState=before.state;
 next.revision++;next.updatedAt=now;return validateRecord(next);
}
export function restoreArchived(item,now){return editRecord(item,{state:item.previousState && item.previousState!=='Poistettu'?item.previousState:'Käytössä'},now);}
export function matches(item,{query='',group='',category='',archive=false}={}){
 if((item.state==='Poistettu')!==archive || group && item.group!==group || category && item.category!==category)return false;
 const text=[item.name,item.group,item.category,item.color,item.material,item.condition,item.state,item.storage,item.notes,item.inventory?.locked.excelId,item.brand,item.purchaseYear,item.purchaseDate,...(item.purposes??[]),...(item.seasons??[]),...garmentActions(item),...sourceFields(item).map(f=>scalar(f.value))].join(' ').toLocaleLowerCase('fi');
 return text.includes(query.toLocaleLowerCase('fi'));
}
export function recordSignature(items){return JSON.stringify(items.map(i=>[i.id,i.revision,i.updatedAt]).sort((a,b)=>a[0].localeCompare(b[0])));}
export function readSnapshot(text){
 const data=JSON.parse(text);
 if(data?.format!=='oma-vaatekaappi' || ![3,4,5].includes(data.version) || typeof data.collectionId!=='string' || !data.collectionId || !Array.isArray(data.items) || data.items.length>2000)throw Error('Tarvitaan tämän puhelinversion varmuuskopio (versio 3, 4 tai 5). Vanha kokoelma valmistellaan ensin erillisenä kopiona.');
 if(data.version>=4&&!data.settings)throw Error('Varmuuskopiosta puuttuvat asetukset.');
 if(data.settings!==undefined)validateSettings(data.settings);
 if(data.version===5&&!Array.isArray(data.trips))throw Error('Varmuuskopiosta puuttuvat matkat.');
 if(data.trips!==undefined)validateTrips(data.trips);
 const items=data.items.map(validateRecord),keys=items.map(i=>i.id);
 if(new Set(keys).size!==keys.length)throw Error('Varmuuskopiossa on päällekkäisiä tunnisteita.');
 for(const key of ['excel','user']){
  const ids=items.map(i=>key==='excel'?i.inventory?.locked.excelId:i.userSource?.key).filter(Boolean);
  if(new Set(ids).size!==ids.length)throw Error('Varmuuskopiossa on sama lähdevaate kahdesti.');
 }
 return {...data,items};
}

export const seasons=['Kevät','Kesä','Syksy','Talvi'];
export const colorOptions=['Beige','Fuksia','Harmaa','Harmaanvihreä','Hopea','Keltainen','Koralli','Kulta','Liila','Luonnonvalkoinen','Musta','Mustavalkoinen','Nude','Oranssi','Persikka','Pinkki','Punainen','Roosa','Ruskea','Sininen','Taupe','Tummanharmaa','Tummanruskea','Tummansininen','Tummanvihreä','Turkoosi','Vaaleanharmaa','Vaaleanpunainen','Vaaleansininen','Vaaleanvihreä','Valkoinen','Vihreä','Viininpunainen','Violetti','Monivärinen'];
export const selectionHeaders={purposes:['Käyttötarkoitus','Käyttötarkoitus (pilkuin)'],seasons:['Vuodenaika(t)']};
export function selections(item,key){
 if(Array.isArray(item[key]))return [...item[key]];
 const values=sourceFields(item).filter(f=>selectionHeaders[key].includes(f.header)).flatMap(f=>String(f.value??'').split(/[,;\n]/)).map(s=>s.trim()).filter(Boolean);
 return [...new Set(values.map(v=>key==='seasons'?(seasons.find(s=>s.toLocaleLowerCase('fi')===v.toLocaleLowerCase('fi'))??v):v))];
}
function validList(values){return Array.isArray(values)&&values.length<=200&&new Set(values).size===values.length&&values.every(v=>typeof v==='string'&&v.trim()&&v.length<=200);}
export function defaultSettings(items=[]){return {version:1,revision:0,storageLocations:[...new Set(['Vaatekaappi','Vaatehuone','Varasto',...items.map(i=>i.storage).filter(Boolean)])],purposes:[...new Set(['Siisti arki','Vapaa-aika','Työ','Juhla','Ulkoilu',...items.flatMap(i=>selections(i,'purposes'))])]};}
export function validateSettings(settings){if(!settings||settings.version!==1||!Number.isInteger(settings.revision)||settings.revision<0||!validList(settings.storageLocations)||!validList(settings.purposes))throw Error('Valintalistojen asetukset ovat virheellisiä.');return {version:1,revision:settings.revision,storageLocations:[...settings.storageLocations],purposes:[...settings.purposes]};}
export function collectionSignature(items,settings,trips=[]){return JSON.stringify([recordSignature(items),settings??defaultSettings(items),tripSignature(trips)]);}

export const purchaseHeaders={purchaseYear:['Ostovuosi'],purchaseDate:['Ostopäivä','Ostopäivämäärä']};
export function purchaseValue(item,key){const f=sourceFields(item).find(f=>purchaseHeaders[key].includes(f.header));return f?String(f.value??''):String(item[key]??'');}
export function dateInputValue(value){const s=String(value??'');const match=/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/.exec(s);if(!match)return '';const date=new Date(match[1]+'T12:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===match[1]?match[1]:'';}
export function validatePurchase(year,date){if(date){const iso=dateInputValue(date);if(!iso)throw Error('Valitse kelvollinen ostopäivämäärä tai tyhjennä päivä.');if(year!==iso.slice(0,4))throw Error('Ostovuoden pitää vastata ostopäivämäärän vuotta. Korjaa vuosi tai päivämäärä.');}}
