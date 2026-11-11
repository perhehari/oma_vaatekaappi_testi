import {validateItem} from './storage.js';
export const groups=['Paidat','Neuletakit ja puserot','Jakut','Takit','Housut','Mekot ja hameet','Urheiluvaatteet','Sukat ja sukkahousut','Alusvaatteet','Yö- ja kylpyvaatteet','Huivit','Asusteet','Juhla-asut','Kengät'];
export const sportsTypes=['Jumppahousut','Jumppatoppi','Kerrastohousut','Kerrastopaita','Partiopaita','Pyöräilyhousut','Sadehousut','Sadetakki','Toppahame','Toppashortsit','Ulkoiluhousut','Ulkoilutakki','Urheiluliivi','Verryttelyasu'];
export const states=['Käytössä','Säilytetään','Säilytetään toistaiseksi','Korjattava','Myyntiin','Lahjoitukseen','Kierrätykseen','Poistettu'];
export const lockedHeaders=['ID','Kuva-ID','Kuva-ID / tiedostonimi'];
export const detailHeaders=['Koko','Malli / leikkaus','Kuosi','Materiaali','Pesulämpötila','Rumpukuivaus','Silitys','Erityishoito / pesuohje','Pesuohjeen lähde','Ostopaikka','Ostopäivä','Ostovuosi','Hankintahinta (€)','Käyttötarkoitus','Vuodenaika(t)'];
export function sourceFields(item){return item.inventory?.fields??item.extraFields??[];}
const aliases={brand:['Merkki'],name:['Tunnistenimi'],category:['Alaryhmä / tyyppi','Alaryhmä/tyyppi'],color:['Pääväri'],material:['Materiaali'],condition:['Kunto'],state:['Tila'],storage:['Säilytyspaikka'],notes:['Huomiot']};
const limits={brand:500,name:100,category:200,group:200,color:200,material:1000,condition:200,state:200,storage:500,notes:1000};
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
 for(const [key,max] of Object.entries(limits))if(!(key==='brand'&&item[key]===undefined) && (typeof item[key]!=='string' || item[key].length>max))throw Error(`Vaatteen kenttä on virheellinen: ${key}`);
 // Hyödynnä yhteistä kuva- ja lähdetunnistevalidointia; puhelimen nykyarvot sallivat Excelin tarkat värit ja materiaalit.
 validateItem({...item,category:'Muu',color:'Ei määritelty',material:'Ei tiedossa',condition:'Ei arvioitu'});
 for(const key of Object.keys(aliases).filter(k=>k!=='brand'))if(item.inventory?.fields.some(f=>aliases[key].includes(f.header)) && item[key]!==fieldValue(item,key))throw Error(`Kortin ja lähdekentän nykyarvot eroavat: ${key}`);
 return structuredClone(item);
}
export function editRecord(before,patch,now=new Date().toISOString(),fieldChanges=[]){
 validateRecord(before);const next=structuredClone(before);let changed=false;
 for(const [key,value] of Object.entries(patch)){
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
 if(!changed)return next;
 if(next.state==='Poistettu' && before.state!=='Poistettu')next.previousState=before.state;
 next.revision++;next.updatedAt=now;return validateRecord(next);
}
export function restoreArchived(item,now){return editRecord(item,{state:item.previousState && item.previousState!=='Poistettu'?item.previousState:'Käytössä'},now);}
export function matches(item,{query='',group='',category='',archive=false}={}){
 if((item.state==='Poistettu')!==archive || group && item.group!==group || category && item.category!==category)return false;
 const text=[item.name,item.group,item.category,item.color,item.material,item.condition,item.state,item.storage,item.notes,item.inventory?.locked.excelId,item.brand,...sourceFields(item).map(f=>scalar(f.value))].join(' ').toLocaleLowerCase('fi');
 return text.includes(query.toLocaleLowerCase('fi'));
}
export function recordSignature(items){return JSON.stringify(items.map(i=>[i.id,i.revision,i.updatedAt]).sort((a,b)=>a[0].localeCompare(b[0])));}
export function readSnapshot(text){
 const data=JSON.parse(text);
 if(data?.format!=='oma-vaatekaappi' || data.version!==3 || typeof data.collectionId!=='string' || !data.collectionId || !Array.isArray(data.items) || data.items.length>2000)throw Error('Tarvitaan tämän puhelinversion varmuuskopio (versio 3). Vanha kokoelma valmistellaan ensin erillisenä kopiona.');
 const items=data.items.map(validateRecord),keys=items.map(i=>i.id);
 if(new Set(keys).size!==keys.length)throw Error('Varmuuskopiossa on päällekkäisiä tunnisteita.');
 for(const key of ['excel','user']){
  const ids=items.map(i=>key==='excel'?i.inventory?.locked.excelId:i.userSource?.key).filter(Boolean);
  if(new Set(ids).size!==ids.length)throw Error('Varmuuskopiossa on sama lähdevaate kahdesti.');
 }
 return {...data,items};
}
