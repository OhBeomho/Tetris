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
		this.delay = 30;
		this.delayCount = 0;
	}

	update() {
		this.delayCount++;

		if (!this.checkBottom() && this.delayCount >= this.delay) {
			this.y++;
			this.delayCount = 0;
		} else if (this.checkBottom()) this.stop();
	}

	checkBottom() {
		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape[i].length; j++) {
				if (this.shape[i][j] && (tArray[this.y + i + 1] === undefined || tArray[this.y + i + 1][this.x + j]))
					return true;
			}
		}

		return false;
	}

	checkLeft() {
		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape[i].length; j++) {
				if (this.shape[i][j] && (tArray[this.y + i][this.x + j - 1] || this.x + j - 1 < 0)) return true;
			}
		}

		return false;
	}

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
		newTetris();

		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape.length; j++) {
				if (this.shape[i][j]) tArray[this.y + i][this.x + j] = this.color;
			}
		}

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
		this.delay = 2;
	}
}

const shapes = [
	new Tetris('red', [
		[0, 0, 0],
		[1, 1, 0],
		[0, 1, 1]
	]),
	new Tetris('cyan', [
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0]
	]),
	new Tetris('blue', [
		[0, 0, 0],
		[1, 0, 0],
		[1, 1, 1]
	]),
	new Tetris('lightgreen', [
		[0, 0, 0],
		[0, 1, 1],
		[1, 1, 0]
	]),
	new Tetris('yellow', [
		[1, 1],
		[1, 1]
	]),
	new Tetris('purple', [
		[0, 0, 0],
		[0, 1, 0],
		[1, 1, 1]
	]),
	new Tetris('orange', [
		[0, 0, 0],
		[0, 0, 1],
		[1, 1, 1]
	])
];
let currentTetris;

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
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
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

ctx.fillStyle = 'white';
ctx.font = '30px Segoe UI Light';
ctx.fillText('Press any key to start', 10, 40);

ctx.font = '16px Segoe UI Light';
ctx.fillText('R - Rotate', 10, 60);
ctx.fillText('A, D - Move', 10, 80);
ctx.fillText('S - Drop', 10, 100);

window.addEventListener('keydown', (e) => {
	if (!started) {
		startGame(4);
		started = true;
		return;
	}

	const key = e.key.toLowerCase();

	if (key === 'r') currentTetris.rotate();
	if (key === 'a' && !currentTetris.checkLeft()) currentTetris.x--;
	if (key === 'd' && !currentTetris.checkRight()) currentTetris.x++;
	if (key === 's') currentTetris.drop();
});

function startGame() {
	newTetris();
	game();
}

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

	currentTetris.draw();
	currentTetris.update();

	drawGrid();

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
		ctx.fillStyle = 'gray';
		for (let i = 0; i < tArray.length; i++) {
			for (let j = 0; j < tArray.length; j++) {
				if (tArray[i][j]) {
					ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
				}
			}
		}
	}, 100);
	setTimeout(() => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = 'white';
		ctx.font = '50px Segoe UI Light';
		ctx.fillText('GAME OVER', 10, 60);
		ctx.fillText('SCORE: ' + score, 10, 120);
	}, 1000);
}

function newTetris() {
	const random = Object.create(shapes[Math.floor(Math.random() * shapes.length)]);
	currentTetris = new Tetris(random);

	if (random.checkBottom()) gameOver();
}

function checkComplete() {
	for (let i = 0; i < tArray.length; i++) {
		if (tArray[i].every((v) => v !== 0)) deleteLine(i);
	}
}

function deleteLine(y) {
	score += 100;

	let effect = setInterval(() => {
		for (let i = 0; i < tArray[0].length; i++) tArray[y][i] = tArray[y][i] === 'white' ? 0 : 'white';
	}, 50);

	setTimeout(() => {
		clearInterval(effect);

		for (let i = y; i > 0; i--) {
			for (let j = 0; j < tArray[i].length; j++) tArray[i][j] = tArray[i - 1][j];
		}
	}, 600);
}