(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* Мобильное меню */
  const burger = $('#burger');
  const nav = $('.nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  /* Каталог */
  const catalogBtn = $('#catalogBtn');
  const catalogMenu = $('#catalogMenu');
  catalogBtn.addEventListener('click', () => {
    const open = catalogMenu.hidden;
    catalogMenu.hidden = !open;
    catalogBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!catalogMenu.hidden && !catalogMenu.contains(e.target) && !catalogBtn.contains(e.target)) {
      catalogMenu.hidden = true;
      catalogBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* Слайдер */
  const slides = $$('[data-slide]');
  const dotsBox = $('#slideDots');
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Слайд ${i + 1}`);
    dot.addEventListener('click', () => showSlide(i, true));
    dotsBox.appendChild(dot);
  });
  const dots = $$('button', dotsBox);

  function showSlide(index, manual) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      slide.classList.toggle('slide--active', i === current);
      dots[i].classList.toggle('is-active', i === current);
    });
    if (manual) restartSlider();
  }
  function restartSlider() {
    clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1), 6000);
  }
  $('#slidePrev').addEventListener('click', () => showSlide(current - 1, true));
  $('#slideNext').addEventListener('click', () => showSlide(current + 1, true));
  showSlide(0);
  restartSlider();

  /* Фильтр товаров */
  let activeFilter = 'all';
  let searchQuery = '';
  const products = $$('.product');
  const message = $('#searchMessage');

  function applyFilters() {
    let visible = 0;
    products.forEach((product) => {
      const matchesFilter = activeFilter === 'all' || product.dataset.category === activeFilter;
      const matchesSearch = !searchQuery || product.dataset.name.toLowerCase().includes(searchQuery);
      const show = matchesFilter && matchesSearch;
      product.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });
    message.hidden = !(searchQuery || activeFilter !== 'all');
    message.textContent = `Найдено товаров: ${visible}`;
  }

  $$('.filter').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.filter').forEach((b) => b.classList.remove('filter--active'));
      button.classList.add('filter--active');
      activeFilter = button.dataset.filter;
      applyFilters();
    });
  });

  /* Клик по категории в каталоге */
  $$('.category[data-filter]').forEach((card) => {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      const value = card.dataset.filter;
      const button = $(`.filter[data-filter="${value}"]`);
      if (button) {
        $$('.filter').forEach((b) => b.classList.remove('filter--active'));
        button.classList.add('filter--active');
        activeFilter = value;
        applyFilters();
      }
      $('#products').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* Поиск */
  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    searchQuery = $('#searchInput').value.trim().toLowerCase();
    applyFilters();
    if (searchQuery) $('#products').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* Корзина */
  const cartCount = $('#cartCount');
  const cartPanel = $('#cartPanel');
  const cartItemsBox = $('#cartItems');
  const cartEmpty = $('#cartEmpty');
  const cartFoot = $('#cartFoot');
  const cartTotalEl = $('#cartTotal');
  const cart = new Map();

  const money = (value) => value.toLocaleString('ru-RU') + ' ₽';

  function productPrice(product) {
    const text = $('.product__bottom strong', product).textContent;
    return Number(text.replace(/[^\d]/g, ''));
  }

  function changeQty(name, delta) {
    const item = cart.get(name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart.delete(name);
    renderCart();
  }

  function renderCart() {
    cartItemsBox.innerHTML = '';
    let total = 0;
    let quantity = 0;

    cart.forEach((item, name) => {
      total += item.price * item.qty;
      quantity += item.qty;

      const row = document.createElement('div');
      row.className = 'cart__item';
      row.innerHTML = `
        <div>
          <h3>${item.name}</h3>
          <small>${money(item.price)} за шт.</small>
          <div class="cart__controls">
            <div class="cart__qty">
              <button type="button" data-cart-minus aria-label="Уменьшить количество">−</button>
              <span>${item.qty}</span>
              <button type="button" data-cart-plus aria-label="Увеличить количество">+</button>
            </div>
            <button type="button" class="cart__remove" data-cart-remove>Удалить</button>
          </div>
        </div>
        <strong class="cart__item-price">${money(item.price * item.qty)}</strong>`;

      $('[data-cart-minus]', row).addEventListener('click', () => changeQty(name, -1));
      $('[data-cart-plus]', row).addEventListener('click', () => changeQty(name, 1));
      $('[data-cart-remove]', row).addEventListener('click', () => {
        cart.delete(name);
        renderCart();
      });
      cartItemsBox.appendChild(row);
    });

    cartCount.textContent = quantity;
    cartEmpty.hidden = cart.size > 0;
    cartFoot.hidden = cart.size === 0;
    cartTotalEl.textContent = money(total);
  }

  $$('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const product = button.closest('.product');
      const name = product.dataset.name;
      const price = productPrice(product);
      const item = cart.get(name);
      if (item) item.qty++;
      else cart.set(name, { name, price, qty: 1 });
      renderCart();
      showToast(`«${name}» добавлен в корзину`);
    });
  });

  function openCart() {
    cartPanel.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.cart__close', cartPanel).focus();
  }
  function closeCart() {
    cartPanel.hidden = true;
    document.body.style.overflow = '';
  }
  $('#cartBtn').addEventListener('click', (event) => {
    event.preventDefault();
    openCart();
  });
  $$('[data-cart-close]', cartPanel).forEach((button) => button.addEventListener('click', closeCart));
  $('#checkoutBtn').addEventListener('click', () => {
    closeCart();
    showToast('Заказ оформлен (демонстрация). Мы свяжемся с вами!');
  });

  /* Модальное окно */
  const modal = $('#callModal');
  function openModal() {
    modal.hidden = false;
    $('input', modal).focus();
  }
  function closeModal() {
    modal.hidden = true;
  }
  $$('[data-modal-open]').forEach((b) => b.addEventListener('click', openModal));
  $$('[data-modal-close]').forEach((b) => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal();
    if (!cartPanel.hidden) closeCart();
  });
  $('#callForm').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.reset();
    closeModal();
    showToast('Заявка принята (демонстрация). Мы перезвоним!');
  });

  /* Уведомления */
  const toast = $('#toast');
  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }
})();
