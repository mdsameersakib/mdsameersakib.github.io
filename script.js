/* Simple footer info for assignment requirement */
(function () {
  var storageKey = "portfolio-theme";
  var locationEl = document.getElementById("page-location");
  var modifiedEl = document.getElementById("last-modified");
  var themeToggleBtn = document.getElementById("theme-toggle-btn");
  var contactForm = document.querySelector(".contact-form");
  var contactSubmitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

  if (locationEl) {
    locationEl.textContent = window.location.href;
  }

  if (modifiedEl) {
    modifiedEl.textContent = document.lastModified;
  }

  function applyTheme(theme) {
    var darkMode = theme === "dark";

    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    if (themeToggleBtn) {
      themeToggleBtn.textContent = darkMode ? "Light Mode" : "Dark Mode";
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      /* localStorage may be unavailable; ignore safely */
    }
  }

  function loadTheme() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  var savedTheme = loadTheme();
  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
  } else {
    applyTheme("light");
  }

  if (themeToggleBtn) {
    themeToggleBtn.onclick = function () {
      var nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      applyTheme(nextTheme);
      saveTheme(nextTheme);
    };
  }

  if (contactForm && contactSubmitBtn) {
    contactForm.onsubmit = function (event) {
      var defaultText = "Send";

      event.preventDefault();

      if (contactSubmitBtn.disabled) {
        return;
      }

      contactSubmitBtn.disabled = true;
      contactSubmitBtn.textContent = "Sending...";

      window
        .fetch(contactForm.action, {
          method: "POST",
          body: new window.FormData(contactForm),
          headers: {
            Accept: "application/json",
          },
        })
        .then(function (response) {
          if (response.ok) {
            contactSubmitBtn.textContent = "Sent";
            contactSubmitBtn.classList.add("is-sent");
            contactForm.reset();
            return;
          }

          contactSubmitBtn.disabled = false;
          contactSubmitBtn.textContent = defaultText;
        })
        .catch(function () {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.textContent = defaultText;
        });
    };
  }
})();
