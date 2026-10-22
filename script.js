// Variable State Keranjang Belanja & Filter
let cartItems = [];
let currentCategory = 'all';

// ==========================================
// 1. FILTER & SEARCH MENU
// ==========================================
function setFilter(category, buttonEl) {
  currentCategory = category;

  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  buttonEl.classList.add('active');

  filterMenu();
}

function filterMenu() {
  const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
  const menuCards = document.querySelectorAll('.menu-card');

  menuCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    const cardName = card.getAttribute('data-name');

    const categoryMatches = (currentCategory === 'all') || (cardCategory === currentCategory);
    const searchMatches = cardName.includes(searchInput);

    if (categoryMatches && searchMatches) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// ==========================================
// 2. KERANJANG BELANJA & KELOLA PESANAN
// ==========================================
function addToCart(namaMenu, harga) {
  const existingItem = cartItems.find(item => item.nama === namaMenu);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cartItems.push({ nama: namaMenu, harga: harga, qty: 1 });
  }

  updateCartUI();
  showToast(`"${namaMenu}" ditambahkan (+1)`);
}

function changeQty(index, change) {
  cartItems[index].qty += change;

  if (cartItems[index].qty <= 0) {
    cartItems.splice(index, 1);
  }

  updateCartUI();
}

function clearAllCart() {
  if (confirm("Apakah Anda yakin ingin membatalkan semua pesanan?")) {
    cartItems = [];
    updateCartUI();
    closeCartModalDirect();
    showToast("Semua pesanan dibatalkan.");
  }
}

function updateCartUI() {
  const cartBar = document.getElementById('cartBar');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const cartItemsList = document.getElementById('cartItemsList');

  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.harga * item.qty), 0);

  cartCount.innerText = totalQty;
  cartTotal.innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;

  document.getElementById('cartSummaryQty').innerText = `${totalQty} item`;
  document.getElementById('cartSummaryTotal').innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;

  if (cartItems.length === 0) {
    cartItemsList.innerHTML = `<p style="text-align:center; color: var(--muted-text); padding: 2rem 0;">Belum ada pesanan terpilih.</p>`;
    cartBar.classList.remove('active');
  } else {
    cartBar.classList.add('active');
    
    let html = "";
    cartItems.forEach((item, index) => {
      const subtotal = item.harga * item.qty;
      html += `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <h4>${item.nama}</h4>
            <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div class="cart-item-controls">
            <button class="btn-qty btn-qty-delete" onclick="changeQty(${index}, -${item.qty})" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>
            <button class="btn-qty" onclick="changeQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
            <span class="qty-number">${item.qty}</span>
            <button class="btn-qty" onclick="changeQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
      `;
    });
    cartItemsList.innerHTML = html;
  }
}

function checkoutWA() {
  if (cartItems.length === 0) return;

  const waNumber = "6281234567890"; // Ganti nomor WhatsApp di sini
  let itemText = "";
  let total = 0;

  cartItems.forEach((item, index) => {
    const subtotal = item.harga * item.qty;
    total += subtotal;
    itemText += `${index + 1}. *${item.nama}* x${item.qty} (Rp ${subtotal.toLocaleString('id-ID')})\n`;
  });

  const message = `Halo The Go-To Resto! Saya mau memesan menu berikut:\n\n${itemText}\n*Total Pesanan: Rp ${total.toLocaleString('id-ID')}*\n\nMohon diproses ya, terima kasih!`;

  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

// ==========================================
// 3. MODALS (DETAIL MENU & CART)
// ==========================================
function openMenuModal(nama, harga, desc, imgUrl) {
  document.getElementById('modalTitle').innerText = nama;
  document.getElementById('modalPrice').innerText = harga;
  document.getElementById('modalDesc').innerText = desc;
  document.getElementById('modalImg').src = imgUrl;

  const rawHarga = parseInt(harga.replace(/[^0-9]/g, ''));
  document.getElementById('modalAddBtn').onclick = function() {
    addToCart(nama, rawHarga);
    closeMenuModalDirect();
  };

  document.getElementById('menuModal').classList.add('open');
}

function closeMenuModal(event) {
  if (event.target.id === 'menuModal') closeMenuModalDirect();
}

function closeMenuModalDirect() {
  document.getElementById('menuModal').classList.remove('open');
}

function toggleCartModal() {
  if (cartItems.length > 0) {
    document.getElementById('cartModal').classList.add('open');
  }
}

function closeCartModal(event) {
  if (event.target.id === 'cartModal') closeCartModalDirect();
}

function closeCartModalDirect() {
  document.getElementById('cartModal').classList.remove('open');
}

// ==========================================
// 4. TOAST & INITIALIZATION
// ==========================================
function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').innerText = message;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  const counters = document.querySelectorAll('.counter, .exp-number');
  let animated = false;

  window.addEventListener('scroll', () => {
    const aboutSec = document.getElementById('about');
    if (!aboutSec) return;

    const secPos = aboutSec.getBoundingClientRect().top;
    const screenPos = window.innerHeight / 1.3;

    if (secPos < screenPos && !animated) {
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const countUp = () => {
          const count = +counter.innerText;
          const inc = Math.ceil(target / 40);

          if (count < target) {
            counter.innerText = Math.min(count + inc, target);
            setTimeout(countUp, 30);
          } else {
            counter.innerText = target;
          }
        };
        countUp();
      });
      animated = true;
    }
  });
});