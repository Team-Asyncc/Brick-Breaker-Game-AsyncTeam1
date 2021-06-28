const canvas = document.getElementById("gameboard");
const ctx = canvas.getContext("2d");
const heading = document.getElementById("heading");
const startClass = document.querySelector(".start-screen");
// dom
const btn = document.getElementById("start");
btn.addEventListener("click", () => {
  canvas.classList.toggle("hide");
  heading.classList.toggle("hide");
  startClass.classList.toggle("hide");
	loop();
});

// canvas.style.border = '1px solid #add';

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
let mouseX;
let mouseY;
// paddle
const paddle = {
	x: canvas.width / 2 - paddle_width / 2,
	y: canvas.height - paddle_margin_bottom - paddle_height,
	width: paddle_width,
	height: paddle_height,
	dx: 5,
};

const drawPaddle = () => {
	ctx.fillStyle = '#ff649f';
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
	ctx.strokeStyle = '#52006A';
	ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
};

////////////////////////////////////////////////////////////////////////
//mouse movement

function updateMousePosition(e) {
	const rect = canvas.getBoundingClientRect();
	const root = document.documentElement;

	mouseX = e.clientX - rect.left - root.scrollLeft;
	mouseY = e.clientY - rect.top - root.scrollTop;
	let paddlemove = mouseX - paddle.width / 2;
	if (paddlemove + paddle.width < canvas.width && paddlemove > 0)
		paddle.x = mouseX - paddle.width / 2;
}

document.addEventListener('mousemove', updateMousePosition);

//mouse movement ends
/////////////////////////////////////////////////////////////////////////////////

//control the paddle using keys
document.addEventListener('keydown', e => {
	if (e.keyCode == 37) {
		leftArrow = true;
	} else if (e.keyCode == 39) {
		rightArrow = true;
	}
});

document.addEventListener('keyup', e => {
	if (e.keyCode == 37) {
		leftArrow = false;
	} else if (e.keyCode == 39) {
		rightArrow = false;
	}
});

//move paddle using keys
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
	speed: 6,
	dx: 3 * (Math.random() * 2 - 1),
	dy: -3,
};
// draw the ball
const drawBall = () => {
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
	ctx.fillStyle = '#ffcd05';
	ctx.fill();
	ctx.strokeStyle = '#2e3548';
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
	fillColor: '#a97351',
	strokeColor: '#783f11',
};

let bricks = [];

function createBricks() {
  for (let r = 0; r < brick.row; r++) {
    bricks[r] = [];
    for (let c = 0; c < brick.column; c++) {
      bricks[r][c] = {
        x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
        y: r * (brick.offSetTop + brick.height) +
          brick.offSetTop +
          brick.marginTop,
        status: true,
        checkPoint: false,
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
// Adding powerball functionality

let powerBallX;
let powerBallY;
let flag = false;
let randomX = Math.floor(Math.random() * 3);
let randomY = Math.floor(Math.random() * 3);
bricks[randomX][randomY].checkPoint = true;
powerBallY = bricks[randomX][randomY].y;
powerBallX = bricks[randomY][randomY].x;

function powerBall() {
	if (
		powerBallX < paddle.x + paddle.width &&
		powerBallX > paddle.x &&
		powerBallY < paddle.y + paddle.height &&
		powerBallY > paddle.y
	) {
		flag = false;
		paddle.width = 120;
	}
	if (powerBallY > canvas.height) flag = false;

	//console.log('powerBall',this);
	powerBallY += 0.1;

	ctx.beginPath();
	ctx.arc(powerBallX, powerBallY + 50, 8, 0, 360);
	ctx.fillStyle = 'green';
	ctx.fill();

	requestAnimationFrame(powerBall);
}

console.log(bricks[1][1].checkPoint, 'l');

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
					BRICK_HIT.play();
					ball.dy = -ball.dy;
					b.status = false;
					score += score_unit;
					if (b.checkPoint) {
						flag = true;
					}
				}
			}
		}
	}
}

