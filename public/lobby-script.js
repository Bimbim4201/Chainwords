const socket = io();

// Modern & Cheerful Lobby System
let availableRooms = { public: [], private: [] };
let currentTab = "public";
let searchTerm = "";

function generatePlayerId() {
  return "player_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

let currentPlayer = {
  id: localStorage.getItem("playerId") || generatePlayerId(),
  name: localStorage.getItem("playerName") || `Player${Math.floor(Math.random() * 1000)}`,
  isHost: false,
};

// Simpan setelah currentPlayer dibuat
localStorage.setItem("playerId", currentPlayer.id);
localStorage.setItem("playerName", currentPlayer.name);

function generateRoomCode() {
  return Math.floor(Math.random() * 900000 + 100000).toString();
}

// Helper functions for categories
function getCategoryDisplay(category) {
  const categories = {
    random: "🎲 Random", hewan: "🐾 Hewan", buah: "🍎 Buah",
    negara: "🌏 Negara", teknologi: "💻 Teknologi", umum: "📚 Umum",
  };
  return categories[category] || "🎲 Random";
}

// DOM Elements
const createRoomModal = document.getElementById("create-room-modal");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("join-room-btn");
const joinCodeInput = document.getElementById("join-code-input");
const confirmCreateBtn = document.getElementById("confirm-create-btn");
const cancelCreateBtn = document.getElementById("cancel-create-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const roomsContainer = document.getElementById("rooms-container");
const searchInput = document.getElementById("search-rooms");
const volumeSlider = document.getElementById("volume-slider");
const muteToggle = document.getElementById("mute-toggle");
const playerNameDisplay = document.getElementById("player-name-display");
const editNameBtn = document.getElementById("edit-name-btn");
const saveNameBtn = document.getElementById("save-name-btn");
const cancelNameBtn = document.getElementById("cancel-name-btn");
const newNameInput = document.getElementById("new-name-input");
const nameEditModal = document.getElementById("name-edit-modal");
const onlineCountEl = document.getElementById("online-count");
const activeGamesEl = document.getElementById("active-games");
const publicCountEl = document.getElementById("public-count");
const privateCountEl = document.getElementById("private-count");

// =========================
// SOUND & BACKGROUND MUSIC
// =========================
let currentVolume = parseFloat(localStorage.getItem("bgmVolume")) || 0.5;
let isMuted = localStorage.getItem("bgmMuted") === "true";

// Pakai link server test yang TIDAK DIBLOKIR browser. 
// NANTI GANTI DENGAN FILE LOKAL KAMU (contoh: "audio/lobby.mp3")
const bgmLobby = new Audio("audio/lobby.mp3");

// Kodingan ini wajib ada biar lagunya muter terus dan suaranya pas!
bgmLobby.loop = true;
bgmLobby.volume = isMuted ? 0 : currentVolume;

function playSound(type) {
  if (isMuted) return;
  // Tempat menaruh sound effect klik
}

// Pancing BGM menyala saat klik pertama
document.body.addEventListener("click", () => {
  if (!isMuted && bgmLobby.paused) {
    bgmLobby.play().catch(e => console.log("Menunggu interaksi user..."));
  }
}, { once: true });

// Sinkronkan UI Slider
if (volumeSlider) {
  volumeSlider.value = currentVolume * 100;
  document.getElementById("volume-value").innerText = Math.floor(currentVolume * 100) + "%";
}
if (isMuted && muteToggle) {
  muteToggle.querySelector("i").className = "fas fa-volume-mute";
}

// Event Slider Geser
if (volumeSlider) {
  volumeSlider.addEventListener("input", (e) => {
    currentVolume = e.target.value / 100;
    localStorage.setItem("bgmVolume", currentVolume);
    document.getElementById("volume-value").innerText = e.target.value + "%";
    
    if (!isMuted) {
      bgmLobby.volume = currentVolume;
      if (bgmLobby.paused) bgmLobby.play();
    }
  });
}

// Event Tombol Mute
if (muteToggle) {
  muteToggle.addEventListener("click", () => {
    isMuted = !isMuted;
    localStorage.setItem("bgmMuted", isMuted);
    
    const icon = muteToggle.querySelector("i");
    if (isMuted) {
      icon.className = "fas fa-volume-mute";
      bgmLobby.pause();
    } else {
      icon.className = "fas fa-volume-up";
      bgmLobby.volume = currentVolume;
      bgmLobby.play().catch(e => console.log("Gagal muter musik"));
    }
  });
}

// Initialize Particles
function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const particles = [];
  const particleCount = 60;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1, alpha: Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.5, speedY: (Math.random() - 0.5) * 0.3,
    });
  }

