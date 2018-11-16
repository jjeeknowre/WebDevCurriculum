<template>
  <div id="app">
    <section v-if="user">
      <tabbar :host="host" :openFiles="openFiles" :selectedIndex="openedIndex" @newFile="newFile" @changeTab="changeTab">
      </tabbar>
      <textarea ref="textInput" v-model="currFile.text"></textarea>
      <button class="logoutbtn" @click="logout">logout</button>
      <filelist :host="host" :files="files" @openFile="openFile" @deleteFile="deleteFile">
      </filelist>
      <div class="buttonlist">
        <button class="save" @click="saveFile" :disabled="currFile.name == ''">save</button>
        <button class="close" @click="closeFile" :disabled="currFile.name == ''">close</button>
      </div>
    </section>
    <login v-else :host="host" @changeUser="updateUser($event)">
    </login>
  </div>
</template>

<script>
import FileList from "./components/FileList";
import Login from "./components/Login";
import TabBar from "./components/TabBar";

export default {
  name: "App",
  components: {
    filelist: FileList,
    login: Login,
    tabbar: TabBar
  },
  data() {
    return {
      user: '',
      files: [],
      openedIndex: -1,
      tabIndices: [],
      host: "http://localhost:8080"
    };
  },
  computed: {
    currFile: function () {
      if (this.openedIndex >= 0) {
        return this.openFiles[this.openedIndex];
      } else {
        return { name: '', text: '', cursor: 0 };
      }
    },
    openFiles: function () {
      let files = [];
      this.tabIndices.forEach(index => {
        files.push(this.files[index]);
      });
      return files;
    }
  },
  watch: {
    user: function (val) {
      if (val) {
        let getFiles = () => fetch(`${this.host}/files`, { method: "GET" })
          .then(res => res.json())
          .then(data => {
            data.forEach(file => {
              file.cursor = 0;
            });
            this.files = data;
          }).catch(err => { console.log(err) });

        let getOpenFiles = () => fetch(`${this.host}/users/${this.user}`, { method: "GET" })
          .then(res => res.json())
          .then(data => {
            for (let tab of data.Tabs) {
              this.files.forEach((file, index) => {
                if (tab.filename === file.name) {
                  file.cursor = tab.cursor;
                  this.tabIndices.push(index);
                }
              })
            }
            this.openedIndex = data.opentab;
          }).catch(err => { console.log(err) });

        getFiles()
          .then(() => getOpenFiles())
          .catch(err => { console.log(err) });
      } else {
        this.openedIndex = -1;
        this.files = [];
        this.tabIndices = [];
      }
    }
  },
  methods: {
    updateUser: function (userName) {
      this.user = userName;
    },
    logout: function () {
      this.saveTabs();
      this.user = '';
      fetch(`${this.host}/logout`, { method: "GET" })
        .then(res => res.json())
        .then(data => { console.log(data.message) });
    },
    saveTabs: function () {
      let tabs = [];
      this.tabIndices.forEach(index => {
        let file = this.files[index];
        tabs.push({
          filename: file.name,
          cursor: file.cursor,
          user: this.user
        })
      });
      fetch(`${this.host}/users/${this.user}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tabs: tabs,
          opentab: this.openedIndex
        })
      }).then(res => res.json());
    },
    changeTab: function (index) {
      this.openedIndex = index;
    },
    newFile: function (file) {
      this.files.push(file);
      this.tabIndices.push(this.files.length - 1);
    },
    openFile: function (index) {
      let findIndex = this.tabIndices.indexOf(index);
      if (findIndex !== -1) {
        this.openedIndex = findIndex;
      } else {
        this.tabIndices.push(index);
        this.openedIndex = this.tabIndices.length - 1;
      }
      this.$refs.textInput.focus();
      this.$refs.textInput.setSelectionRange(2, 2);
    },
    saveFile: function () {
      fetch(`${this.host}/files/${this.currFile.name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: this.currFile.text })
      })
    },
    deleteFile: function (index) {
      fetch(`${this.host}/files/${this.files[index].name}`, { method: "DELETE" })
        .then(res => res.json());
      let nextIndex = this.getNextTabIndex();
      this.openedIndex = nextIndex;
      this.files.splice(index, 1);
    },
    closeFile: function () {
      let nextIndex = this.getNextTabIndex();
      this.tabIndices.splice(this.tabIndices.indexOf(this.openedIndex), 1);
      this.openedIndex = nextIndex;
      
    },
    getNextTabIndex: function () {
      let newIndex = this.tabIndices.indexOf(this.openedIndex);
      if (this.tabIndices.length == 1) {
        return -1;
      } else if (newIndex !== this.tabIndices.length - 1) {
        newIndex++;
      } else {
        newIndex--;
      }
      return newIndex;
    }
  },
  created: function () {
    fetch(`${this.host}/login`, { method: "GET" })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw "please login"; 
        }
      }).then(data => {
        this.user = data.user;
      }).catch(error => error);
  },
  mounted: function () {
    
    window.addEventListener('beforeunload', this.saveTabs);
  }
};
</script>

<style>
section {
  margin: auto;
	padding-top: 100px;
	display: grid;
	width: 1400px;
	grid-template-areas:
	"tabbar tabbar tabbar logout"
	"textarea textarea textarea filelist"
	" . . buttons ."
	;
	grid-template-columns: 3fr 3fr 3fr 1fr;
	grid-template-rows: auto 500px 30px;
}
textarea {
	grid-area: textarea;
	resize: none;
	border: 1px solid gray;
}

.buttonlist {
	grid-area: buttons;
	justify-self: end;
	align-self: center;
	display: flex;
	flex-flow: row nowrap;
	flex-direction: row-reverse;
	justify-content: flex-end;
	align-items: center;
	align-content: center;
}
.buttonlist > button {
	width: 75px;
	padding: 2px;
}
.buttonlist > .close {
	margin: 0px 5px;
}

.logoutbtn {
	grid-area: logout;
	margin: 3px;
	padding: 2px;
}
</style>
