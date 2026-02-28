const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");

const gravity = 0.35;
const jumpForce = -7;
const pipeSpeed = 2.5;
const pipeSpawnGap = 110;
const pipeDistance = 220;
const birdRadius = 14;

let bird;
let pipes;
let frame;
let score;
let best = Number(localStorage.getItem("flappyBest") || 0);
let gameOver;
let started;

bestEl.textContent = String(best);

function reset() {
  bird = {
    x: 96,
    y: canvas.height / 2,
    vy: 0,
  };

  pipes = [];
  frame = 0;
  score = 0;
  gameOver = false;
  started = false;
  scoreEl.textContent = "0";

  for (let i = 0; i < 3; i += 1) {
    createPipe(canvas.width + i * pipeDistance + 120);
  }
}

function createPipe(x) {
  const margin = 80;
  const minY = margin;
  const maxY = canvas.height - margin - pipeSpawnGap;
  const gapY = Math.random() * (maxY - minY) + minY;

  pipes.push({
    x,
    width: 56,
    gapY,
    passed: false,
  });
}

function jump() {
  if (gameOver) {
    return;
  }

  started = true;
  bird.vy = jumpForce;
}

function update() {
  if (!started || gameOver) {
    return;
  }

  frame += 1;
  bird.vy += gravity;
  bird.y += bird.vy;

  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;

    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      pipe.passed = true;
      score += 1;
      scoreEl.textContent = String(score);
    }
  });

  if (pipes.length && pipes[0].x + pipes[0].width < -10) {
    pipes.shift();
    const lastX = pipes[pipes.length - 1].x;
    createPipe(lastX + pipeDistance);
  }

  if (bird.y - birdRadius <= 0 || bird.y + birdRadius >= canvas.height) {
    endGame();
  }

  pipes.forEach((pipe) => {
    const hitX = bird.x + birdRadius > pipe.x && bird.x - birdRadius < pipe.x + pipe.width;
    const hitTop = bird.y - birdRadius < pipe.gapY;
    const hitBottom = bird.y + birdRadius > pipe.gapY + pipeSpawnGap;

    if (hitX && (hitTop || hitBottom)) {
      endGame();
    }
  });
}

function endGame() {
  if (gameOver) {
    return;
  }

  gameOver = true;
  if (score > best) {
    best = score;
    localStorage.setItem("flappyBest", String(best));
    bestEl.textContent = String(best);
  }
}

function drawBird() {
  ctx.beginPath();
  ctx.fillStyle = "#ffd43b";
  ctx.arc(bird.x, bird.y, birdRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "#f08c00";
  ctx.arc(bird.x + 10, bird.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "#212529";
  ctx.arc(bird.x + 4, bird.y - 6, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes() {
  pipes.forEach((pipe) => {
    ctx.fillStyle = "#2f9e44";
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
    ctx.fillRect(pipe.x, pipe.gapY + pipeSpawnGap, pipe.width, canvas.height - (pipe.gapY + pipeSpawnGap));

    ctx.fillStyle = "#37b24d";
    ctx.fillRect(pipe.x - 4, pipe.gapY - 12, pipe.width + 8, 12);
    ctx.fillRect(pipe.x - 4, pipe.gapY + pipeSpawnGap, pipe.width + 8, 12);
  });
}

function drawText() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.font = "bold 40px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(String(score), canvas.width / 2, 80);

  if (!started) {
    ctx.font = "bold 30px Segoe UI";
    ctx.fillText("點擊或空白鍵開始", canvas.width / 2, canvas.height / 2 - 20);
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(55, canvas.height / 2 - 90, canvas.width - 110, 160);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 38px Segoe UI";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 30);

    ctx.font = "22px Segoe UI";
    ctx.fillText(`分數：${score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText("按重新開始再玩一次", canvas.width / 2, canvas.height / 2 + 45);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPipes();
  drawBird();
  drawText();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    jump();
  }
});

canvas.addEventListener("pointerdown", jump);
restartBtn.addEventListener("click", reset);

reset();
loop();
