const gridSize = 15;
let grid = [];
const words = ["ESCOLA", "TRATOR", "PLANTACAO", "ALUNO", "LIVRO", "COLHEITA", "PROFESSOR", "CAMPO", "SOJA", "MILHO", "GADO", "PASTO", "HORTA", "EDUCACAO", "CADERNO"];
let foundWords = {};
let students = [];
let currentStudentIndex = 0;
let selectedCells = [];

function createGrid() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));
    words.forEach(word => placeWord(word));
    fillEmptySpaces();
    renderGrid();
    renderWordList();
}

function placeWord(word) {
    let placed = false;
    while (!placed) {
        const dir = Math.random() < 0.5 ? "H" : "V";
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (dir === "H" && col + word.length <= gridSize) {
            if (grid[row].slice(col, col + word.length).every(c => c === "")) {
                for (let i = 0; i < word.length; i++) {
                    grid[row][col + i] = word[i];
                }
                placed = true;
            }
        } else if (dir === "V" && row + word.length <= gridSize) {
            if (grid.slice(row, row + word.length).every(r => r[col] === "")) {
                for (let i = 0; i < word.length; i++) {
                    grid[row + i][col] = word[i];
                }
                placed = true;
            }
        }
    }
}

function fillEmptySpaces() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === "") {
                grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function renderGrid() {
    const gridContainer = document.getElementById("wordGrid");
    gridContainer.innerHTML = "";
    grid.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            cell.addEventListener("click", () => selectCell(cell));
            gridContainer.appendChild(cell);
        });
    });
}

function renderWordList() {
    const list = document.getElementById("wordList");
    list.innerHTML = "";
    words.forEach(word => {
        const li = document.createElement("li");
        li.textContent = word;
        list.appendChild(li);
    });
}

function addStudent() {
    const name = document.getElementById("studentName").value.trim();
    if (name === "") {
        alert("Digite o nome do aluno!");
        return;
    }
    students.push(name);
    document.getElementById("studentName").value = "";
    if (students.length === 1) {
        startGame();
    }
}

function startGame() {
    document.getElementById("studentArea").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    document.getElementById("currentPlayer").textContent = students[currentStudentIndex];
    createGrid();
}

function selectCell(cell) {
    const isSelected = cell.classList.contains("selected");
    if (isSelected) {
        cell.classList.remove("selected");
        selectedCells = selectedCells.filter(c => c !== cell);
    } else {
        cell.classList.add("selected");
        selectedCells.push(cell);
    }
}

function confirmSelection() {
    const selectedWord = selectedCells.map(cell => cell.textContent).join("");

    if (words.includes(selectedWord) && !foundWords[selectedWord]) {
        foundWords[selectedWord] = students[currentStudentIndex];
        selectedCells.forEach(cell => {
            cell.classList.add("found");
            cell.classList.remove("selected");
        });
        selectedCells = [];
        updateFoundWords();
        updateRanking();
    } else {
        alert("Palavra incorreta ou já encontrada.");
        clearSelection();
    }
}

function clearSelection() {
    selectedCells.forEach(cell => cell.classList.remove("selected"));
    selectedCells = [];
}

function updateFoundWords() {
    const list = document.getElementById("foundWordsList");
    list.innerHTML = "";
    for (const word in foundWords) {
        const li = document.createElement("li");
        li.textContent = `${word} → ${foundWords[word]}`;
        list.appendChild(li);
    }
}

function updateRanking() {
    const ranking = {};
    for (const word in foundWords) {
        const student = foundWords[word];
        ranking[student] = (ranking[student] || 0) + 1;
    }

    const sortedRanking = Object.entries(ranking).sort((a, b) => b[1] - a[1]);
    const rankElement = document.getElementById("ranking");
    rankElement.innerHTML = "";
    sortedRanking.forEach(([student, count]) => {
        const li = document.createElement("li");
        li.textContent = `${student}: ${count} palavras`;
        rankElement.appendChild(li);
    });
}

function nextPlayer() {
    clearSelection();
    currentStudentIndex = (currentStudentIndex + 1) % students.length;
    document.getElementById("currentPlayer").textContent = students[currentStudentIndex];
}