function showGameStats(text, textX, textY, img, imgX, imgY) {
	ctx.fillStyle = '#000';
	ctx.font = '25px sans-serif';
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
		WALL_HIT.play();
	}
	if (ball.y - ball.radius < 0) {
		ball.dy = -ball.dy;
		WALL_HIT.play();
	}
	if (ball.y + ball.radius > canvas.height) {
		life--;
		LIFE_LOST.play();
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
		PADDLE_HIT.play();
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
	if (life <= 0) {
		showYouLose();
		game_over = true;
	}
}
//level up
function levelUp() {
	let isLevelDown = true;
	//check for all bricks broken
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			let b = bricks[r][c];
			isLevelDown = isLevelDown && !b.status;
		}
	}
	if (isLevelDown) {
		WIN.play();
		if (level >= maxLevel) {
			showYouWin();
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
	if (flag) powerBall();
};

function loop() {
	ctx.drawImage(BG_IMG, 0, 0);
	draw();
	update();
	ballWallCollision();
	if (!game_over) requestAnimationFrame(loop);
}
// loop();
// SELECT SOUND ELEMENT
const soundElement = document.getElementById('sound');

soundElement.addEventListener('click', audioManager);

function audioManager() {
	// CHANGE IMAGE SOUND_ON/OFF
	let imgSrc = soundElement.getAttribute('src');
	let SOUND_IMG =
		imgSrc == 'img/SOUND_ON.png' ? 'img/SOUND_OFF.png' : 'img/SOUND_ON.png';

	soundElement.setAttribute('src', SOUND_IMG);

	// MUTE AND UNMUTE SOUNDS
	WALL_HIT.muted = WALL_HIT.muted ? false : true;
	PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
	BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
	WIN.muted = WIN.muted ? false : true;
	LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

// SHOW GAME OVER MESSAGE
/* SELECT ELEMENTS */
const gameover = document.getElementById('gameover');
const youwin = document.getElementById('youwin');
const youlose = document.getElementById('youlose');
const restart = document.getElementById('restart');

// CLICK ON PLAY AGAIN BUTTON
restart.addEventListener('click', function () {
	location.reload(); // reload the page
});

// SHOW YOU WIN
function showYouWin() {
	gameover.style.display = 'block';
	youwon.style.display = 'block';
	realistic();
}

// SHOW YOU LOSE
function showYouLose() {
	gameover.style.display = 'block';
	youlose.style.display = 'block';
	snow();
}

// confetti
function realistic() {
	var count = 200;
	var defaults = {
		origin: { y: 0.7 },
	};

	function fire(particleRatio, opts) {
		confetti(
			Object.assign({}, defaults, opts, {
				particleCount: Math.floor(count * particleRatio),
			})
		);
	}

	fire(0.25, {
		spread: 26,
		startVelocity: 55,
	});
	fire(0.2, {
		spread: 60,
	});
	fire(0.35, {
		spread: 100,
		decay: 0.91,
		scalar: 0.8,
	});
	fire(0.1, {
		spread: 120,
		startVelocity: 25,
		decay: 0.92,
		scalar: 1.2,
	});
	fire(0.1, {
		spread: 120,
		startVelocity: 45,
	});
}

function snow() {
	var duration = 3 * 1000;
	var animationEnd = Date.now() + duration;
	var skew = 1;

	function randomInRange(min, max) {
		return Math.random() * (max - min) + min;
	}

	(function frame() {
		var timeLeft = animationEnd - Date.now();
		var ticks = Math.max(200, 500 * (timeLeft / duration));
		skew = Math.max(0.8, skew - 0.001);

		confetti({
			particleCount: 1,
			startVelocity: 0,
			ticks: ticks,
			origin: {
				x: Math.random(),
				// since particles fall down, skew start toward the top
				y: Math.random() * skew - 0.2,
			},
			colors: ['#ffffff'],
			shapes: ['circle'],
			gravity: randomInRange(0.4, 0.6),
			scalar: randomInRange(0.4, 1),
			drift: randomInRange(-0.4, 0.4),
		});

		if (timeLeft > 0) {
			requestAnimationFrame(frame);
		}
	})();
}
