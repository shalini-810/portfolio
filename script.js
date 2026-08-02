// ============ THEME TOGGLE ============
// Switches a class on <body> and remembers the choice for next visit.
(function () {
  const body = document.body;
  const toggleBtn = document.getElementById('themeToggle');
  const STORAGE_KEY = 'sa-portfolio-theme';

  function applyTheme(theme) {
    if (theme === 'light') {
      body.classList.add('theme-light');
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      body.classList.remove('theme-light');
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.setAttribute('aria-label', 'Switch to light mode');
    }
  }

  // Load saved preference, falling back to the visitor's OS setting.
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }

  toggleBtn.addEventListener('click', function () {
    const isLight = body.classList.contains('theme-light');
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });
})();

// ============ MOBILE NAV ============
(function () {
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');

  navToggle.addEventListener('click', function () {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the menu after a link is tapped (mobile only).
  navList.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ============ EMAIL LINK: COPY-TO-CLIPBOARD FALLBACK ============
// mailto: only works if the visitor's device has a mail app configured.
// This copies the address to the clipboard too, so it's usable either way.
(function () {
  const emailLink = document.getElementById('emailLink');
  const emailText = document.getElementById('emailLinkText');
  if (!emailLink || !emailText) return;

  const email = emailLink.getAttribute('data-email');
  const originalLabel = emailText.textContent;

  function showCopiedFeedback() {
    emailText.textContent = 'Copied!';
    setTimeout(function () {
      emailText.textContent = originalLabel;
    }, 1600);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      // Clipboard copy isn't available; the mailto: link is still the fallback.
    }
    document.body.removeChild(textarea);
  }

  emailLink.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(showCopiedFeedback).catch(function () {
        fallbackCopy(email);
        showCopiedFeedback();
      });
    } else {
      fallbackCopy(email);
      showCopiedFeedback();
    }
    // Note: mailto: still fires normally alongside this for visitors
    // who do have a mail app set up as their default.
  });
})();

// ============ CONTACT FORM (Web3Forms) ============
// Sends the form directly to Web3Forms, which emails the submission
// to the address tied to the access_key below — no backend needed.
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('contactFormSubmit');
  const statusEl = document.getElementById('contactFormStatus');
  const originalBtnText = submitBtn.innerHTML;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const accessKey = form.querySelector('input[name="access_key"]').value;
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      statusEl.textContent = 'Form isn\'t connected yet — add a Web3Forms access key in index.html.';
      statusEl.className = 'contact-form-status is-error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'contact-form-status';

    const formData = new FormData(form);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (result.success) {
          statusEl.textContent = 'Message sent — thanks for reaching out! I\'ll reply soon.';
          statusEl.className = 'contact-form-status is-success';
          form.reset();
        } else {
          statusEl.textContent = 'Something went wrong. Please try again or use the email link above.';
          statusEl.className = 'contact-form-status is-error';
        }
      })
      .catch(function () {
        statusEl.textContent = 'Network error. Please try again or use the email link above.';
        statusEl.className = 'contact-form-status is-error';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      });
  });
})();