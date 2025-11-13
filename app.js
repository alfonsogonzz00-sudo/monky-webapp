
// Global constants
const STORAGE_KEY = "silviaDashboardState_v3";
const RELATION_START_DATE = new Date(2023, 1, 28); // 28 Feb 2023
const SILVIA_BIRTHDATE = new Date(1999, 10, 14); // 14 Nov 1999 (mes 10 = noviembre)
const TOTAL_TRIPS_SO_FAR = 7;

// Doctor
const GUARDIAS_START_DATE = new Date(2024, 4, 1); // mayo 2024
const GUARDIAS_PER_MONTH = 6.3;
const GUARDIAS_PER_LIFE = 2.9;

// Wardrobe values
const WARDROBE_VALUES = {
  tops: 6,
  camisetas: 7,
  bolsos: 22,
  zapatos: 30,
  botas: 25,
  zapatillas: 60,
  blusas: 6,
  jerseys: 10,
  chaquetas: 30,
  faldas: 15,
  monos: 12,
  abrigos: 50,
  pantalones: 12,
  vaqueros: 12,
};

const WARDROBE_LABELS = {
  tops: "Tops",
  camisetas: "Camisetas",
  bolsos: "Bolsos",
  zapatos: "Zapatos",
  botas: "Botas",
  zapatillas: "Zapatillas",
  blusas: "Blusas",
  jerseys: "Jerseys",
  chaquetas: "Chaquetas",
  faldas: "Faldas",
  monos: "Monos",
  abrigos: "Abrigos",
  pantalones: "Pantalones",
  vaqueros: "Vaqueros",
};

// Restaurants in Córdoba (manually defined)
const cordobaRestaurants = [
  {
    name: "Pasta & Basta",
    lat: 37.8847,
    lng: -4.7811,
    address: "Zona centro · Carbonara clásica cremosa",
  },
  {
    name: "Trattoria Mezquita",
    lat: 37.8785,
    lng: -4.7793,
    address: "Cerca de la Mezquita · Pasta fresca y carbonara top",
  },
  {
    name: "Carbonara House",
    lat: 37.891,
    lng: -4.776,
    address: "Av. Gran Capitán · Especialistas en pasta",
  },
  {
    name: "La Tavola Cordobesa",
    lat: 37.888,
    lng: -4.772,
    address: "Zona Ribera · Carta italiana con buena carbonara",
  },
];

// State model
const initialState = {
  currentProfile: null,
  // angerByMonth: { "YYYY-MM": number }
  angerByMonth: {},
  // world map memories
  countryMemories: {},
  // counters
  countSilviaRazon: 0,
  countAlfonsoRazon: 0,
  countCarbonara: 0,
  // operations per month: { "YYYY-MM": number }
  opsByMonth: {},
  // wardrobe counts: { category: number }
  wardrobeCounts: {},
  // vouchers: structure { type: { total: 3, used: [false, false, false] } }
  vouchers: {},
};

let state = loadState();

// ------ State persistence ------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = { ...initialState };
      seedAnger(seeded);
      seedWardrobe(seeded);
      seedVouchers(seeded);
      seedOperations(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw);
    // Ensure required sub-objects
    parsed.angerByMonth = parsed.angerByMonth || {};
    parsed.countryMemories = parsed.countryMemories || {};
    parsed.opsByMonth = parsed.opsByMonth || {};
    parsed.wardrobeCounts = parsed.wardrobeCounts || {};
    parsed.vouchers = parsed.vouchers || {};
    seedAnger(parsed);
    seedWardrobe(parsed);
    seedVouchers(parsed);
    seedOperations(parsed);
    return parsed;
  } catch (e) {
    console.error("Error loading state", e);
    const seeded = { ...initialState };
    seedAnger(seeded);
    seedWardrobe(seeded);
    seedVouchers(seeded);
    seedOperations(seeded);
    return seeded;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving state", e);
  }
}

