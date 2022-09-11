const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cellSize = 40;
const cellCanvasWidth = canvas.width / cellSize;
const cellCanvasHeight = canvas.height / cellSize;

class Tetris {
	constructor(...args) {
		if (args[0] instanceof Tetris) {
			this.color = args[0].color;
			this.shape = args[0].shape;
		} else {
			this.color = args[0];
			this.shape = args[1];
		}

		this.x = Math.floor(Math.random() * (cellCanvasWidth - this.shape[0].length));
		this.y = 0;
	}

	update() {
		if (!this.checkBottom()) this.y++;
		else if (this.checkBottom()) this.stop();
	}

	// 아래쪽 확인
	checkBottom() {
		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape[i].length; j++) {
				if (this.shape[i][j] && (tArray[this.y + i + 1] === undefined || tArray[this.y + i + 1][this.x + j]))
					return true;
			}
		}

		return false;
	}

	// 왼쪽 확인
	checkLeft() {
		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape[i].length; j++) {
				if (this.shape[i][j] && (tArray[this.y + i][this.x + j - 1] || this.x + j - 1 < 0)) return true;
			}
		}

		return false;
	}

	// 오른쪽 확인
	checkRight() {
		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape[i].length; j++) {
				if (this.shape[i][j] && (tArray[this.y + i][this.x + j + 1] || this.x + j + 1 >= cellCanvasWidth))
					return true;
			}
		}

		return false;
	}

	stop() {
		nextTetris();

		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape.length; j++) {
				if (this.shape[i][j]) tArray[this.y + i][this.x + j] = this.color;
			}
		}

		if (this.y <= 0) gameOver();

		checkComplete();
	}

	draw() {
		ctx.fillStyle = this.color;

		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape[i].length; j++) {
				if (this.shape[i][j] === 1)
					ctx.fillRect((this.x + j) * cellSize, (this.y + i) * cellSize, cellSize, cellSize);
			}
		}

		let tempTetris = Object.create(this);
		tempTetris.x = this.x;
		tempTetris.y = this.y;
		while (!tempTetris.checkBottom()) tempTetris.y++;
		ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';

		for (let i = 0; i < tempTetris.shape.length; i++) {
			for (let j = 0; j < tempTetris.shape[i].length; j++) {
				if (tempTetris.shape[i][j] === 1)
					ctx.fillRect((tempTetris.x + j) * cellSize, (tempTetris.y + i) * cellSize, cellSize, cellSize);
			}
		}
	}

	rotate() {
		let tempShape = [];
		for (let i = 0; i < this.shape.length; i++) tempShape[i] = this.shape[i].slice();

		let n = this.shape.length;

		for (let layer = 0; layer < n / 2; layer++) {
			let first = layer;
			let last = n - 1 - layer;

			for (let i = first; i < last; i++) {
				let offset = i - first;
				let top = this.shape[first][i];

				tempShape[first][i] = tempShape[i][last];
				tempShape[i][last] = tempShape[last][last - offset];
				tempShape[last][last - offset] = tempShape[last - offset][first];
				tempShape[last - offset][first] = top;
			}
		}

		for (let i = 0; i < tempShape.length; i++) {
			for (let j = 0; j < tempShape[i].length; j++) {
				if (tempShape[i][j] && (tArray[this.y + i][this.x + j] === undefined || tArray[this.y + i][this.x + j]))
					return;
			}
		}

		this.shape = tempShape;
	}

	drop() {
		while (!this.checkBottom()) this.y++;
	}
}

// 모양들
const shapes = [
	new Tetris('red', [
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0]
	]),
	new Tetris('cyan', [
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0]
	]),
	new Tetris('blue', [
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0]
	]),
	new Tetris('lightgreen', [
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0]
	]),
	new Tetris('yellow', [
		[1, 1],
		[1, 1]
	]),
	new Tetris('purple', [
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0]
	]),
	new Tetris('orange', [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0]
	])
];
let current, next = new Tetris(Object.create(shapes[Math.floor(Math.random() * shapes.length)]));

const tArray = [];
for (let i = 0; i < cellCanvasHeight; i++) {
	const array = [];
	for (let j = 0; j < cellCanvasWidth; j++) {
		array.push(0);
	}

	tArray.push(array);
}

