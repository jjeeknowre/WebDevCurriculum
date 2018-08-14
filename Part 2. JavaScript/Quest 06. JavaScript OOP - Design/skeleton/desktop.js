class Desktop {
	constructor(elem, items, width, height) {
		this.elem = elem;
		this.width = width ? width : 1200;
		this.height = height ? height : 700;
		this.elem.style.width = width + 'px';
		this.elem.style.height = height + 'px';
		this.elem.style.zIndex = 0;
		this.items = [];

		this.selectedItem;
		this.z = 1;
		this.windowz = 1000;
		if(Array.isArray(items)) {
			for(let item of items) {
				this.addItem(item);
			}
		}

		this.elem.onmousemove = (event) => {
			if(this.selectedItem &&
				this.selectedItem.posx + event.movementX < this.elem.offsetWidth && this.selectedItem.posx + event.movementX > 0 &&
				this.selectedItem.posy + event.movementY < this.elem.offsetHeight && this.selectedItem.posy + event.movementY > 0) {
				this.selectedItem.move(event.movementX, event.movementY);
			} else {
				this.selectedItem = null
			}
		}
		this.elem.onmouseleave = () => {
			this.selectedItem = null
		}
		this.elem.onmouseup = () => {
			this.selectedItem = null
		}
	}

	addItem(item) {
		this.elem.appendChild(item.elem);
		if(item.constructor.name === 'Window') {
			item.header.onmousedown = () => {
				this.selectedItem = item;
				item.changez(this.windowz++);
				/*
				for(let other of this.items) {
					if (other != item) {
						other.elem.changez(other.elem.style.zIndex - 1);
					}
				}
				*/
			}
		} else {
			item.elem.onmousedown = () => {
				this.selectedItem = item;
				item.changez(this.z++);
				/*
				for(let other of this.items) {
					if (other != item) {
						other.elem.changez(other.elem.style.zIndex - 1);
					}
				}
				*/
			}
		}
		if(item.constructor.name === 'Folder'){
			item.elem.ondblclick = (event) => {
				this.addItem(item.getWindow(400, 200, this.windowz++));
			}
		}
		if(item.constructor.name === 'Window') {
			item.elem.onkeydown = (event) => {
				if (event.keyCode == 27) {
					item.close();
				}
			}
			item.closebtn.onclick = () => {
				item.close();
			}
		}
		this.items.push(item);
	}
};

class Item {
	constructor(width, height, posx, posy, zIndex) {
		this.width = width ? width : 20;
		this.height = height ? height : 20;
		this.posx = posx ? posx : this.width/2;
		this.posy = posy ? posy : this.height/2;
		this.zIndex = zIndex ? zIndex : 0;
		this.elem = this.getelem();
	}
	
	get pos() {
		return [this.posx, this.posy];
	}
	getelem() {
		let elem = document.createElement('span');
		elem.classList.add('item');
		elem.style.width = this.width + 'px';
		elem.style.height = this.height + 'px';
		elem.style.left = (this.posx - this.width/2) + 'px';
		elem.style.top = (this.posy - this.height/2) + 'px';
		elem.style.zIndex = this.zIndex;
		// disable browser drag and drop
		elem.ondragstart = () => { return false; };
		elem.tabIndex = 0;
		return elem;
	}
	move(deltax, deltay) {
		this.posx += deltax;
		this.posy += deltay;
		this.elem.style.left = this.posx - this.width/2 + 'px';
		this.elem.style.top = this.posy - this.height/2 + 'px';
	}
	changez(newz) {
		this.zIndex = newz;
		this.elem.style.zIndex = newz;
	}
	resize(newW, newH) {
		let movex = 0;
		if (newW != this.width) {
			this.width = newW;
			this.elem.style.width = newW + 'px';
			movex = this.width/2;
		}
		let movey = 0;
		if (newH != this.height) {
			this.height = newH;
			this.elem.style.height = newH + 'px';
			movey = this.height/2
		}
		this.move(movex, movey);
	}
}

class Icon extends Item {
	constructor(width, height, posx, posy, zIndex, iconname, iconimg) {
		super(width, height, posx, posy, zIndex);
		this.elem.classList.add('icon');
		this.iconname = iconname;
		this.iconimg = iconimg;

		this.elem.innerHTML = this.iconname;			
	}
};

class Folder extends Icon {
	constructor(width, height, posx, posy, zIndex, iconname, items) {
		super(width, height, posx, posy, zIndex, iconname, 'folder');
		this.elem.classList.add('folder');
		this.items = items;
		// set initial window opening position here
		this.window = new Window(null, null, this.posx, this.posy, zIndex, this.items);
	}

	getWindow(width, height, zIndex) {
		this.window.resize(width, height);
		this.window.changez(zIndex);
		return this.window;
	}
	move(deltax, deltay) {
		this.posx += deltax;
		this.posy += deltay;
		this.elem.style.left = this.posx - this.width/2 + 'px';
		this.elem.style.top = this.posy - this.height/2 + 'px';
	}
};

class Window extends Item {
	constructor(width, height, posx, posy, zIndex, items) {
		super(width, height, posx, posy, zIndex);
		this.elem.classList.add('window');
		this.header = this.getheader();
		this.closebtn = this.header.firstChild;
		this.elem.appendChild(this.header);
		this.items = [];

		this.selectedItem;
		this.z = 1;
		this.windowz = 1000;
		if(Array.isArray(items)) {
			for(let item of items) {
				this.addItem(item);
			}
		}

		this.elem.onmousemove = (event) => {
			if(this.selectedItem &&
				this.selectedItem.posx + event.movementX < this.elem.offsetWidth && this.selectedItem.posx + event.movementX > 0 &&
				this.selectedItem.posy + event.movementY < this.elem.offsetHeight && this.selectedItem.posy + event.movementY > 0) {
				this.selectedItem.move(event.movementX, event.movementY);
			} else {
				this.selectedItem = null
			}
		}
		this.elem.onmouseleave = () => {
			this.selectedItem = null
		}
		this.elem.onmouseup = () => {
			this.selectedItem = null
		}
	}

	getheader() {
		let header = document.createElement('div');
		header.classList.add('header');
		let closebtn = document.createElement('button');
		closebtn.innerHTML = 'X';
		closebtn.classList.add('closebtn');
		header.appendChild(closebtn);
		return header;
	}
	close() {
		this.elem.parentNode.removeChild(this.elem);
	}
	addItem(item) {
		this.elem.appendChild(item.elem);
		if(item.constructor.name === 'Window') {
			item.header.onmousedown = () => {
				this.selectedItem = item;
				item.changez(this.windowz++);
			}
		} else {
			item.elem.onmousedown = () => {
				this.selectedItem = item;
				item.changez(this.z++);
			}
		}
		if(item.constructor.name === 'Folder'){
			item.elem.ondblclick = (event) => {
				this.addItem(item.getWindow(400, 200, this.windowz++));
			}
		}
		if(item.constructor.name === 'Window') {
			item.elem.onkeydown = (event) => {
				if (event.keyCode == 27) {
					item.close();
				}
			}
			item.closebtn.onclick = () => {
				item.close();
			}
		}
		this.items.push(item);
	}
};