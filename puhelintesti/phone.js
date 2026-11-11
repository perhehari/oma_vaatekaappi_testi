
kyllä

13.36
GitHub palauttaa edelleen Forbidden-virheen, joten tehdään julkaisu käyttöliittymässä yksi vaihe kerrallaan.

Avaa ensin tämä sivu:

GitHub – oma_vaatekaappi_testi

Varmista, että olet Code-välilehdellä ja näet nykyiset tiedostot. Älä vielä muuta mitään.

Kerro, kun sivu on auki.

13.37
auki

13.37
Työskenteli 2s
Valitse tiedostoluettelon yläpuolelta Add file → Create new file.

Kirjoita tiedoston nimeksi täsmälleen:

puhelintesti/index.html
Vinoviiva luo uuden puhelintesti-kansion. Älä vielä paina Commit changes.

Kerro, kun nimi on kirjoitettu.

13.37
y

13.38
Kopioi alla oleva koodi GitHubin suureen Edit-kenttään:

<!doctype html><html lang="fi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#344d43"><title>Oma vaatekaappi – puhelimen testiversio</title><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="phone.css">
<header><span>OMA TYYLI · OMASTA KAAPISTA</span><h1>Vaatekaappisi.</h1><p>Puhelimen muokkaus · erillinen paikallinen testikokoelma</p></header><main>
<p class="notice">Tämä on testiversio. Kuvat ja tiedot säilyvät tässä selaimessa. Vie palautuskopio talteen myös puhelimen ulkopuolelle.</p>
<p id="message" role="status" aria-live="polite">Avataan testikokoelmaa…</p>
<section class="toolbar"><h2>Oma kokoelma <small id="total"></small></h2><button id="new" disabled>＋ Lisää vaate</button></section>
<div class="tabs"><button id="active" class="secondary" aria-pressed="true">Vaatekaappi</button><button id="archive" class="secondary" aria-pressed="false">Arkisto</button></div>
<section class="filters"><label>Etsi kaikista tiedoista<input id="query" type="search" placeholder="Nimi, ID, merkki, säilytyspaikka…"></label><label>Vaateryhmä<select id="group-filter"><option value="">Kaikki</option></select></label><label>Alatyyppi<select id="type-filter"><option value="">Kaikki</option></select></label></section>
<p id="visible-count"></p><section id="cards" class="grid" aria-label="Vaatteet"></section>
<section class="backup"><h2>Varmuuskopio ja käyttöönotto</h2><p>Ensimmäisellä kerralla valitse tietokoneella tekemäsi uusin varmuuskopio. Sen jälkeen kokoelma avautuu tallennuksesta; Exceliä ei lueta uudelleen.</p><button id="export-phone" class="secondary" disabled>Vie varmuuskopio</button><label>Valitse testikokoelma tai palautettava varmuuskopio<input id="snapshot" type="file" accept=".json,application/json" disabled></label><p id="restore-summary"></p><label id="backup-ack-row" hidden><input id="backup-ack" type="checkbox"> Olen tallentanut nykyisen kokoelman varmuuskopion turvalliseen paikkaan.</label><button id="restore-phone" disabled>Ota valittu kokoelma käyttöön</button><p>Palautus korvaa tämän testikokoelman vahvistuksen jälkeen. Tämä ei yhdistä kahdella laitteella tehtyjä muutoksia.</p></section>
</main>
<dialog id="phone-editor"><form id="phone-form"><div class="dialog-head"><h2 id="editor-title">Vaate</h2><button type="button" id="close-phone" class="secondary">Sulje</button></div><div class="photo"><img id="phone-image" alt="Vaatteen kuva" hidden></div><div class="photo-actions"><label class="file-button">Ota kuva<input id="take-photo" type="file" accept="image/*" capture="environment"></label><label class="file-button">Valitse kuva<input id="choose-photo" type="file" accept="image/*"></label></div>
<label>Nimi<input id="edit-name" maxlength="100" placeholder="Nimen voi jättää uutena automaattiseksi"></label><label>Merkki<input id="edit-brand" maxlength="500"></label><div class="fields"><label>Vaateryhmä<select id="edit-group" required></select></label><label>Alatyyppi<input id="edit-type" list="type-options" maxlength="200" required><datalist id="type-options"></datalist></label><label>Väri<input id="edit-color" maxlength="200"></label><label>Kunto<input id="edit-condition" list="condition-options" maxlength="200"><datalist id="condition-options"><option>Erinomainen</option><option>Hyvä</option><option>Siisti</option><option>Tyydyttävä</option><option>Kulunut</option><option>Korjattava</option></datalist></label><label>Tila<input id="edit-state" list="state-options" maxlength="200"><datalist id="state-options"></datalist></label></div><label>Säilytyspaikka<input id="edit-storage" maxlength="500"></label><label>Huomiot<textarea id="edit-notes" rows="3" maxlength="1000"></textarea></label>
<h3>Lisätiedot</h3><div id="detail-groups"></div><p id="edit-error" role="alert"></p><div class="actions"><button id="save-phone" type="submit">Tallenna muutokset</button><button id="archive-phone" class="secondary" type="button" hidden>Siirrä arkistoon</button><button id="unarchive-phone" class="secondary" type="button" hidden>Palauta vaatekaappiin</button></div></form></dialog>
<dialog id="phone-confirm"><h2 id="confirm-title">Vahvista</h2><p id="confirm-message"></p><div class="actions"><button id="confirm-phone">Vahvista</button><button id="cancel-phone" class="secondary">Peruuta</button></div></dialog><footer>Paikallinen testiversio · ei pilvitallennusta</footer><script type="module" src="phone.js"></script></html>
Paina sitten Commit changes… ja avautuvassa ikkunassa uudelleen Commit changes. Jos GitHub kysyy haaraa, valitse tallennus suoraan main-haaraan.

