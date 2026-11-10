import {categories,legacyCategories,colors,materials,conditions,ages,validateItem,parseBackup,openStore,transaction} from './storage.js';
const $=id=>document.getElementById(id);
let db,items=[],image='',photoPending=false;
for(const [id,values] of [['category',categories],['filter',categories],['color',colors],['material',materials],['condition',conditions],['age',ages]]) for(const value of values) $(id).add(new Option(value,value));
function askConfirmation(message){
 return new Promise(resolve=>{const dialog=$('confirmation');$('confirmation-message').textContent=message;const finish=value=>{dialog.close();resolve(value);};$('confirm-yes').onclick=()=>finish(true);$('confirm-no').onclick=()=>finish(false);dialog.oncancel=event=>{event.preventDefault();finish(false);};dialog.showModal();$('confirm-no').focus();});
}
function explainError(error){if(error?.name==='QuotaExceededError')return 'Laitteen tallennustila on täynnä.';if(error?.name==='SecurityError')return 'Selain tai esikatselu estää paikallisen tallennuksen.';return error?.message || 'Tuntematon virhe.';}
function status(message){$('status').textContent=message;}
async function refresh(){items=await transaction(db,'readonly',s=>s.getAll());for(const category of legacyCategories){if(items.some(item=>item.category===category)){for(const id of ['category','filter'])if(!Array.from($(id).options).some(option=>option.value===category))$(id).add(new Option(category,category));}}render();}
function render(){
  $('count').textContent=`${items.length} vaatetta`;
  const query=$('search').value.toLocaleLowerCase('fi');
  const visible=items.filter(i=>(!$('filter').value || i.category===$('filter').value) && [i.name,i.color,i.material,i.notes].join(' ').toLocaleLowerCase('fi').includes(query));
  $('collection').replaceChildren();
  for(const item of visible){
    const card=document.createElement('button');card.className='card';card.setAttribute('aria-label',`Muokkaa: ${item.name}`);
    const photo=document.createElement('img');photo.src=item.image;photo.alt=item.name;photo.loading='lazy';
    const body=document.createElement('div'),title=document.createElement('h3'),details=document.createElement('p');
    title.textContent=item.name;details.textContent=`${item.category} · ${item.color}`;body.append(title,details);card.append(photo,body);card.onclick=()=>edit(item);$('collection').append(card);
  }
  if(!visible.length){const empty=document.createElement('div');empty.className='empty';const title=document.createElement('strong'),p=document.createElement('p');title.textContent=items.length?'Ei hakutuloksia':'Oma tyyli alkaa yhdestä vaatteesta';p.textContent=items.length?'Kokeile toista hakua tai vaatetyyppiä.':'Lisää ensimmäinen vaatteesi kuvaamalla se tai valitsemalla kuva puhelimesta.';empty.append(title,p);$('collection').append(empty);}
}
function showImage(){ $('preview').src=image;$('preview').hidden=!image;$('photo-hint').hidden=!!image; }
function edit(item){$('delete-confirmation').hidden=true;$('save').disabled=false;$('delete').disabled=false;$('form').reset();$('form-error').textContent='';$('item-id').value=item?.id||'';image=item?.image||'';showImage();$('form-title').textContent=item?'Muokkaa vaatetta':'Lisää vaate';$('delete').hidden=!item;for(const key of ['name','category','color','material','condition','age','notes']) if(item) $(key).value=item[key];$('editor').showModal();}
$('add').onclick=()=>edit();$('close').onclick=()=>$('editor').close();$('search').oninput=render;$('filter').onchange=render;
async function loadPhoto(event){
 const file=event.target.files[0];if(!file)return;
 photoPending=true;for(const id of ['save','close','camera','photo','delete'])$(id).disabled=true;$('form-error').textContent='';
 try{
  if(!file.type.startsWith('image/'))throw Error('Valitse kuvatiedosto.');
  const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
  const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();image=canvas.toDataURL('image/jpeg',.82);showImage();
 }catch(error){$('form-error').textContent='Kuvan avaaminen epäonnistui. Kokeile JPEG- tai PNG-kuvaa.';}
 finally{photoPending=false;for(const id of ['save','close','camera','photo','delete'])$(id).disabled=false;event.target.value='';}
}
$('editor').addEventListener('cancel',event=>{if(photoPending)event.preventDefault();});
$('camera').onchange=loadPhoto;$('photo').onchange=loadPhoto;
$('form').onsubmit=async event=>{
 event.preventDefault();if(photoPending)return;$('save').disabled=true;
 try{const item={id:$('item-id').value||crypto.randomUUID(),image};for(const key of ['name','category','color','material','condition','age','notes']) item[key]=$(key).value.trim();const valid=validateItem(item);await transaction(db,'readwrite',s=>s.put(valid));await refresh();$('editor').close();status('Vaate tallennettu tälle laitteelle.');}
 catch(error){$('form-error').textContent=image?`Tallennus epäonnistui: ${explainError(error)}`:'Lisää vaatteesta kuva ennen tallennusta.';}
 finally{$('save').disabled=false;}
};
$('delete').onclick=()=>{
 $('delete-confirmation').hidden=false;$('save').disabled=true;$('delete').disabled=true;
 $('cancel-delete').focus();$('delete-confirmation').scrollIntoView({block:'nearest'});
};
$('cancel-delete').onclick=()=>{
 $('delete-confirmation').hidden=true;$('save').disabled=false;$('delete').disabled=false;$('delete').focus();
};
$('confirm-delete').onclick=async()=>{
 const id=$('item-id').value;
 if(!id){$('form-error').textContent='Poistettavaa vaatetta ei ole valittu.';return;}
 $('confirm-delete').disabled=true;$('cancel-delete').disabled=true;$('close').disabled=true;
 try{
  await transaction(db,'readwrite',s=>s.delete(id));
  await refresh();$('editor').close();status('Vaate poistettu.');
 }catch(error){$('form-error').textContent=`Poistaminen epäonnistui: ${explainError(error)}`;}
 finally{$('confirm-delete').disabled=false;$('cancel-delete').disabled=false;$('close').disabled=false;}
};
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({format:'oma-vaatekaappi',version:1,exportedAt:new Date().toISOString(),items})],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`vaatekaappi-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status('Varmuuskopio ladattu. Säilytä se turvallisessa paikassa: se sisältää kuvasi.');};
let backupFile=null;
$('restore').onchange=event=>{backupFile=event.target.files[0]||null;status(backupFile?`Valittu tiedosto: ${backupFile.name}. Valitse tuonti tai palautus.`:'Valitse varmuuskopiotiedosto.');};
async function applyBackup(replace){
 if(!backupFile){status('Valitse ensin JSON-varmuuskopiotiedosto.');return;}
 try{
  if(backupFile.size>100*1024*1024)throw Error('Varmuuskopio on liian suuri (enintään 100 Mt).');
  const imported=parseBackup(await backupFile.text());
  if(replace){
   if(!await askConfirmation(`Korvataanko koko nykyinen kokoelma (${items.length} vaatetta) varmuuskopion ${imported.length} vaatteella? Ota ensin varmuuskopio nykyisestä kokoelmasta.`))return;
   await transaction(db,'readwrite',s=>{s.clear();for(const item of imported)s.put(item);});
   await refresh();status(`Koko varmuuskopio palautettu: ${imported.length} vaatetta.`);
  }else{
   const existing=new Set(items.map(i=>i.id)),fresh=imported.filter(i=>!existing.has(i.id));
   if(!fresh.length){status('Ei uusia vaatteita tuotavaksi.');return;}
   if(!await askConfirmation(`Tuodaanko ${fresh.length} uutta vaatetta? Nykyiset säilyvät.`))return;
   await transaction(db,'readwrite',s=>{for(const item of fresh)s.add(item);});
   await refresh();status(`Tuotu ${fresh.length} uutta vaatetta.`);
  }
 }catch(error){status(`Varmuuskopion käsittely epäonnistui: ${error.message}`);}
}
$('import-new').onclick=()=>applyBackup(false);
$('replace-all').onclick=()=>applyBackup(true);
try{db=await openStore();await refresh();for(const id of ['add','export','restore','import-new','replace-all'])$(id).disabled=false;status('Tallennus tällä laitteella · ei pilviyhteyttä');}catch(error){status(`Paikallista tallennustilaa ei voitu avata: ${explainError(error)} Kokeile sovellusta suoraan Chromessa.`);}
