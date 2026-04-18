// Lightweight i18n loader — loads JSON from /lang/<code>.json and applies keys
(function () {
  async function loadLang(code) {
    try {
      console.log('i18n: loadLang called ->', code);
      setI18nDebug(`Loading language: ${code}...`);
      const res = await fetch(`lang/${code}.json`);
      if (!res.ok) throw new Error('Language file not found');
      const data = await res.json();

      // document direction
      if (data.dir) document.documentElement.dir = data.dir;
      // set html lang attr for accessibility/seo
      try { document.documentElement.lang = code; } catch (e) {}

      // title & meta description
      if (data.pageTitle) document.title = data.pageTitle;
      const meta = document.querySelector('meta[data-i18n-meta="metaDescription"]');
      if (meta && data.metaDescription) meta.setAttribute('content', data.metaDescription);

      // simple key -> element innerHTML mapping
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const val = data[key];
        if (val === undefined) return;
        // If value is array and element is a UL, populate list
        if (Array.isArray(val) && el.tagName.toLowerCase() === 'ul') {
          el.innerHTML = val.map(i => `<li>${i}</li>`).join('');
          return;
        }
        // If this is the value stack (array of objects)
        if (key === 'valueStack' && Array.isArray(val)) {
          const html = val.map(item => `
            <div class="value-item">
              <span class="value-name">${item.name}</span>
              <span class="value-price">${item.price}</span>
            </div>
          `).join('');
          el.innerHTML = html;
          return;
        }

        // FAQ builder
        if (key === 'faq' && Array.isArray(val)) {
          const container = document.getElementById('faq-container');
          if (container) {
            container.innerHTML = val.map(f => `
              <div class="faq-item">
                <div class="faq-question">${f.q}<span>+</span></div>
                <div class="faq-answer" style="display:none;">${f.a}</div>
              </div>
            `).join('');
          }

          // Inject SEO-friendly FAQPage structured data for crawlers (localized)
          try {
            const existing = document.getElementById('i18n-faq-ld');
            if (existing) existing.remove();
            const faqLd = {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": val.map(item => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.a
                }
              }))
            };
            const s = document.createElement('script');
            s.type = 'application/ld+json';
            s.id = 'i18n-faq-ld';
            s.textContent = JSON.stringify(faqLd);
            document.head.appendChild(s);
          } catch (e) {
            // ignore JSON-LD injection errors
            console.warn('FAQ JSON-LD injection failed', e);
          }

          return;
        }

        // Footer links
        if (key === 'footerLinks' && Array.isArray(val)) {
          const elLinks = document.getElementById('footer-links');
          if (elLinks) {
            elLinks.innerHTML = val.map(l => `<a href="${l.href}" style="color:#666; text-decoration:none; margin:0 1rem;">${l.label}</a>`).join('');
          }
          return;
        }

        // default: set innerHTML or textContent
        if (typeof val === 'string' || typeof val === 'number') el.innerHTML = val;
      });

      // Build day lists if present as arrays
      ['day1List','day2List','day3List'].forEach(k => {
        const arr = data[k];
        const el = document.querySelector(`[data-i18n="${k}"]`);
        if (el && Array.isArray(arr)) el.innerHTML = arr.map(i => `<li>${i}</li>`).join('');
      });

      // Update countdown note etc handled via data attributes already

      // Expose current language
      window.__CURRENT_LANG = code;
      localStorage.setItem('lang', code);
      console.log('i18n: loaded ->', code);
      setI18nDebug(`Loaded language: ${code}`);
      // ensure selector reflects current language
      const sel = document.getElementById('lang-select');
      if (sel) sel.value = code;

      // After translations inserted, allow other scripts to attach handlers
      if (window.onI18nLoaded) window.onI18nLoaded(data);
    } catch (err) {
      console.error('i18n load error', err);
      setI18nDebug(`Language load failed: ${err.message}`, true);
    }
  }

  // Automatic initial load
  const saved = localStorage.getItem('lang');
  const defaultLang = saved || (navigator.language || 'en').slice(0,2) || 'en';
  const pick = ['en','fr','es','de','ar','ma'].includes(defaultLang) ? defaultLang : 'en';

  document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('lang-select');
    if (selector) {
      selector.value = pick;
      selector.addEventListener('change', e => { console.log('i18n: selector changed ->', e.target.value); loadLang(e.target.value); });
    }
    loadLang(pick);
  });

  // Visible debug banner for language loading state
  function setI18nDebug(msg, isError){
    try{
      let b = document.getElementById('i18n-debug');
      if(!b){
        b = document.createElement('div');
        b.id = 'i18n-debug';
        b.style.position = 'fixed';
        b.style.left = '1rem';
        b.style.bottom = '1rem';
        b.style.padding = '0.5rem 0.75rem';
        b.style.zIndex = 99999;
        b.style.borderRadius = '8px';
        b.style.fontSize = '12px';
        b.style.fontWeight = '600';
        document.body.appendChild(b);
      }
      b.textContent = msg;
      b.style.background = isError ? 'rgba(255,59,48,0.95)' : 'rgba(0,0,0,0.75)';
      b.style.color = isError ? '#FFF' : '#FFF';
    }catch(e){/* ignore */}
  }

  // expose API
  window.i18n = { load: loadLang };
})();
