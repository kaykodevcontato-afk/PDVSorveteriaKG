/* Sorveteria • calendário independente, visual roxo/claro/escuro.
 * Mantém reportDay/reportMonth com valores nativos YYYY-MM-DD e YYYY-MM.
 * Funciona em GitHub Pages sem dependências e sem alterar o histórico. */
'use strict';
(() => {
  const el = id => document.getElementById(id);
  const months=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const weekdays=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const pop=el('sorveteriaCalendar'), grid=el('calendarGrid'), heading=el('calendarHeading');
  if(!pop || !el('reportDay') || !el('reportMonth'))return;
  let input=null, year=0, month=0;
  const pad=n=>String(n).padStart(2,'0');
  const today=()=>new Date();
  function dateParts(value){
    const match=/^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value||'');
    if(match){const y=Number(match[1]),m=Number(match[2]);if(y>=1900&&y<=2100&&m>=1&&m<=12)return {year:y,month:m-1};}
    const now=today();return{year:now.getFullYear(),month:now.getMonth()};
  }
  function refreshTrigger(id){
    const source=el(id),target=el(id+'Display');if(!source||!target)return;
    const value=source.value;
    if(id==='reportDay'&&/^\d{4}-\d{2}-\d{2}$/.test(value)){
      target.textContent=value.slice(8,10)+'/'+value.slice(5,7)+'/'+value.slice(0,4);
    }else if(id==='reportMonth'&&/^\d{4}-\d{2}$/.test(value)){
      target.textContent=months[Number(value.slice(5,7))-1]+' de '+value.slice(0,4);
    }else target.textContent=id==='reportDay'?'Escolher dia':'Escolher mês';
  }
  function close(){pop.hidden=true;input=null;}
  function choose(value){
    if(!input)return;
    input.value=value;
    refreshTrigger(input.id);
    input.dispatchEvent(new Event('change',{bubbles:true}));
    const trigger=document.querySelector(`[data-calendar-target="${input.id}"]`);
    close();trigger?.focus();
  }
  function draw(){
    if(!input)return;
    const isMonth=input.id==='reportMonth';
    heading.textContent=months[month]+' de '+year;
    grid.classList.toggle('calendar-grid-months',isMonth);
    grid.replaceChildren();
    const current=input.value;
    if(!isMonth){
      weekdays.forEach(week=>{
        const label=document.createElement('span');label.className='calendar-weekday';label.textContent=week;grid.append(label);
      });
      const first=(new Date(year,month,1).getDay()+6)%7;
      for(let i=0;i<first;i++){
        const empty=document.createElement('span');empty.className='calendar-empty';grid.append(empty);
      }
      const days=new Date(year,month+1,0).getDate();
      const now=today(),todayValue=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
      for(let day=1;day<=days;day++){
        const value=`${year}-${pad(month+1)}-${pad(day)}`;
        const btn=document.createElement('button');btn.type='button';btn.className='calendar-day';btn.textContent=String(day);
        btn.dataset.value=value;btn.setAttribute('aria-label',`${day} de ${months[month]} de ${year}`);
        if(value===current)btn.classList.add('selected');
        if(value===todayValue)btn.classList.add('is-today');
        grid.append(btn);
      }
    }else{
      for(let i=0;i<12;i++){
        const value=`${year}-${pad(i+1)}`;
        const btn=document.createElement('button');btn.type='button';btn.className='calendar-month';btn.textContent=months[i].slice(0,3).replace(/^./,x=>x.toUpperCase());
        btn.dataset.value=value;btn.setAttribute('aria-label',months[i]+' de '+year);
        if(value===current)btn.classList.add('selected');
        grid.append(btn);
      }
    }
  }
  function open(target){
    if(!['reportDay','reportMonth'].includes(target))return;
    input=el(target);
    refreshTrigger(target);
    const d=dateParts(input.value);year=d.year;month=d.month;
    draw();pop.hidden=false;
    const btn=document.querySelector(`[data-calendar-target="${target}"]`);
    const rect=btn.getBoundingClientRect();
    const w=Math.min(325,window.innerWidth-20);
    const left=Math.max(10,Math.min(rect.left,window.innerWidth-w-10));
    pop.style.width=w+'px';
    const height=pop.getBoundingClientRect().height;
    const above=rect.bottom+height+8>window.innerHeight && rect.top>height+8;
    pop.style.left=left+'px';
    pop.style.top=(above?rect.top-height-6:Math.min(rect.bottom+6,Math.max(10,window.innerHeight-height-10)))+'px';
    pop.querySelector('.calendar-nav')?.focus();
  }
  document.querySelectorAll('[data-calendar-target]').forEach(btn=>{
    btn.addEventListener('click',()=>pop.hidden?open(btn.dataset.calendarTarget):close());
  });
  pop.addEventListener('click',event=>{
    const btn=event.target.closest('button');if(!btn)return;
    if(btn.dataset.value){choose(btn.dataset.value);return;}
    const action=btn.dataset.calAction;
    if(action==='close')return close();
    if(action==='today'){
      const d=today();year=d.getFullYear();month=d.getMonth();
      return choose(input.id==='reportDay'?`${year}-${pad(month+1)}-${pad(d.getDate())}`:`${year}-${pad(month+1)}`);
    }
    if(action==='prev'||action==='next'){
      const add=action==='prev'?-1:1;
      // Selecionar mês: navegar por anos; selecionar dia: navegar por meses.
      const d=new Date(year,month+(input.id==='reportMonth'?add*12:add),1);
      year=d.getFullYear();month=d.getMonth();draw();
    }
  });
  document.addEventListener('pointerdown',event=>{
    if(!pop.hidden&&!pop.contains(event.target)&&!event.target.closest('[data-calendar-target]'))close();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!pop.hidden){close();event.preventDefault();}
  });
  ['reportDay','reportMonth'].forEach(id=>{
    el(id).addEventListener('change',()=>refreshTrigger(id));
    refreshTrigger(id);
  });
})();
