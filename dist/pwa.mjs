const installButton=document.getElementById('pwa-install'),status=document.getElementById('pwa-status'),dialog=document.getElementById('pwa-install-dialog'),instructions=document.getElementById('pwa-install-instructions'),updatePanel=document.getElementById('pwa-update'),updateButton=document.getElementById('pwa-update-now');
const standalone=matchMedia('(display-mode:standalone)');
let installPrompt,registration,applyingUpdate=false,offlineReady=false;
function installed(){return standalone.matches||navigator.standalone===true;}
function showInstall(){installButton.hidden=installed();}
function showStatus(){status.textContent=offlineReady?(navigator.onLine?'Available offline · PDF exports included':'Offline · character creation and PDF exports available'):'Preparing offline access, including PDF exports…';}
function showUpdate(){updatePanel.hidden=!(registration?.waiting&&registration.active);}
function watchInstalling(worker){
 worker?.addEventListener('statechange',()=>{
  if(worker.state==='installed')showUpdate();
  if(worker.state==='redundant'&&!registration.active)status.textContent='Offline access could not be prepared. Reopen the app online to retry.';
 });
}
showInstall();
standalone.addEventListener('change',showInstall);
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;showInstall();});
window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.hidden=true;dialog.close();});
installButton.addEventListener('click',async()=>{
 if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();return;}
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 instructions.textContent=ios?'Open this page in Safari. Tap Share, then Add to Home Screen. Enable Open as Web App if shown, then tap Add.':/Android/.test(navigator.userAgent)?'Open your browser menu and choose Install app or Add to Home screen, then confirm.':'Use your browser’s install option in the address bar or menu. Chrome and Edge support installing this app; Safari on Mac offers Add to Dock.';
 dialog.showModal();
});
document.getElementById('pwa-install-close').addEventListener('click',()=>dialog.close());
document.getElementById('pwa-update-later').addEventListener('click',()=>{updatePanel.hidden=true;});
updateButton.addEventListener('click',()=>{
 if(!registration?.waiting)return;
 window.dispatchEvent(new Event('wfrp-before-update'));
 applyingUpdate=true;updateButton.disabled=true;updateButton.textContent='Updating…';
 registration.waiting.postMessage({type:'APPLY_UPDATE'});
});
window.addEventListener('online',()=>{showStatus();registration?.update().catch(()=>{});});
window.addEventListener('offline',showStatus);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&navigator.onLine)registration?.update().catch(()=>{});});
if('serviceWorker' in navigator){
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(applyingUpdate)location.reload();});
 try{
  registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
  showUpdate();
  watchInstalling(registration.installing);
  registration.addEventListener('updatefound',()=>watchInstalling(registration.installing));
  navigator.serviceWorker.ready.then(()=>{offlineReady=true;showStatus();showUpdate();});
 }catch{status.textContent='Offline access could not be prepared. Reopen the app online to retry.';}
}else status.textContent='Offline access is not supported in this browser.';