// Seed anger months with given values if empty
function seedAnger(s) {
  if (Object.keys(s.angerByMonth).length > 0) return;
  const now = new Date();
  const baseYear = now.getFullYear();
  const values = [48, 79, 33, 54, 55, 32, 76, 23, 78, 32, 23]; // Jan–Nov
  values.forEach((v, idx) => {
    const month = (idx + 1).toString().padStart(2, "0");
    const key = `${baseYear}-${month}`;
    s.angerByMonth[key] = v;
  });
}

// Seed wardrobe with random counts if empty
function seedWardrobe(s) {
  if (Object.keys(s.wardrobeCounts).length > 0) return;
  Object.keys(WARDROBE_VALUES).forEach((key) => {
    const baseMin = 5;
    const baseMax = 40;
    const n = baseMin + Math.floor(Math.random() * (baseMax - baseMin + 1));
    s.wardrobeCounts[key] = n;
  });
}

// Seed vouchers
function seedVouchers(s) {
  if (Object.keys(s.vouchers).length > 0) return;
  s.vouchers = {
    carbonara: { label: "Alfonso tiene que hacerme pasta carbonara", used: [false, false, false] },
    masaje: { label: "Alfonso tiene que hacerme un masaje", used: [false, false, false] },
    brunch: { label: "Alfonso tiene que venir conmigo de brunch", used: [false, false, false] },
  };
}

// Seed operations per month
function seedOperations(s) {
  if (Object.keys(s.opsByMonth).length > 0) return;
  const now = new Date();
  let y = GUARDIAS_START_DATE.getFullYear();
  let m = GUARDIAS_START_DATE.getMonth(); // 0-based
  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth())) {
    const monthKey = `${y}-${String(m + 1).padStart(2, "0")}`;
    const val = 3 + Math.floor(Math.random() * 4); // 3–6
    s.opsByMonth[monthKey] = val;
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
}

// ------ Utility functions ------
function getCurrentMonthKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function daysBetween(a, b) {
  const diff = b.getTime() - a.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function computeDaysTogether() {
  const now = new Date();
  return daysBetween(RELATION_START_DATE, now);
}

function computeAge(dob) {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function getLabelMonthShort(date) {
  return date.toLocaleString("es-ES", { month: "short" });
}

// ------ Profile handling ------
const overlayEl = document.getElementById("profileOverlay");
const profileCards = document.querySelectorAll(".profile-card");
const currentProfileLabel = document.getElementById("currentProfileLabel");
const bodyEl = document.body;
const btnLogout = document.getElementById("btnLogout");

function applyProfile(profile) {
  state.currentProfile = profile;
  saveState();
  currentProfileLabel.textContent =
    "Perfil: " + (profile ? profile.charAt(0).toUpperCase() + profile.slice(1) : "–");

  if (profile === "silvia") {
    bodyEl.classList.add("silvia-mode");
  } else {
    bodyEl.classList.remove("silvia-mode");
  }
}

profileCards.forEach((btn) => {
  btn.addEventListener("click", () => {
    const profile = btn.getAttribute("data-profile");
    applyProfile(profile);
    overlayEl.style.display = "none";
  });
});

btnLogout.addEventListener("click", () => {
  state.currentProfile = null;
  saveState();
  overlayEl.style.display = "flex";
  currentProfileLabel.textContent = "Perfil: –";
});

// Restore profile if exists
if (state.currentProfile) {
  overlayEl.style.display = "none";
  applyProfile(state.currentProfile);
} else {
  overlayEl.style.display = "flex";
}

// ------ Enfados & relation KPIs ------
let angerChart;
let viajesChart;

function getLastMonthsLabelsAndData(n = 12) {
  const labels = [];
  const data = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const key = `${y}-${m}`;
    labels.push(getLabelMonthShort(d));
    data.push(state.angerByMonth[key] || 0);
  }
  return { labels, data };
}

function recomputeAngerTotals() {
  const year = new Date().getFullYear();
  let totalForYear = 0;
  let monthsWithData = 0;
  Object.entries(state.angerByMonth).forEach(([key, value]) => {
    if (key.startsWith(year + "-")) {
      totalForYear += value;
      monthsWithData += 1;
    }
  });
  const allTotal = Object.values(state.angerByMonth).reduce((acc, v) => acc + v, 0);
  const daysTogether = computeDaysTogether();
  const dailyAvg = daysTogether ? allTotal / daysTogether : 0;
  const monthlyAvg = monthsWithData ? totalForYear / monthsWithData : 0;
  return { totalForYear, allTotal, monthlyAvg, dailyAvg };
}

function renderEnfados() {
  const monthKey = getCurrentMonthKey();
  const current = state.angerByMonth[monthKey] || 0;
  const angerThisMonthEl = document.getElementById("angerThisMonth");
  const angerYearTotalValue = document.getElementById("angerYearTotalValue");
  const angerMonthlyAvgValue = document.getElementById("angerMonthlyAvgValue");
  const angerDailyAvgValue = document.getElementById("angerDailyAvgValue");
  const totalEnfadosHero = document.getElementById("totalEnfadosHero");
  const avgEnfadosDiaHero = document.getElementById("avgEnfadosDiaHero");
  const angerTrendNote = document.getElementById("angerTrendNote");

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
            data,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
  } else {
    angerChart.data.labels = labels;
    angerChart.data.datasets[0].data = data;
    angerChart.update();
  }

  const { totalForYear, allTotal, monthlyAvg, dailyAvg } = recomputeAngerTotals();
  angerYearTotalValue.textContent = totalForYear.toString();
  angerMonthlyAvgValue.textContent = monthlyAvg.toFixed(1);
  angerDailyAvgValue.textContent = dailyAvg.toFixed(3);
  totalEnfadosHero.textContent = allTotal.toString();
  avgEnfadosDiaHero.textContent = dailyAvg.toFixed(3);

  const max = Math.max(...data);
  const min = Math.min(...data);
  angerTrendNote.textContent =
    "Máximo mensual: " + max + " enfados · Mínimo mensual: " + min + ".";
}

