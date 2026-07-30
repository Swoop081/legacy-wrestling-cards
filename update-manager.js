(() => {
  const RUNNING='0.7.5';
  async function check(){
    try{
      const r=await fetch(`version.json?ts=${Date.now()}`,{cache:'no-store'});
      if(!r.ok)return;
      const v=await r.json();
      if(v.version&&v.version!==RUNNING){
        if('caches'in window){for(const k of await caches.keys())await caches.delete(k)}
        if('serviceWorker'in navigator){for(const reg of await navigator.serviceWorker.getRegistrations())await reg.unregister()}
        location.replace(`./?updated=${Date.now()}`);
      }
    }catch(e){}
  }
  window.addEventListener('load',async()=>{
    await check();
    if('serviceWorker'in navigator){try{const reg=await navigator.serviceWorker.register('service-worker.js?v=0.7.5',{updateViaCache:'none'});await reg.update()}catch(e){}}
  });
})();
