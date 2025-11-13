
// Relationship Dashboard logic

const STORAGE_KEY = "silviaDashboardState_v2";

const initialState = {
  currentProfile: null,
  angerByMonth: {},
  countryMemories: {},
  secretUnlockedForSilvia: false,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...initialState };
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed };
  } catch (e) {
    console.error("Error loading state", e);
    return { ...initialState };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving state", e);
  }
}

let state = loadState();

// If angerByMonth is empty, seed with 11 months of data
function ensureSeededAnger() {
  if (Object.keys(state.angerByMonth).length > 0) return;
  const year = new Date().getFullYear();
  const values = [48, 79, 33, 54, 55, 32, 76, 23, 78, 32, 23]; // Jan–Nov
  values.forEach((v, idx) => {
    const month = (idx + 1).toString().padStart(2, "0");
    const key = `${year}-${month}`;
    state.angerByMonth[key] = v;
  });
}
ensureSeededAnger();
saveState();

// DOM references
const overlayEl = document.getElementById("profileOverlay");
const profileCards = document.querySelectorAll(".profile-card");
const currentProfileLabel = document.getElementById("currentProfileLabel");

const daysTogetherHero = document.getElementById("daysTogetherHero");
const daysTogetherMain = document.getElementById("daysTogether");
const totalEnfadosHero = document.getElementById("totalEnfadosHero");
const avgEnfadosBadge = document.getElementById("avgEnfadosBadge");
const angerYearTotalValue = document.getElementById("angerYearTotalValue");
const angerMonthlyAvgValue = document.getElementById("angerMonthlyAvgValue");

const angerThisMonthEl = document.getElementById("angerThisMonth");
const angerTrendNote = document.getElementById("angerTrendNote");
const btnAddAnger = document.getElementById("btnAddAnger");
const memoryText = document.getElementById("memoryText");
const memoryInput = document.getElementById("memoryInput");
const btnSaveMemory = document.getElementById("btnSaveMemory");

const planPrompt = document.getElementById("planPrompt");
const btnGeneratePlan = document.getElementById("btnGeneratePlan");
const planOutput = document.getElementById("planOutput");

const secretTabs = document.querySelectorAll(".secret-tab");
const secretPanels = document.querySelectorAll(".secret-panel");
const secretForm = document.getElementById("secretForm");
const secretPasswordInput = document.getElementById("secretPassword");
const secretError = document.getElementById("secretError");
const secretContent = document.getElementById("secretContent");

let angerChart;

// Profile overlay
function applyProfile(profile) {
  state.currentProfile = profile;
  saveState();
  currentProfileLabel.textContent =
    "Perfil: " + (profile ? profile.charAt(0).toUpperCase() + profile.slice(1) : "–");
}

profileCards.forEach((btn) => {
  btn.addEventListener("click", () => {
    const profile = btn.getAttribute("data-profile");
    applyProfile(profile);
    overlayEl.style.display = "none";
  });
});

// Restore cover overlay if no profile
if (state.currentProfile) {
  overlayEl.style.display = "none";
  applyProfile(state.currentProfile);
} else {
  overlayEl.style.display = "flex";
}

// Days together
function computeDaysTogether() {
  const start = new Date(2023, 1, 28); // 28 Feb 2023
  const now = new Date();
  const diffMs = now - start;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days;
}

function renderDaysTogether() {
  const days = computeDaysTogether();
  daysTogetherHero.textContent = days;
  daysTogetherMain.textContent = days;
}

// Enfados stats
function getCurrentMonthKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getLastMonthsLabelsAndData(n = 12) {
  const labels = [];
  const data = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const temp = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const y = temp.getFullYear();
    const m = String(temp.getMonth() + 1).padStart(2, "0");
    const key = `${y}-${m}`;
    const monthLabel = temp.toLocaleString("es-ES", { month: "short" });
    labels.push(monthLabel);
    data.push(state.angerByMonth[key] || 0);
  }
  return { labels, data };
}

function recomputeAngerTotals() {
  const year = new Date().getFullYear();
  let totalForYear = 0;
  let monthsWithData = 0;
  Object.entries(state.angerByMonth).forEach(([key, value]) => {
    if (key.startsWith(`${year}-`)) {
      totalForYear += value;
      monthsWithData += 1;
    }
  });

  const avg = monthsWithData ? totalForYear / monthsWithData : 0;
  return { totalForYear, avg };
}

function renderAngerStats() {
  const monthKey = getCurrentMonthKey();
  const current = state.angerByMonth[monthKey] || 0;
  angerThisMonthEl.textContent = current;

  const { labels, data } = getLastMonthsLabelsAndData(12);

  if (!angerChart) {
    const ctx = document.getElementById("angerChart").getContext("2d");
    angerChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Enfados por mes",
            data,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  } else {
    angerChart.data.labels = labels;
    angerChart.data.datasets[0].data = data;
    angerChart.update();
  }

  // Stats
  const { totalForYear, avg } = recomputeAngerTotals();
  angerYearTotalValue.textContent = totalForYear.toString();
  angerMonthlyAvgValue.textContent = avg.toFixed(1);
  totalEnfadosHero.textContent = totalForYear.toString();
  avgEnfadosBadge.textContent = avg.toFixed(1);

  const max = Math.max(...data);
  const min = Math.min(...data);
  angerTrendNote.textContent =
    "Máximo mensual: " + max + " enfados · Mínimo mensual: " + min + ".";
}

