const canvas = document.getElementById("gameboard");
const ctx = canvas.getContext("2d");

canvas.style.border = "1px solid #add";

// variables and constants
const paddle_width = 100;
const paddle_margin_bottom = 50;
const paddle_height = 20;
const ball_radius = 8;
let leftArrow = false;
let rightArrow = false;
let life = 3;
let score = 0;
let score_unit = 10;
let level = 1;
const maxLevel = 3;
let game_over = false;

// paddle
const paddle = {
  x: canvas.width / 2 - paddle_width / 2,
  y: canvas.height - paddle_margin_bottom - paddle_height,
  width: paddle_width,
  height: paddle_height,
  dx: 5,
};

const drawPaddle = () => {
  ctx.fillStyle = "red";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.strokeStyle = "#ffcd05";
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
};
//control the paddle
document.addEventListener("keydown", (e) => {
  if (e.keyCode == 37) {
    leftArrow = true;
  } else if (e.keyCode == 39) {
    rightArrow = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.keyCode == 37) {
    leftArrow = false;
  } else if (e.keyCode == 39) {
    rightArrow = false;
  }
});

//move paddle
const movePaddle = () => {
  if (rightArrow && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.dx;
  } else if (leftArrow && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }
};

// create ball
const ball = {
  x: canvas.width / 2,
  y: paddle.y - ball_radius,
  radius: ball_radius,
  speed: 4,
  dx: 3 * (Math.random() * 2 - 1),
  dy: -3,
};
// draw the ball
const drawBall = () => {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffcd05";
  ctx.fill();
  ctx.strokeStyle = "#2e3548";
  ctx.stroke();
  ctx.closePath();
};

//move ball
const moveBall = () => {
  ball.x += ball.dx;
  ball.y += ball.dy;
};
// bricks
const brick = {
  row: 3,
  column: 5,
  width: 55,
  height: 20,
  offSetLeft: 20,
  offSetTop: 20,
  marginTop: 40,
  fillColor: "#2e35",
  strokeColor: "#111",
};

let bricks = [];

function createBricks() {
  for (let r = 0; r < brick.row; r++) {
    bricks[r] = [];
    for (let c = 0; c < brick.column; c++) {
      bricks[r][c] = {
        x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
        y:
          r * (brick.offSetTop + brick.height) +
          brick.offSetTop +
          brick.marginTop,
        status: true,
      };
    }
  }
}

createBricks();
//draw the bricks
function drawBricks() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      if (b.status) {
        ctx.fillStyle = brick.fillColor;
        ctx.fillRect(b.x, b.y, brick.width, brick.height);
        ctx.strokeStyle = brick.strokeColor;
        ctx.strokeRect(b.x, b.y, brick.width, brick.height);
      }
    }
  }
}

//ball brick collision
function ballBrickCollision() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      if (b.status) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + brick.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + brick.height
        ) {
          ball.dy = -ball.dy;
          b.status = false;
          score += score_unit;
        }
      }
    }
  }
}

function showGameStats(text, textX, textY, img, imgX, imgY) {
  ctx.fillStyle = "#fff";
  ctx.font = "25px sans-serif";
  ctx.fillText(text, textX, textY);
  ctx.drawImage(img, imgX, imgY, (width = 25), (height = 25));
}

//draw function
const draw = () => {
  drawPaddle();
  drawBall();
  drawBricks();
  //show score
  showGameStats(score, 35, 25, SCORE_IMG, 5, 5);
  //show lives
  showGameStats(life, canvas.width - 25, 25, LIFE_IMG, canvas.width - 55, 5);
  //show level
  showGameStats(
    level,
    canvas.width / 2,
    25,
    LEVEL_IMG,
    canvas.width / 2 - 30,
    5
  );
};

//ball and wall collision
const ballWallCollision = () => {
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }
  if (ball.y + ball.radius > canvas.height) {
    life--;
    resetBall();
  }
};

//reset ball
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = paddle.y - ball_radius;
  ball.dx = 3 * (Math.random() * 2 - 1);
  ball.dy = -3;
}
//ball and paddle collison
const ballPaddleCollision = () => {
  if (
    ball.x < paddle.x + paddle.width &&
    ball.x > paddle.x &&
    ball.y < paddle.y + paddle.height &&
    ball.y > paddle.y
  ) {
    // check where the ball hits
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);
    collidePoint = collidePoint / (paddle.width / 2);
    //calc tha angle to rebound
    let angle = (collidePoint * Math.PI) / 3;

    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }
};

//game over
function gameOver() {
  if (life <= 0) game_over = true;
}
//level up
function levelUp() {
  let isLevelDown = true;
  //check for all bricks broken
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      isLevelDown &&= !b.status;
    }
  }
  if (isLevelDown) {
    if (level >= maxLevel) {
      game_over = true;
      return;
    }
    brick.row++;
    createBricks();
    ball.speed += 0.5;
    resetBall();
    level++;
  }
}

//update function
const update = () => {
  movePaddle();
  moveBall();
  ballPaddleCollision();
  ballBrickCollision();
  gameOver();
  levelUp();
};

function loop() {
  ctx.drawImage(BG_IMG, 0, 0);
  draw();
  update();
  ballWallCollision();
  if (!game_over) requestAnimationFrame(loop);
}
// loop();
