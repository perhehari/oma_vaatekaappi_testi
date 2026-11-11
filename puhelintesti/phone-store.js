import {validateRecord,readSnapshot,recordSignature} from './phone-model.js';
export const testDatabase='oma-vaatekaappi-puhelin-testi-v1';
export function openPhoneStore(name=testDatabase){return new Promise((resolve,reject)=>{const request=indexedDB.open(name,1);request.onupgradeneeded=()=>{request.result.createObjectStore('items',{keyPath:'id'});request.result.createObjectStore('meta');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Sulje sovelluksen muut välilehdet.'));});}
export function readCollection(db){return new Promise((resolve,reject)=>{const tx=db.transaction(['items','meta'],'readonly');const items=tx.objectStore('items').getAll(),id=tx.objectStore('meta').get('collectionId');tx.oncomplete=()=>resolve({items:items.result,collectionId:id.result??null});tx.onerror=()=>reject(tx.error);});}
const identity=i=>JSON.stringify([i.id,i.inventory?.locked,i.inventory?.originalCells,i.inventory?.imageMatch,i.userSource]);
export function saveRecord(db,item,expectedRevision){
 validateRecord(item);
 return new Promise((resolve,reject)=>{const tx=db.transaction('items','readwrite'),store=tx.objectStore('items');let failure;const req=store.get(item.id);
 req.onsuccess=()=>{try{const old=req.result;if(old){if(old.revision!==expectedRevision)throw Error('Vaate muuttui toisessa ikkunassa. Sulje kortti ja avaa se uudelleen.');if(identity(old)!==identity(item))throw Error('Alkuperäisiä tunnisteita tai lähdetietoja ei saa muuttaa.');if(item.revision!==old.revision+1 && JSON.stringify(item)!==JSON.stringify(old))throw Error('Muutosversio ei täsmää.');}else if(expectedRevision!==null || item.revision!==1)throw Error('Vaatetta ei löytynyt.');store.put(item);}catch(error){failure=error;tx.abort();}};
 tx.oncomplete=()=>resolve(item);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(failure??tx.error??Error('Tallennus peruttiin.'));
 });
}
export async function makeSnapshot(db){const data=await readCollection(db);if(!data.collectionId)throw Error('Kokoelmaa ei ole vielä alustettu.');return {format:'oma-vaatekaappi',version:3,collectionId:data.collectionId,exportedAt:new Date().toISOString(),items:data.items.map(validateRecord)};}
export function restoreSnapshot(db,raw,{backupToken=null,confirmed=false}={}){
 const snapshot=readSnapshot(typeof raw==='string'?raw:JSON.stringify(raw));
 return new Promise((resolve,reject)=>{const tx=db.transaction(['items','meta'],'readwrite'),store=tx.objectStore('items');let failure;const req=store.getAll();req.onsuccess=()=>{try{if(req.result.length && (!confirmed || backupToken!==recordSignature(req.result)))throw Error('Vie nykyisestä kokoelmasta uusi varmuuskopio ja vahvista palautus.');store.clear();for(const item of snapshot.items)store.add(item);tx.objectStore('meta').put(snapshot.collectionId,'collectionId');}catch(error){failure=error;tx.abort();}};tx.oncomplete=()=>resolve(snapshot.items.length);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(failure??tx.error??Error('Palautus peruttiin kokonaan.'));
 });
}
