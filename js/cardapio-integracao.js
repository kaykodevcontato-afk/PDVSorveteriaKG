/* Extensão segura: usa o formulário original de preços do PDV.
   NÃO importa itens nem manipula o banco local da aplicação. */
(() => {
  'use strict';
  const button=document.getElementById('applyMenuKgPrice');
  if(!button)return;
  button.addEventListener('click',()=>{
    const input=document.getElementById('iceWeightPrice');
    const form=document.getElementById('icePricesForm');
    if(!input||!form){alert('Formulário de preços do PDV indisponível.');return;}
    if(!confirm('Definir R$ 44,99/kg no PDV? O preço por bola será mantido.'))return;
    input.value='44.99';
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
    if(form.requestSubmit)form.requestSubmit();else form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  });
})();
