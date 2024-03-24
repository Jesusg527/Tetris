document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    const ctx = canvas.getContext('2d');
    const boardWidth = 10;
    const boardHeight = 20;
    const tileSize = 20;
    let board = [];
    let currentPiece;
    let gameInterval;
	 let isPaused = false;
	 let score = 0;
	 let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore'), 10) : 0;

    const pieceShapes = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
};

    function initGame() {
        board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
        spawnPiece();
        gameInterval = setInterval(updateGame, 1000);
	 	  score = 0;
        updateScoreDisplay();
		   highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore'), 			10) : 0;
    		updateHighScoreDisplay();
    }

    // Restart button functionality
    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', restartGame);

    function restartGame() {
		document.getElementById('restartButton').style.display = 'none';
        // Clear the existing game board
        board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
        
        // Reset any other game variables, such as score and linesCleared
        score = 0;
        linesCleared = 0;
        
        // Properly clear the game interval before restarting to avoid multiple loops
        clearInterval(gameInterval);
        
        // Re-initialize the game
        initGame();
    }

	 const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan'];
	

    
	function spawnPiece() {
    const shapeKeys = Object.keys(pieceShapes);
    const randomKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)]; // Select a random color
    currentPiece = {
        shape: pieceShapes[randomKey],
        x: Math.floor((boardWidth - pieceShapes[randomKey][0].length) / 2),
        y: 0,
        color: randomColor // Assign the selected color to the current piece
    };

    // Check for collision immediately after spawning
    if (checkCollision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        endGame(); // Call the endGame function if there's a collision
    } else {
        // If no collision, continue the game as usual
        renderGame();
    }
}
    function updateGame() {
		   if (isPaused) return; 
        if (!movePiece(0, 1)) {
            lockPiece();
            clearLines();
            spawnPiece();
        }
        renderGame();
    }

    function movePiece(deltaX, deltaY) {
        let newX = currentPiece.x + deltaX;
        let newY = currentPiece.y + deltaY;
		  if (isPaused) return; 
        if (!checkCollision(newX, newY, currentPiece.shape)) {
            currentPiece.x = newX;
            currentPiece.y = newY;
            return true;
        }
        return false;
    }

    function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x] === 1) {
                board[currentPiece.y + y][currentPiece.x + x] = 1;
            }
        }
    }
    clearLines(); // Clear any filled lines
    spawnPiece(); // Spawn a new piece
}

    function clearLines() {
    let linesClearedThisTurn = 0;

    // Start from the bottom of the board and move upwards
    for (let row = boardHeight - 1; row >= 0; row--) {
        // Check if every cell in the row is filled (not 0)
        if (board[row].every(cell => cell === 1)) {
            // Remove the filled row
            board.splice(row, 1);

            // Add a new empty row at the top of the board
            board.unshift(new Array(boardWidth).fill(0));

            // Since we modified the board, we need to check the same row again
            // as it now contains the row above the removed row
            row++;

            // Update the linesClearedThisTurn count
            linesClearedThisTurn++;
        }
    }

    // Update the total lines cleared and score, if necessary
    if (linesClearedThisTurn > 0) {
        linesCleared += linesClearedThisTurn;
        updateScore(linesClearedThisTurn);
        // Optionally, you can adjust the game speed here based on linesCleared
        updateGameSpeed();
    }
}

    function rotatePiece() {
	  if (isPaused) return; 

    // Assuming you have a function rotateClockwise to rotate the piece's shape matrix
    let newShape = rotateClockwise(currentPiece.shape);
    
    // Check if the new rotated shape would collide
    if (!checkCollision(currentPiece.x, currentPiece.y, newShape)) {
        // If no collision, update the piece's shape
        currentPiece.shape = newShape;
        console.log("Piece rotated");
    } else {
        // Log or handle the case where rotation isn't possible due to collision
        console.log("Rotation not possible due to collision");
    }

    // Redraw the game state with the rotated piece
    renderGame();
}

// Simple rotation function for a 2D matrix (clockwise)
function rotateClockwise(matrix) {
    return matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
}

	function checkCollision(x, y, shape) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) { // If part of the shape
                let boardX = x + j;
                let boardY = y + i;
                // Check if outside the board bounds or collides with placed pieces
                if (boardX < 0 || boardX >= boardWidth || boardY >= boardHeight || board[boardY][boardX] === 1) {
                    return true; // Collision detected
                }
            }
        }
    }
    return false; // No collision
}

	function clearLines() {
    let linesClearedThisTurn = 0;
    for (let row = boardHeight - 1; row >= 0; row--) {
        if (board[row].every(cell => cell === 1)) {
            board.splice(row, 1);
            board.unshift(Array(boardWidth).fill(0));
            linesClearedThisTurn++;
        }
    }
    if (linesClearedThisTurn > 0) {
        updateScore(linesClearedThisTurn);
        updateGameSpeed(); // Assuming you implement dynamic game speed
    }
}

function updateScore(linesClearedThisTurn) {
    // Adjust the score based on game events
    let points = linesClearedThisTurn * 100; // Just an example, adjust as needed
    score += points;
    updateScoreDisplay();
    document.getElementById('score').innerText = "Score: " + score;
	 checkAndUpdateHighScore();
}

function updateScoreDisplay() {
    // Update the webpage to reflect the current score
    document.getElementById('score').innerText = "Score: " + score;
}

	function checkAndUpdateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore.toString());
        updateHighScoreDisplay();
    }
}

	 function updateHighScoreDisplay() {
    document.getElementById('highScore').innerText = "High Score: " + highScore;
}

	function togglePause() {
    if (isPaused) {
        // Game is currently paused, resume it
        gameInterval = setInterval(updateGame, 1000); // Adjust the interval as per your game speed
        isPaused = false;
        document.getElementById('pauseButton').innerText = 'Pause'; // Update button text to "Pause"
    } else {
        // Game is running, pause it
        clearInterval(gameInterval);
        isPaused = true;
        document.getElementById('pauseButton').innerText = 'Resume'; // Update button text to "Resume"
    }
}

    function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the board
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (board[y][x] === 1) {
                ctx.fillStyle = 'grey'; // Static pieces color
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }

    // Draw the current piece
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color; // Use the current piece's color
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x] === 1) {
                    ctx.fillRect((currentPiece.x + x) * tileSize, (currentPiece.y + y) * tileSize, tileSize, tileSize);
                }
            }
        }
    }
}


	function endGame() {
    clearInterval(gameInterval); // Stop the game loop
    alert("Game Over!"); // Display a game over message
    // Additional game over logic (e.g., hide the game board, show a restart button, etc.)
}

    document.addEventListener('keydown', (event) => {
        switch (event.keyCode) {
            case 37: // Left
                movePiece(-1, 0);
                break;
            case 39: // Right
                movePiece(1, 0);
                break;
            case 40: // Down
                movePiece(0, 1);
                break;
            case 38: // Rotate
                rotatePiece();
                break;
        }
	document.getElementById('restartButton').style.display = 'block';
        renderGame();
    });
	document.getElementById('pauseButton').addEventListener('click', togglePause);
	document.getElementById('moveLeft').addEventListener('click', () => movePiece(-1, 0));
	document.getElementById('moveRight').addEventListener('click', () => movePiece(1, 0));
	document.getElementById('rotatePiece').addEventListener('click', rotatePiece);
	document.getElementById('moveDown').addEventListener('click', () => movePiece(0, 1));

    initGame();
});