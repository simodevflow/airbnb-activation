// Main interaction file: countdown timer, FAQ toggles, smooth scrolling
(function () {
  function updateCountdown() {
    const now = new Date().getTime();
    const tomorrow = new Date();
    tomorrow.setHours(23, 59, 59, 999);
    const distance = tomorrow - now;

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const countdownHTML = `
      <div class="time-unit">
          <div class="time-number">${hours.toString().padStart(2, '0')}</div>
          <div class="time-label">Hours</div>
      </div>
      <div class="time-unit">
          <div class="time-number">${minutes.toString().padStart(2, '0')}</div>
          <div class="time-label">Minutes</div>
      </div>
      <div class="time-unit">
          <div class="time-number">${seconds.toString().padStart(2, '0')}</div>
          <div class="time-label">Seconds</div>
      </div>
    `;

    const countdownEl = document.getElementById('countdown');
    const bannerEl = document.getElementById('countdown-banner');
    if (countdownEl) countdownEl.innerHTML = countdownHTML;
    if (bannerEl) bannerEl.innerHTML = `${hours}h ${minutes}m ${seconds}s`;
  }

  function attachFAQHandlers() {
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isOpen = answer.style.display === 'block';

        // Close all answers
        document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
        document.querySelectorAll('.faq-question span').forEach(s => s.textContent = '+');

        if (!isOpen) {
          answer.style.display = 'block';
          question.querySelector('span').textContent = '−';
        }
      });
    });
  }

  function attachSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // After i18n populates content, attach FAQ and any other dom handlers
  window.onI18nLoaded = function (data) {
    attachFAQHandlers();
    attachSmoothScroll();
    // If translated labels for time units exist, try to replace the labels
    // (simple, not exhaustive)
  };

  document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    setInterval(updateCountdown, 1000);
    attachSmoothScroll();
    // If i18n already loaded, attach FAQ
    setTimeout(() => { if (document.querySelectorAll('.faq-question').length) attachFAQHandlers(); }, 500);
  });

})();
