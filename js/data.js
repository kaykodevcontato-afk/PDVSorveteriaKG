'use strict';
const DB_KEY='devkayko_sorveteria_v1';
const uid=()=>crypto.randomUUID?.()||('s'+Date.now()+Math.random().toString(36).slice(2));
const todayISO=()=>{const d=new Date();const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
const money=value=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)||0);
const cents=value=>Math.round((Number(value)||0)*100);
const round=value=>cents(value)/100;
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const empty=()=>({version:1,businessType:'sorveteria',settings:{name:'Sorveteria Manager',ownerName:'Dono',phone:'',address:'',weightPrice:69.90,scoopPrice:6},goals:{daily:0,monthly:0},ui:{theme:'light'},security:null,cashSecurity:null,recoverySecurity:null,operatorSecurity:null,lastBackupAt:null,
 flavors:['Chocolate','Morango','Creme','Flocos','Baunilha','Doce de leite','Coco','Napolitano','Maracujá','Açaí'].map(name=>({id:uid(),name,category:'Sorvetes'})),
 products:[{name:'Casquinha',category:'Casquinhas',code:'CASQ',cost:.5,price:2,stock:0,minStock:10},{name:'Cascão',category:'Casquinhas',code:'CASCAO',cost:1,price:3.5,stock:0,minStock:10},{name:'Copo 200 ml',category:'Embalagens',code:'COPO200',cost:.35,price:1,stock:0,minStock:20},{name:'Pote 500 ml',category:'Embalagens',code:'POTE500',cost:1.5,price:3,stock:0,minStock:10},{name:'Pote 1 litro',category:'Embalagens',code:'POTE1000',cost:2.5,price:5,stock:0,minStock:10}].map(x=>({id:uid(),...x})),
 services:[{name:'Cobertura extra',category:'Adicionais',unit:'unidade',price:3},{name:'Granulado extra',category:'Adicionais',unit:'unidade',price:2},{name:'Milk-shake 300 ml',category:'Bebidas',unit:'unidade',price:15}].map(x=>({id:uid(),...x})),employees:[],sales:[],movements:[],sessions:[]});
const validCredential=o=>o&&typeof o==='object'&&typeof o.salt==='string'&&typeof o.hash==='string'&&Number.isInteger(o.iterations)&&o.iterations>=100000;
function normalizeData(raw){const d=empty();if(!raw||typeof raw!=='object')return d;
 for(const key of ['products','services','flavors','employees','sales','movements','sessions'])if(Array.isArray(raw[key]))d[key]=raw[key];
 for(const key of ['settings','goals','ui'])if(raw[key]&&typeof raw[key]==='object')d[key]={...d[key],...raw[key]};
 if(['papelaria manager','minha papelaria','minha sorveteria'].includes(String(d.settings.name).toLocaleLowerCase('pt-BR').trim()))d.settings.name='Sorveteria Manager';
 for(const key of ['security','cashSecurity','recoverySecurity'])d[key]=validCredential(raw[key])?raw[key]:null;
 if(!d.cashSecurity&&validCredential(raw.operatorSecurity))d.cashSecurity=raw.operatorSecurity;
 d.lastBackupAt=raw.lastBackupAt||null;
 for(const k of ['weightPrice','scoopPrice'])if(!(Number(d.settings[k])>0))d.settings[k]=k==='weightPrice'?69.9:6;
 return d;}
function loadDB(){try{const raw=localStorage.getItem(DB_KEY);return raw?normalizeData(JSON.parse(raw)):empty();}catch{return empty();}}
let db=loadDB();
function commit(callback){try{const previous=structuredClone(db);callback();localStorage.setItem(DB_KEY,JSON.stringify(db));return true;}catch(e){console.error(e);alert('Não foi possível salvar. Verifique o armazenamento do navegador.');return false;}}
function saveDB(){try{localStorage.setItem(DB_KEY,JSON.stringify(db));return true;}catch(e){console.error(e);return false;}}
function downloadBlob(data,name,type='application/json'){const b=new Blob([data],{type}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
function backup(){if(!Access.isOwner())return;db.lastBackupAt=new Date().toISOString();saveDB();downloadBlob(JSON.stringify(db,null,2),`sorveteria-backup-${todayISO()}.json`);}
async function restoreBackup(file){const incoming=JSON.parse(await file.text());if(!incoming||incoming.businessType!=='sorveteria'||!Array.isArray(incoming.sales)||!Array.isArray(incoming.products))throw Error('Backup não é compatível com Sorveteria Manager');db=normalizeData(incoming);if(!saveDB())throw Error('Não foi possível salvar o backup');}