Kerro, kun ensimmäinen tiedosto on tallennettu. Sivusto toimii vasta, kun muutkin kuusi tiedostoa on lisätty.

13.38
tallennettu

13.39
Työskenteli 1s
Lisätään seuraava tiedosto.

Valitse Add file → Create new file.

Jos olet jo puhelintesti-kansion sisällä, kirjoita nimeksi phone.js.
Jos näet repositorion juuritiedostot, kirjoita puhelintesti/phone.js.
Lopullisen polun pitää olla puhelintesti/phone.js. Älä vielä tallenna.

Kerro, kun nimi on kirjoitettu.

13.39
kirjoitettu

13.40
Vastaus: const file=event.target.files[0];if(!file)return;if(file.size>100*1024*1024)throw Error('Varmuuskopion enimmäiskoko on 100 Mt.');selectedSnapshot=readSnapshot(await file.text());$('restore-summary').textContent=`Valitussa tiedostossa ${selectedSnapshot.items.length} vaatetta. Nykyisessä testikokoelmassa ${items.length}.`;$('backup-ack-row').hidden=!items.length;$('restore-phone').disabled=false;}catch(e){say(errorText(e));}}; $('restore-phone').onclick=async()=>{if(!selectedSnapshot)return;$('restore-phone').disabled=true;try{const existing=await readCollection(db);if(existing.items.length && (!$('backup-ack').checked || !backupToken))throw Error('Vie ensin nykyinen varmuuskopio ja vahvista sen tallennus.');if(!await ask('Ota kokoelma käyttöön',existing.items.length?`Korvataanko testikokoelman ${existing.items.length} vaatetta valitun tiedoston ${selectedSnapshot.items.length}
Kopioi koko alla oleva koodi GitHubin Edit-kenttään:

import {groups,sportsTypes,states,fieldValue,sourceFields,lockedHeaders,detailHeaders,validateRecord,editRecord,restoreArchived,matches,recordSignature,readSnapshot} from './phone-model.js';
import {openPhoneStore,readCollection,saveRecord,makeSnapshot,restoreSnapshot} from './phone-store.js';
const $=id=>document.getElementById(id);
let db,items=[],collectionId=null,archived=false,current=null,image='',photoKind='photo',busy=false,selectedSnapshot=null,backupToken=null;
const keys={brand:'edit-brand',name:'edit-name',group:'edit-group',category:'edit-type',color:'edit-color',condition:'edit-condition',state:'edit-state',storage:'edit-storage',notes:'edit-notes'};
const say=message=>$('message').textContent=message;
function errorText(e){return e?.name==='QuotaExceededError'?'Selaimen tallennustila on täynnä. Vie varmuuskopio ja vapauta laitteen tilaa.':e?.message||'Toiminto epäonnistui.';}
function options(id,values,all=false){const select=$(id),old=select.value;select.replaceChildren();if(all)select.append(new Option('Kaikki',''));for(const value of [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fi')))select.append(new Option(value,value));if([...select.options].some(o=>o.value===old))select.value=old;}
function typeOptions(){options('type-filter',items.filter(i=>!$('group-filter').value||i.group===$('group-filter').value).map(i=>i.category),true);}
function editTypeOptions(){options('type-options',$('edit-group').value==='Urheiluvaatteet'?sportsTypes:items.filter(i=>i.group===$('edit-group').value).map(i=>i.category));}
function render(){
 $('total').textContent=`${items.length} vaatetta`;
 const found=items.filter(i=>matches(i,{query:$('query').value,group:$('group-filter').value,category:$('type-filter').value,archive:archived}));
 $('visible-count').textContent=`Näytetään ${found.length} ${archived?'arkistoitua vaatetta':'vaatetta'}`;
 $('active').setAttribute('aria-pressed',String(!archived));$('archive').setAttribute('aria-pressed',String(archived));$('cards').replaceChildren();
 for(const item of found){const card=document.createElement('button');card.className='card';card.dataset.id=item.id;card.setAttribute('aria-label',`Avaa: ${item.name}`);const photo=document.createElement('img');photo.src=item.image;photo.alt=item.name;photo.loading='lazy';const body=document.createElement('div'),title=document.createElement('h3'),details=document.createElement('p');title.textContent=item.name;details.textContent=[item.category,item.color,fieldValue(item,'brand')].filter(Boolean).join(' · ');body.append(title,details);card.append(photo,body);card.onclick=()=>openEditor(item);$('cards').append(card);}
 if(!found.length){const empty=document.createElement('p');empty.className='empty';empty.textContent=items.length?'Ei hakutuloksia tässä näkymässä.':'Valitse valmisteltu testikokoelma sivun alaosasta.';$('cards').append(empty);}
}
async function refresh(){const data=await readCollection(db);items=data.items;collectionId=data.collectionId;options('group-filter',[...groups,...items.map(i=>i.group)],true);typeOptions();render();$('new').disabled=!collectionId;}
const detailGroupDefs=[['👕 Vaatteen ominaisuudet',/koko|malli|kuosi|materiaali/i],['🧺 Huolto-ohjeet',/pesu|kuivaus|silitys|hoito/i],['🛍️ Ostostiedot',/osto|hankinta|hinta/i],['🏷️ Muut tiedot',/.*/]];
let editingFields=[];
const primaryHeaders=['Tunnistenimi','Merkki','Alaryhmä / tyyppi','Alaryhmä/tyyppi','Pääväri','Kunto','Tila','Säilytyspaikka','Huomiot'];
function showDetailGroups(item){
 editingFields=structuredClone(sourceFields(item));
 $('detail-groups').replaceChildren();
 const containers=detailGroupDefs.map(([title])=>{const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=title;details.append(summary);$('detail-groups').append(details);return details;});
 for(const field of editingFields){
  if(lockedHeaders.includes(field.header)||primaryHeaders.includes(field.header)||field.header==='Pesuohjeen lähde')continue;
  const label=document.createElement('label');label.textContent=field.header||`Muu tieto (sarake ${field.column})`;
  const input=document.createElement('input');input.dataset.sourceColumn=field.column;input.value=field.value??'';
  input.type=typeof field.value==='number'?'number':typeof field.value==='boolean'?'checkbox':'text';
  if(input.type==='number')input.step='any';if(input.type==='checkbox')input.checked=field.value;
  input.maxLength=10000;label.append(input);
  containers[detailGroupDefs.findIndex(([,pattern])=>pattern.test(field.header??''))].append(label);
 }
}
function readDetailChanges(){return editingFields.filter(f=>!lockedHeaders.includes(f.header)&&!primaryHeaders.includes(f.header)).map(field=>{
 let value=field.value;
 const input=$('detail-groups').querySelector(`[data-source-column="${field.column}"]`);
 if(input){value=input.type==='checkbox'?input.checked:input.type==='number'?(input.value===''?null:input.valueAsNumber):input.value;if(field.value===null&&value==='')value=null;}
 return {column:field.column,value};
});}
function showImage(){$('phone-image').hidden=!image;$('phone-image').src=image;}
function openEditor(item){current=item?structuredClone(item):null;if(current&&!current.inventory&&!current.extraFields)current.extraFields=[...new Set(['Merkki',...detailHeaders])].map((header,n)=>({column:n+1,header,value:header==='Merkki'?current.brand??'':header==='Materiaali'?current.material:''}));image=item?.image??'';photoKind=item?.photoKind??'photo';$('phone-form').reset();$('edit-error').textContent='';$('editor-title').textContent=item?'Muokkaa vaatetta':'Lisää vaate';options('edit-group',[...groups,...items.map(i=>i.group)]);for(const [key,id] of Object.entries(keys))$(id).value=item?.[key]??(key==='state'?'Käytössä':key==='group'?'Paidat':'');options('state-options',[...states,...items.map(i=>i.state)]);editTypeOptions();showImage();$('edit-brand').value=item?fieldValue(item,'brand'):'';showDetailGroups(current??{extraFields:[...new Set(['Merkki',...detailHeaders])].map((header,n)=>({column:n+1,header,value:''}))});$('archive-phone').hidden=!item||item.state==='Poistettu';$('unarchive-phone').hidden=!item||item.state!=='Poistettu';$('phone-editor').showModal();}
function ask(title,message){return new Promise(resolve=>{const dialog=$('phone-confirm');$('confirm-title').textContent=title;$('confirm-message').textContent=message;const done=value=>{dialog.close();resolve(value);};$('confirm-phone').onclick=()=>done(true);$('cancel-phone').onclick=()=>done(false);dialog.oncancel=e=>{e.preventDefault();done(false);};dialog.showModal();$('cancel-phone').focus();});}
function setBusy(value){busy=value;for(const id of ['save-phone','close-phone','archive-phone','unarchive-phone','take-photo','choose-photo'])$(id).disabled=value;}
async function loadPhoto(event){const file=event.target.files[0];if(!file)return;setBusy(true);$('edit-error').textContent='';try{const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();image=canvas.toDataURL('image/jpeg',.82);photoKind='photo';showImage();}catch{ $('edit-error').textContent='Kuvan avaaminen epäonnistui. Kokeile JPEG- tai PNG-kuvaa.';}finally{setBusy(false);event.target.value='';}}
$('take-photo').onchange=loadPhoto;$('choose-photo').onchange=loadPhoto;$('phone-editor').oncancel=e=>{if(busy)e.preventDefault();};$('close-phone').onclick=()=>$('phone-editor').close();$('new').onclick=()=>openEditor();$('edit-group').onchange=editTypeOptions;
$('phone-form').onsubmit=async event=>{event.preventDefault();if(busy)return;setBusy(true);$('edit-error').textContent='';try{const patch={};for(const [key,id] of Object.entries(keys))patch[key]=$(id).value;patch.name=patch.name||patch.category;patch.image=image;patch.photoKind=photoKind;if(!image)throw Error('Lisää vaatteesta kuva.');const now=new Date().toISOString();const changes=readDetailChanges();let item;if(current){item=editRecord(current,patch,now,changes);}else{const extraFields=editingFields.map(f=>({...f,value:f.header==='Merkki'?patch.brand:changes.find(c=>c.column===f.column)?.value??f.value}));item=validateRecord({id:crypto.randomUUID(),...patch,brand:$('edit-brand').value,material:extraFields.find(f=>f.header==='Materiaali')?.value??'',extraFields,age:'Ei tiedossa',phoneSchema:1,revision:1,updatedAt:now});}await saveRecord(db,item,current?.revision??null);backupToken=null;await refresh();$('phone-editor').close();say('Muutokset tallennettu tähän selaimeen. Vie varmuuskopio päivän päätteeksi.');}catch(e){$('edit-error').textContent=errorText(e);}finally{setBusy(false);}};
async function changeArchive(restore){if(!current||busy)return;if(!await ask(restore?'Palauta vaatekaappiin':'Siirrä arkistoon',restore?'Vaate palautuu aktiiviseen vaatekaappiin.':'Vaate säilyy tallessa mutta poistuu aktiivisesta vaatekaapista. Voit palauttaa sen Arkisto-näkymästä.'))return;setBusy(true);try{const item=restore?restoreArchived(current):editRecord(current,{state:'Poistettu'});await saveRecord(db,item,current.revision);backupToken=null;await refresh();$('phone-editor').close();say(restore?'Vaate palautettu vaatekaappiin.':'Vaate siirretty arkistoon.');}catch(e){$('edit-error').textContent=errorText(e);}finally{setBusy(false);}}
$('archive-phone').onclick=()=>changeArchive(false);$('unarchive-phone').onclick=()=>changeArchive(true);
$('query').oninput=render;$('group-filter').onchange=()=>{typeOptions();render();};$('type-filter').onchange=render;$('active').onclick=()=>{archived=false;render();};$('archive').onclick=()=>{archived=true;render();};
$('export-phone').onclick=async()=>{try{const snapshot=await makeSnapshot(db);const blob=new Blob([JSON.stringify(snapshot)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`vaatekaappi-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);backupToken=recordSignature(snapshot.items);say('Varmuuskopion lataus aloitettu. Tarkista tiedosto ja säilytä kopio myös tämän laitteen ulkopuolella.');}catch(e){say(errorText(e));}};
$('snapshot').onchange=async event=>{selectedSnapshot=null;$('restore-phone').disabled=true;$('backup-ack').checked=false;try{const file=event.target.files[0];if(!file)return;if(file.size>100*1024*1024)throw Error('Varmuuskopion enimmäiskoko on 100 Mt.');selectedSnapshot=readSnapshot(await file.text());$('restore-summary').textContent=`Valitussa tiedostossa ${selectedSnapshot.items.length} vaatetta. Nykyisessä testikokoelmassa ${items.length}.`;$('backup-ack-row').hidden=!items.length;$('restore-phone').disabled=false;}catch(e){say(errorText(e));}};
$('restore-phone').onclick=async()=>{if(!selectedSnapshot)return;$('restore-phone').disabled=true;try{const existing=await readCollection(db);if(existing.items.length && (!$('backup-ack').checked || !backupToken))throw Error('Vie ensin nykyinen varmuuskopio ja vahvista sen tallennus.');if(!await ask('Ota kokoelma käyttöön',existing.items.length?`Korvataanko testikokoelman ${existing.items.length} vaatetta valitun tiedoston ${selectedSnapshot.items.length} vaatteella?`:`Avataanko valitun testikokoelman