const btnAddAnger = document.getElementById("btnAddAnger");
btnAddAnger.addEventListener("click", () => {
  if (state.currentProfile !== "alfonso") return;
  const key = getCurrentMonthKey();
  state.angerByMonth[key] = (state.angerByMonth[key] || 0) + 1;
  saveState();
  renderEnfados();
});

// Days together & travel stats
function renderBaseRelationStats() {
  const days = computeDaysTogether();
  document.getElementById("daysTogetherHero").textContent = days;
  document.getElementById("daysTogether").textContent = days;
  document.getElementById("viajesTotales").textContent = TOTAL_TRIPS_SO_FAR;

  const yearsTogether = days / 365;
  const tripsPerYear = yearsTogether ? TOTAL_TRIPS_SO_FAR / yearsTogether : 0;
  document.getElementById("viajesPorAnio").textContent = tripsPerYear.toFixed(2);

  const ageNow = computeAge(SILVIA_BIRTHDATE);
  const yearsRemaining = 90 - ageNow;
  const projectedTripsAdditional = yearsRemaining * tripsPerYear;
  const projectedTotal = TOTAL_TRIPS_SO_FAR + projectedTripsAdditional;
  document.getElementById("viajes90Value").textContent = projectedTotal.toFixed(0);

  // Build viajesChart
  const labels = [];
  const data = [];
  let currentAge = ageNow;
  let cumulativeTrips = TOTAL_TRIPS_SO_FAR;
  labels.push(currentAge.toString());
  data.push(cumulativeTrips);
  for (let age = currentAge + 5; age <= 90; age += 5) {
    const yearsDelta = age - currentAge;
    const futureTrips = tripsPerYear * yearsDelta;
    labels.push(age.toString());
    data.push((TOTAL_TRIPS_SO_FAR + futureTrips).toFixed(1));
  }

  const ctx = document.getElementById("viajesChart").getContext("2d");
  if (viajesChart) {
    viajesChart.destroy();
  }
  viajesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// ------ Leaflet maps & memories ------
let worldMap, cordobaMap;
let currentCountry = null;
const memoryText = document.getElementById("memoryText");
const memoryInput = document.getElementById("memoryInput");
const btnSaveMemory = document.getElementById("btnSaveMemory");

const visitedCountries = [
  { code: "ES", name: "España", lat: 40.0, lng: -3.7 },
  { code: "MA", name: "Marruecos (Tánger)", lat: 35.78, lng: -5.81 },
  { code: "PT", name: "Portugal", lat: 38.7, lng: -9.1 },
  { code: "IT", name: "Italia", lat: 41.9, lng: 12.5 },
  { code: "PL", name: "Polonia", lat: 52.2, lng: 21.0 },
  { code: "CZ", name: "República Checa", lat: 50.1, lng: 14.4 },
  { code: "HU", name: "Hungría", lat: 47.5, lng: 19.0 },
];

const lockedCountries = [
  { code: "US", name: "Estados Unidos", lat: 40.7, lng: -74.0 },
  { code: "JP", name: "Japón", lat: 35.7, lng: 139.7 },
  { code: "BR", name: "Brasil", lat: -22.9, lng: -43.2 },
  { code: "AU", name: "Australia", lat: -33.8, lng: 151.2 },
];

function initWorldMap() {
  worldMap = L.map("worldMap", { zoomControl: false }).setView([25, 5], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 5,
  }).addTo(worldMap);

  visitedCountries.forEach((c) => {
    const marker = L.circleMarker([c.lat, c.lng], {
      radius: 7,
      color: "#1d4ed8",
      fillColor: "#f97316",
      fillOpacity: 0.9,
    }).addTo(worldMap);
    marker.bindTooltip(c.name);
    marker.on("click", () => {
      currentCountry = c.code;
      const existing = state.countryMemories[currentCountry] || "";
      memoryInput.disabled = false;
      memoryInput.value = existing;
      memoryText.textContent = existing
        ? "Recuerdo guardado para este país:"
        : "Escribe un recuerdo gracioso de este país y guárdalo.";
    });
  });

  lockedCountries.forEach((c) => {
    const marker = L.circleMarker([c.lat, c.lng], {
      radius: 6,
      color: "#111827",
      fillColor: "#111827",
      fillOpacity: 0.7,
    }).addTo(worldMap);
    marker.bindTooltip(c.name + " (bloqueado)");
    marker.on("click", () => {
      currentCountry = null;
      memoryInput.disabled = true;
      memoryInput.value = "";
      memoryText.textContent =
        "Este país está bloqueado. Primero tendréis que viajar allí para desbloquearlo.";
    });
  });
}

