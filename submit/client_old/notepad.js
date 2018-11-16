//const user = 'user1';

class Login {
	constructor() {
		this.elem = document.getElementById('login');
		this.getelem();
		this.user = null;
	}
	getelem() {
		let userLabel = document.createElement('label');
		let passLabel = document.createElement('label');
		userLabel.classList.add('userLabel');
		passLabel.classList.add('passLabel');
		userLabel.innerHTML = 'username: ';
		passLabel.innerHTML = 'password: '

		let userInput = document.createElement('input');
		let passInput = document.createElement('input');
		userInput.autocomplete = 'on';
		passInput.autocomplete = 'on';
		userInput.classList.add('userInput');
		passInput.classList.add('passInput');
		passInput.type = 'password';

		let loginbtn = document.createElement('button');
		loginbtn.classList.add('login');
		loginbtn.innerHTML = 'login';
		
		loginbtn.onclick = () => {
			fetch('./login', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: userInput.value,
					password: passInput.value
				})
			})
			.then(res => {
				if (res.status === 200) {
					res.json();
				} else {
					throw 'error';
				}
			})
			.then((data) => {
				this.user = userInput.value;
			})
			.catch(data => {
				console.log(data.message);
			})
		}
		
		this.elem.appendChild(userLabel);
		this.elem.appendChild(userInput);
		this.elem.appendChild(passLabel);
		this.elem.appendChild(passInput);
		this.elem.appendChild(loginbtn);
	}
	close() {
		this.elem.parentElement.removeChild(this.elem);
	}
}


