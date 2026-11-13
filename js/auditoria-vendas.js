/*
 * Sorveteria Manager — Dev Kayko — atualização de identificação de atendente.
 * Complemento para versões existentes; carregar DEPOIS de js/app.js.
 * Não renomeia nem apaga vendas anteriores. Retém vendedor na própria venda.
 * Perfis sem autenticação de funcionário não comprovam a identidade da pessoa.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let chosenEmployee = null;
  let employeeEntryApproved = false;
  const knownSales = new Set(Array.isArray(db.sales) ? db.sales.map(s => s.id) : []);
  const ownerName = () => String(db.settings?.ownerName || 'Dono').trim() || 'Dono';
  const sellerName = sale => String(sale.seller?.name || sale.sellerName || 'Não identificado');
  const sellerRole = sale => String(sale.seller?.role || sale.sellerRole || '');

  function personForSale(){
    if(Access.isOwner()) return { role:'Dono', name:ownerName(), id:null };
    if(Access.isOperator() && chosenEmployee){
      // Confirma que o funcionário escolhido ainda consta nos cadastros.
      const employee = db.employees.find(e=>String(e.id)===String(chosenEmployee.id));
      if(employee) return {role:'Funcionário',name:String(employee.name).trim(),id:String(employee.id)};
    }
    return {role:Access.isOwner()?'Dono':'Funcionário',name:Access.isOwner()?ownerName():'Não identificado',id:null};
  }

  // Proprietário: o nome nos recibos não precisa ser o nome da sorveteria.
  const settings = $('settingsForm');
  if(settings){
    const nameLabel=document.createElement('label');
    nameLabel.htmlFor='salesOwnerName';
    nameLabel.textContent='Nome do dono (aparece nas vendas e nos comprovantes)';
    const field=document.createElement('input');
    field.id='salesOwnerName';field.name='salesOwnerName';field.maxLength=80;
    field.placeholder='Ex.: Proprietário';field.value=ownerName();
    nameLabel.append(field);
    const saveButton=settings.querySelector('button[type="submit"]');
    if(saveButton)settings.insertBefore(nameLabel,saveButton);else settings.append(nameLabel);
    settings.addEventListener('submit',()=>{
      if(!Access.isOwner())return;
      const next=field.value.trim() || 'Dono';
      // Mantém configurações anteriores: atualiza apenas o nome do proprietário.
      if(typeof commit==='function')commit(()=>{db.settings.ownerName=next;});
      updateProfileName();
    });
  }

  // Funcionário sem senha: seleciona o próprio nome cadastrado ANTES de entrar.
  const modal=document.createElement('div');
  modal.id='salesEmployeeOverlay';modal.className='modal-overlay';modal.hidden=true;
  modal.innerHTML=`<div class="modal sales-employee-dialog" role="dialog" aria-modal="true" aria-labelledby="salesEmployeeTitle">
    <h3 id="salesEmployeeTitle">Quem vai atender no caixa?</h3>
    <p>Escolha seu nome. Ele aparecerá no comprovante do cliente, na via da loja e nos relatórios.</p>
    <label for="salesEmployeeSelect">Funcionário cadastrado</label>
    <select id="salesEmployeeSelect" required></select>
    <p id="salesEmployeeEmpty" class="hint" hidden>Peça ao dono para cadastrar seu nome em Funcionários antes de utilizar o PDV.</p>
    <div class="modal-actions"><button type="button" id="salesEmployeeCancel" class="btn btn-secondary">Voltar</button><button type="button" id="salesEmployeeConfirm" class="btn btn-primary">Entrar no PDV</button></div>
  </div>`;
  document.body.append(modal);
  const select=$('salesEmployeeSelect');
  function refreshEmployeeOptions(){
    const employees=Array.isArray(db.employees)?db.employees.filter(e=>e?.id&&String(e.name||'').trim()):[];
    select.replaceChildren();
    const option=document.createElement('option');option.value='';option.textContent='Selecione seu nome';select.append(option);
    for(const e of employees){
      const o=document.createElement('option');o.value=String(e.id);o.textContent=String(e.name)+(e.role||e.position?` — ${e.role||e.position}`:'');select.append(o);
    }
    $('salesEmployeeEmpty').hidden=employees.length>0;
    $('salesEmployeeConfirm').disabled=!employees.length;
  }
  function closeEmployeeModal(){modal.hidden=true;}
  $('salesEmployeeCancel').addEventListener('click',closeEmployeeModal);
  $('salesEmployeeConfirm').addEventListener('click',()=>{
    const employee=db.employees.find(e=>String(e.id)===select.value);
    if(!employee)return;
    chosenEmployee={id:String(employee.id),name:String(employee.name)};
    employeeEntryApproved=true;
    closeEmployeeModal();
    // Prossegue com o login original da sorveteria, sem alterar senhas.
    $('loginForm').requestSubmit();
    queueMicrotask(updateProfileName);
  });
  $('loginForm')?.addEventListener('submit',event=>{
    const staffSelected=$('loginOperator')?.getAttribute('aria-pressed')==='true';
    if(!staffSelected){chosenEmployee=null;employeeEntryApproved=false;return;}
    if(employeeEntryApproved){employeeEntryApproved=false;return;}
    event.preventDefault();event.stopImmediatePropagation();
    refreshEmployeeOptions();modal.hidden=false;select.focus();
  },true);
  const pdvProfile=$('pdvProfile');
  function updateProfileName(){
    if(!pdvProfile || (typeof Access.isLoggedIn==='function' && !Access.isLoggedIn()))return;
    const expected=Access.isOwner()?`👑 Dono · ${ownerName()}`
      : chosenEmployee?`👤 ${chosenEmployee.name}`:'👤 Funcionário';
    if(pdvProfile.textContent!==expected)pdvProfile.textContent=expected;
  }
  if(pdvProfile)new MutationObserver(updateProfileName).observe(pdvProfile,{childList:true,subtree:true,characterData:true});
  updateProfileName();
  for(const id of ['switchUser','pdvSwitchUser']){
    $(id)?.addEventListener('click',()=>{chosenEmployee=null;employeeEntryApproved=false;closeEmployeeModal();});
  }

  // Só grava vendedor quando uma venda realmente entrou no histórico.
  // Listener em document bubble: o clique original do PDV já concluiu a venda.
  document.addEventListener('click',event=>{
    if(!event.target.closest('#finishSale'))return;
    const fresh=db.sales.filter(s=>!knownSales.has(s.id));
    if(!fresh.length)return;
    const actor=personForSale();
    if(typeof commit==='function'){
      commit(()=>{for(const sale of fresh){sale.seller={...actor};}});
    }else{
      for(const sale of fresh)sale.seller={...actor};
    }
    for(const sale of fresh)knownSales.add(sale.id);
    const status=$('receiptSaleText');
    if(status&&!$('receiptOverlay').hidden){
      status.textContent += ` · Atendido por: ${actor.name}`;
    }
    queueMicrotask(updateReportRows);
    updateProfileName();
  });

  // Ajuste aplicado às duas vias e às reimpressões, inclusive vendas antigas.
  if(typeof window.receiptMarkup==='function'){
    const originalReceiptMarkup=window.receiptMarkup;
    window.receiptMarkup=function(sale,via){
      let receipt=originalReceiptMarkup.call(this,sale,via);
      receipt=receipt.replace(/COMPROVANTE NÃO FISCAL/gi,'Comprovante de venda');
      const actor=`<p class="receipt-seller">Atendido por: ${escapeText(sellerName(sale))}</p>`;
      return receipt.includes('</header>')?receipt.replace('</header>',actor+'</header>'):receipt+actor;
    };
  }
  const hint=document.querySelector('#receiptOverlay .hint');
  if(hint)hint.textContent=hint.textContent.replace(/Comprovante não fiscal\./i,'O comprovante de venda não substitui documento fiscal.');

  // Histórico do dia/mês e versão de impressão/PDF usam a mesma tabela.
  const historyTable=$('reportSaleRows');
  function updateReportRows(){
    if(!historyTable)return;
    const head=historyTable.closest('table')?.querySelector('thead tr');
    if(head&&!head.querySelector('.sales-seller-column')){
      const th=document.createElement('th');th.className='sales-seller-column';th.textContent='Atendente';
      const actionHeader=head.querySelector('th.screen-only');
      head.insertBefore(th,actionHeader||null);
    }
    historyTable.querySelectorAll('tr').forEach(row=>{
      const button=row.querySelector('[data-id][data-action^="receipt-"]')||row.querySelector('[data-action="void-sale"][data-id]');
      const sale=db.sales.find(s=>String(s.id)===String(button?.dataset.id));
      if(!sale)return; // Não altera a linha "Nenhuma venda".
      let cell=row.querySelector('.sales-seller-column');
      if(!cell){cell=document.createElement('td');cell.className='sales-seller-column';row.insertBefore(cell,row.querySelector('td.screen-only')||null);}
      cell.textContent=sellerName(sale);
    });
  }
  if(historyTable){
    new MutationObserver(updateReportRows).observe(historyTable,{childList:true});
    updateReportRows();
  }
  for(const id of ['reportPeriod','reportDay','reportMonth'])$(id)?.addEventListener('change',()=>queueMicrotask(updateReportRows));

  // Excel: acrescenta nome e perfil na aba Vendas, inclusive exportações futuras.
  if(typeof window.excelSheetData==='function'){
    const originalExcelSheetData=window.excelSheetData;
    window.excelSheetData=function(...args){
      const sheets=originalExcelSheetData.apply(this,args);
      const sheet=sheets.find(x=>x.name==='Vendas');
      if(!sheet?.rows?.length)return sheets;
      sheet.rows[0].push('Atendente','Perfil do atendente');
      sheet.rows.slice(1).forEach(row=>{
        const sale=db.sales.find(s=>String(s.id)===String(row[2]));
        row.push(sale?sellerName(sale):'Não identificado',sale?sellerRole(sale):'');
      });
      return sheets;
    };
  }

  // Reimpressões de vendas antigas mantêm "Não identificado": não inventar autor.
  // A identificação é apenas declarada: o login do funcionário não tem senha.
})();
