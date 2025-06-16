document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const wordList = document.getElementById('word-list');
    const message = document.getElementById('message');
    const hintBtn = document.getElementById('hint-btn');

    // Configuração do jogo (15x15)
    const size = 15;
    const words = [
        'TRATOR', 'VACA', 'PLANTIO', 'SOLO', 'AGUA', 'MILHO', 
        'FARINHA', 'CEVADA', 'COLHEITA', 'ENXADA', 'PASTO', 
        'SILO', 'LACTOSE', 'ORDENHA', 'FERTIL'
    ];

    // Direções: [row, col] (8 direções possíveis)
    const directions = [
        [0, 1],   // Horizontal →
        [1, 0],    // Vertical ↓
        [1, 1],    // Diagonal ↘
        [1, -1],   // Diagonal ↙
        [-1, 1],   // Diagonal ↗
        [-1, -1],  // Diagonal ↖
        [0, -1],   // Horizontal ←
        [-1, 0]    // Vertical ↑
    ];

    let gridData = Array(size).fill().map(() => Array(size).fill(''));
    let wordPositions = {};
    let selectedCells = [];
    let foundWords = [];
    let hintTimeout = null;

    // Inicializa o jogo
    initGame();

    function initGame() {
        createEmptyGrid();
        placeWords();
        fillEmptySpaces();
        createGrid();
        createWordList();
        setupEventListeners();
    }

    function createEmptyGrid() {
        gridData = Array(size).fill().map(() => Array(size).fill(''));
    }

    function placeWords() {
        words.forEach(word => {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 100;

            while (!placed && attempts < maxAttempts) {
                attempts++;
                const direction = directions[Math.floor(Math.random() * directions.length)];
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * size);

                if (canPlaceWord(word, row, col, direction)) {
                    placeWord(word, row, col, direction);
                    placed = true;
                }
            }
        });
    }

    function canPlaceWord(word, row, col, direction) {
        const [dr, dc] = direction;
        const endRow = row + dr * (word.length - 1);
        const endCol = col + dc * (word.length - 1);

        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
            return false;
        }

        for (let i = 0; i < word.length; i++) {
            const currentRow = row + dr * i;
            const currentCol = col + dc * i;
            const currentCell = gridData[currentRow][currentCol];

            if (currentCell !== '' && currentCell !== word[i]) {
                return false;
            }
        }

        return true;
    }

    function placeWord(word, row, col, direction) {
        const [dr, dc] = direction;
        wordPositions[word] = [];

        for (let i = 0; i < word.length; i++) {
            const currentRow = row + dr * i;
            const currentCol = col + dc * i;
            gridData[currentRow][currentCol] = word[i];
            wordPositions[word].push(`${currentRow},${currentCol}`);
        }
    }

    function fillEmptySpaces() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (gridData[i][j] === '') {
                    gridData[i][j] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }

    function createGrid() {
        grid.innerHTML = '';
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = gridData[i][j];
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', () => selectCell(cell));
                grid.appendChild(cell);
            }
        }
    }

    function createWordList() {
        wordList.innerHTML = '';
        words.forEach(word => {
            const div = document.createElement('div');
            div.className = 'word-item';
            div.textContent = word;
            div.dataset.word = word;
            wordList.appendChild(div);
        });
    }

    function setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'h' && !hintTimeout) {
                giveHint();
            }
        });

        hintBtn.addEventListener('click', () => {
            if (!hintTimeout) {
                giveHint();
            }
        });
    }

    function selectCell(cell) {
        if (cell.classList.contains('found')) return;

        // Se não há células selecionadas OU a célula é adjacente à última selecionada
        if (selectedCells.length === 0 || isAdjacent(selectedCells[selectedCells.length - 1], cell)) {
            
            // Verifica se a célula já está selecionada (para desmarcar)
            const alreadySelected = selectedCells.includes(cell);
            if (alreadySelected) {
                const index = selectedCells.indexOf(cell);
                if (index === selectedCells.length - 1) { // Só desmarca se for a última
                    cell.classList.remove('selected');
                    selectedCells.pop();
                }
                return;
            }

            cell.classList.add('selected');
            selectedCells.push(cell);
            checkWord();
            
        } else {
            // Se clicar em uma célula não adjacente, limpa toda a seleção
            clearSelection();
            cell.classList.add('selected');
            selectedCells.push(cell);
        }
    }

    function isAdjacent(cell1, cell2) {
        const row1 = parseInt(cell1.dataset.row);
        const col1 = parseInt(cell1.dataset.col);
        const row2 = parseInt(cell2.dataset.row);
        const col2 = parseInt(cell2.dataset.col);

        return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
    }

    function isPartialWord() {
        if (selectedCells.length < 2) return false;
        
        const selectedWord = selectedCells.map(cell => cell.textContent).join('');
        const reversedWord = selectedCells.map(cell => cell.textContent).reverse().join('');

        // Verifica se é início de alguma palavra válida
        return words.some(word => 
            word.startsWith(selectedWord) || 
            word.startsWith(reversedWord)
        );
    }

    function checkWord() {
        const selectedWord = selectedCells.map(cell => cell.textContent).join('');
        const reversedWord = selectedCells.map(cell => cell.textContent).reverse().join('');

        const foundWord = words.find(word => 
            word === selectedWord || word === reversedWord
        );

        if (foundWord && !foundWords.includes(foundWord)) {
            // Palavra completa encontrada
            selectedCells.forEach(cell => {
                cell.classList.remove('selected');
                cell.classList.add('found');
            });
            foundWords.push(foundWord);
            updateWordList(foundWord);
            showMessage(`Parabéns! Encontrou "${foundWord}"!`, 'success');
            selectedCells = [];
            
        } else if (!isPartialWord()) {
            // Não é nem palavra completa nem início válido - limpa após 1 segundo
            setTimeout(() => {
                if (selectedCells.some(cell => !cell.classList.contains('found'))) {
                    clearSelection();
                    showMessage('Continue tentando!', 'error');
                }
            }, 1000);
        }
    }

    function clearSelection() {
        selectedCells.forEach(cell => {
            if (!cell.classList.contains('found')) {
                cell.classList.remove('selected');
            }
        });
        selectedCells = [];
    }

    function updateWordList(word) {
        const wordItems = document.querySelectorAll('.word-item');
        wordItems.forEach(item => {
            if (item.dataset.word === word) {
                item.classList.add('found');
            }
        });
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.style.color = type === 'success' ? '#2e7d32' : 
                             type === 'victory' ? '#ff9800' : '#d32f2f';
        
        setTimeout(() => {
            message.textContent = '';
        }, 3000);
    }

    function giveHint() {
        // Encontra uma palavra não encontrada
        const remainingWords = words.filter(word => !foundWords.includes(word));
        if (remainingWords.length === 0) return;

        const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
        const positions = wordPositions[randomWord];
        
        // Pisca a primeira letra da palavra
        const [row, col] = positions[0].split(',').map(Number);
        const firstCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        
        firstCell.classList.add('hint');
        showMessage(`Dica: A palavra "${randomWord}" começa aqui!`, 'hint');
        
        hintTimeout = setTimeout(() => {
            firstCell.classList.remove('hint');
            hintTimeout = null;
        }, 2000);
    }
});