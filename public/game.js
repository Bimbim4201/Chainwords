const socket = io();

const room = JSON.parse(localStorage.getItem("currentRoom") || "{}");
const playerId = localStorage.getItem("playerId");

if (!room.code) {
  window.location.href = "lobby.html";
}

// DOM Elements
const roomNameEl = document.getElementById("room-name");
const targetScoreEl = document.getElementById("target-score");
const playersList = document.getElementById("players-list");
const lastWordEl = document.getElementById("last-word");
const currentTurnEl = document.getElementById("current-turn");
const timerEl = document.getElementById("timer");
const wordInput = document.getElementById("word-input");
const submitBtn = document.getElementById("submit-word-btn");
const messageEl = document.getElementById("game-message");
const backBtn = document.getElementById("back-lobby-btn");

roomNameEl.textContent = room.name || "Chainwords Arena";
targetScoreEl.textContent = `${room.winScore || 20} pts`;

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
// CONNECT TO SOCKET
// =========================
socket.on("connect", () => {
  console.log("Connected:", socket.id);
  // Gabungkan pemanggilan joinGame cukup satu kali di sini beserta playerId-nya
  socket.emit("joinGame", {
    roomCode: room.code,
    playerId: playerId
  });
});

socket.on("gameState", (state) => {
  gameState = state;
  updateUI();
});

socket.on("invalidMove", (message) => {
  alert(message);
});

socket.on("gameOver", (winner) => {
  alert(`🏆 ${winner.name} menang dengan ${winner.score} poin!`);
});

// =========================
// SUBMIT WORD
// =========================
function submitWord() {
  const word = wordInput.value.trim().toLowerCase();
  if (!word) return;

  socket.emit("submitWord", {
    roomCode: room.code,
    word: word, // Cukup kirim word dan roomCode, tidak perlu kirim playerId (server tau dari socket id)
  });

  wordInput.value = "";
}


// Variable untuk mendeteksi perubahan kata
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
    
    // 🌟 Efek Pop-up saat kata terakhir berubah!
    if (gameState.lastWord !== previousWord && gameState.lastWord !== "-") {
      lastWordEl.classList.remove("word-pop");
      void lastWordEl.offsetWidth; // Trigger DOM reflow agar animasi bisa diulang
      lastWordEl.classList.add("word-pop");
      previousWord = gameState.lastWord;
    }
    lastWordEl.textContent = gameState.lastWord || "-";

    currentTurnEl.textContent = "🔥 REBUTAN! 🔥";
    currentTurnEl.style.color = "#ff3b6f";
    
    // 🌟 Efek panik bergetar saat waktu sisa 5 detik!
    timerEl.textContent = gameState.timer;
    if (gameState.timer <= 5 && gameState.timer > 0) {
      timerEl.classList.add("time-danger");
    } else {
      timerEl.classList.remove("time-danger");
    }
    
    wordInput.disabled = false;
    submitBtn.disabled = false;
    messageEl.textContent = "Ketik secepatnya sebelum keduluan!";
    
    // Biar gak usah klik manual kotak input, otomatis fokus!
    if (document.activeElement !== wordInput) {
      wordInput.focus();
    }
    
  } else if (gameState.status === "finished" || gameState.winner) {
    lastWordEl.textContent = gameState.lastWord || "-";
    currentTurnEl.textContent = "SELESAI";
    timerEl.textContent = 0;
    timerEl.classList.remove("time-danger");
    
    wordInput.disabled = true;
    submitBtn.disabled = true;
    messageEl.textContent = `🏆 ${gameState.winner ? gameState.winner.name : '-'} menang dengan ${gameState.winner ? gameState.winner.score : 0} poin!`;
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

// =========================
// EVENTS
// =========================
submitBtn.addEventListener("click", submitWord);

wordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    submitWord();
  }
});

// 🌟 UPDATE: Ubah tujuan dan teks tombol
backBtn.textContent = "← Kembali ke Room";
backBtn.addEventListener("click", () => {
  window.location.href = "room.html";
});

updateUI();

// =========================
// BACKGROUND MUSIC GAME 
// =========================
const gameVolume = parseFloat(localStorage.getItem("bgmVolume")) || 0.5;
const isGameMuted = localStorage.getItem("bgmMuted") === "true";

const bgmGame = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3");
bgmGame.loop = true;
bgmGame.volume = isGameMuted ? 0 : gameVolume;

// Teknik Autoplay Bypass: Coba putar otomatis. Kalau diblokir browser, tunggu user klik layar.
function attemptPlayGame() {
  if (!isGameMuted) {
    bgmGame.play().catch(e => {
      console.log("Browser minta klik dulu biar lagu nyala...");
      document.body.addEventListener("click", () => bgmGame.play(), { once: true });
    });
  }
}
attemptPlayGame();