let gameLoop;
let isGameOver = false;
let started = false;
let score = 0;

function drawGrid() {
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
	ctx.lineWidth = 1;

	ctx.beginPath();

	for (let i = 0; i < cellCanvasWidth; i++) {
		ctx.moveTo(i * cellSize, 0);
		ctx.lineTo(i * cellSize, canvas.height);
	}

	for (let i = 0; i < cellCanvasHeight; i++) {
		ctx.moveTo(0, i * cellSize);
		ctx.lineTo(canvas.width, i * cellSize);
	}

	ctx.stroke();
}

function drawNext() {
	ctx.fillStyle = 'white';
	ctx.font = '24px Segoe UI Light';
	ctx.fillText('NEXT', 15, 80);

	const miniCellSize = cellSize / 3;

	ctx.fillStyle = next.color;
	for (let i = 0; i < next.shape.length; i++) {
		for (let j = 0; j < next.shape[i].length; j++) {
			if (next.shape[i][j])
				ctx.fillRect(15 + j * miniCellSize, 85 + i * miniCellSize, miniCellSize, miniCellSize);
		}
	}
}

ctx.fillStyle = 'white';
ctx.font = '30px Segoe UI Black';
ctx.fillText('Press any key to start', 10, 40);

ctx.font = '16px Segoe UI Semibold';
ctx.fillText('R - Rotate', 10, 70);
ctx.fillText('A, D - Move', 10, 90);
ctx.fillText('S - Soft Drop', 10, 110);
ctx.fillText('X - Hard Drop', 10, 130);

window.addEventListener('keydown', (e) => {
	if (!started) {
		startGame();
		started = true;
		return;
	}

	const key = e.key.toLowerCase();

	// 회전
	if (key === 'r') current.rotate();
	// 좌우 움직이기
	if (key === 'a' && !current.checkLeft()) current.x--;
	if (key === 'd' && !current.checkRight()) current.x++;
	// soft drop
	if (key === 's') delay = 2;
	// hard drop
	if (key === 'x') current.drop();
});

function startGame() {
	nextTetris();
	game();
}

let delay = 30;
let delayCount = 0;

function game() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < tArray.length; i++) {
		for (let j = 0; j < tArray.length; j++) {
			if (tArray[i][j]) {
				ctx.fillStyle = tArray[i][j];
				ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
			}
		}
	}

	delayCount++;

	current.draw();
	if (delayCount >= delay) {
		current.update();
		delayCount = 0;
	}

	drawGrid();
	drawNext();

	if (isGameOver) {
		cancelAnimationFrame(gameLoop);
		return;
	}

	ctx.fillStyle = 'white';
	ctx.font = '30px Segoe UI Light';
	ctx.fillText('Score: ' + score, 10, 40);

	gameLoop = requestAnimationFrame(game);
}

function gameOver() {
	isGameOver = true;

	setTimeout(() => {
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;

		ctx.font = '50px Segoe UI Black';

		ctx.fillText('GAME OVER', 10, 60);
		ctx.fillText('SCORE: ' + score, 10, 120);
		ctx.strokeText('GAME OVER', 10, 60);
		ctx.strokeText('SCORE: ' + score, 10, 120);
	}, 1000);
}

function nextTetris() {
	current = next;

	const random = Object.create(shapes[Math.floor(Math.random() * shapes.length)]);
	next = new Tetris(random);

	delay = 30;
}

function checkComplete() {
	for (let i = 0; i < tArray.length; i++) {
		if (tArray[i].every((v) => v !== 0)) deleteLine(i);
	}
}

function deleteLine(y) {
	score += 100;

	// 깜빡거림 효과
	let effect = setInterval(() => {
		for (let i = 0; i < tArray[0].length; i++) tArray[y][i] = tArray[y][i] === 'white' ? 'black' : 'white';
	}, 50);

	setTimeout(() => {
		clearInterval(effect);

		for (let i = y; i > 0; i--) {
			for (let j = 0; j < tArray[i].length; j++) tArray[i][j] = tArray[i - 1][j];
		}
	}, 600);
}
