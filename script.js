const MAX_ATTEMPTS = 6;

let wordListRaw = localStorage.getItem("wordList");
let words = wordListRaw
  .split('\n')
  .map(w => w.trim())
  .map(w => w.replace(" ",""))
  .filter(w => w.length > 0);

let target = words[Math.floor(Math.random() * words.length)].toLowerCase();
let currentRow = 0;
let currentGuess = "";
const letterStates = {}; // letter: 'green' | 'yellow' | 'red'

const board = document.getElementById("board");
const result = document.getElementById("result");

function createBoard() {
  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    const row = document.createElement("div");
    row.classList.add("guessRow");
    row.setAttribute("data-row", r);

    for (let c = 0; c < target.length; c++) {
      const cell = document.createElement("div");
      cell.classList.add("letter");
      cell.setAttribute("data-col", c);
      row.appendChild(cell);
    }

    board.appendChild(row);
  }
}

function createKeyboard() {
  const layout = [
    "q w e r t y u i o p".split(" "),
    "a s d f g h j k l".split(" "),
    ["Enter", ..."z x c v b n m".split(" "), "Back"]
  ];

  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";

  layout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("key-row");

    row.forEach(key => {
      const keyBtn = document.createElement("button");
      keyBtn.textContent = key;
      keyBtn.classList.add("key");
      keyBtn.setAttribute("data-key", key.toLowerCase());

      keyBtn.addEventListener("click", () => handleVirtualKey(key));
      rowDiv.appendChild(keyBtn);
    });

    keyboard.appendChild(rowDiv);
  });
}

function handleVirtualKey(key) {
  if (currentRow >= MAX_ATTEMPTS) return;
  if (result.textContent) return;

  if (key === "Enter") {
    if (currentGuess.length !== target.length) {
      result.textContent = `Word must be ${target.length} letters long.`;
      const row = document.querySelector(`.guessRow[data-row="${currentRow}"]`);
      row.classList.add("shake");
      setTimeout(() => {
        result.textContent = "";
        row.classList.remove("shake");
      }, 1500);
      return;
    }
    checkGuess();
  } else if (key === "Back") {
    currentGuess = currentGuess.slice(0, -1);
    updateRowDisplay();
  } else if (/^[a-zA-Z]$/.test(key)) {
    if (currentGuess.length < target.length) {
      currentGuess += key.toLowerCase();
      updateRowDisplay();
    }
  }
}



function updateRowDisplay() {
  const row = document.querySelector(`.guessRow[data-row="${currentRow}"]`);
  const boxes = row.querySelectorAll(".letter");

  boxes.forEach((box, i) => {
    box.textContent = currentGuess[i] || "";
  });
}

function handleKey(e) {
  if (currentRow >= MAX_ATTEMPTS) return;
  if (result.textContent) return;

  if (e.key === "Enter") {
if (currentGuess.length !== target.length) {
  result.textContent = `Word must be ${target.length} letters long.`;

  // Optional: highlight the row to indicate error
  const row = document.querySelector(`.guessRow[data-row="${currentRow}"]`);
  row.classList.add("shake");

  setTimeout(() => {
    result.textContent = "";
    row.classList.remove("shake");
  }, 1500);

  return;
}


    checkGuess();
  } else if (e.key === "Backspace") {
    currentGuess = currentGuess.slice(0, -1);
    updateRowDisplay();
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    if (currentGuess.length < target.length) {
      currentGuess += e.key.toLowerCase();
      updateRowDisplay();
    }
  }
}

function checkGuess() {
  const row = document.querySelector(`.guessRow[data-row="${currentRow}"]`);
  const boxes = row.querySelectorAll(".letter");

  const guess = currentGuess;
  let targetArray = target.split("");

  // First pass: mark greens
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      boxes[i].classList.add("green");
      targetArray[i] = null;

      // Update keyboard color (green overrides others)
      letterStates[guess[i]] = 'green';
    }
  }

  // Second pass: mark yellows and reds
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] !== target[i]) {
      if (targetArray.includes(guess[i])) {
        boxes[i].classList.add("yellow");

        // Only update if not green already
        if (letterStates[guess[i]] !== 'green') {
          letterStates[guess[i]] = 'yellow';
        }

        targetArray[targetArray.indexOf(guess[i])] = null;
      } else {
        boxes[i].classList.add("gray");

        // Only update if no green/yellow yet
        if (!letterStates[guess[i]]) {
          letterStates[guess[i]] = 'red';
        }
      }
    }
  }

  updateKeyboardColors();

  if (guess === target) {
    result.textContent = `🎉 Correct! The word was: ${target}`;
    document.removeEventListener("keydown", handleKey);
    return;
  }

  currentRow++;
  currentGuess = "";

  if (currentRow >= MAX_ATTEMPTS) {
    result.textContent = `❌ Out of attempts. The word was: ${target}`;
    document.removeEventListener("keydown", handleKey);
  }
}

function updateKeyboardColors() {
  const keyboard = document.getElementById("keyboard");
  const keys = keyboard.querySelectorAll(".key");

  keys.forEach(key => {
    const letter = key.getAttribute("data-key");

    // Remove all color classes first
    key.classList.remove("key-green", "key-yellow", "key-red");

    if (letterStates[letter] === "green") {
      key.classList.add("key-green");
    } else if (letterStates[letter] === "yellow") {
      key.classList.add("key-yellow");
    } else if (letterStates[letter] === "red") {
      key.classList.add("key-red");
    }
  });
}


createBoard();
createKeyboard();
updateRowDisplay();
document.addEventListener("keydown", handleKey);

document.getElementById("resetBtn").addEventListener("click", () => {
  // Remove focus from button to avoid accidental submits
  document.activeElement.blur();

  board.innerHTML = "";
  result.textContent = "";
  currentRow = 0;
  currentGuess = "";
  target = words[Math.floor(Math.random() * words.length)].toLowerCase();

  // Clear letter states and reset keyboard colors
  for (const key in letterStates) delete letterStates[key];
  updateKeyboardColors();

  createBoard();
  updateRowDisplay();
  document.addEventListener("keydown", handleKey);
});


