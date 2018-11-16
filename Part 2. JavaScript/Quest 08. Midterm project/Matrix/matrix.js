class Matrix {
	constructor(elem, width, height, operands, operators) {
		this.elem = elem;
		this.width = width ? width : 1200;
		this.height = height ? height : 700;
		this.elem.style.width = this.width + 'px';
		this.elem.style.height = this.height + 'px';
		operands = operands ? operands : [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		operators = operators ? operators : ['+', '-'];
		this.items = [];

		this.startGenerator(this, this.width, this.height, operands, operators);

		// falling interval
		let speed = 20;
		setInterval(() => {
			for (let item of this.items) {
				if (item.posy + 1 > (this.height - 15)) {
					this.removeItem(item);
				} else {
					item.decYcoord();
				}
			}
		}, speed);

		let answerZone = new AnswerZone();
		let scoreBoard = new ScoreBoard();
		this.elem.appendChild(answerZone.elem);
		this.elem.appendChild(scoreBoard.elem);

		this._createEvents();
	}

	_createEvents() {
		this.elem.addEventListener('selectItem', (event) => {
			this.removeItem(event.detail);
			if (event.detail instanceof Operand) {
				answerZone.addOperand(event.detail.value);
			} else if (event.detail instanceof Operator) {
				answerZone.addOperator(event.detail.value);
			}
			let value = answerZone.calc();
			console.log(Number(answerZone.currentTarget()));
			if (value === Number(answerZone.currentTarget())) {
				scoreBoard.addPoints(value);
				answerZone.reset();
			} else if (value !== null) {
				scoreBoard.streakReset();
			}
		});
		this.elem.addEventListener('removeItem', (event) => {		
			this.removeItem(event.detail);
		});

		
		this.elem.addEventListener('selectMoveable', (event) => {
			this.moveableItem = event.detail;
		});
		window.onmouseup = () => {
			if (this.moveableItem) {
				this.moveableItem = null;
			}
		};
		window.addEventListener('mousemove', (event) => {
			if (this.moveableItem) {
				this.moveableItem.move(event);
			}
		});
	}

	startGenerator(matrix, width, height, operands, operators) {
		let max = 500;
		let min = 100;
		function newFallingItem() {
			let posx = Math.random() * width;
			let posy = 0;
			let item;
			if (Math.random() < 0.75) {
				item = new Operand(posx, posy, operands[Math.floor(Math.random()*operands.length)], height);
			} else {
				item = new Operator(posx, posy, operators[Math.floor(Math.random()*operators.length)], height);
			}
			matrix.addItem(item);
			setTimeout(newFallingItem, Math.random() * (max - min) + min);
		}
		setTimeout(newFallingItem, Math.random() * (max - min) + min);
	}
	addItem(item) {
		this.elem.appendChild(item.elem);
		this.items.push(item);
	}
	removeItem(item) {
		this.elem.removeChild(item.elem);
		this.items.splice(this.items.indexOf(item), 1);
	}
};


class FallingItem {
	constructor(posx, posy, value) {
		this.elem = this.getelem(posx, posy, value);
		this.posx = posx;
		this.posy = posy;
		this.value = value;
		this.decPixel = 1; // set how many pixels to decrease for each iteration

		this.elem.onmousedown = () => {
			let event = new CustomEvent('selectItem', { detail: this });
			this.elem.parentNode.dispatchEvent(event);
		};
	}

	getelem(posx, posy, value) {
		let elem = document.createElement('span');
		elem.classList.add('item');
		elem.style.left = posx - 15 + 'px';
		elem.style.top = posy - 15 + 'px';
		elem.innerHTML = value;
		return elem;
	}
	decYcoord() {
		this.posy = this.posy + this.decPixel;
		this.elem.style.top = this.posy + 'px';
	}
}
class Operand extends FallingItem {
	constructor(posx, posy, value) {
		super(posx, posy, value);
	}
}
class Operator extends FallingItem {
	constructor(posx, posy, value) {
		super(posx, posy, value);
	}
}


class MoveableItem {
	constructor(width, height, posx, posy) {
		this.clientX = null;
		this.clientY = null;
		this.elem = this.getBase(width, height, posx, posy);

		this.elem.onmousedown = (event) => {
			let e = new CustomEvent('selectMoveable', { detail: this });
			this.elem.parentNode.dispatchEvent(e);
			
			this.clientX = event.clientX;
			this.clientY = event.clientY;
		}
	}
	
	getBase(width, height, posx, posy) {
		let elem = document.createElement('span');
		elem.classList.add('moveable');
		elem.style.width = width + 'px';
		elem.style.height = height + 'px';
		elem.style.left = (posx - width/2) + 'px';
		elem.style.top = (posy - height/2) + 'px';
		elem.ondragstart = () => { return false; };
		elem.tabIndex = 0;
		return elem;
	}
	move(event) {
		let deltax = event.clientX - this.clientX;
		let deltay = event.clientY - this.clientY;
		let offsetx = this.elem.offsetLeft + this.elem.offsetWidth/2 + deltax;
		if (offsetx >= this.elem.parentNode.offsetWidth) {
			this.elem.style.left = this.elem.parentNode.offsetWidth - this.elem.offsetWidth/2 + 'px';
			this.clientX = (deltax + this.clientX) - (offsetx - this.elem.parentNode.offsetWidth);
		} else if (offsetx <= 0) {
			this.elem.style.left = 0 - this.elem.offsetWidth/2 + 'px';
			this.clientX = (deltax + this.clientX) - (offsetx - 0);
		} else {
			this.elem.style.left = (this.elem.offsetLeft + deltax) + 'px';
			this.clientX = deltax + this.clientX;
		}

		let offsety = this.elem.offsetTop + this.elem.offsetHeight/2 + deltay;
		if (offsety >= this.elem.parentNode.offsetHeight) {
			this.elem.style.top = this.elem.parentNode.offsetHeight - this.elem.offsetHeight/2 + 'px';
			this.clientY = (deltay + this.clientY) - (offsety - this.elem.parentNode.offsetHeight);
		} else if(offsety <= 0) {
			this.elem.style.top = 0 - this.elem.offsetHeight/2 + 'px';
			this.clientY = (deltay + this.clientY) - (offsety - 0);
		} else {
			this.elem.style.top = (this.elem.offsetTop + deltay) + 'px';
			this.clientY = deltay + this.clientY;
		}
	}
}


class ScoreBoard extends MoveableItem {
	constructor() {
		super(150, 50, 100, 100);
		this.streak = 0;
		this.bonusMultiplier = 1;
		this.score = 0;
		this.correct = 0;
		this.incorrect = 0;
		
		this.getelem();
	}
	getelem() {
		this.elem.classList.add('scoreBoard');
		this.elem.appendChild(this.getcolumn('score', this.score));
		this.elem.appendChild(this.getcolumn('streak', this.streak));
		this.elem.appendChild(this.getcolumn('bonus', this.bonusMultiplier));		
	}
	getcolumn(name, value) {
		let valueArea = document.createElement('div');
		valueArea.classList.add('value');
		valueArea.classList.add(name);
		let text = document.createElement('div');
		text.innerHTML = value;
		valueArea.appendChild(text);

		let column = document.createElement('div');
		column.classList.add('column');
		column.appendChild(valueArea);
		column.appendChild(document.createTextNode(name));
		return column;
	}
	streakReset() {
		this.streak = 0;
		this.bonusMultiplier = 1;
		this.elem.childNodes[1].childNodes[0].childNodes[0].innerHTML = this.streak;
		this.elem.childNodes[2].childNodes[0].childNodes[0].innerHTML = this.bonusMultiplier;
	}
	addPoints(value) {
		this.streak++;
		this.score = this.score + (Math.abs(value) * this.bonusMultiplier);
		this.elem.childNodes[0].childNodes[0].childNodes[0].innerHTML = this.score;
		this.elem.childNodes[1].childNodes[0].childNodes[0].innerHTML = this.streak;
		if (this.streak === 5) {
			this.bonusMultiplier++;
			this.elem.childNodes[2].childNodes[0].childNodes[0].innerHTML = this.bonusMultiplier;
		}
	}
}

class AnswerZone extends MoveableItem {
	constructor(min, max) {
		super(150, 50, 100, 200);
		this.min = min ? min : -10;
		this.max = max ? max : 10;
		this.operandStack = [];
		this.leftright = true;
		this.leftOperand = null;
		this.rightOperand = null;
		this.operatorStack = [];
		this.operator = null;
		this.targetStack = [];
		this.switch = false;
		this.timer = 30;

		this.getelem();
		this.setRandomTarget();
		setInterval(() => {
			if (this.timer === 0) {
				this.timer = 30;
				this.setRandomTarget();
			} else {
				this.timer--
			}
		}, 1000);
	}

	getelem() {
		let left = this.getAnswerArea('left');
		left.onmousedown = () => {
			this.leftOperand = null;
			this.elem.childNodes[0].childNodes[0].innerHTML = null;
			this.leftright = true;
		}
		let right = this.getAnswerArea('right');
		right.onmousedown = () => {
			this.rightOperand = null;
			this.elem.childNodes[2].childNodes[0].innerHTML = null;
			this.leftright = false;
		}
		let operator = this.getAnswerArea('operator');
		operator.onmousedown = () => {
			this.operator = null;
			this.elem.childNodes[1].childNodes[0].innerHTML = null;
		}
	
		let equality = document.createElement('span');
		equality.classList.add('equality');
		equality.innerHTML = '=';

		let answer = document.createElement('span');
		answer.classList.add('answer');
		answer.innerHTML = this.currentTarget();

		this.elem.appendChild(left);
		this.elem.appendChild(operator);
		this.elem.appendChild(right);
		this.elem.appendChild(equality);
		this.elem.appendChild(answer);
		this.elem.appendChild(this.getLabel('left'));
		this.elem.appendChild(this.getLabel('op'));
		this.elem.appendChild(this.getLabel('right'));
		this.elem.appendChild(this.getLabel(''));
		this.elem.appendChild(this.getLabel('answer'));
		this.elem.classList.add('answerZone');
	}
	getAnswerArea(name) {
		let answer = document.createElement('span');
		answer.classList.add('answerArea');
		answer.appendChild(document.createElement('span'));
		answer.classList.add(name);

		return answer;
	}
	getLabel(name) {
		let temp = document.createElement('span');
		temp.appendChild(document.createTextNode(name));
		temp.classList.add(name + 'label')
		return temp;
	}
	addOperand(operand) {
		this.operandStack.push(Number(operand));
		if (this.leftright) {
			this.leftOperand = Number(operand);
			this.elem.childNodes[0].childNodes[0].innerHTML = this.leftOperand;
			if (this.rightOperand === null) {
				this.leftright = !this.leftright;
			}
		} else {
			this.rightOperand = Number(operand);
			if (this.rightOperand < 0) {
				this.elem.childNodes[2].childNodes[0].innerHTML = this.rightOperand;
			} else {
				this.elem.childNodes[2].childNodes[0].innerHTML = this.rightOperand;
			}
			if (this.leftOperand === null) {
				this.leftright = !this.leftright;
			}
		}	
	}
	addOperator(operator) {
		this.operatorStack.push(operator);
		this.operator = operator;
		this.elem.childNodes[1].childNodes[0].innerHTML = operator;
	}
	calc() {
		let value;
		if (this.operator !== null && this.leftOperand !== null && this.rightOperand !== null) {
			switch (this.operator) {
				case '+':
					value = this.leftOperand + this.rightOperand;
					break;

				case '-':
					value = this.leftOperand - this.rightOperand;
					break;

				case '*':
				case 'x':
					value = this.leftOperand * this.rightOperand;
					break;

				case '/':
					value = this.leftOperand / this.rightOperand;
					break;
			}
		} else {
			value = null;
		}
		return value;
	}
	currentTarget() {
		return this.targetStack[0];
	}
	setRandomTarget() {
		this.targetStack.unshift(Math.floor(Math.random() * (this.max - this.min) + this.min));
		this.elem.childNodes[4].innerHTML = this.currentTarget();
	}
	switchOperands() {
		let temp = this.leftOperand;
		this.leftOperand = this.rightOperand;
		this.rightOperand = temp;
		this.elem.childNodes[0].childNodes[0].innerHTML = this.leftOperand;
		if (this.rightOperand < 0) {
			this.elem.childNodes[2].childNodes[0].innerHTML = this.rightOperand;
		} else {
			this.elem.childNodes[2].childNodes[0].innerHTML = this.rightOperand;
		}
	}
	reset() {
		this.switch = false;
		this.leftright = true;
		this.timer = 30;
		this.setRandomTarget();
		this.operator = null;
		this.leftOperand = null;
		this.rightOperand = null;
		this.elem.childNodes[1].childNodes[0].innerHTML = null;
		this.elem.childNodes[0].childNodes[0].innerHTML = null;
		this.elem.childNodes[2].childNodes[0].innerHTML = null;
	}
}