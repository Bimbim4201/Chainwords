const socket = io();

// Ambil data identitas dan kode room dari memori lokal
const roomCode = localStorage.getItem("currentRoomCode");
const playerId = localStorage.getItem("playerId");
const playerName = localStorage.getItem("playerName");

// Cegah penyusup masuk langsung dari URL tanpa lewat Lobby
if (!roomCode || !playerId) {
  window.location.href = "lobby.html";
}

let currentPlayer = {
  id: playerId,
  name: playerName,
  isHost: false
};
let allPlayers = [];

// =========================
// DOM ELEMENTS
// =========================
const waitingRoomName = document.getElementById("waiting-room-name");
const roomCodeDisplay = document.getElementById("room-code-display");
const playerCountSpan = document.getElementById("player-count");
const maxPlayersDisplay = document.getElementById("max-players-display");
const roomTypeDisplay = document.getElementById("room-type-display");
const roomTypeIcon = document.getElementById("room-type-icon");
const roomCategoryDisplay = document.getElementById("room-category-display");
const turnTimeDisplay = document.getElementById("turn-time-display");
const winScoreDisplay = document.getElementById("win-score-display");
const playersGrid = document.getElementById("players-grid");
const hostControls = document.getElementById("host-controls");
const waitingMessage = document.getElementById("waiting-message");
const hostCategorySelect = document.getElementById("host-category-select");
const hostTurnTime = document.getElementById("host-turn-time");
const hostWinScore = document.getElementById("host-win-score");
const leaveRoomBtn = document.getElementById("leave-room-btn");
const forceStartBtn = document.getElementById("force-start-btn");
const updateSettingsBtn = document.getElementById("update-settings-btn");

function getCategoryDisplay(category) {
  const categories = {
    random: "🎲 Random", hewan: "🐾 Hewan", buah: "🍎 Buah",
    negara: "🌏 Negara", teknologi: "💻 Teknologi", umum: "📚 Umum",
  };
  return categories[category] || "🎲 Random";
}

// =========================
// SOCKET EVENT LISTENERS
// =========================
socket.on("connect", () => {
  // Langsung teriak ke server minta masuk room sesaat setelah halaman diload
  socket.emit("joinRoom", {
    code: roomCode,
    playerId: currentPlayer.id,
    playerName: currentPlayer.name,
  });
});

socket.on("roomUpdated", (room) => {
  allPlayers = room.players || [];
  currentPlayer.isHost = room.hostId === currentPlayer.id;

  // Update Teks Informasi Room
  waitingRoomName.textContent = room.name;
  roomCodeDisplay.textContent = room.code;
  playerCountSpan.textContent = allPlayers.length;
  maxPlayersDisplay.textContent = room.maxPlayers;
  // 🌟 TAMBAHAN: Update UI penanda Public/Private
      if (room.type === "private") {
        roomTypeDisplay.textContent = "Private";
        roomTypeIcon.className = "fas fa-lock";
      } else {
        roomTypeDisplay.textContent = "Public";
        roomTypeIcon.className = "fas fa-globe";
      }
  roomCategoryDisplay.textContent = getCategoryDisplay(room.category);
  turnTimeDisplay.textContent = room.turnTime;

  // Render Pemain di Layar
  playersGrid.innerHTML = allPlayers.map((player) => `
    <div class="player-card">
      <div class="player-avatar">🎮</div>
      <div class="player-name">${player.name}</div>
      ${player.isHost ? '<div class="player-badge"><i class="fas fa-crown"></i> Host</div>' : ""}
    </div>
  `).join("");

  // Munculkan / Sembunyikan Panel Host
  if (currentPlayer.isHost) {
    hostControls.classList.remove("hidden");
    waitingMessage.classList.add("hidden");
    hostCategorySelect.value = room.category;
    hostTurnTime.value = room.turnTime;
  } else {
    hostControls.classList.add("hidden");
    waitingMessage.classList.remove("hidden");
  }
});

socket.on("joinError", (message) => {
  alert(message);
  window.location.href = "lobby.html";
});

socket.on("gameStarted", (room) => {
  // Simpan detail room ke localstorage agar halaman game tahu sedang main di room mana
  localStorage.setItem("currentRoom", JSON.stringify(room));
  window.location.href = "game.html";
});

// =========================
// BUTTON EVENTS
// =========================
leaveRoomBtn.addEventListener("click", () => {
  // 🌟 UPDATE: Lapor ke server kalau kita pamit keluar!
  socket.emit("leaveRoom", { roomCode: roomCode, playerId: currentPlayer.id });
  window.location.href = "lobby.html";
});

forceStartBtn.addEventListener("click", () => {
  if (allPlayers.length < 2) {
    alert("Sabar, minimal 2 pemain buat mulai gas game-nya!");
    return;
  }
  socket.emit("startGame", roomCode);
});

updateSettingsBtn.addEventListener("click", () => {
  socket.emit("updateRoom", {
    roomCode: roomCode,
    category: hostCategorySelect.value,
    turnTime: parseInt(hostTurnTime.value)
  });
});

// =========================
// BACKGROUND MUSIC ROOM
// =========================
const roomVolume = parseFloat(localStorage.getItem("bgmVolume")) || 0.5;
const isRoomMuted = localStorage.getItem("bgmMuted") === "true";

const bgmRoom = new Audio("audio/room.mp3");
bgmRoom.loop = true;
bgmRoom.volume = isRoomMuted ? 0 : roomVolume;

// Teknik Autoplay Bypass
function attemptPlayRoom() {
  if (!isRoomMuted) {
    bgmRoom.play().catch(e => {
      console.log("Browser minta klik dulu biar lagu nyala...");
      document.body.addEventListener("click", () => bgmRoom.play(), { once: true });
    });
  }
}
attemptPlayRoom();