function animate() {
    // 🌟 OPTIMASI 1: Selalu panggil requestAnimationFrame di awal
    requestAnimationFrame(animate);

    // 🌟 OPTIMASI 2: Jika user pindah Tab browser, BERHENTIKAN ANIMASI! (Hemat Baterai & CPU)
    if (document.hidden) return; 

    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 140, 66, ${p.alpha})`;
      ctx.fill();

      p.x += p.speedX; p.y += p.speedY;
      if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
    }
  }
  animate();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function updateRoomCounts() {
  publicCountEl.textContent = availableRooms.public.length;
  privateCountEl.textContent = availableRooms.private.length;
}

function renderRooms() {
  let rooms = [];
  if (currentTab === "public") rooms = [...availableRooms.public];
  else if (currentTab === "private") rooms = [...availableRooms.private];

  if (searchTerm) {
    rooms = rooms.filter(
      (room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()) || room.code.includes(searchTerm)
    );
  }

  if (rooms.length === 0) {
    roomsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-door-open"></i>
        <p>Tidak ada room ditemukan</p>
        <p style="font-size: 12px;">Buat room baru atau coba kata kunci lain!</p>
      </div>`;
    return;
  }

  roomsContainer.innerHTML = rooms
    .map((room) => {
      const isFull = room.players >= room.maxPlayers;
      const isPrivate = room.type === "private"; // 🌟 Deteksi room private

      // 🌟 Atur tombol berdasarkan tipe dan kapasitas room
      let btnHTML = "";
      if (isPrivate) {
        // Tombol mati untuk room private
        btnHTML = `<button class="join-room-btn" style="background: #e0e0e8; color: #6a6a8a; cursor: not-allowed;" disabled><i class="fas fa-lock"></i> Gunakan Kode</button>`;
      } else if (isFull) {
        // Tombol mati untuk room penuh
        btnHTML = `<button class="join-room-btn" style="background: #ccc; cursor: not-allowed;" disabled>Penuh 🔒</button>`;
      } else {
        // Tombol normal untuk room public yang masih kosong
        btnHTML = `<button class="join-room-btn" data-code="${room.code}">Join <i class="fas fa-arrow-right"></i></button>`;
      }

      return `
      <div class="room-card" data-code="${room.code}">
        <div class="room-info">
          <h3>${room.name}</h3>
          <div class="room-tags">
            <span class="tag">${getCategoryDisplay(room.category)}</span>
            <span class="tag"><i class="fas fa-users"></i> ${room.players}/${room.maxPlayers}</span>
            <span class="tag"><i class="fas fa-clock"></i> ${room.turnTime}s</span>
          </div>
        </div>
        ${btnHTML}
      </div>`;
    })
    .join("");

  // Hapus event listener di card agar tidak bisa diklik kalau penuh
  document.querySelectorAll(".room-card").forEach((card) => {
    card.addEventListener("click", () => {
      const btn = card.querySelector(".join-room-btn");
      if (!btn.disabled) joinRoomByCode(card.dataset.code);
    });
  });

  document.querySelectorAll(".join-room-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!btn.disabled) joinRoomByCode(btn.dataset.code);
    });
  });
}

function joinRoomByCode(code) {
  const roomCode = (code || "").trim();
  if (!roomCode) {
    alert("Masukkan kode room!");
    return;
  }

  // 🌟 PERBAIKAN: Hapus kata trending di sini
  const allRooms = [...availableRooms.public, ...availableRooms.private];
  const targetRoom = allRooms.find(r => r.code === roomCode);
  
  if (targetRoom && targetRoom.players >= targetRoom.maxPlayers) {
     alert("Maaf, Room ini sudah penuh! 🔒");
     return;
  }

  localStorage.setItem("currentRoomCode", roomCode);
  window.location.href = "room.html";
}