btnSaveMemory.addEventListener("click", () => {
  if (!currentCountry) {
    alert("Selecciona primero un país visitado en el mapa.");
    return;
  }
  state.countryMemories[currentCountry] = memoryInput.value.trim();
  saveState();
  memoryText.textContent = "Recuerdo guardado ✅";
});

// Córdoba map
function initCordobaMap() {
  cordobaMap = L.map("cordobaMap", { zoomControl: true }).setView(
    [37.8882, -4.7794],
    13
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(cordobaMap);

  const listEl = document.getElementById("restaurantList");
  listEl.innerHTML = "";

  cordobaRestaurants.forEach((r) => {
    const marker = L.marker([r.lat, r.lng]).addTo(cordobaMap);
    marker.bindPopup(r.name);

    const li = document.createElement("li");
    li.className = "restaurant-item";
    li.innerHTML =
      '<div class="restaurant-name">' +
      r.name +
      "</div>" +
      '<div class="restaurant-address">' +
      r.address +
      "</div>";
    listEl.appendChild(li);
  });
}

// ------ Guardias & operaciones ------
function monthsBetweenInclusive(start, end) {
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  if (months < 0) months = 0;
  return months;
}

function renderGuardias() {
  const now = new Date();
  const months = monthsBetweenInclusive(GUARDIAS_START_DATE, now);
  const totalGuardias = months * GUARDIAS_PER_MONTH;
  const vidas = totalGuardias / GUARDIAS_PER_LIFE;

  document.getElementById("totalGuardias").textContent = totalGuardias.toFixed(0);
  document.getElementById("vidasSalvadas").textContent = vidas.toFixed(0) + " vidas";
}

function renderOperations() {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
  if (!state.opsByMonth[currentKey]) {
    state.opsByMonth[currentKey] = 3 + Math.floor(Math.random() * 4);
  }
  const thisMonth = state.opsByMonth[currentKey];
  const total = Object.values(state.opsByMonth).reduce(
    (acc, v) => acc + (v || 0),
    0
  );
  document.getElementById("opsMesActual").textContent = thisMonth;
  document.getElementById("opsTotal").textContent = total;
}

document.getElementById("btnOpsPlus").addEventListener("click", () => {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  state.opsByMonth[key] = (state.opsByMonth[key] || 0) + 1;
  saveState();
  renderOperations();
});

document.getElementById("btnOpsMinus").addEventListener("click", () => {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  state.opsByMonth[key] = Math.max((state.opsByMonth[key] || 0) - 1, 0);
  saveState();
  renderOperations();
});

// ------ Counters: razón & carbonara ------
const countSilviaRazonEl = document.getElementById("countSilviaRazon");
const countAlfonsoRazonEl = document.getElementById("countAlfonsoRazon");
const countCarbonaraEl = document.getElementById("countCarbonara");

function renderCounters() {
  countSilviaRazonEl.textContent = state.countSilviaRazon || 0;
  countAlfonsoRazonEl.textContent = state.countAlfonsoRazon || 0;
  countCarbonaraEl.textContent = state.countCarbonara || 0;
}

document.getElementById("btnSilviaRazon").addEventListener("click", () => {
  state.countSilviaRazon = (state.countSilviaRazon || 0) + 1;
  saveState();
  renderCounters();
});

document.getElementById("btnAlfonsoRazon").addEventListener("click", () => {
  state.countAlfonsoRazon = (state.countAlfonsoRazon || 0) + 1;
  saveState();
  renderCounters();
});

document.getElementById("btnCarbonara").addEventListener("click", () => {
  state.countCarbonara = (state.countCarbonara || 0) + 1;
  saveState();
  renderCounters();
});

// ------ Wardrobe panel ------
function computeWardrobeTotal() {
  let total = 0;
  Object.keys(WARDROBE_VALUES).forEach((key) => {
    const count = state.wardrobeCounts[key] || 0;
    total += count * WARDROBE_VALUES[key];
  });
  return total;
}

function renderWardrobe() {
  const grid = document.getElementById("wardrobeGrid");
  grid.innerHTML = "";
  Object.keys(WARDROBE_VALUES).forEach((key) => {
    const item = document.createElement("div");
    item.className = "wardrobe-item";
    const label = WARDROBE_LABELS[key] || key;
    const count = state.wardrobeCounts[key] || 0;
    item.innerHTML = `
      <span>${label}</span>
      <div class="wardrobe-controls">
        <span>${count}</span>
        <button class="edit-only" data-action="minus" data-key="${key}">-</button>
        <button class="edit-only" data-action="plus" data-key="${key}">+</button>
      </div>
    `;
    grid.appendChild(item);
  });

  const total = computeWardrobeTotal();
  document.getElementById("wardrobeTotal").textContent = total.toFixed(0) + " €";

  // Attach events
  grid.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      const action = btn.getAttribute("data-action");
      if (!state.wardrobeCounts[key]) state.wardrobeCounts[key] = 0;
      if (action === "plus") {
        state.wardrobeCounts[key] += 1;
      } else if (action === "minus") {
        state.wardrobeCounts[key] = Math.max(0, state.wardrobeCounts[key] - 1);
      }
      saveState();
      renderWardrobe();
    });
  });
}

