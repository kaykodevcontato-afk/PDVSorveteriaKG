(() => {
  'use strict';
  const data = window.SORVETERIA_CARDAPIO;
  const $ = id => document.getElementById(id);
  if (!data || !Array.isArray(data.categories)) {
    $('catalogSections').textContent = 'Não foi possível carregar o cardápio. Confira js/cardapio-dados.js.';
    return;
  }
  const formatMoney = value => Number(value).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
  const normal = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const categories = data.categories;
  const state = { category:'all', query:'' };
  const select = $('categorySelect');
  const list = $('catalogSections');
  const chips = $('categoryChips');
  const lightbox = $('lightbox');
  let lastFocus = null;
  const filtered = (category) => category.items.filter(p => normal([p.name,category.name,p.unit,p.options?.map(o=>o.label).join(' ')].join(' ')).includes(normal(state.query)));
  const activeCategories = () => categories.filter(c => state.category === 'all' || c.id === state.category);
  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function priceText(item) {
    if (item.options) return item.options.map(opt=>`${opt.label}: ${formatMoney(opt.price)}`).join(' • ');
    return `${formatMoney(item.price)}${item.unit === 'kg' ? '/kg' : ''}`;
  }
  function makeCard(item) {
    const card = element('article','product-card');
    const photoBtn = element('button','photo-button');
    photoBtn.type='button'; photoBtn.setAttribute('aria-label',`Ampliar imagem ilustrativa de ${item.name}`);
    const img = document.createElement('img');
    img.src=item.image; img.alt=`Imagem ilustrativa de ${item.name}`; img.loading='lazy';img.width=420;img.height=420;
    img.onerror=()=>{img.alt=`Foto não disponível: ${item.name}`;img.style.display='none';photoBtn.textContent='🍦';photoBtn.style.fontSize='65px';};
    photoBtn.append(img, element('span','zoom','⌕ Ver foto'));
    photoBtn.addEventListener('click',()=>openLightbox(item,photoBtn));
    const body=element('div','product-body');body.appendChild(element('h4','',item.name));
    if (item.options) {
      const prices=element('div','variant-prices');
      for (const opt of item.options) {
        const row=element('div','variant-row');
        row.append(element('span','',opt.label),element('strong','',formatMoney(opt.price)));
        prices.appendChild(row);
      }
      body.appendChild(prices);
    } else {
      const bottom=element('div','product-bottom');
      bottom.appendChild(element('div','price',`${formatMoney(item.price)}${item.unit==='kg'?'/kg':''}`));
      if (item.unit && item.unit!=='kg' && item.unit!=='unidade') bottom.appendChild(element('small','unit',item.unit));
      body.appendChild(bottom);
    }
    card.append(photoBtn,body);
    return card;
  }
  function render() {
    list.replaceChildren();
    chips.querySelectorAll('button').forEach(btn=>btn.classList.toggle('active',btn.dataset.category===state.category));
    let count=0, visibleCats=0;
    for (const category of activeCategories()) {
      const products=filtered(category);
      if (!products.length)continue;
      count+=products.length;visibleCats++;
      const section=element('section','catalog-section');section.id=`categoria-${category.id}`;
      const head=element('div','section-head');
      const headText=element('div');headText.appendChild(element('h3','',category.name));
      if(category.note)headText.appendChild(element('p','',category.note));
      head.appendChild(headText);
      if(category.priceLabel)head.appendChild(element('div','section-price',category.priceLabel));
      section.appendChild(head);
      const grid=element('div','product-grid');
      products.forEach(p=>grid.appendChild(makeCard(p)));
      section.appendChild(grid);list.appendChild(section);
    }
    $('menuCount').textContent = `${count} ${count===1?'produto':'produtos'} • ${visibleCats} ${visibleCats===1?'categoria':'categorias'}`;
    $('emptyState').hidden=count!==0;
  }
  for(const c of categories){const o=document.createElement('option');o.value=c.id;o.textContent=c.name;select.appendChild(o);}
  const all=[{id:'all',name:'Todos'},...categories];
  for(const c of all){
    const btn=element('button','',c.name);btn.type='button';btn.dataset.category=c.id;
    btn.addEventListener('click',()=>{state.category=c.id;select.value=c.id;render();$('catalogo').scrollIntoView({behavior:'smooth'});});
    chips.appendChild(btn);
  }
  $('searchProducts').addEventListener('input',e=>{state.query=e.target.value.trim();render();});
  select.addEventListener('change',e=>{state.category=e.target.value;render();});
  $('resetFilters').addEventListener('click',()=>{state.category='all';state.query='';select.value='all';$('searchProducts').value='';render();});
  function openLightbox(item,source){
    lastFocus=source;$('lightboxImage').src=item.image;$('lightboxImage').alt=`Foto ilustrativa de ${item.name}`;
    $('lightboxTitle').textContent=item.name;$('lightboxPrice').textContent=priceText(item);
    lightbox.hidden=false;document.body.classList.add('lightbox-open');$('closeLightbox').focus();
  }
  function closeLightbox(){lightbox.hidden=true;document.body.classList.remove('lightbox-open');if(lastFocus)lastFocus.focus();}
  $('closeLightbox').addEventListener('click',closeLightbox);
  lightbox.querySelector('[data-close-lightbox]').addEventListener('click',closeLightbox);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lightbox.hidden)closeLightbox();});
  const themeKey='devkayko_sorveteria_cardapio_tema';
  try{if(localStorage.getItem(themeKey)==='dark')document.body.classList.add('dark');}catch(e){}
  const updateTheme=()=>{$('themeText').textContent=document.body.classList.contains('dark')?'Claro':'Escuro';};updateTheme();
  $('toggleTheme').addEventListener('click',()=>{document.body.classList.toggle('dark');updateTheme();try{localStorage.setItem(themeKey,document.body.classList.contains('dark')?'dark':'light');}catch(e){}});
  $('printMenu').addEventListener('click',()=>window.print());
  $('exportMenu').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sorveteria-cardapio-produtos.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),300);
  });
  render();
})();