function createRoom() {
  const roomName = document.getElementById("room-name-input").value.trim();
  const modeElem = document.querySelector(".type-card.active");
  const mode = modeElem ? modeElem.dataset.mode : "public";
  const limitElem = document.querySelector(".player-opt.active");
  const maxPlayers = limitElem ? parseInt(limitElem.dataset.limit) : 4;
  const category = document.getElementById("room-category").value;
  const turnTime = parseInt(document.getElementById("turn-time").value);
  const winScore = 0;

  const roomCode = generateRoomCode();

  socket.emit("createRoom", {
    code: roomCode,
    name: roomName || `Room ${roomCode}`,
    type: mode,
    maxPlayers: maxPlayers,
    category: category,
    turnTime: turnTime,
    winScore: winScore,
    hostId: currentPlayer.id,
    hostName: currentPlayer.name,
  });

  document.getElementById("room-name-input").value = "";
  document.getElementById("room-category").value = "random";
  playSound("create");
}

function updateStats() {
  const online = Math.floor(Math.random() * 100) + 100;
  const activeGames = availableRooms.public.length + availableRooms.private.length;
  onlineCountEl.textContent = online;
  activeGamesEl.textContent = activeGames;
}

// Event Listeners
createRoomBtn.addEventListener("click", () => createRoomModal.classList.remove("hidden"));
cancelCreateBtn.addEventListener("click", () => createRoomModal.classList.add("hidden"));
closeModalBtn.addEventListener("click", () => createRoomModal.classList.add("hidden"));
confirmCreateBtn.addEventListener("click", createRoom);

joinRoomBtn.addEventListener("click", () => {
  const code = joinCodeInput.value.trim();
  if (code) { joinRoomByCode(code); joinCodeInput.value = ""; } 
  else alert("Masukkan kode room!");
});

editNameBtn.addEventListener("click", () => {
  newNameInput.value = currentPlayer.name;
  nameEditModal.classList.remove("hidden");
});
cancelNameBtn.addEventListener("click", () => nameEditModal.classList.add("hidden"));
saveNameBtn.addEventListener("click", () => {
  const newName = newNameInput.value.trim();
  if (newName) {
    currentPlayer.name = newName;
    playerNameDisplay.textContent = newName;
    localStorage.setItem("playerName", newName);
    nameEditModal.classList.add("hidden");
    playSound("click");
  }
});



// 🌟 OPTIMASI: Teknik "Debounce"
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  // Hapus hitung mundur sebelumnya kalau user masih ngetik
  clearTimeout(searchTimeout);
  
  // Tunggu 300ms setelah user BERHENTI ngetik, baru render ulang HTML-nya
  searchTimeout = setTimeout(() => {
    searchTerm = e.target.value;
    renderRooms();
  }, 300);
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    renderRooms();
  });
});

document.querySelectorAll(".type-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".type-card").forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
  });
});

document.querySelectorAll(".player-opt").forEach((opt) => {
  opt.addEventListener("click", () => {
    document.querySelectorAll(".player-opt").forEach((o) => o.classList.remove("active"));
    opt.classList.add("active");
  });
});

function init() {
  initParticles();
  renderRooms();
  playerNameDisplay.textContent = currentPlayer.name;

}

// SOCKET EVENTS
socket.on("roomCreated", (room) => {
  createRoomModal.classList.add("hidden");
  localStorage.setItem("currentRoomCode", room.code);
  window.location.href = "room.html";
});

// 🌟 TAMBAHAN: Tangkap data real-time dari server
socket.on("updateStats", (stats) => {
  onlineCountEl.textContent = stats.online;
  activeGamesEl.textContent = stats.activeGames;
});

socket.on("roomsList", (serverRooms) => {
  availableRooms = { public: [], private: [] }; // 🌟 Hapus trending
  serverRooms.forEach((room) => {
    const roomData = {
      id: room.code, name: room.name, code: room.code, type: room.type || "public",
      players: room.players.length, maxPlayers: room.maxPlayers,
      category: room.category, host: room.hostName, turnTime: room.turnTime, winScore: room.winScore,
    };
    if (roomData.type === "public") availableRooms.public.push(roomData);
    else if (roomData.type === "private") availableRooms.private.push(roomData);
    // 🌟 Baris "else availableRooms.trending" dihapus
  });
  updateRoomCounts();
  renderRooms();
});

init();