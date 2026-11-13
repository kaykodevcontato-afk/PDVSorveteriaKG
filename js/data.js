/*
 * Sorveteria Manager 1.0 — Persistência local
 * Banco independente da papelaria. Não altere a chave após começar a vender.
 */
'use strict';
const DB_KEY = 'devkayko_sorveteria_v1';

// PREÇOS E PRODUTOS INICIAIS SÃO APENAS EXEMPLOS: configure antes de vender.
const INITIAL_SERVICES = [
  {name:'Cobertura extra',category:'Adicionais',unit:'unidade',price:3},
  {name:'Granulado extra',category:'Adicionais',unit:'unidade',price:2},
  {name:'Milk-shake 300 ml',category:'Bebidas',unit:'unidade',price:15}
];
const INITIAL_PRODUCTS = [
  {name:'Casquinha',category:'Casquinhas',code:'CASQ',cost:0.5,price:2,stock:0,minStock:10},
  {name:'Cascão',category:'Casquinhas',code:'CASCAO',cost:1,price:3.5,stock:0,minStock:10},
  {name:'Copo 200 ml',category:'Embalagens',code:'COPO200',cost:0.35,price:1,stock:0,minStock:20},
  {name:'Pote 500 ml',category:'Embalagens',code:'POTE500',cost:1.5,price:3,stock:0,minStock:10},
  {name:'Pote 1 litro',category:'Embalagens',code:'POTE1000',cost:2.5,price:5,stock:0,minStock:5}
];
const INITIAL_FLAVORS = [
  'Chocolate','Morango','Creme','Flocos','Baunilha','Doce de leite','Coco','Napolitano','Maracujá','Açaí'
];

const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function freshData() {
  return {
    version:1,
    businessType:'sorveteria',
    settings:{name:'Minha Sorveteria',phone:'',address:'',weightPrice:69.90,scoopPrice:6},
    flavors:INITIAL_FLAVORS.map(name=>({id:uid(),name,category:'Sorvetes'})),
    products:INITIAL_PRODUCTS.map(item=>({id:uid(),...item})),
    services:INITIAL_SERVICES.map(item=>({id:uid(),...item})),
    employees:[],movements:[],sales:[],sessions:[],
    goals:{daily:0,monthly:0},
    ui:{theme:'light'},
    security:null, // senha antiga do caixa passa a ser senha do dono
    cashSecurity:null, // senha operacional exclusiva para abrir, fechar e desbloquear o caixa

    lastBackup:null
  };
}

// Dados antigos da 1.0 e 1.1 não possuíam goals e ui.
function normalizeData(data) {
  data.flavors=Array.isArray(data.flavors)?data.flavors:[];
  data.settings.weightPrice=Number.isFinite(Number(data.settings.weightPrice)) && Number(data.settings.weightPrice)>0?Number(data.settings.weightPrice):69.90;
  data.settings.scoopPrice=Number.isFinite(Number(data.settings.scoopPrice)) && Number(data.settings.scoopPrice)>0?Number(data.settings.scoopPrice):6;
  data.goals = data.goals && typeof data.goals === 'object'
    ? {daily:Number(data.goals.daily)||0,monthly:Number(data.goals.monthly)||0}
    : {daily:0,monthly:0};
  data.ui = data.ui && typeof data.ui === 'object'
    ? {theme:data.ui.theme==='dark'?'dark':'light'}
    : {theme:'light'};
  data.security = data.security && typeof data.security==='object'
    && typeof data.security.salt==='string' && typeof data.security.hash==='string'
    && Number.isSafeInteger(data.security.iterations) && data.security.iterations>=100000
    ? data.security : null;
  // Migração 1.5: a antiga senha de login do funcionário passa a servir
  // SOMENTE para abrir/fechar caixa; o login do funcionário não exige senha.
  const validCredential=record=>record && typeof record==='object'
    && typeof record.salt==='string' && typeof record.hash==='string'
    && Number.isSafeInteger(record.iterations) && record.iterations>=100000;
  data.cashSecurity = validCredential(data.cashSecurity) ? data.cashSecurity
    : validCredential(data.operatorSecurity) ? data.operatorSecurity : null;
  data.operatorSecurity = null; // campo antigo obsoleto; não é usado para login
  data.movements.forEach(m=>{if(typeof m.voided!=='boolean')m.voided=false;});
  return data;
}

function validData(data) {
  if (!data || data.version!==1 || data.businessType!=='sorveteria' || !data.settings || typeof data.settings.name!=='string')return false;
  const collections=['products','services','employees','movements','sales','sessions'];
  if (!Array.isArray(data.flavors)||data.flavors.length>3000||!data.flavors.every(f=>f && typeof f.id==='string'&&typeof f.name==='string'))return false;
  if (!collections.every(key=>Array.isArray(data[key]) && data[key].length<=200000))return false;
  return collections.every(key=>data[key].every(item=>item&&typeof item==='object'&&typeof item.id==='string'));
}

let storageError=false;
function loadData() {
  try {
    const raw=localStorage.getItem(DB_KEY);
    if (!raw)return freshData();
    const data=JSON.parse(raw);
    if (!validData(data))throw Error('Registros locais incompatíveis');
    return normalizeData(data);
  } catch (error) {
    storageError=true;
    alert('Não foi possível ler os registros antigos. Nenhum dado foi sobrescrito. Restaure um backup ou examine o armazenamento antes de salvar novos registros.');
    return freshData();
  }
}
let db=loadData();

function saveData() {
  if(storageError){alert('O armazenamento anterior está com erro. Para proteger os dados existentes, o salvamento foi bloqueado nesta aba.');return false;}
  try {
    localStorage.setItem(DB_KEY,JSON.stringify(db));
    return true;
  } catch (error) {
    alert('Não foi possível salvar. O armazenamento pode estar cheio ou bloqueado. Faça backup antes de continuar.');
    return false;
  }
}

// Modifica e salva como uma operação; desfaz a memória se a gravação falhar.
function commit(modifier) {
  const original=structuredClone(db);
  try {
    modifier();
    if(!saveData()){db=original;return false;}
    return true;
  }catch(error){db=original;alert(error.message||'Erro ao salvar');return false;}
}

function exportData() {
  const snapshot=structuredClone(db);
  const when=new Date().toISOString();
  snapshot.lastBackup=when;
  const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download=`sorveteria-manager-backup-${new Date().toLocaleDateString('sv-SE')}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2500);
  commit(()=>{db.lastBackup=when;});
}

async function importData(file) {
  if(!file||file.size>30*1024*1024)throw Error('Escolha um backup JSON de até 30 MB.');
  let data;
  try{data=JSON.parse(await file.text());}catch{throw Error('O arquivo JSON não pôde ser lido.');}
  if(!validData(data))throw Error('O arquivo não é um backup compatível do Sorveteria Manager.');
  if(!confirm('ATENÇÃO: restaurar substitui todos os dados locais, inclusive vendas e estoque. Deseja continuar?'))return false;
  const original=db;
  db=normalizeData(data);
  if(!saveData()){db=original;return false;}
  return true;
}
