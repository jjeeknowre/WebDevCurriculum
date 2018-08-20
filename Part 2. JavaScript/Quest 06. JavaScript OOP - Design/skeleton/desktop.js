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

		window.addEventListener('mouseup', () => {
			this.selectedItem = null;
		});
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

class Item {
	constructor(width, height, posx, posy, zIndex) {
		this.clientX = null;
		this.clientY = null;
		this.elem = this.getelem(width, height, posx, posy, zIndex);

		this.elem.onmousedown = (event) => {
			myDesktop.selectedItem = this;
			this.elem.style.zIndex = myDesktop.z++
			this.clientX = event.clientX;
			this.clientY = event.clientY;
		}
		this.elem.onmouseup = () => {
			myDesktop.selectedItem = null;
			this.clientX = null;
			this.clientY = null;
		}
		window.addEventListener('mousemove', (event) => {
			if(this == myDesktop.selectedItem) {
				this.move(event.clientX - this.clientX, event.clientY - this.clientY);
			}
		});
	}
	
	getelem(width, height, posx, posy, zIndex) {
		let elem = document.createElement('span');
		elem.classList.add('item');
		elem.style.width = width + 'px';
		elem.style.height = height + 'px';
		elem.style.left = (posx - width/2) + 'px';
		elem.style.top = (posy - height/2) + 'px';
		elem.style.zIndex = zIndex;
		elem.ondragstart = () => { return false; };
		elem.tabIndex = 0;
		return elem;
	}
	move(deltax, deltay) {
		let offsetx = this.elem.offsetLeft + this.elem.offsetWidth/2 + deltax;
		if(offsetx >= this.elem.parentNode.offsetWidth) {
			this.elem.style.left = this.elem.parentNode.offsetWidth - this.elem.offsetWidth/2 + 'px';
			this.clientX = (deltax + this.clientX) - (offsetx - this.elem.parentNode.offsetWidth);
		} else if(offsetx <= 0) {
			this.elem.style.left = 0 - this.elem.offsetWidth/2 + 'px';
			this.clientX = (deltax + this.clientX) - (offsetx - 0);
		} else {
			this.elem.style.left = (this.elem.offsetLeft + deltax) + 'px';
			this.clientX = deltax + this.clientX;
		}

		let offsety = this.elem.offsetTop + this.elem.offsetHeight/2 + deltay;
		if(offsety >= this.elem.parentNode.offsetHeight) {
			this.elem.style.top = this.elem.parentNode.offsetHeight - this.elem.offsetHeight/2 + 'px';
			this.clientY = (deltay + this.clientY) - (offsety - this.elem.parentNode.offsetHeight);
		} else if(offsety <= 0) {
			this.elem.style.top = 0 - this.elem.offsetHeight/2 + 'px';
			this.clientY = (deltay + this.clientY) - (offsety - 0);
		} else {
			this.elem.style.top = (this.elem.offsetTop + deltay) + 'px';
			this.clientY = deltay + this.clientY;
		}

		
		// if(offsety < this.elem.parentNode.offsetHeight && offsety > 0) {
		// 	this.elem.style.top = (this.elem.offsetTop + deltay) + 'px';
		// 	this.clientY = deltay + this.clientY;
		// }
	}
}

class Icon extends Item {
	constructor(width, height, posx, posy, zIndex, iconname, iconimg) {
		super(width, height, posx, posy, zIndex);
		this.elem.classList.add('icon');
		this.elem.innerHTML = iconname;
		// set icon image
	}
};

class Folder extends Icon {
	constructor(width, height, posx, posy, zIndex, iconname, items) {
		super(width, height, posx, posy, zIndex, iconname, 'folder');
		this.elem.classList.add('folder');
		this.items = items;

		this.elem.ondblclick = () => {
			if(!this.window || !this.window.open) {
				myDesktop.addItem(this.getWindow(400, 200, myDesktop.windowz++));
				this.window.open = true;
			}
			this.window.elem.focus();
		}
	}

	getWindow(width, height, zIndex) {
		let posx = this.elem.offsetWidth/2 + this.elem.offsetLeft + width/2;
		let posy = this.elem.offsetHeight/2 + this.elem.offsetTop + height/2;
		this.window = new Window(width, height, posx, posy, zIndex, this.items);
		this.window.elem.style.zIndex = zIndex;
		return this.window;
	}
};


class Window extends Item {
	constructor(width, height, posx, posy, zIndex, items) {
		super(width, height, posx, posy, zIndex);
		this.elem.classList.add('window');
		this.elem.appendChild(this.getheader());
		this.open = false;
		this.items = [];

		
		// close window when escape key is pressed
		this.elem.onkeydown = (event) => {
			if (event.keyCode == 27) {
				myDesktop.removeItem(this);
				this.open = false;
			}
		}
		this.elem.onmousedown = null;

		this.selectedItem;
		this.z = 1;
		if(Array.isArray(items)) {
			for(let item of items) {
				this.addItem(item);
			}
		}

		window.addEventListener('mouseup', () => {
			this.selectedItem = null;
		});
	}

	getheader() {
		let header = document.createElement('div');
		header.classList.add('header');
		header.onmousedown = (event) => {
			myDesktop.selectedItem = this;
			this.elem.style.zIndex = myDesktop.windowz++;
			this.clientX = event.clientX;
			this.clientY = event.clientY
		}

		let closebtn = document.createElement('button');
		closebtn.classList.add('closebtn');
		closebtn.innerHTML = 'X';
		closebtn.onclick = () => {
			myDesktop.removeItem(this);
			this.open = false;
		}
		header.appendChild(closebtn);
		return header;
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