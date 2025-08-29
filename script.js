const canvas = document.querySelector(".gameCanvas"); 
const ctx = canvas.getContext("2d");

// Full-screen responsive canvas setup
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    
    // Use entire viewport dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Set actual canvas dimensions to full viewport
    canvas.width = width;
    canvas.height = height;
    
    // Set CSS dimensions to match
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    
    // Reset bird position after resize
    if (typeof resetBirdPosition === 'function') {
        resetBirdPosition();
    }
}

// Initial canvas setup will be done in initializeGame()
window.addEventListener('resize', resizeCanvas);


//Constant declarations 
const pipes = [];
const pipeIntervalBase = 90; // Start with reasonable pipe spacing
const baseSpeed = 3; // Reasonable starting speed
const maxSpeed = 7; // Maximum speed cap for playability
const minPipeInterval = 45; // Minimum pipe interval (maximum frequency)
const basePipeSpacing = 180; // Fixed pipe spacing - doesn't change with difficulty

//Variable Initializations
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let isGameStarted = false;
let isGameOver = false; 
let currentSpeed = baseSpeed; 
let pipeInterval = pipeIntervalBase; 
let lastPipeYTop = canvas.height / 2; 
let frameCount = 0; 
let score = 0;
let displayScore = 0; // For smooth score animation
let scoreAnimation = 0; // Animation timer
let gameOverAnimation = 0; // Game over animation timer
let startScreenAnimation = 0; // Start screen animation timer


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
        
        // Scale pipe spacing based on screen height for consistency across devices
        this.spacing = Math.max(canvas.height * 0.25, 120); // 25% of screen height minimum
        
        // Scale pipe width based on screen width but keep reasonable bounds
        this.width = Math.max(canvas.width * 0.06, Math.min(canvas.width * 0.12, 80));
        
        // Reasonable pipe positioning with variation scaled to spacing
        const maxVariation = Math.min(this.spacing * 0.4, canvas.height * 0.15);
        const minTop = canvas.height * 0.1; // 10% from top
        const maxTop = canvas.height - this.spacing - canvas.height * 0.1; // 10% from bottom
        
        this.yTop = Math.max(minTop, Math.min(maxTop, 
            lastPipeYTop + (Math.random() - 0.5) * maxVariation));
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

    // Always generate pipes (but only when game is started)
    generatePipes();

    if(isGameStarted) {
        if (isGameOver === false) {
            bird.update();
            pipes.forEach(pipe => pipe.update());

            checkCollisions();
            updateScore();
        }
    }

    // Render based on game state
    if (gameState === 'start') {
        displayStartScreen();
    } else {
        // Always render everything (background to foreground order)
        renderBird();
        pipes.forEach(pipe => renderPipe(pipe));
        displayScore();
        
        // Render game over on top of everything else
        if(gameState === 'gameOver') {
            displayGameOver();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

function generatePipes() {
    if (isGameStarted && !isGameOver) {
        frameCount++;
        if (frameCount >= pipeInterval) {
            pipes.push(new Pipe());
            frameCount = 0;
            console.log('New pipe generated, total pipes:', pipes.length);
        }
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
            scoreAnimation = 30; // Trigger score animation
            console.log("Score increased:", score);

            // Progressive difficulty increase every 3 points
            if (score % 3 === 0 && score > 0) {
                // Increase speed gradually but cap at maximum
                currentSpeed = Math.min(currentSpeed + 0.4, maxSpeed);
                
                // Increase pipe frequency (decrease interval) but cap at minimum
                pipeInterval = Math.max(pipeInterval - 2, minPipeInterval);
                
                // Log difficulty progression for debugging
                console.log(`Difficulty increased at score ${score}: speed=${currentSpeed.toFixed(1)}, interval=${pipeInterval}`);
                
                // Check if max difficulty reached
                if (currentSpeed >= maxSpeed && pipeInterval <= minPipeInterval) {
                    console.log('Maximum difficulty reached!');
                }
            }
        }
    });
    
    // Smooth score animation
    if (displayScore < score) {
        displayScore += 0.1;
        if (displayScore > score) displayScore = score;
    }
    
    // Update animation timers
    if (scoreAnimation > 0) scoreAnimation--;
}