btnAddAnger.addEventListener("click", () => {
  const key = getCurrentMonthKey();
  state.angerByMonth[key] = (state.angerByMonth[key] || 0) + 1;
  saveState();
  renderAngerStats();
});

// Memories on map

let currentCountry = null;

document.querySelectorAll(".country-dot").forEach((dot) => {
  dot.addEventListener("click", () => {
    const country = dot.getAttribute("data-country");
    const isLocked = dot.classList.contains("locked");
    currentCountry = country;

    if (isLocked) {
      memoryText.textContent =
        "Este país está bloqueado. Primero tendréis que viajar allí para desbloquearlo.";
      memoryInput.value = "";
      memoryInput.disabled = true;
      return;
    }

    memoryInput.disabled = false;
    const existing = state.countryMemories[country] || "";
    memoryInput.value = existing;
    memoryText.textContent = existing
      ? "Recuerdo guardado para este país:"
      : "Escribe un recuerdo gracioso de este país y guárdalo.";
  });
});

btnSaveMemory.addEventListener("click", () => {
  if (!currentCountry) {
    alert("Primero selecciona un país visitado en el mapa.");
    return;
  }
  if (document.querySelector(`.country-dot[data-country="${currentCountry}"]`).classList.contains("locked")) {
    alert("Ese país está bloqueado. Tendréis que viajar primero.");
    return;
  }
  state.countryMemories[currentCountry] = memoryInput.value.trim();
  saveState();
  memoryText.textContent = "Recuerdo guardado ✅";
});

// Plan generator (simple local generator, no external calls)

const planTemplates = [
  (context) => `Plan chill en casa: pedir algo de comer, poner una peli que os encante y obligaros a dejar los móviles en otra habitación. Bonus: mini masaje al final para quien menos se haya enfadado este mes.`,
  (context) => `Plan de paseo: salir a caminar por la ciudad al atardecer, parar en un bar con terraza para una cerveza, y volver escuchando vuestra playlist (incluida “Niña, piensa en ti”).`,
  (context) => `Plan low-cost: preparar un picnic con cosas del súper, ir a un parque o mirador, hacer fotos ridículas (para futuras versiones de esta web) y volver comentando algún viaje futuro.`,
  (context) => `Plan viaje express: buscar un destino cercano en coche o tren, pasar el día pateando calles, probar un plato típico y comprar un recuerdo cutre pero obligatorio.`,
];

btnGeneratePlan.addEventListener("click", () => {
  const prompt = (planPrompt.value || "").toLowerCase();
  let chosen = planTemplates[Math.floor(Math.random() * planTemplates.length)];

  if (prompt.includes("playa")) {
    chosen = () => `Plan playa: pillar toalla, algo de comer, vuestra tabla de paddle y pasar el día enterito al sol. Al volver, ducha y cena fácil con música de Morat de fondo.`;
  } else if (prompt.includes("resaca")) {
    chosen = () => `Plan resaca: mantita, comida grasienta, cero planes exigentes. Solo series, siesta y quizá actualizar esta web con los nuevos KPIs de enfados de la noche anterior.`;
  } else if (prompt.includes("viaje")) {
    chosen = () => `Plan viaje: elegir una ciudad nueva, mirar vuelos baratos y montar una escapada de finde. Condición: en cada viaje hay que registrar un recuerdo gracioso en el mapa.`;
  }

  planOutput.textContent = chosen(prompt);
});

// Secret section tabs

secretTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.getAttribute("data-tab");

    // If trying to open secret tab from non-Silvia profile
    if (tabName === "gift" && state.currentProfile !== "silvia") {
      alert("Solo Silvia puede abrir esta pestaña (entra desde su perfil).");
      return;
    }

    secretTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    secretPanels.forEach((panel) => {
      if (panel.getAttribute("data-panel") === tabName) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });
  });
});

// Secret password form

if (secretForm) {
  secretForm.addEventListener("submit", (e) => {
    e.preventDefault();
    secretError.textContent = "";

    if (state.currentProfile !== "silvia") {
      secretError.textContent = "Esta parte solo se puede desbloquear desde el perfil de Silvia.";
      return;
    }

    const value = (secretPasswordInput.value || "").trim();
    if (value === SILVIA_SECRET_PASSWORD) {
      state.secretUnlockedForSilvia = true;
      saveState();
      renderSecretUnlocked();
    } else {
      secretError.textContent = "Contraseña incorrecta. Prueba otra vez.";
    }
  });
}

function renderSecretUnlocked() {
  if (!state.secretUnlockedForSilvia || !secretContent) return;
  secretContent.innerHTML = `
    <div class="bagpipe-wrapper">
      <img src="${BAGPIPE_GIF_URL}" alt="Señor con falda tocando la gaita" />
      <p>Prepárate, porque este regalo va de gaita, falda y probablemente lluvia: Escocia te espera. 🎁</p>
    </div>
  `;
}

// Initial render
renderDaysTogether();
renderAngerStats();
renderSecretUnlocked();