// ------ Songs with Spotify link ------
const songsData = [
  {
    title: "Niña, piensa en ti",
    artist: "Los Caños",
    tag: "Favorita de Silvia",
    url: "https://open.spotify.com/search/ni%C3%B1a%20piensa%20en%20ti%20los%20ca%C3%B1os",
  },
  {
    title: "Te entiendo",
    artist: "Pignoise",
    tag: "",
    url: "https://open.spotify.com/search/te%20entiendo%20pignoise",
  },
  {
    title: "Estoy enfermo",
    artist: "Pignoise",
    tag: "",
    url: "https://open.spotify.com/search/estoy%20enfermo%20pignoise",
  },
  {
    title: "Cómo te atreves",
    artist: "Morat",
    tag: "",
    url: "https://open.spotify.com/search/c%C3%B3mo%20te%20atreves%20morat",
  },
  {
    title: "Besos en guerra",
    artist: "Morat",
    tag: "",
    url: "https://open.spotify.com/search/besos%20en%20guerra%20morat",
  },
];

function renderSongs() {
  const list = document.getElementById("songList");
  list.innerHTML = "";
  songsData.forEach((song) => {
    const li = document.createElement("li");
    li.innerHTML =
      '<span class="song-title">' +
      song.title +
      "</span>" +
      '<span class="song-artist">' +
      song.artist +
      (song.tag ? " · " + song.tag : "") +
      "</span>" +
      '<span class="song-play-btn"><a class="btn btn-secondary" target="_blank" rel="noreferrer" href="' +
      song.url +
      '">Escuchar</a></span>';
    list.appendChild(li);
  });
}

