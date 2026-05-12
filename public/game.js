const socket = io();

const room = JSON.parse(localStorage.getItem("currentRoom") || "{}");
const playerId = localStorage.getItem("playerId");

if (!room.code) {
  window.location.href = "lobby.html";
}

// DOM Elements
const roomNameEl = document.getElementById("room-name");
const playersList = document.getElementById("players-list");
const lastWordEl = document.getElementById("last-word");
const currentTurnEl = document.getElementById("current-turn");
const timerEl = document.getElementById("timer");
const wordInput = document.getElementById("word-input");
const submitBtn = document.getElementById("submit-word-btn");
const messageEl = document.getElementById("game-message");
const backBtn = document.getElementById("back-lobby-btn");
const toastContainer = document.getElementById("toast-container");
const gameOverModal = document.getElementById("game-over-modal");
const playAgainBtn = document.getElementById("play-again-btn");

roomNameEl.textContent = room.name || "Chainwords Arena";

let gameState = {
  players: room.players || [],
  lastWord: "-",
  currentTurnIndex: 0,
  timer: room.turnTime || 15,
  winner: null,
  status: "countdown", 
  countdown: 3         
};

// =========================
// TOAST NOTIFICATION (Pengganti Alert Error)
// =========================
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  
  // Hapus otomatis setelah 3 detik
  setTimeout(() => {
    if (toastContainer.contains(toast)) toast.remove();
  }, 3000);
}

// =========================
// CONNECT TO SOCKET
// =========================
socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("joinGame", {
    roomCode: room.code,
    playerId: playerId
  });
});

socket.on("gameState", (state) => {
  gameState = state;
  updateUI();
});

// Panggil showToast saat kata salah/sudah dipakai
socket.on("invalidMove", (message) => {
  showToast(message);
});

// Panggil Pop-up Modal saat game selesai
socket.on("gameOver", (winner) => {
  // Sortir pemain berdasarkan poin tertinggi
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  
  document.getElementById("winner-name-display").textContent = winner ? winner.name : "Seri!";
  
  // Bikin List Leaderboard
  document.getElementById("leaderboard-list").innerHTML = sortedPlayers.map((p, i) => `
    <div class="leaderboard-item ${i === 0 ? 'rank-1' : ''} ${p.id === playerId ? 'is-me' : ''}">
      <span>${i === 0 ? '👑' : `#${i+1}`} ${p.name} ${p.id === playerId ? '(Kamu)' : ''}</span>
      <span>${p.score} pts</span>
    </div>
  `).join("");
  
  // Tampilkan modal
  gameOverModal.classList.remove("hidden");
});

// Tutup modal dan kembali ke waiting room saat diklik
playAgainBtn.addEventListener("click", () => {
  gameOverModal.classList.add("hidden");
  window.location.href = "room.html";
});

// =========================
// SUBMIT WORD
// =========================
function submitWord() {
  const word = wordInput.value.trim().toLowerCase();
  if (!word) return;

  socket.emit("submitWord", {
    roomCode: room.code,
    word: word,
  });

  wordInput.value = "";
}

let previousWord = "";

// =========================
// UPDATE UI
// =========================
function updateUI() {
  playersList.innerHTML = gameState.players
    .map((player) => `
      <div class="player-card ${player.id === playerId ? "is-me" : ""}">
        <div class="name">
          ${player.name}${player.id === playerId ? " (Kamu)" : ""}
        </div>
        <div class="score">${player.score || 0} pts</div>
      </div>
    `)
    .join("");

  if (gameState.status === "countdown") {
    lastWordEl.textContent = "Menunggu...";
    currentTurnEl.textContent = `Mulai dalam ${gameState.countdown}`;
    currentTurnEl.style.color = "#ff8c42";
    timerEl.textContent = gameState.timer;
    timerEl.classList.remove("time-danger");
    
    wordInput.disabled = true;
    submitBtn.disabled = true;
    messageEl.textContent = "Siap-siap tangkas ngetik!";
    
  } else if (gameState.status === "playing") {
    
    if (gameState.lastWord !== previousWord && gameState.lastWord !== "-") {
      lastWordEl.classList.remove("word-pop");
      void lastWordEl.offsetWidth; 
      lastWordEl.classList.add("word-pop");
      previousWord = gameState.lastWord;
    }
    lastWordEl.textContent = gameState.lastWord || "-";

    currentTurnEl.textContent = "🔥 REBUTAN! 🔥";
    currentTurnEl.style.color = "#ff3b6f";
    
    timerEl.textContent = gameState.timer;
    if (gameState.timer <= 5 && gameState.timer > 0) {
      timerEl.classList.add("time-danger");
    } else {
      timerEl.classList.remove("time-danger");
    }
    
    wordInput.disabled = false;
    submitBtn.disabled = false;
    messageEl.textContent = "Ketik secepatnya sebelum keduluan!";
    
    // Auto fokus layar lebar, tapi matikan auto-fokus di HP biar keyboard gak nutupin UI terus-terusan
    if (window.innerWidth > 768 && document.activeElement !== wordInput) {
      wordInput.focus();
    }
    
  } else if (gameState.status === "finished" || gameState.winner) {
    lastWordEl.textContent = gameState.lastWord || "-";
    currentTurnEl.textContent = "SELESAI";
    timerEl.textContent = 0;
    timerEl.classList.remove("time-danger");
    
    wordInput.disabled = true;
    submitBtn.disabled = true;
    messageEl.textContent = ``;
  }
}

// =========================
// EVENTS
// =========================
submitBtn.addEventListener("click", submitWord);

wordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    submitWord();
  }
});

backBtn.addEventListener("click", () => {
  window.location.href = "room.html";
});

updateUI();

// =========================
// BACKGROUND MUSIC GAME 
// =========================
const gameVolume = parseFloat(localStorage.getItem("bgmVolume")) || 0.5;
const isGameMuted = localStorage.getItem("bgmMuted") === "true";

const bgmGame = new Audio("audio/game.mp3");
bgmGame.loop = true;
bgmGame.volume = isGameMuted ? 0 : gameVolume;

function attemptPlayGame() {
  if (!isGameMuted) {
    bgmGame.play().catch(e => {
      document.body.addEventListener("click", () => bgmGame.play(), { once: true });
    });
  }
}
attemptPlayGame();