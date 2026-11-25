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

  /* Поиск */
  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    searchQuery = $('#searchInput').value.trim().toLowerCase();
    applyFilters();
    if (searchQuery) $('#products').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* Корзина */
  const cartCount = $('#cartCount');
  let count = 0;
  $$('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      count++;
      cartCount.textContent = count;
      showToast(`«${button.closest('.product').dataset.name}» добавлен в корзину`);
    });
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
    if (e.key === 'Escape') closeModal();
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