function gameOver() {
    isGameOver = true;
    gameState = 'gameOver';
    gameOverAnimation = 0; // Reset animation
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
    
    // Animated score with glow effect when score increases
    if (scoreAnimation > 0) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FFD700';
        const animScale = 1 + (scoreAnimation / 30) * 0.3;
        ctx.font = (fontSize * animScale) + "px Arial";
    } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.font = fontSize + "px Arial";
    }
    
    // Add text stroke for better visibility
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText("Score: " + Math.floor(displayScore), canvas.width * 0.02, fontSize + 10);
    ctx.fillText("Score: " + Math.floor(displayScore), canvas.width * 0.02, fontSize + 10);
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

function displayGameOver() {
    // Increment animation timer
    gameOverAnimation++;
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const fontSize = Math.max(canvas.width * 0.05, 24);
    const restartSize = Math.max(canvas.width * 0.03, 16);
    
    // Animated game over text with bounce effect
    const bounceScale = 1 + Math.sin(gameOverAnimation * 0.1) * 0.1;
    const slideIn = Math.min(gameOverAnimation / 30, 1);
    
    // Game Over title with glow and animation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 50);
    ctx.scale(bounceScale * slideIn, bounceScale * slideIn);
    
    // Glow effect
    ctx.shadowColor = '#FF4444';
    ctx.shadowBlur = 20;
    
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold ' + fontSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    
    const gameOverText = 'GAME OVER';
    ctx.strokeText(gameOverText, 0, 0);
    ctx.fillText(gameOverText, 0, 0);
    ctx.restore();
    
    // Final score display
    if (slideIn >= 1) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold ' + (restartSize * 1.2) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        const finalScoreText = 'Final Score: ' + score;
        ctx.strokeText(finalScoreText, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText(finalScoreText, canvas.width / 2, canvas.height / 2 + 20);
        
        // Restart instructions with fade in
        const fadeIn = Math.min((gameOverAnimation - 30) / 30, 1);
        if (fadeIn > 0) {
            ctx.fillStyle = `rgba(200, 200, 200, ${fadeIn})`;
            ctx.font = restartSize + 'px Arial';
            const restartText = 'Tap Anywhere or Press Space to Restart';
            ctx.strokeText(restartText, canvas.width / 2, canvas.height / 2 + 80);
            ctx.fillText(restartText, canvas.width / 2, canvas.height / 2 + 80);
        }
    }
    
    // Reset text alignment
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;
}

function resetBirdPosition() {
    if (typeof bird === 'undefined') return; // Safety check
    
    // Position bird based on screen dimensions - works for all aspect ratios
    bird.x = canvas.width * 0.25; // 25% from left edge
    bird.y = canvas.height / 2;
    
    // Size bird proportionally to screen size but with reasonable bounds
    const minDimension = Math.min(canvas.width, canvas.height);
    bird.width = Math.max(minDimension * 0.04, 25);
    bird.height = Math.max(minDimension * 0.03, 20);
    
    // Physics scaled to screen height for consistency
    bird.gravity = Math.max(canvas.height * 0.0008, 0.3);
    bird.jumpStrength = -Math.max(canvas.height * 0.012, 6);
}

