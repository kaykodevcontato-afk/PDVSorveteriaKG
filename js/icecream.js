/*
 * SORVETERIA MANAGER — DEV KAYKO
 * Venda por peso (gramas ou valor), bolas e cadastro de sabores.
 * Preços ficam em db.settings, sabores em db.flavors.
 * Não lê balanças Bluetooth/USB automaticamente: digite o peso indicado.
 */
'use strict';
let iceMode='peso';
let iceChosenFlavors=new Set();

function quoteIce(){
  const price=iceMode==='peso'?Number(db.settings.weightPrice):Number(db.settings.scoopPrice);
  if(!Number.isFinite(price)||price<=0)return null;
  if(iceMode==='bola'){
    const count=Number($('iceQty').value);
    if(!Number.isInteger(count)||count<=0||count>500)return null;
    return {mode:'bola',qty:count,unit:'bola',weightGrams:null,fromValue:false,price,
      total:fromCents(toCents(price)*count),description:`${count} bola${count===1?'':'s'} · ${money(price)} por bola`};
  }
  const raw=Number($('iceAmount').value);
  if(!positive($('iceAmount').value)||raw>1000000)return null;
  const fromValue=$('iceInputMode').value==='valor';
  const total=fromValue?fromCents(toCents(raw)):fromCents(toCents(raw/1000*price));
  const grams=fromValue ? total/price*1000 : raw;
  if(total<=0||!Number.isFinite(grams)||grams<=0)return null;
  return {mode:'peso',qty:grams/1000,unit:'kg',weightGrams:grams,fromValue,price,total,
    description:`${fromValue?'≈ ':''}${grams.toLocaleString('pt-BR',{maximumFractionDigits:1})} g · ${money(price)}/kg`};
}
function renderIce(){
  const wrapper=$('iceCalculator');if(!wrapper)return;
  $('icePriceSummary').textContent=`${money(db.settings.weightPrice)}/kg · ${money(db.settings.scoopPrice)}/bola`;
  document.querySelectorAll('[data-ice-mode]').forEach(btn=>{
    const on=btn.dataset.iceMode===iceMode;
    btn.classList.toggle('selected',on);btn.setAttribute('aria-pressed',String(on));
  });
  $('iceWeightFields').hidden=iceMode!=='peso';
  $('iceBallsFields').hidden=iceMode!=='bola';
  $('iceAmountLabel').textContent=$('iceInputMode').value==='valor'?'Valor em reais (R$)':'Peso em gramas (g)';
  $('iceAmount').placeholder=$('iceInputMode').value==='valor'?'Ex.: 20.00':'Ex.: 350';
  const available=new Set(db.flavors.map(f=>f.id));
  iceChosenFlavors=new Set([...iceChosenFlavors].filter(id=>available.has(id)));
  $('iceFlavors').innerHTML=db.flavors.map(f=>`<button type="button" class="ice-flavor" data-ice-flavor="${esc(f.id)}" aria-pressed="${iceChosenFlavors.has(f.id)}" title="Selecionar ${esc(f.name)}">${esc(f.name)}</button>`).join('')||'<small>Nenhum sabor cadastrado. Peça ao dono para cadastrar.</small>';
  const quote=quoteIce();
  $('iceCalcTotal').textContent=quote?money(quote.total):money(0);
  $('iceQuoteDetail').textContent=quote?quote.description:iceMode==='peso'?'Informe o peso ou o valor para calcular':'Informe a quantidade de bolas';
  $('iceAddToCart').disabled=!quote;
}
function renderFlavors(){
  if(!Access.isOwner())return;
  $('flavorRows').innerHTML=db.flavors.map(f=>`<tr><td><b>${esc(f.name)}</b></td><td>${esc(f.category||'Sorvetes')}</td><td>${actionButtons('flavors',f.id)}</td></tr>`).join('')||emptyRow(3,'Cadastre seus sabores para começar.');
  $('iceWeightPrice').value=Number(db.settings.weightPrice);
  $('iceScoopPrice').value=Number(db.settings.scoopPrice);
}
function addIceToCart(){
  const quote=quoteIce();
  if(!quote)return toast('Informe um peso, valor ou quantidade válido.');
  const flavors=db.flavors.filter(f=>iceChosenFlavors.has(f.id)).map(f=>f.name);
  const flavorText=flavors.length?flavors.join(' + '):'Sortido / não informado';
  const item={kind:'ice',id:uid(),name:`Sorvete ${quote.mode==='peso'?'por peso':'por bola'} · ${flavorText}`,
    mode:quote.mode,flavors,unit:quote.unit,price:quote.price,qty:quote.qty,
    weightGrams:quote.weightGrams,fromValue:quote.fromValue,lineTotal:quote.total,cost:0};
  // Cada pesagem é uma linha independente, sem somar quantidades de clientes diferentes.
  cart.push(item);
  $('iceAmount').value='';$('iceQty').value='1';
  iceChosenFlavors.clear();
  renderIce();renderCart();
  toast(`Sorvete adicionado: ${money(quote.total)}. Finalize no painel de pagamento.`);
}
function bindIceEvents(){
  document.querySelectorAll('[data-ice-mode]').forEach(btn=>btn.addEventListener('click',()=>{
    iceMode=btn.dataset.iceMode;
    if(numpadFocus==='iceAmount'||numpadFocus==='iceQty')focusNumericField(iceMode==='peso'?'iceAmount':'iceQty');
    renderIce();
  }));
  $('iceFlavors').addEventListener('click',event=>{
    const button=event.target.closest('[data-ice-flavor]');if(!button)return;
    const id=button.dataset.iceFlavor;
    if(iceChosenFlavors.has(id))iceChosenFlavors.delete(id);else iceChosenFlavors.add(id);
    renderIce();
  });
  $('iceInputMode').addEventListener('change',()=>{$('iceAmount').value='';renderIce();});
  $('iceAmount').addEventListener('input',renderIce);
  $('iceQty').addEventListener('input',renderIce);
  $('iceAddToCart').addEventListener('click',addIceToCart);
  $('icePricesForm').addEventListener('submit',event=>{
    event.preventDefault();if(!Access.requireOwner())return;
    const weight=Number($('iceWeightPrice').value),scoop=Number($('iceScoopPrice').value);
    if(!positive($('iceWeightPrice').value)||!positive($('iceScoopPrice').value)||weight>100000||scoop>100000)
      return toast('Preços inválidos. Informe valores positivos.');
    if(commit(()=>{db.settings.weightPrice=fromCents(toCents(weight));db.settings.scoopPrice=fromCents(toCents(scoop));})){
      render();toast('Preços por quilo e por bola atualizados.');
    }
  });
}
