/* Sorveteria Manager 1.1.6 — RH e identificação de operador. Sem servidor. */
'use strict';
const HR = (() => {
  const E = x => esc(x);
  const today = () => localDate();
  const active = () => db.employees.filter(e => e.status !== 'dismissed');
  function currentOperator() { return Access.isOperator() ? Access.loggedEmployee() : active().find(e => e.id === db.ui.operatorId) || null; }
  function renderOperator() {
    const select = $('pdvOperator'); if (!select) return;
    const locked = Access.isOperator();
    const old = locked ? (Access.loggedEmployee()?.id || '') : db.ui.operatorId || '';
    select.innerHTML = '<option value="">' + (Access.isOperator() ? 'Selecione seu nome' : 'Dono / responsável') + '</option>' + active().map(e => `<option value="${E(e.id)}">${E(e.name)} — ${E(e.role || e.department || 'Atendente')}</option>`).join('');
    select.value = active().some(e => e.id === old) ? old : '';
    select.disabled = locked; select.title = locked ? 'Identidade definida pelo login. Use Trocar usuário para entrar com outra senha.' : 'O dono pode selecionar um atendente.';
    if (!locked && !select.value && old) db.ui.operatorId = '';
  }
  function payments() { return db.movements.filter(m => m.employeeId && m.type === 'out' && m.category === 'Salário'); }
  function render() {
    if (!Access.isOwner()) return;
    const list = db.employees.filter(e => {
      const q = String($('hrSearch')?.value || '').toLocaleLowerCase('pt-BR').trim();
      const f = $('hrStatus')?.value || 'all';
      return (f === 'all' || (f === 'active' && e.status !== 'dismissed') || (f === 'dismissed' && e.status === 'dismissed')) && [e.name, e.role, e.department].some(v => String(v || '').toLocaleLowerCase('pt-BR').includes(q));
    }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    $('employeeRows').innerHTML = list.map(e => `<tr><td><b>${E(e.name)}</b><small class="sub-info">${E(e.department || '—')}</small></td><td>${E(e.role || '—')}</td><td>${E(formatDate(e.hiredAt))}</td><td>${e.status === 'dismissed' ? 'Desligado' : 'Ativo'}</td><td>${money(e.salary)}</td><td><button class="table-action" data-action="edit" data-kind="employees" data-id="${E(e.id)}">Editar</button> <button class="table-action" data-action="hr-password" data-id="${E(e.id)}">${e.pdvPassword ? 'Trocar senha PDV' : 'Criar senha PDV'}</button> <button class="table-action" data-action="pay" data-id="${E(e.id)}">Pagamento</button> <button class="table-action" data-action="hr-document" data-document="admission" data-id="${E(e.id)}">Admissão PDF</button> ${e.status === 'dismissed' ? `<button class="table-action" data-action="hr-document" data-document="dismissal" data-id="${E(e.id)}">Desligamento PDF</button> <button class="table-action" data-action="hr-restore" data-id="${E(e.id)}">Reativar</button>` : `<button class="table-action danger" data-action="delete" data-kind="employees" data-id="${E(e.id)}">Desligar</button>`}</td></tr>`).join('') || emptyRow(6);
    $('hrActiveCount').textContent = active().length;
    $('hrPayrollBase').textContent = money(active().reduce((s, e) => s + Number(e.salary || 0), 0));
    $('hrPaidMonth').textContent = money(payments().filter(m => !m.voided && String(m.competence || m.date).slice(0, 7) === today().slice(0, 7)).reduce((s, m) => s + Number(m.amount), 0));
    const el = $('hrEmployeeFilter'), prev = el.value;
    el.innerHTML = '<option value="all">Todos</option>' + db.employees.map(e => `<option value="${E(e.id)}">${E(e.name)}</option>`).join('');
    el.value = db.employees.some(e => e.id === prev) ? prev : 'all';
    const listP = filteredPayments();
    $('hrPaymentRows').innerHTML = listP.map(m => `<tr class="${m.voided ? 'voided-row' : ''}"><td>${E(formatDate(m.date))}</td><td>${E(m.employeeName || employeeName(m.employeeId))}</td><td>${E(m.competence || '—')}</td><td>${E(m.description || 'Salário')}</td><td>${E(m.paymentMethod || '—')}</td><td>${money(m.amount)}</td><td>${m.voided ? 'Cancelado' : 'Pago'}</td></tr>`).join('') || emptyRow(7, 'Nenhum pagamento cadastrado neste período.');
    $('hrPaymentTotal').textContent = 'Total pago no período: ' + money(listP.filter(x => !x.voided).reduce((s, m) => s + Number(m.amount), 0));
  }
  function employeeName(id) { return db.employees.find(e => e.id === id)?.name || 'Funcionário não localizado'; }
  function filteredPayments() { const month = $('hrMonth').value; const id = $('hrEmployeeFilter').value; return payments().filter(m => (!month || String(m.competence || m.date).slice(0, 7) === month) && (id === 'all' || m.employeeId === id)).sort((a, b) => String(b.date).localeCompare(String(a.date))); }
  function openEmployee(id) {
    if (!Access.requireOwner()) return;
    const e = id ? db.employees.find(x => x.id === id) : null;
    const html = `<label>Nome completo<input name="name" maxlength="100" required value="${E(e?.name || '')}"></label>
      <label>Setor<input name="department" maxlength="70" required placeholder="Ex.: Atendimento, Produção, Estoque" value="${E(e?.department || '')}"></label>
      <label>Função / Cargo<input name="role" maxlength="70" required placeholder="Ex.: Operador de caixa" value="${E(e?.role || '')}"></label>
      <label>Salário-base mensal (R$)<input name="salary" type="number" min="0" step="0.01" required value="${E(e?.salary ?? '0')}"></label>
      <label>Data de admissão<input name="hiredAt" type="date" required value="${E(e?.hiredAt || today())}"></label>
      <label>Telefone (opcional)<input name="phone" maxlength="35" value="${E(e?.phone || '')}"></label>
      <label>Observações internas (opcional)<input name="notes" maxlength="180" value="${E(e?.notes || '')}"></label>`;
    openModal(e ? 'Editar funcionário' : 'Cadastrar funcionário', html, form => {
      const record = {}; for (const key of ['name', 'department', 'role', 'phone', 'notes']) record[key] = String(form.get(key) || '').trim();
      record.salary = Number(form.get('salary')); record.hiredAt = String(form.get('hiredAt') || '');
      if (!record.name || !record.department || !record.role || !Number.isFinite(record.salary) || record.salary < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(record.hiredAt) || Number.isNaN(Date.parse(record.hiredAt + 'T12:00:00'))) throw Error('Confira os dados de admissão e salário.');
      return commit(() => { if (e) Object.assign(e, record); else db.employees.push({ id: uid(), status: 'active', ...record }); });
    });
  }
  function setEmployeePassword(id) {
    if (!Access.requireOwner()) return;
    const e = db.employees.find(x => x.id === id);
    if (!e || e.status === 'dismissed') return toast('Cadastre ou reative o funcionário antes de criar uma senha.');
    const html = `<p>Senha individual de acesso ao PDV para <b>${E(e.name)}</b>. Somente o dono pode alterá-la.</p>
      <label>Nova senha<input type="password" name="newPassword" minlength="6" maxlength="64" required autocomplete="new-password"></label>
      <label>Confirmar senha<input type="password" name="confirmPassword" minlength="6" maxlength="64" required autocomplete="new-password"></label>`;
    openModal(e.pdvPassword ? 'Alterar senha do PDV' : 'Criar senha do PDV', html, async form => {
      const password = String(form.get('newPassword') || '');
      if (password !== String(form.get('confirmPassword') || '')) throw Error('As senhas não conferem.');
      if (db.security && await CashSecurity.verify(password, db.security)) throw Error('Use uma senha diferente da senha do dono.');
      const credential = await CashSecurity.create(password);
      const result = commit(() => { e.pdvPassword = credential; });
      if (result) { render(); toast('Senha individual definida para ' + e.name + '.'); }
      return result;
    });
  }
  function dismiss(id) {
    if (!Access.requireOwner()) return; const e = db.employees.find(x => x.id === id); if (!e || e.status === 'dismissed') return;
    const html = `<p>Registrar desligamento de <b>${E(e.name)}</b>. O histórico será mantido.</p><label>Data do desligamento<input type="date" name="dismissedAt" value="${today()}" required></label><label>Motivo/observação<input name="dismissalReason" maxlength="170" placeholder="Opcional"></label>`;
    openModal('Registrar desligamento', html, form => {
      const date = String(form.get('dismissedAt')); if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date + 'T12:00:00')) || (e.hiredAt && date < e.hiredAt)) throw Error('Data de desligamento inválida.');
      return commit(() => { e.status = 'dismissed'; e.dismissedAt = date; e.dismissalReason = String(form.get('dismissalReason') || '').trim(); if (db.ui.operatorId === e.id) db.ui.operatorId = ''; });
    });
  }
  function reactivate(id) { if (!Access.requireOwner()) return; const e = db.employees.find(x => x.id === id); if (!e || !confirm('Reativar cadastro de ' + e.name + '? Confira a data de admissão antes de utilizá-lo.')) return; if (commit(() => { e.status = 'active'; e.dismissedAt = ''; e.dismissalReason = ''; })) { render(); renderOperator(); toast('Cadastro reativado.'); } }
  function pay(id) {
    if (!Access.requireOwner()) return; const e = db.employees.find(x => x.id === id); if (!e) return;
    const html = `<p>Registrar pagamento de <b>${E(e.name)}</b>.</p><label>Tipo de pagamento<select name="payType"><option>Salário</option><option>Adiantamento</option><option>Bonificação</option><option>Outros</option></select></label>
      <label>Competência<input name="competence" type="month" value="${today().slice(0, 7)}" required></label>
      <label>Data do pagamento<input name="date" type="date" value="${today()}" required></label>
      <label>Valor pago (R$)<input name="amount" type="number" min="0.01" step="0.01" value="${Number(e.salary || 0).toFixed(2)}" required></label>
      <label>Forma de pagamento<select name="paymentMethod"><option>Pix</option><option>Dinheiro</option><option>Transferência</option><option>Outro</option></select></label>
      <label>Retirar dinheiro da gaveta do caixa aberto?<select name="cashImpact"><option value="no">Não</option><option value="yes">Sim</option></select></label>
      <label>Observação (opcional)<input name="note" maxlength="120"></label>`;
    openModal('Registrar pagamento', html, form => {
      const amount = Number(form.get('amount')), date = String(form.get('date')), competence = String(form.get('competence'));
      if (!Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{4}-\d{2}$/.test(competence)) throw Error('Confira valor, competência e data.');
      const session = activeSession(); const type = String(form.get('payType'));
      const record = { id: uid(), date, competence, employeeId: e.id, employeeName: e.name, type: 'out', category: 'Salário', description: type + ': ' + e.name + (form.get('note') ? ' — ' + String(form.get('note')).trim() : ''), paymentMethod: String(form.get('paymentMethod')), amount, sessionId: form.get('cashImpact') === 'yes' && session ? session.id : null, voided: false };
      return commit(() => db.movements.push(record));
    });
  }
  function printHTML(title, html) {
    if (!Access.requireOwner()) return;
    const win = window.open('', '_blank', 'width=900,height=800'); if (!win) { toast('Libere os pop-ups do navegador para imprimir.'); return; }
    win.document.open(); win.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${E(title)}</title><style>@page{size:A4;margin:20mm 18mm 22mm}body{font:12px Arial,sans-serif;color:#161616;line-height:1.55}h1{font-size:19px;margin:0 0 5px}h2{font-size:14px;margin-top:24px}header{border-bottom:2px solid #222;padding-bottom:14px;margin-bottom:19px}small{color:#555}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #aaa;padding:7px;text-align:left;overflow-wrap:anywhere}th{background:#f1f1f1}.sign{margin-top:85px;display:flex;gap:45px}.sign>div{flex:1;border-top:1px solid #333;text-align:center;padding-top:7px}.note{margin-top:26px;color:#555} @media print{button{display:none}}</style></head><body><header><h1>${E(db.settings.name || 'Sorveteria Manager')}</h1><small>${E(db.settings.address || '')} ${E(db.settings.phone || '')}</small></header>${html}<p class="note">Documento para controle administrativo interno. Não substitui documentos trabalhistas exigidos pela legislação.</p></body></html>`); win.document.close(); win.focus(); setTimeout(() => win.print(), 250);
  }
  function printEmployee(id, kind) {    
if (!Access.requireOwner()) return; const e = db.employees.find(x => x.id === id); if (!e) return;
    const dismiss = kind === 'dismissal'; const title = dismiss ? 'Registro de desligamento' : 'Ficha de admissão e cadastro';
    if (dismiss && e.status !== 'dismissed') return toast('Funcionário ainda está ativo.');
    const body = `<h1>${E(title)}</h1><p>Gerado em: ${E(new Date().toLocaleString('pt-BR'))}</p><table><tbody>${[
      ['Nome completo', e.name], ['Setor', e.department], ['Função', e.role], ['Salário-base mensal', money(e.salary)], ['Data de admissão', formatDate(e.hiredAt)], ['Telefone', e.phone || 'Não informado'], ['Situação', e.status === 'dismissed' ? 'Desligado' : 'Ativo'], ...(dismiss ? [['Data de desligamento', formatDate(e.dismissedAt)], ['Observação de desligamento', e.dismissalReason || '—']] : [])
    ].map(([a, b]) => `<tr><th>${E(a)}</th><td>${E(b)}</td></tr>`).join('')}</tbody></table><div class="sign"><div>Responsável / Sorveteria</div><div>Funcionário</div></div>`;
    printHTML(title, body);
  }
  function printPayments() {    
if (!Access.requireOwner()) return; const month = $('hrMonth').value, list = filteredPayments(); const title = 'Relatório de pagamentos — ' + (month || 'Todos os meses');
    const rows = list.map(m => `<tr><td>${E(formatDate(m.date))}</td><td>${E(m.employeeName || employeeName(m.employeeId))}</td><td>${E(m.competence || '—')}</td><td>${E(m.description)}</td><td>${money(m.amount)}</td><td>${m.voided ? 'Cancelado' : 'Pago'}</td></tr>`).join('');
    printHTML(title, `<h1>${E(title)}</h1><p>Gerado em ${E(new Date().toLocaleString('pt-BR'))}</p><table><thead><tr><th>Data</th><th>Funcionário</th><th>Competência</th><th>Descrição</th><th>Valor</th><th>Situação</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Nenhum registro</td></tr>'}</tbody></table><h2>Total pago: ${money(list.filter(m => !m.voided).reduce((s, m) => s + Number(m.amount), 0))}</h2>`);
  }
  function init() {
    $('pdvOperator').addEventListener('change', event => { if (Access.isOperator()) { renderOperator(); return toast('O funcionário não pode trocar o atendente. Use Trocar usuário.'); } const id = event.target.value; if (id && !active().some(e => e.id === id)) return; if (commit(() => { db.ui.operatorId = id; })) toast(id ? 'Atendente selecionado: ' + employeeName(id) : 'Atendimento pelo responsável.'); });
    for (const id of ['hrSearch', 'hrStatus', 'hrMonth', 'hrEmployeeFilter']) $(id).addEventListener(id === 'hrSearch' ? 'input' : 'change', render);
    $('hrMonth').value = today().slice(0, 7);
    $('hrPrintPayments').addEventListener('click', printPayments);
  }
  return { init, render, renderOperator, currentOperator, openEmployee, setEmployeePassword, dismiss, reactivate, pay, printEmployee };
})();