class Notepad {
	constructor() {
		this.elem = document.getElementById('notepad');
		this.getelem();
		window.addEventListener('beforeunload', (event) => {
			let tabs = [];
			this.tabBar.opentabs.forEach(tab => {
				tabs.push({
					filename: tab,
					user: user,
					cursor: this.textArea.elem.selectionStart
				});
			});
			fetch(`./users/${user}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tabs: tabs,
					opentab: this.tabBar.selected
				})
			}).then(res => res.json());
		});
	}
	async getelem() {
		const userdata = await fetch(`./users/${user}`, { method: 'GET' })
			.then(res => res.json());
		console.log(userdata);
		for (let i = 0; i < userdata.Tabs.length; i++) {
			if (userdata.opentab > 0 && userdata.Tabs[i] == userdata.Tabs[userdata.opentab]) {
				userdata.cursor = userdata.Tabs[i].cursor;
			}
			userdata.Tabs[i] = userdata.Tabs[i].filename
		};

		this.textArea = new TextArea();
		this.elem.appendChild(this.textArea.elem);

		this.tabBar = new TabBar(userdata.Tabs, userdata.opentab);
		this.elem.appendChild(this.tabBar.elem);		

		this.fileList = new FileList(userdata.tabs);
		this.elem.appendChild(this.fileList.elem);

		this.buttons = new ButtonList();
		this.elem.appendChild(this.buttons.elem);

		let logout = document.createElement('button');
		logout.classList.add('logoutbtn');
		logout.innerHTML = 'logout';
		logout.onclick = () => {
			fetch('./logout', { method: "GET" })
				.then(res => res.json())
				.then(data => { console.log(data.message) });
			location.reload();
		}
		this.elem.appendChild(logout);
	}
};

class TextArea {
	constructor() {
		this.elem = this.getelem();
		window.addEventListener('selecttab', (event) => {
			this.elem.value = event.detail.text;
			this.elem.focus();
			this.elem.selectionEnd = event.detail.cursor;
		});
		window.addEventListener('closetab', () => {
			this.elem.value = '';
		});
		window.addEventListener('deletetab', () => {
			this.elem.value = '';
		});
	}
	getelem() {
		let textarea = document.createElement('textarea');
		textarea.classList.add('textarea');
		textarea.onkeyup = () => {
			let event = new CustomEvent('updatetext', { 
				detail: {
					text: textarea.value,
					cursor: textarea.selectionEnd
				}
			});
			window.dispatchEvent(event);
		};
		textarea.onclick = () => {
			let event = new CustomEvent('updatecursor', { detail: textarea.selectionEnd });
			window.dispatchEvent(event);
		}
		return textarea;
	}
}

class Tab {
	constructor(filename, filetext, cursor) {
		this.name = filename;
		this.text = filetext ? filetext : '';
		this.cursor = cursor ? cursor : null;
		this.elem = this.getelem();

		window.addEventListener('updatetab', (event) => {
			this.text = event.detail;
		});
	}
	getelem() {
		let tab = document.createElement('li');
		tab.classList.add('tab');
		tab.innerHTML = this.name;
		tab.onclick = () => {
			let event = new CustomEvent('selecttab', { detail: this });
			window.dispatchEvent(event);
		};
		return tab;
	}
	gettext() {
		return fetch(`./files/${this.name}`, { method: "GET" })
		.then(res => res.json())
		.then((data) => {
			this.text = data.filetext;
			if (this.cursor === null) {
				this.cursor = data.filetext.length;
			}
			return data.filetext;
		});
	}
}

class TabBar {
	constructor(tabs = [], selected = -1, cursor = 0) {
		this.elem = this.getelem();
		this.tabs = [];
		this.selected = -1;

		window.addEventListener('selecttab', (event) => {
			if (this.selected !== -1) {
				this.tabs[this.selected].elem.classList.remove('selected');
			}
			this.selected = this.opentabs.indexOf(event.detail.name);
			this.tabs[this.selected].elem.classList.add('selected');
		});
		window.addEventListener('savetab', () => {
			if (this.selected !== -1) {
				let tab = this.tabs[this.selected];
				fetch(`./files/${tab.name}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ filename: tab.name, filetext: tab.text })
				})
				.then(res => res.json());
			}
		});
		window.addEventListener('closetab', () => {
			if (this.selected !== -1) {
				let event = new CustomEvent('closefile', { detail: this.tabs[this.selected].name });
				window.dispatchEvent(event);
				this.closeTab(this.tabs[this.selected]);
			}
		});
		window.addEventListener('deletetab', (event) => {
			let index = this.opentabs.indexOf(event.detail);
			if (index !== -1) {
				this.closeTab(this.tabs[index]);
			}
		});
		window.addEventListener('opentab', (event) => {
			fetch(`./files/${event.detail}`, { method: "GET" })
				.then(res => res.json())
				.then((data) => {
					let newTab = new Tab(event.detail, data.filetext);
					if (this.opentabs.indexOf(newTab.name) === -1) {
						this.addTab(newTab);
					}
					let e = new CustomEvent('selecttab', { detail: newTab });
					window.dispatchEvent(e);
				});
		});
		window.addEventListener('updatetext', (event) => {
			if (this.selected !== -1) {
				this.tabs[this.selected].text = event.detail.text;
				this.tabs[this.selected].cursor = event.detail.cursor;
			}
		});
		window.addEventListener('updatecursor', (event) => {
			if (this.selected !== -1) {
				this.tabs[this.selected].cursor = event.detail;
			}
		});

		this.opentabs = tabs;
		let newPromise = new Promise(async (resolve, reject) => {
			for (let i = 0; i < tabs.length; i++) {
				let newTab = new Tab(tabs[i]);
				if (i === selected) {
					newTab.cursor = cursor;
				}
				this.tabs.push(newTab);
				this.elem.childNodes[1].appendChild(newTab.elem);
			}
			for (let i = 0; i < tabs.length; i++) {
				await this.tabs[i].gettext();
			}
			resolve('success');
		});
		
		newPromise.then(() => {
			if (selected != -1) {
				let event = new CustomEvent('selecttab', { detail: this.tabs[selected] });
				window.dispatchEvent(event);
			}
		}).catch(error => {
			console.log('error');
		});
	}
	getelem() {
		let bar = document.createElement('nav');
		bar.classList.add('tabbar');

		let add = document.createElement('button');
		add.classList.add('addtabbtn');
		add.innerHTML = '+';
		add.onclick = () => {
			let filename = window.prompt("Enter file name:");
			if (filename != null) {
				filename = filename.split(' ').join('') + '.txt';
				let event = new CustomEvent('newfile', { detail: { name: filename } });
				window.dispatchEvent(event);

				let newTab = new Tab(filename);
				fetch('./files', {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ filename: newTab.name, filetext: '' })
				})
					.then(res => res.json())
					.catch(error => {
						console.log(error);
					});
				this.addTab(newTab);

				let event2 = new CustomEvent('selecttab', { detail: newTab });
				window.dispatchEvent(event2);
			}
		};
		bar.appendChild(add);

		let tablist = document.createElement('ul');
		tablist.classList.add('tablist');
		bar.appendChild(tablist);
		return bar;
	}
	addTab(tab) {
		this.tabs.push(tab);
		this.opentabs.push(tab.name);
		this.elem.childNodes[1].appendChild(tab.elem);
	}
	closeTab(tab) {
		this.selected = -1;
		this.elem.childNodes[1].removeChild(tab.elem);
		let index = this.tabs.indexOf(tab);
		this.opentabs.splice(index, 1);
		this.tabs.splice(index, 1);
	}
}