// ------ Gallery with animation ------
function initGallery() {
  const mainImg = document.getElementById("galleryMainImage");
  const thumbs = document.querySelectorAll(".gallery-thumb");
  if (!thumbs.length) return;

  let currentIndex = 0;

  function setActive(index) {
    currentIndex = index;
    const thumb = thumbs[index];
    if (!thumb) return;
    mainImg.src = thumb.src;
    mainImg.classList.remove("active-zoom");
    void mainImg.offsetWidth;
    mainImg.classList.add("active-zoom");
    thumbs.forEach((t) => t.classList.remove("active"));
    thumb.classList.add("active");
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const idx = parseInt(thumb.getAttribute("data-index"), 10) || 0;
      setActive(idx);
    });
  });

  setActive(0);

  setInterval(() => {
    const nextIndex = (currentIndex + 1) % thumbs.length;
    setActive(nextIndex);
  }, 7000);
}

// ------ Smart plan generator ------
const climaSelect = document.getElementById("climaSelect");
const dineroSelect = document.getElementById("dineroSelect");
const momentoSelect = document.getElementById("momentoSelect");
const lugarSelect = document.getElementById("lugarSelect");
const extraPrompt = document.getElementById("extraPrompt");
const btnGenerateSmartPlan = document.getElementById("btnGenerateSmartPlan");
const smartPlanOutput = document.getElementById("smartPlanOutput");

