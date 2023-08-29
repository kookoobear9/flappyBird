const canvas = document.querySelector(".gameCanvas"); 
const ctx = canvas.getContext("2d");


//Canvas Dimensions
canvas.width = 800;
canvas.height = 600;


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
    x: canvas.width / 4,  
    y: canvas.height / 2,  
    width: 40,
    height: 30,
    velocityY: 0,
    gravity: 0.9,
    jumpStrength: -11,
    
    jump() {
        this.velocityY = this.jumpStrength;
    },

    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0; 
        }
    }
};

class Pipe {
    constructor() {
        this.x = canvas.width;
        this.spacing = 180;
        const maxVariation = this.spacing * 0.76;
        this.yTop = Math.max(lastPipeYTop - maxVariation, 0) + Math.random() * maxVariation * 2;

        this.yTop = Math.min(this.yTop, canvas.height - this.spacing - 20);

        this.yBottom = this.yTop + this.spacing;
        this.width = 70;
        this.speed = 4;
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

        if (pipes.length === 2) {
            lastPipeYTop = pipes[1].yTop;
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
                frameCount -= 2; 
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
    ctx.fillRect(pipe.x, pipe.yTop, pipe.width, -pipe.yTop); 

    //bottom pipe
    ctx.fillStyle = pipe.passed ? "blue" : "green";
    ctx.fillRect(pipe.x, pipe.yBottom, pipe.width, canvas.height - pipe.yBottom);
}

function displayScore() {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, 20, 30);

}

function displayGameOver() {
    ctx.fillStyle = "red";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
}

function restartGame() {
    isGameOver = false;
    isGameStarted = false;
    bird.y = canvas.height / 2; 
    pipes.length = 0; 
    score = 0; 
    frameCount = 0; 
    currentSpeed = baseSpeed; 
    pipeInterval = pipeIntervalBase; 
}


//Space Bar Event Listener
document.addEventListener("keydown", event => {
    if (event.keyCode === 32) {
        if (!isGameStarted) {
            isGameStarted = true; 
            bird.jump(); 
        } else if (isGameOver) {
            restartGame(); 
        } else {
            bird.jump(); 
        }
    }
});



generatePipes();
displayScore();
gameLoop();