function displayStartScreen() {
    // Increment animation timer
    startScreenAnimation++;
    
    // Animated gradient background overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(135, 206, 235, 0.8)');
    gradient.addColorStop(1, 'rgba(152, 251, 152, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title animation with floating effect
    const titleFloat = Math.sin(startScreenAnimation * 0.05) * 10;
    const titleScale = 1 + Math.sin(startScreenAnimation * 0.03) * 0.05;
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 3 + titleFloat);
    ctx.scale(titleScale, titleScale);
    
    // Title glow effect
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    
    // Main title
    const titleSize = Math.max(canvas.width * 0.08, 32);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold ' + titleSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 4;
    
    const titleText = 'FLAPPY BIRD';
    ctx.strokeText(titleText, 0, 0);
    ctx.fillText(titleText, 0, 0);
    ctx.restore();
    
    // Subtitle with fade animation
    const subtitleFade = (Math.sin(startScreenAnimation * 0.08) + 1) / 2;
    ctx.fillStyle = `rgba(255, 255, 255, ${subtitleFade})`;
    ctx.font = (Math.max(canvas.width * 0.03, 16)) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    const subtitleText = 'Get Ready to Fly!';
    ctx.strokeText(subtitleText, canvas.width / 2, canvas.height / 3 + 60);
    ctx.fillText(subtitleText, canvas.width / 2, canvas.height / 3 + 60);
    
    // Animated bird preview
    const birdPreviewX = canvas.width / 2 + Math.sin(startScreenAnimation * 0.1) * 30;
    const birdPreviewY = canvas.height / 2;
    const birdSize = 40;
    
    // Bird with wing flap animation
    ctx.fillStyle = '#FFD700';
    const wingFlap = Math.sin(startScreenAnimation * 0.3) * 5;
    ctx.fillRect(birdPreviewX - birdSize/2, birdPreviewY - birdSize/2 + wingFlap, birdSize, birdSize/2);
    ctx.fillRect(birdPreviewX - birdSize/4, birdPreviewY - birdSize/4, birdSize/2, birdSize/2);
    
    // Instructions with pulsing effect
    const instructionPulse = 0.8 + Math.sin(startScreenAnimation * 0.15) * 0.2;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height * 0.75);
    ctx.scale(instructionPulse, instructionPulse);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold ' + (Math.max(canvas.width * 0.025, 18)) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    
    const instructionText = 'Tap Anywhere or Press Space to Start';
    ctx.strokeText(instructionText, 0, 0);
    ctx.fillText(instructionText, 0, 0);
    ctx.restore();
    
    // Reset styles
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;
}

function restartGame() {
    isGameOver = false;
    isGameStarted = false;
    gameState = 'start';
    resetBirdPosition();
    bird.velocityY = 0; 
    pipes.length = 0; 
    score = 0; 
    displayScore = 0;
    frameCount = 0; 
    currentSpeed = baseSpeed; 
    pipeInterval = pipeIntervalBase;
    lastPipeYTop = canvas.height / 2;
    startScreenAnimation = 0;
    gameOverAnimation = 0;
    scoreAnimation = 0;
}


// Input handlers
function handleInput() {
    if (gameState === 'start') {
        isGameStarted = true;
        gameState = 'playing';
        bird.jump(); 
    } else if (gameState === 'gameOver') {
        restartGame(); 
    } else if (gameState === 'playing') {
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

// Input controls setup
function setupControls() {
    // Mouse/Touch controls - improved mobile support
    canvas.addEventListener("click", handleInput);
    
    // Touch events with better mobile compatibility
    canvas.addEventListener("touchstart", (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleInput();
    }, { passive: false });
    
    // Add touch controls to the entire game container
    const container = document.getElementById('gameContainer');
    container.addEventListener("touchstart", (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleInput();
    }, { passive: false });
    
    // Add touch controls to entire webpage for mobile - tap anywhere to play
    document.body.addEventListener("touchstart", (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleInput();
    }, { passive: false });
    
    // Also add to document for full coverage
    document.addEventListener("touchstart", (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleInput();
    }, { passive: false });
    
    // Prevent page scrolling anywhere on mobile
    document.addEventListener("touchmove", (event) => {
        event.preventDefault();
    }, { passive: false });
    
    document.addEventListener("touchend", (event) => {
        event.preventDefault();
    }, { passive: false });
}



// Initialize game
function initializeGame() {
    resizeCanvas();
    resetBirdPosition();
    setupControls();
    
    // Set initial game state
    gameState = 'start';
    isGameStarted = false;
    isGameOver = false;
    
    // Start the game loop
    gameLoop();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}
