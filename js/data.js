/*
 * Sorveteria Manager 1.2.4 — Primeira instalação — Persistência local
 * Banco independente da papelaria. Não altere a chave após começar a vender.
 */
'use strict';
const DB_KEY = 'devkayko_sorveteria_v1';

// INSTALAÇÃO NOVA: sem vendas, funcionários, caixa, salários ou movimentações.
// Preços do catálogo são sugestões editáveis; estoque inicial sempre zero.
// O GitHub Pages hospeda somente o código; registros ficam no navegador do usuário.
const INITIAL_SERVICES = [
  { name: 'Cobertura extra', category: 'Adicionais', unit: 'unidade', price: 3 },
  { name: 'Granulado extra', category: 'Adicionais', unit: 'unidade', price: 2 }
];
// MINI PALETA PREMIUM — produtos individuais vendidos por unidade.
// Estoque inicial zero evita vender unidades que ainda não foram conferidas.
// Para adicionar fotos: envie os arquivos à pasta assets/paletas/ e edite
// o campo "Caminho da foto" em Dono > Produtos e estoque.
const PREMIUM_PALETAS = [
  { name: 'Mini Paleta Premium - Chocolate Branco', category: 'Mini Paleta Premium', code: 'MPP-CHOC-BRANCO', cost: 0, price: 10, stock: 0, minStock: 5, image: '' },
  { name: 'Mini Paleta Premium - Chocolate Black', category: 'Mini Paleta Premium', code: 'MPP-CHOC-BLACK', cost: 0, price: 10, stock: 0, minStock: 5, image: '' },
  { name: 'Mini Paleta Premium - Morango com Leite Condensado', category: 'Mini Paleta Premium', code: 'MPP-MORANGO-LC', cost: 0, price: 10, stock: 0, minStock: 5, image: '' },
  { name: 'Mini Paleta Premium - Brigadeiro de Colher', category: 'Mini Paleta Premium', code: 'MPP-BRIG-COLHER', cost: 0, price: 10, stock: 0, minStock: 5, image: '' },
  { name: 'Mini Paleta Premium - Leite com Avelã', category: 'Mini Paleta Premium', code: 'MPP-LEITE-AVELA', cost: 0, price: 10, stock: 0, minStock: 5, image: '' },
  { name: 'Mini Paleta Premium - Bolo de Rolo', category: 'Mini Paleta Premium', code: 'MPP-BOLO-ROLO', cost: 0, price: 10, stock: 0, minStock: 5, image: '' }
];
// CATÁLOGO DE NOVOS PRODUTOS — Sorveteria Manager 1.1.2
// Edite os nomes, categorias, preços e códigos aqui ANTES da primeira publicação.
// Depois de publicar, edite pelo painel Dono > Produtos e estoque.
// A migração nunca sobrescreve produtos existentes, preços, estoque ou fotos.
// Estoque e custo começam em zero até o dono preencher os dados reais.
const NEW_CATALOG_PRODUCTS = [
  { "name": "Sorvete 1,5 L - Chocolate", "category": "Sorvete Pote 1,5 L", "code": "SP15-01", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1,5 L - Morango", "category": "Sorvete Pote 1,5 L", "code": "SP15-02", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1,5 L - Napolitano", "category": "Sorvete Pote 1,5 L", "code": "SP15-03", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1,5 L - Flocos", "category": "Sorvete Pote 1,5 L", "code": "SP15-04", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1,5 L - Nata Goiaba", "category": "Sorvete Pote 1,5 L", "code": "SP15-05", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Açaí 900 ml", "category": "Açaí Pote 900 ml", "code": "ACAI-900", "price": 27, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Super Cremoso - Leite Trufado (270 ml)", "category": "Super Cremosos", "code": "SC-01", "price": 13, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Super Cremoso - Napolitano (270 ml)", "category": "Super Cremosos", "code": "SC-02", "price": 13, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Super Cremoso - Bombom de Doce de Leite (110 g)", "category": "Super Cremosos", "code": "SC-03", "price": 13, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1 L - Açaí com Leitinho", "category": "Sorvete Pote 1 L", "code": "SP1L-ACAI-LEITINHO", "price": 35, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1 L - Pavê", "category": "Sorvete Pote 1 L", "code": "SP1L-01", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1 L - Leite Trufado", "category": "Sorvete Pote 1 L", "code": "SP1L-02", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1 L - Leite com Avelã", "category": "Sorvete Pote 1 L", "code": "SP1L-03", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1 L - Delicia de Abacaxi", "category": "Sorvete Pote 1 L", "code": "SP1L-04", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1 L - Brigadeiro de Colher", "category": "Sorvete Pote 1 L", "code": "SP1L-05", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete 1 L - Chocolate Belga Crocante", "category": "Sorvete Pote 1 L", "code": "SP1L-06", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete Zero Açúcar - Açaí zero açúcar", "category": "Zero Açúcar", "code": "SZ-01", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Sorvete Zero Açúcar - Chocolate Zero", "category": "Zero Açúcar", "code": "SZ-02", "price": 30, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Salada de Frutas 300 ml", "category": "Salada de Frutas", "code": "SF-300", "price": 10, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Salada de Frutas 400 ml", "category": "Salada de Frutas", "code": "SF-400", "price": 14, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cobertura Chocolate", "category": "Coberturas", "code": "COB-01", "price": 15, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cobertura Morango", "category": "Coberturas", "code": "COB-02", "price": 12, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cobertura Caramelo", "category": "Coberturas", "code": "COB-03", "price": 12, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Picolé Pistache 60 g", "category": "Picolé Pistache", "code": "PIC-PISTACHE-60", "price": 6, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Picolé Especial 60 g - Cookies", "category": "Picolés Especiais", "code": "PIC-ESP-01", "price": 7, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Picolé Especial 60 g - Sensação", "category": "Picolés Especiais", "code": "PIC-ESP-02", "price": 7, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Picolé Especial 60 g - Chocolate zero açúcar", "category": "Picolés Especiais", "code": "PIC-ESP-03", "price": 7, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Leite condensado", "category": "Cremosinn", "code": "CREM-01", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Açaí com banana", "category": "Cremosinn", "code": "CREM-02", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Chocolate branco", "category": "Cremosinn", "code": "CREM-03", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Morango", "category": "Cremosinn", "code": "CREM-04", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Blue", "category": "Cremosinn", "code": "CREM-05", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Frutas tropicais", "category": "Cremosinn", "code": "CREM-06", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Maracujá", "category": "Cremosinn", "code": "CREM-07", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Coco", "category": "Cremosinn", "code": "CREM-08", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Graviola", "category": "Cremosinn", "code": "CREM-09", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Cremosinn - Uva", "category": "Cremosinn", "code": "CREM-10", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Água Mineral 500 ml", "category": "Água Mineral", "code": "AG-500", "price": 2, "cost": 0, "stock": 0, "minStock": 5, "image": "" },
  { "name": "Água Mineral 1,5 L", "category": "Água Mineral", "code": "AG-1500", "price": 4, "cost": 0, "stock": 0, "minStock": 5, "image": "" }
];

const INITIAL_PRODUCTS = [
  { name: 'Casquinha', category: 'Casquinhas', code: 'CASQ', cost: 0.5, price: 2, stock: 0, minStock: 10 },
  { name: 'Cascão', category: 'Casquinhas', code: 'CASCAO', cost: 1, price: 3.5, stock: 0, minStock: 10 },
  { name: 'Copo 200 ml', category: 'Embalagens', code: 'COPO200', cost: 0.35, price: 1, stock: 0, minStock: 20 },
  { name: 'Pote 500 ml', category: 'Embalagens', code: 'POTE500', cost: 1.5, price: 3, stock: 0, minStock: 10 },
  { name: 'Pote 1 litro', category: 'Embalagens', code: 'POTE1000', cost: 2.5, price: 5, stock: 0, minStock: 5 },
  { name: 'Picolé de Açaí', category: 'Picolés', code: 'PIC-ACAI', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/acai.webp' },
  { name: 'Picolé de Amendoim', category: 'Picolés', code: 'PIC-AMENDOIM', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/amendoim.webp' },
  { name: 'Picolé de Chocolate', category: 'Picolés', code: 'PIC-CHOC', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/chocolate.webp' },
  { name: 'Picolé de Coco', category: 'Picolés', code: 'PIC-COCO', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/coco.webp' },
  { name: 'Picolé de Leite Condensado', category: 'Picolés', code: 'PIC-COND', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/leite-condensado.webp' },
  { name: 'Picolé de Limão', category: 'Picolés', code: 'PIC-LIMAO', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/limao.webp' },
  { name: 'Picolé de Maçã Verde', category: 'Picolés', code: 'PIC-MACA', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/maca-verde.webp' },
  { name: 'Picolé de Maracujá', category: 'Picolés', code: 'PIC-MARACUJA', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/maracuja.webp' },
  { name: 'Picolé de Milho Verde', category: 'Picolés', code: 'PIC-MILHO', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/milho-verde.webp' },
  { name: 'Picolé de Morango', category: 'Picolés', code: 'PIC-MORANGO', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/morango.webp' },
  ...PREMIUM_PALETAS,
  ...NEW_CATALOG_PRODUCTS
];
// Sabores do sorvete vendido por quilo (sem preço individual).
const INITIAL_FLAVORS = [
  'Morango',
  'Brigadeiro',
  'Chiclete',
  'Napolitano',
  'Sonho de Valsa',
  'Abacaxi',
  'Coco',
  'Maracujá',
  'Maçã Verde',
  'Creme com Passas',
  'Nata Goiaba',
  'Flocos'
];
// Fotos padrão dos sabores vendidos por quilo. Para trocar, altere o arquivo nesta pasta.
const DEFAULT_FLAVOR_IMAGES = {
  'Morango': 'assets/sabores/morango.webp',
  'Brigadeiro': 'assets/sabores/brigadeiro.webp',
  'Chiclete': 'assets/sabores/chiclete.webp',
  'Napolitano': 'assets/sabores/napolitano.webp',
  'Sonho de Valsa': 'assets/sabores/sonho-de-valsa.webp',
  'Abacaxi': 'assets/sabores/abacaxi.webp',
  'Coco': 'assets/sabores/coco.webp',
  'Maracujá': 'assets/sabores/maracuja.webp',
  'Maçã Verde': 'assets/sabores/maca-verde.webp',
  'Creme com Passas': 'assets/sabores/creme-com-passas.webp',
  'Nata Goiaba': 'assets/sabores/nata-goiaba.webp',
  'Flocos': 'assets/sabores/flocos.webp',
};

const LEGACY_FLAVORS = ['Chocolate', 'Morango', 'Creme', 'Flocos', 'Baunilha', 'Doce de leite', 'Coco', 'Napolitano', 'Maracujá', 'Açaí'];

// MILK-SHAKES — catálogo e preços iniciais. Edite pelo painel do dono.
// Fotos são caminhos locais; o cliente não envia imagens automaticamente para o GitHub.
const MILK_FLAVORS = {
  tradicional: ['Brigadeiro', 'Chiclete', 'Coco', 'Creme com Passas', 'Flocos', 'Maracujá', 'Morango'],
  especial: ['Ninho com Nutella', 'Ninho com Oreo', 'Ninho Trufado', 'Ovomaltine', 'Kinder ovo', 'Sensação', 'Cookies']
};
const MILK_PRICES = { tradicional: { 300: 12, 400: 14, 500: 16 }, especial: { 300: 15, 400: 17, 500: 19 } };
function defaultMilkConfig() {
  return { prices: structuredClone(MILK_PRICES), flavors: Object.entries(MILK_FLAVORS).flatMap(([type, names]) => names.map(name => ({ type, name, image: '' }))) };
}
function normalizeMilkConfig(value) {
  const base = defaultMilkConfig();
  if (!value || typeof value !== 'object') return base;
  for (const type of Object.keys(MILK_FLAVORS)) {
    for (const size of ['300', '400', '500']) {
      const price = Number(value.prices?.[type]?.[size]);
      if (Number.isFinite(price) && price > 0 && price < 100000) base.prices[type][size] = price;
    }
  }
  if (Array.isArray(value.flavors)) for (const f of base.flavors) {
    const previous = value.flavors.find(x => x && x.type === f.type && x.name === f.name);
    if (previous && typeof previous.image === 'string') f.image = previous.image.slice(0, 400);
  }
  return base;
}

const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const DEFAULT_POPSICLES = [
  { name: 'Picolé de Açaí', category: 'Picolés', code: 'PIC-ACAI', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/acai.webp' },
  { name: 'Picolé de Amendoim', category: 'Picolés', code: 'PIC-AMENDOIM', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/amendoim.webp' },
  { name: 'Picolé de Chocolate', category: 'Picolés', code: 'PIC-CHOC', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/chocolate.webp' },
  { name: 'Picolé de Coco', category: 'Picolés', code: 'PIC-COCO', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/coco.webp' },
  { name: 'Picolé de Leite Condensado', category: 'Picolés', code: 'PIC-COND', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/leite-condensado.webp' },
  { name: 'Picolé de Limão', category: 'Picolés', code: 'PIC-LIMAO', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/limao.webp' },
  { name: 'Picolé de Maçã Verde', category: 'Picolés', code: 'PIC-MACA', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/maca-verde.webp' },
  { name: 'Picolé de Maracujá', category: 'Picolés', code: 'PIC-MARACUJA', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/maracuja.webp' },
  { name: 'Picolé de Milho Verde', category: 'Picolés', code: 'PIC-MILHO', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/milho-verde.webp' },
  { name: 'Picolé de Morango', category: 'Picolés', code: 'PIC-MORANGO', cost: 0, price: 2, stock: 0, minStock: 5, image: 'assets/picoles/morango.webp' }
];

function freshData() {
  return {
    version: 1,
    businessType: 'sorveteria',
    settings: { name: 'Sorveteria Manager', phone: '', address: '', weightPrice: 69.90 },
    flavors: INITIAL_FLAVORS.map(name => ({ id: uid(), name, category: 'Sorvetes', image: DEFAULT_FLAVOR_IMAGES[name] || '' })),
    products: INITIAL_PRODUCTS.map(item => ({ id: uid(), ...item })),
    services: INITIAL_SERVICES.map(item => ({ id: uid(), ...item })),
    milkshakes: defaultMilkConfig(),
    employees: [], movements: [], sales: [], sessions: [], // nenhuma movimentação ou histórico de demonstração
    goals: { daily: 0, monthly: 0 },
    ui: { theme: 'light', favorites: [], operatorId: '' },
    security: null, // senha antiga do caixa passa a ser senha do dono
    cashSecurity: null, // senha operacional exclusiva para abrir, fechar e desbloquear o caixa
    recoverySecurity: null, // código de recuperação do dono, salvo apenas como verificador

    lastBackup: null
  };
}

// Dados antigos da 1.0 e 1.1 não possuíam goals e ui.
function normalizeData(data) {
  // Corrige marcas legadas de projetos de papelaria sem alterar nomes personalizados.
  if (['papelaria manager', 'minha papelaria', 'minha sorveteria'].includes(String(data.settings.name || '').trim().toLocaleLowerCase('pt-BR'))) {
    data.settings.name = 'Sorveteria Manager';
  }
  data.flavors = Array.isArray(data.flavors) ? data.flavors : [];
  data.milkshakes = normalizeMilkConfig(data.milkshakes);
  // Oculta somente o item genérico de demonstração não utilizado, mantendo
  // itens editados pelo dono ou presentes no histórico de vendas.
  if (Array.isArray(data.services)) data.services = data.services.filter(item => {
    const isDemo = item.name === 'Milk-shake 300 ml' && item.category === 'Bebidas'
      && item.unit === 'unidade' && Number(item.price) === 15;
    if (!isDemo) return true;
    return Array.isArray(data.sales) && data.sales.some(s => (s.items || []).some(i => i.id === item.id));
  });

  // Migração segura: em instalações que só tinham os sabores de exemplo da versão
  // anterior, trocamos a lista pela lista real. Sabores personalizados permanecem.
  const normalizeFlavor = name => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const oldDefaultsOnly = data.flavors.length === LEGACY_FLAVORS.length &&
    data.flavors.every(f => LEGACY_FLAVORS.some(old => normalizeFlavor(old) === normalizeFlavor(f.name)));
  if (oldDefaultsOnly) {
    const existingByName = new Map(data.flavors.map(f => [normalizeFlavor(f.name), f]));
    data.flavors = INITIAL_FLAVORS.map(name => {
      const existing = existingByName.get(normalizeFlavor(name));
      return existing ? { ...existing, name, category: existing.category || 'Sorvetes' } : { id: uid(), name, category: 'Sorvetes', image: DEFAULT_FLAVOR_IMAGES[name] || '' };
    });
  } else {
    // Não apagar sabores adicionados manualmente pelo dono.
    for (const name of INITIAL_FLAVORS) {
      if (!data.flavors.some(f => normalizeFlavor(f.name) === normalizeFlavor(name)))
        data.flavors.push({ id: uid(), name, category: 'Sorvetes', image: DEFAULT_FLAVOR_IMAGES[name] || '' });
    }
  }
  data.flavors.forEach(f => {
    if (typeof f.image !== 'string') f.image = '';
    // Aplica a nova foto apenas aos sabores sem foto; preserva imagens personalizadas.
    if (!f.image.trim()) {
      const defaultName = INITIAL_FLAVORS.find(name => normalizeFlavor(name) === normalizeFlavor(f.name));
      if (defaultName) f.image = DEFAULT_FLAVOR_IMAGES[defaultName] || '';
    }
  });
  data.products = Array.isArray(data.products) ? data.products : [];
  // Acrescenta as novas paletas em instalações já usadas, sem duplicar por código
  // e sem sobrescrever preço, estoque, foto ou nome que o dono já editou.
  for (const paleta of PREMIUM_PALETAS) {
    const present = data.products.some(p =>
      String(p.code || '').toUpperCase() === paleta.code ||
      String(p.name || '').trim().toLocaleLowerCase('pt-BR') === paleta.name.toLocaleLowerCase('pt-BR'));
    if (!present) data.products.push({ id: uid(), ...paleta });
  }
  // Acrescenta os 39 produtos novos às instalações anteriores sem duplicar registros.
  for (const product of NEW_CATALOG_PRODUCTS) {
    const found = data.products.some(p => String(p.code || '').toUpperCase() === product.code ||
      String(p.name || '').trim().toLocaleLowerCase('pt-BR') === product.name.toLocaleLowerCase('pt-BR'));
    if (!found) data.products.push({ id: uid(), ...product });
  }
  for (const pop of DEFAULT_POPSICLES) {
    const existing = data.products.find(p => String(p.code || '').toUpperCase() === pop.code || String(p.name || '').trim().toLocaleLowerCase('pt-BR') === pop.name.toLocaleLowerCase('pt-BR'));
    if (existing) {
      if (existing.image === undefined || existing.image === null) existing.image = pop.image; // Permite remover a imagem deixando o campo vazio
      if (!existing.category) existing.category = pop.category;
      if (!(Number(existing.price) > 0)) existing.price = pop.price;
      if (!Number.isFinite(Number(existing.minStock))) existing.minStock = pop.minStock;
      if (!Number.isFinite(Number(existing.stock))) existing.stock = pop.stock;
    } else {
      data.products.push({ id: uid(), ...pop });
    }
  }
  data.settings.weightPrice = Number.isFinite(Number(data.settings.weightPrice)) && Number(data.settings.weightPrice) > 0 ? Number(data.settings.weightPrice) : 69.90;
  // A opção por bola foi removida em 1.0.5. Histórico antigo continua intacto.
  delete data.settings.scoopPrice;
  data.goals = data.goals && typeof data.goals === 'object'
    ? { daily: Number(data.goals.daily) || 0, monthly: Number(data.goals.monthly) || 0 }
    : { daily: 0, monthly: 0 };
  data.ui = data.ui && typeof data.ui === 'object'
    ? { theme: data.ui.theme === 'dark' ? 'dark' : 'light', favorites: Array.isArray(data.ui.favorites) ? [...new Set(data.ui.favorites.filter(x => typeof x === 'string' && /^(p|s):/.test(x)))].slice(0, 500) : [], operatorId: typeof data.ui.operatorId === 'string' ? data.ui.operatorId : '' }
    : { theme: 'light', favorites: [], operatorId: '' };
  data.security = data.security && typeof data.security === 'object'
    && typeof data.security.salt === 'string' && typeof data.security.hash === 'string'
    && Number.isSafeInteger(data.security.iterations) && data.security.iterations >= 100000
    ? data.security : null;
  // Migração 1.5: a antiga senha de login do funcionário passa a servir
  // SOMENTE para abrir/fechar caixa; o login do funcionário não exige senha.
  const validCredential = record => record && typeof record === 'object'
    && typeof record.salt === 'string' && typeof record.hash === 'string'
    && Number.isSafeInteger(record.iterations) && record.iterations >= 100000;
  data.cashSecurity = validCredential(data.cashSecurity) ? data.cashSecurity
    : validCredential(data.operatorSecurity) ? data.operatorSecurity : null;
  data.operatorSecurity = null; // campo antigo obsoleto; não é usado para login
  // Backups anteriores continuam válidos; o código é criado após o login do dono.
  data.recoverySecurity = validCredential(data.recoverySecurity) ? data.recoverySecurity : null;
  data.employees.forEach(e => { if (!e.department) e.department = e.role || 'Geral'; if (!e.hiredAt) e.hiredAt = ''; if (!e.status) e.status = e.dismissedAt ? 'dismissed' : 'active'; });
  data.movements.forEach(m => { if (typeof m.voided !== 'boolean') m.voided = false; });
  return data;
}

function validData(data) {
  if (!data || data.version !== 1 || data.businessType !== 'sorveteria' || !data.settings || typeof data.settings.name !== 'string') return false;
  const collections = ['products', 'services', 'employees', 'movements', 'sales', 'sessions'];
  if (!Array.isArray(data.flavors) || data.flavors.length > 3000 || !data.flavors.every(f => f && typeof f.id === 'string' && typeof f.name === 'string')) return false;
  if (!collections.every(key => Array.isArray(data[key]) && data[key].length <= 200000)) return false;
  return collections.every(key => data[key].every(item => item && typeof item === 'object' && typeof item.id === 'string'));
}

let storageError = false;
function loadData() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return freshData();
    const data = JSON.parse(raw);
    if (!validData(data)) throw Error('Registros locais incompatíveis');
    return normalizeData(data);
  } catch (error) {
    storageError = true;
    alert('Não foi possível ler os registros antigos. Nenhum dado foi sobrescrito. Restaure um backup ou examine o armazenamento antes de salvar novos registros.');
    return freshData();
  }
}
let db = loadData();

function saveData() {
  if (storageError) { alert('O armazenamento anterior está com erro. Para proteger os dados existentes, o salvamento foi bloqueado nesta aba.'); return false; }
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    alert('Não foi possível salvar. O armazenamento pode estar cheio ou bloqueado. Faça backup antes de continuar.');
    return false;
  }
}

// Modifica e salva como uma operação; desfaz a memória se a gravação falhar.
function commit(modifier) {
  const original = structuredClone(db);
  try {
    modifier();
    if (!saveData()) { db = original; return false; }
    return true;
  } catch (error) { db = original; alert(error.message || 'Erro ao salvar'); return false; }
}

function exportData() {
  const snapshot = structuredClone(db);
  const when = new Date().toISOString();
  snapshot.lastBackup = when;
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sorveteria-manager-backup-${new Date().toLocaleDateString('sv-SE')}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
  commit(() => { db.lastBackup = when; });
}

async function importData(file) {
  if (!file || file.size > 30 * 1024 * 1024) throw Error('Escolha um backup JSON de até 30 MB.');
  let data;
  try { data = JSON.parse(await file.text()); } catch { throw Error('O arquivo JSON não pôde ser lido.'); }
  if (!validData(data)) throw Error('O arquivo não é um backup compatível do Sorveteria Manager.');
  if (!confirm('ATENÇÃO: restaurar substitui todos os dados locais, inclusive vendas e estoque. Deseja continuar?')) return false;
  const original = db;
  db = normalizeData(data);
  if (!saveData()) { db = original; return false; }
  return true;
}