class FileList {
	constructor() {
		this.elem = this.getelem();
		this.files = [];
		this.selected = -1;

		fetch('./files', { method: "GET" })
			.then(res => {
				if (res.status === 200) {
					return res.json();
				} else {
					throw '401 no access';
				}
			})
			.then(data => {
				data.forEach(file => {
					this.newFile(file.filename);
				});
			})
			.catch(err => console.log(err));

		window.addEventListener('closefile', (event) => {
			for (let file of this.elem.childNodes[0].childNodes) {
				if (file.innerHTML === event.detail) {
					file.classList.remove('opened');
					break;
				}
			}
			this.elem.childNodes[0].childNodes[this.selected].classList.add('selected');
		});
		window.addEventListener('newfile', () => {
			if (this.selected !== -1) {
				this.elem.childNodes[0].childNodes[this.selected].classList.remove('opened');
				this.elem.childNodes[0].childNodes[this.selected].classList.remove('selected');
			}
			this.selected = this.files.length;
			this.newFile(event.detail.name);
			this.elem.childNodes[0].childNodes[this.selected].classList.remove('selected');
			this.elem.childNodes[0].childNodes[this.selected].classList.add('opened');
		});
	}
	getelem() {
		let elem = document.createElement('div');
		elem.classList.add('filelist')

		let list = document.createElement('ul');
		list.classList.add('list');

		let openBtn = document.createElement('button');
		openBtn.classList.add('openbtn');
		openBtn.innerHTML = 'open';
		openBtn.onclick = () => {
			if (this.selected !== -1) {
				this.elem.childNodes[0].childNodes[this.selected].classList.remove('selected');
				this.elem.childNodes[0].childNodes[this.selected].classList.add('opened');
				let event = new CustomEvent('opentab', { detail: this.files[this.selected] });
				window.dispatchEvent(event);
			}
		};

		let deleteBtn = document.createElement('button');
		deleteBtn.classList.add('deletebtn');
		deleteBtn.innerHTML = 'delete';
		deleteBtn.onclick = () => {
			if (this.selected !== -1) {
				let file = this.elem.childNodes[0].childNodes[this.selected];
				let event = new CustomEvent('deletetab', { detail: file.innerHTML });
				window.dispatchEvent(event);
				this.elem.childNodes[0].removeChild(file);
				this.files.splice(this.files.indexOf(file.innerHTML), 1);
				fetch(`./files/${file.innerHTML}`, { method: "DELETE" })
					.then(res => res.json());
				this.selected = -1;
			}
		};

		elem.appendChild(list);
		elem.appendChild(openBtn);
		elem.appendChild(deleteBtn);
		return elem;
	}
	newFile(filename) {
		this.files.push(filename);
		let file = document.createElement('li');
		file.innerHTML = filename;
		file.onclick = () => {
			if (this.selected !== -1) {
				this.elem.childNodes[0].childNodes[this.selected].classList.remove('selected');
			}
			this.selected = this.files.indexOf(filename);
			this.elem.childNodes[0].childNodes[this.selected].classList.add('selected');
		};
		this.elem.childNodes[0].appendChild(file);
	}
}

class ButtonList {
	constructor() {
		this.elem = this.getelem();
	}
	getelem() {
		let buttonList = document.createElement('div');
		buttonList.classList.add('buttonlist');

		let saveBtn = document.createElement('button');
		saveBtn.classList.add('save');
		saveBtn.innerHTML = 'save';
		saveBtn.onclick = () => {
			let event = new CustomEvent('savetab');
			window.dispatchEvent(event);
		};

		let closeBtn = document.createElement('button');
		closeBtn.classList.add('close');
		closeBtn.innerHTML = 'close';
		closeBtn.onclick = () => {
			let event = new CustomEvent('closetab');
			window.dispatchEvent(event);
		};

		buttonList.appendChild(saveBtn);
		buttonList.appendChild(closeBtn);
		return buttonList;
	}
}