btnGenerateSmartPlan.addEventListener("click", () => {
  const clima = climaSelect.value;
  const dinero = dineroSelect.value;
  const momento = momentoSelect.value;
  const lugar = lugarSelect.value;
  const extra = (extraPrompt.value || "").toLowerCase();

  let plan = "";

  if (lugar === "casa" && clima === "lluvioso") {
    if (dinero === "bajo") {
      plan =
        "Plan lluvia en casa: pijama, peli, algo fácil de cocinar y sesión de comentarios absurdos sobre lo que veis. Si entra hambre seria, toca pasta carbonara casera.";
    } else {
      plan =
        "Noche de lluvia con comida a domicilio, manta y vuestra playlist sonando de fondo. De postre, cada uno cuenta un recuerdo gracioso de un viaje.";
    }
  } else if (lugar === "fuera" && clima === "soleado" && momento === "tarde") {
    plan =
      "Tarde de paseo por la ciudad, parada en terraza con cerveza, luego helado o algo dulce y terminar viendo el atardecer en un sitio bonito. Ideal para fotos nuevas para esta web.";
  } else if (lugar === "fuera" && clima === "soleado" && momento === "dia") {
    plan =
      "Día entero fuera: excursión a un pueblo cercano o zona de naturaleza, comer allí, hacer fotos y guardar un recuerdo nuevo en el mapa de viajes.";
  } else if (lugar === "fuera" && clima === "nublado") {
    plan =
      "Plan nublado pero activo: visitar museo, barrio bonito o zona nueva de la ciudad, terminar en un sitio con buena pasta o brunch, según lo que os apetezca.";
  } else if (lugar === "casa" && momento === "noche") {
    plan =
      "Noche en casa: cena sencilla, luces bajas, velas si os venís arriba, música y charla de repaso de la semana. Al final podéis actualizar los KPIs de razón y carbonara.";
  } else {
    plan =
      "Plan comodín: salir a pasear sin rumbo fijo, decidir sobre la marcha si acabáis en bar, en casa con peli o en algún sitio nuevo. La única norma: cero prisa.";
  }

  if (extra.includes("carbonara")) {
    plan +=
      " Además, este plan obliga a que en algún momento del día entre una buena ración de pasta carbonara, ya sea en casa o fuera.";
  }

  smartPlanOutput.textContent = plan;
});

// ------ Vouchers ------
function renderVouchers() {
  const grid = document.getElementById("voucherGrid");
  grid.innerHTML = "";

  Object.entries(state.vouchers).forEach(([key, data]) => {
    const card = document.createElement("div");
    card.className = "voucher-card";
    card.innerHTML =
      '<div class="voucher-title">' +
      data.label +
      "</div>" +
      '<ul class="voucher-list">' +
      data.used
        .map((used, idx) => {
          return (
            '<li class="voucher-item' +
            (used ? " used" : "") +
            '">' +
            "<span>Vale " +
            (idx + 1) +
            "</span>" +
            '<button class="btn btn-secondary edit-only" data-type="' +
            key +
            '" data-index="' +
            idx +
            '"' +
            (used ? " disabled" : "") +
            ">Canjear</button>" +
            "</li>"
          );
        })
        .join("") +
      "</ul>";
    grid.appendChild(card);
  });

  grid.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      const idx = parseInt(btn.getAttribute("data-index"), 10);
      if (!state.vouchers[type]) return;
      state.vouchers[type].used[idx] = true;
      saveState();
      renderVouchers();
    });
  });
}

// ------ Secret section ------
const secretTabs = document.querySelectorAll(".secret-tab");
const secretPanels = document.querySelectorAll(".secret-panel");
const secretForm = document.getElementById("secretForm");
const secretPasswordInput = document.getElementById("secretPassword");
const secretError = document.getElementById("secretError");
const secretContent = document.getElementById("secretContent");

secretTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.getAttribute("data-tab");

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

function renderSecretUnlocked() {
  if (!secretContent) return;
  if (!state.secretUnlockedForSilvia) return;

  secretContent.innerHTML =
    '<div class="bagpipe-wrapper">' +
    '<img src="' +
    BAGPIPE_GIF_URL +
    '" alt="Señor con falda tocando la gaita" />' +
    '<a href="' +
    SECRET_PLAYLIST_URL +
    '" target="_blank" rel="noreferrer">' +
    "https://open.spotify.com/playlist/5k5sKkmrfaPn3MauHrYboM?si=RmnWV4SMRi6G9smZp_RNOw&pi=zw5Lx11yTmqFF" +
    "</a>" +
    "</div>";
}

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

// ------ Init ------
window.addEventListener("load", () => {
  renderEnfados();
  renderBaseRelationStats();
  renderGuardias();
  renderOperations();
  renderCounters();
  renderWardrobe();
  renderSongs();
  initGallery();
  renderVouchers();
  initWorldMap();
  initCordobaMap();
  renderSecretUnlocked();
});
