const fortunes = [
  "No Salami This Eid.",
  "You will get 10x More Salami than last Eid.",
  "You will recieve a surprise Kacchi very soon.",
  "Biriyani iftar is waiting for you at Home.",
  "You will have to give 60% of your Salami back to your younger siiblngs and cousins.",
  "After Eid you will have to sit for Midterms.",
  "You will randomly bite into a Jilapi while eating Muri Makha.",
  "Jhura Halim is waiting for you at home for Iftar.",
  "Badam Shorbot is waiting for you.",
  "Your mother takes away all your Salami for savings."
];

const fortuneText = document.getElementById("fortuneText");
const fortuneBox = document.getElementById("fortuneBox");
const styleControls = document.querySelector(".style-controls");

const stylePresets = [
  {
    text: {
      color: "#b91c1c",
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: "1.35rem"
    },
    box: {
      backgroundColor: "#f7f9c5",
      borderColor: "#4f8a10"
    }
  },
  {
    text: {
      color: "#1f2937",
      fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
      fontSize: "1.3rem"
    },
    box: {
      backgroundColor: "#fef3c7",
      borderColor: "#d97706"
    }
  },
  {
    text: {
      color: "#0f172a",
      fontFamily: "Verdana, Geneva, sans-serif",
      fontSize: "1.28rem"
    },
    box: {
      backgroundColor: "#dbeafe",
      borderColor: "#2563eb"
    }
  },
  {
    text: {
      color: "#14532d",
      fontFamily: '"Palatino Linotype", "Book Antiqua", serif',
      fontSize: "1.33rem"
    },
    box: {
      backgroundColor: "#dcfce7",
      borderColor: "#16a34a"
    }
  }
];

function showRandomFortune() {
  fortuneText.textContent = fortunes[Math.floor(Math.random() * fortunes.length)];
}

function applyStylePreset(index) {
  const preset = stylePresets[index];

  if (!preset) {
    return;
  }
  Object.assign(fortuneText.style, preset.text);
  Object.assign(fortuneBox.style, preset.box);
}

styleControls.addEventListener("click", (event) => {
  const button = event.target.closest(".style-btn");
  if (!button) {
    return;
  }
  applyStylePreset(Number(button.dataset.style));
});

showRandomFortune();
applyStylePreset(0);
