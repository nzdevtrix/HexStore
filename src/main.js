/* HexStore - lightweight client-side marketplace
   Features: product grid, search, filters, sort, cart (localStorage)
*/

const PRODUCTS = [
  {id:1,title:'Wireless Headphones',price:79.99,brand:'Aurora',img:'https://picsum.photos/seed/p1/400/300',prime:true,stock:12},
  {id:2,title:'Mechanical Keyboard',price:129.00,brand:'KeyHex',img:'https://picsum.photos/seed/p2/400/300',prime:false,stock:5},
  {id:3,title:'Smartwatch',price:199.99,brand:'TickPro',img:'https://picsum.photos/seed/p3/400/300',prime:true,stock:0},
  {id:4,title:'Coffee Maker',price:49.5,brand:'Brewly',img:'https://picsum.photos/seed/p4/400/300',prime:false,stock:8},
  {id:5,title:'Noise Cancelling Earbuds',price:59.9,brand:'Aurora',img:'https://picsum.photos/seed/p5/400/300',prime:true,stock:20},
  {id:6,title:'Kids Puzzle 500pcs',price:14.99,brand:'FunBox',img:'https://picsum.photos/seed/p6/400/300',prime:false,stock:15}
];

let state = {
  q:'',
  sort:'relevance',
  filterPrime:false,
  filterInStock:false,
  cart: JSON.parse(localStorage.getItem('hs_cart')||'{}')
};

function $(id){return document.getElementById(id)}

function formatPrice(v){return v.toFixed(2)}

function getFiltered(){
  let list = PRODUCTS.filter(p=>{
    if(state.filterPrime && !p.prime) return false;
    if(state.filterInStock && p.stock<=0) return false;
    if(state.q){
      const q=state.q.toLowerCase();
      return p.title.toLowerCase().includes(q)||p.brand.toLowerCase().includes(q);
    }
    return true;
  });
  if(state.sort==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(state.sort==='price-desc') list.sort((a,b)=>b.price-a.price);
  return list;
}

function renderProducts(){
  const grid = $('products-grid');
  const list = getFiltered();
  $('results-count').textContent = list.length;
  grid.innerHTML='';
  list.forEach(p=>{
    const card = document.createElement('div'); card.className='product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="product-title">${p.title}</div>
      <div class="product-meta">${p.brand} · ${p.stock>0? 'In stock':'Out of stock'}</div>
      <div class="product-price">$${formatPrice(p.price)}</div>
      <div class="product-actions">
        <button class="btn" data-id="${p.id}" data-action="view">View</button>
        <button class="btn btn-primary" data-id="${p.id}" data-action="add" ${p.stock<=0? 'disabled':''}>Add to cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function saveCart(){
  localStorage.setItem('hs_cart', JSON.stringify(state.cart));
  updateCartCount();
}

function addToCart(id){
  const pid = String(id);
  state.cart[pid] = (state.cart[pid]||0)+1;
  saveCart();
  renderCartItems();
}

function removeFromCart(id){
  const pid=String(id);
  delete state.cart[pid]; saveCart(); renderCartItems();
}

function updateCartCount(){
  const count = Object.values(state.cart).reduce((s,v)=>s+v,0);
  $('cart-count').textContent = count;
}

function renderCartItems(){
  const el = $('cart-items'); el.innerHTML='';
  let total=0;
  for(const [id,qty] of Object.entries(state.cart)){
    const p = PRODUCTS.find(x=>String(x.id)===id); if(!p) continue;
    total += p.price*qty;
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div style="flex:1">
        <div style="font-weight:600">${p.title}</div>
        <div style="font-size:13px;color:#64748b">${qty} × $${formatPrice(p.price)}</div>
      </div>
      <div>
        <button class="btn" data-id="${p.id}" data-action="remove">Remove</button>
      </div>
    `;
    el.appendChild(row);
  }
  $('cart-total').textContent = formatPrice(total);
  updateCartCount();
}

function toggleCart(show){
  const drawer = $('cart-drawer');
  drawer.classList.toggle('hidden', !show);
}

function bind(){
  $('search-input').addEventListener('input', e=>{ state.q=e.target.value; renderProducts(); });
  $('sort-select').addEventListener('change', e=>{ state.sort=e.target.value; renderProducts(); });
  $('filter-prime').addEventListener('change', e=>{ state.filterPrime=e.target.checked; renderProducts(); });
  $('filter-instock').addEventListener('change', e=>{ state.filterInStock=e.target.checked; renderProducts(); });
  $('cart-btn').addEventListener('click', ()=>toggleCart(true));
  $('checkout-btn')?.addEventListener('click', ()=>{ alert('Checkout is not implemented in this demo'); });
  document.addEventListener('click', (e)=>{
    const action = e.target.getAttribute && e.target.getAttribute('data-action');
    const id = e.target.getAttribute && e.target.getAttribute('data-id');
    if(action==='add') addToCart(id);
    if(action==='remove') removeFromCart(id);
    if(action==='view') alert('Product quick view: '+id);
  });
}

function init(){
  bind(); renderProducts(); renderCartItems(); updateCartCount();
}

window.addEventListener('DOMContentLoaded', init);

