const CACHE='planify-v6';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='CHECK_TASKS'){
    const tasks=e.data.tasks||[];
    const now=new Date();now.setHours(0,0,0,0);
    const sN={mat:'Matemáticas',esp:'Español',cien:'Ciencias',hist:'Historia',ing:'Inglés',arte:'Arte',edu:'Ed. Física',otro:'Otra'};
    tasks.filter(t=>!t.done&&t.date).forEach(t=>{
      const due=new Date(t.date+'T00:00:00');
      const diff=Math.floor((due-now)/864e5);
      if(diff===3||diff===1||diff===0){
        const cuando=diff===0?'🔥 HOY vence':diff===1?'⏰ Mañana vence':'📅 En '+diff+' días';
        const profe=t.teacher?' — '+t.teacher:'';
        self.registration.showNotification(cuando,{
          body:t.type+' de '+(sN[t.subj]||'Materia')+profe+': "'+t.title+'"',
          icon:'./favicon.svg',tag:t.id+'_'+diff,renotify:false,vibrate:[200,100,200]
        });
      }
    });
  }
});
