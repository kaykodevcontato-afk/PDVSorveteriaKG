/*
 * SORVETERIA MANAGER 1.0.7 — DEV KAYKO
 * Sorvete vendido somente por peso, com preço/kg editável pelo dono.
 * Digite gramas da balança ou valor desejado em reais; não há balança integrada.
 */
'use strict';
let iceChosenFlavors = new Set();

function quoteIce() {
  const price = Number(db.settings.weightPrice);
  if (!Number.isFinite(price) || price <= 0) return null;
  const raw = Number($('iceAmount').value);
  if (!positive($('iceAmount').value) || raw > 1000000) return null;
  const fromValue = $('iceInputMode').value === 'valor';
  // Calcula em centavos para evitar diferenças no meio centavo por ponto flutuante.
  const total = fromValue ? fromCents(toCents(raw)) : fromCents(Math.round(raw * toCents(price) / 1000 + 1e-9));
  const grams = fromValue ? total / price * 1000 : raw;
  if (total <= 0 || !Number.isFinite(grams) || grams <= 0) return null;
  return {    
mode: 'peso', qty: grams / 1000, unit: 'kg', weightGrams: grams, fromValue, price, total,
    description: `${fromValue ? '≈ ' : ''}${grams.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} g · ${money(price)}/kg`  
};
}
function renderIce() {
  if (!$('iceCalculator')) return;
  $('icePriceSummary').textContent = `${money(db.settings.weightPrice)}/kg`;
  const amountMode = $('iceInputMode').value;
  $('iceAmountLabel').textContent = amountMode === 'valor' ? 'Valor em reais (R$)' : 'Peso em gramas (g)';
  $('iceAmount').placeholder = amountMode === 'valor' ? 'Ex.: 20.00' : 'Ex.: 350';
  const available = new Set(db.flavors.map(f => f.id));
  iceChosenFlavors = new Set([...iceChosenFlavors].filter(id => available.has(id)));
  $('iceFlavors').innerHTML = db.flavors.map(f => `<button type="button" class="ice-flavor ice-flavor-card" data-ice-flavor="${esc(f.id)}" aria-pressed="${iceChosenFlavors.has(f.id)}" title="Selecionar ${esc(f.name)}">${f.image ? `<span class="ice-flavor-photo"><img src="${esc(f.image)}" alt="Foto de ${esc(f.name)}" loading="lazy" onerror="this.closest('.ice-flavor-photo').classList.add('photo-unavailable');this.remove()"><span class="ice-photo-fallback">🍨<small>Foto</small></span></span>` : `<span class="ice-flavor-photo photo-unavailable"><span class="ice-photo-fallback">🍨<small>Adicionar foto</small></span></span>`}<span class="ice-flavor-name">${esc(f.name)}</span></button>`).join('') || '<small>Nenhum sabor cadastrado. Peça ao dono para cadastrar.</small>';
  const quote = quoteIce();
  $('iceCalcTotal').textContent = quote ? money(quote.total) : money(0);
  $('iceQuoteDetail').textContent = quote ? quote.description : 'Informe o peso ou o valor para calcular';
  $('iceAddToCart').disabled = !quote;
}
function renderFlavors() {
  if (!Access.isOwner()) return;
  $('flavorRows').innerHTML = db.flavors.map(f => `<tr><td><b>${esc(f.name)}</b></td><td>${esc(f.category || 'Sorvetes')}</td><td>${actionButtons('flavors', f.id)}</td></tr>`).join('') || emptyRow(3, 'Cadastre seus sabores para começar.');
  $('iceWeightPrice').value = Number(db.settings.weightPrice);
}
function addIceToCart() {
  const quote = quoteIce();
  if (!quote) return toast('Informe um peso ou valor válido.');
  const flavors = db.flavors.filter(f => iceChosenFlavors.has(f.id)).map(f => f.name);
  const flavorText = flavors.length ? flavors.join(' + ') : 'Sortido / não informado';
  const item = {    
kind: 'ice', id: uid(), name: `Sorvete por peso · ${flavorText}`,
    mode: 'peso', flavors, unit: 'kg', price: quote.price, qty: quote.qty,
    weightGrams: quote.weightGrams, fromValue: quote.fromValue, lineTotal: quote.total, cost: 0  
};
  // Cada pesagem é independente; não junta pesos de clientes diferentes.
  cart.push(item);
  $('iceAmount').value = '';
  iceChosenFlavors.clear();
  renderIce(); renderCart();
  toast(`Sorvete adicionado: ${money(quote.total)}. Finalize no pagamento.`);
}
function bindIceEvents() {
  $('iceFlavors').addEventListener('click', event => {
    const button = event.target.closest('[data-ice-flavor]'); if (!button) return;
    const id = button.dataset.iceFlavor;
    if (iceChosenFlavors.has(id)) iceChosenFlavors.delete(id); else iceChosenFlavors.add(id);
    renderIce();
  });
  $('iceInputMode').addEventListener('change', () => { $('iceAmount').value = ''; renderIce(); });
  $('iceAmount').addEventListener('input', renderIce);
  $('iceAddToCart').addEventListener('click', addIceToCart);
  $('icePricesForm').addEventListener('submit', event => {
    event.preventDefault(); if (!Access.requireOwner()) return;
    const weight = Number($('iceWeightPrice').value);
    if (!positive($('iceWeightPrice').value) || weight > 100000)
      return toast('Preço inválido. Informe um valor positivo por quilo.');
    if (commit(() => { db.settings.weightPrice = fromCents(toCents(weight)); })) {
      render(); toast('Preço por quilo atualizado com sucesso.');
    }
  });
}
