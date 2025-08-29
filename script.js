const canvas = document.querySelector(".gameCanvas"); 
const ctx = canvas.getContext("2d");

// Responsive canvas setup
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const maxWidth = Math.min(window.innerWidth - 20, 800);
    const maxHeight = Math.min(window.innerHeight - 20, 600);
    
    // Maintain 4:3 aspect ratio
    const aspectRatio = 4/3;
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    container.style.width = width + 'px';
    container.style.height = height + 'px';
}

// Initial canvas setup
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


//Constant declarations 
const pipes = [];
const pipeIntervalBase = 40; 
const baseSpeed = 4;

//Variable Initializations
let isGameStarted = false;
let isGameOver = false; 
let currentSpeed = baseSpeed; 
let pipeInterval = pipeIntervalBase; 
let lastPipeYTop = canvas.height / 2; 
let frameCount = 0; 
let score = 0;


//Game Objects
const bird = {
    x: 0,  // Will be set in resetBirdPosition
    y: 0,  // Will be set in resetBirdPosition
    width: 0, // Will be set proportionally
    height: 0, // Will be set proportionally
    velocityY: 0,
    gravity: 0,  // Will be set proportionally
    jumpStrength: 0,  // Will be set proportionally
    
    jump() {
        this.velocityY = this.jumpStrength;
    },

    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Terminal velocity to prevent bird from falling too fast
        if (this.velocityY > canvas.height * 0.01) {
            this.velocityY = canvas.height * 0.01;
        }

        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0; 
        }
    }
};

class Pipe {
    constructor() {
        this.x = canvas.width;
        
        // Dynamic spacing based on score for progressive difficulty
        const difficultyMultiplier = Math.max(1 - score * 0.02, 0.6); // Gets harder as score increases
        this.spacing = Math.max(basePipeSpacing * difficultyMultiplier, Math.max(canvas.height * 0.25, 100));
        this.width = Math.max(canvas.width * 0.08, 50);
        
        const maxVariation = this.spacing * 0.5; // Reduced variation for easier gameplay
        this.yTop = Math.max(lastPipeYTop - maxVariation, 50) + Math.random() * maxVariation * 2;
        this.yTop = Math.min(this.yTop, canvas.height - this.spacing - 50);
        this.yBottom = this.yTop + this.spacing;
        
        this.speed = currentSpeed;
        this.passed = false;

        lastPipeYTop = this.yTop; 
    }

    update() {
        this.x -= currentSpeed;
    }
}


//Functions
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(isGameStarted) {
        if (isGameOver === false) {
            bird.update();
            pipes.forEach(pipe => pipe.update());

            checkCollisions();

            updateScore();

            renderBird();
            pipes.forEach(pipe => renderPipe(pipe));
        }

        if (isGameOver === true) {
            displayGameOver();
        }
    }

    displayScore();
    requestAnimationFrame(gameLoop);
    generatePipes();
}

function generatePipes() {
    frameCount++;
    if (frameCount >= pipeInterval && !isGameOver) {
        pipes.push(new Pipe());
        frameCount = 0;
    }
    
    // Clean up off-screen pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
        }
    }
}

function checkCollisions() {
    if (bird.y + bird.height > canvas.height) {
        gameOver();
        frameCount = 0; 
    }

    pipes.forEach(pipe => {
        if (
            (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) &&
            ((bird.y < pipe.yTop || bird.y + bird.height > pipe.yBottom))
        ) {
            gameOver();
        }
    });
    
}

function updateScore() {
    pipes.forEach(pipe => {
        if (pipe.x + pipe.width < bird.x && !pipe.passed) {
            pipe.passed = true;
            score++; 
            console.log("Score increased:", score);

            if (score % 10 === 0) {
                currentSpeed += 1.5; 
                pipeInterval = Math.max(pipeInterval - 2, 20);
            }
        }
    });
}

function gameOver() {
    isGameOver = true;
}

function renderBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function renderPipe(pipe) {
    //top pipe
    ctx.fillStyle = pipe.passed ? "blue" : "green";
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.yTop); 

    //bottom pipe
    ctx.fillStyle = pipe.passed ? "blue" : "green";
    ctx.fillRect(pipe.x, pipe.yBottom, pipe.width, canvas.height - pipe.yBottom);
}

function displayScore() {
    const fontSize = Math.max(canvas.width * 0.03, 16);
    ctx.fillStyle = "black";
    ctx.font = fontSize + "px Arial";
    ctx.fillText("Score: " + score, canvas.width * 0.02, fontSize + 10);
    
    if (!isGameStarted && !isGameOver) {
        const instructionSize = Math.max(canvas.width * 0.025, 14);
        ctx.font = instructionSize + "px Arial";
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        const instructions = "Tap or Press Space to Start";
        const textWidth = ctx.measureText(instructions).width;
        ctx.fillText(instructions, (canvas.width - textWidth) / 2, canvas.height / 2 + 50);
    }
}

function displayGameOver() {
    const fontSize = Math.max(canvas.width * 0.05, 24);
    const restartSize = Math.max(canvas.width * 0.03, 16);
    
    ctx.fillStyle = "red";
    ctx.font = fontSize + "px Arial";
    const gameOverText = "Game Over";
    const gameOverWidth = ctx.measureText(gameOverText).width;
    ctx.fillText(gameOverText, (canvas.width - gameOverWidth) / 2, canvas.height / 2);
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.font = restartSize + "px Arial";
    const restartText = "Tap or Press Space to Restart";
    const restartWidth = ctx.measureText(restartText).width;
    ctx.fillText(restartText, (canvas.width - restartWidth) / 2, canvas.height / 2 + 40);
}

function resetBirdPosition() {
    bird.x = canvas.width / 4;
    bird.y = canvas.height / 2;
    bird.width = Math.max(canvas.width * 0.05, 20);
    bird.height = Math.max(canvas.height * 0.05, 15);
    bird.gravity = Math.max(canvas.height * 0.0015, 0.5);
    bird.jumpStrength = -Math.max(canvas.height * 0.018, 8);
}

function restartGame() {
    isGameOver = false;
    isGameStarted = false;
    resetBirdPosition();
    bird.velocityY = 0; 
    pipes.length = 0; 
    score = 0; 
    frameCount = 0; 
    currentSpeed = baseSpeed; 
    pipeInterval = pipeIntervalBase;
    lastPipeYTop = canvas.height / 2; 
}


// Input handlers
function handleInput() {
    if (!isGameStarted) {
        isGameStarted = true; 
        bird.jump(); 
    } else if (isGameOver) {
        restartGame(); 
    } else {
        bird.jump(); 
    }
}

// Keyboard controls
document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "Enter" || event.code === "ArrowUp") {
        event.preventDefault();
        handleInput();
    }
});

// Mouse/Touch controls
canvas.addEventListener("click", handleInput);
canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    handleInput();
});



// Initialize game
resetBirdPosition();
generatePipes();
displayScore();
gameLoop();
