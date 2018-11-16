<template>
  <nav>
    <button @click="newTab">
      +
    </button>
    <ul>
      <li v-for="(file, key) in openFiles" :key="key" 
        :class="{ selected: key == selectedIndex }"
        @click="$emit('changeTab', key)">
        {{ file.name }}
      </li>
    </ul>
  </nav>
</template>


<script>
export default {
  name: "TabBar",
  props: {
    host: {
			type: String,
			required: true
    },
    openFiles: {
      type: Array,
      required: true
    },
    selectedIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
    }
  },
  methods: {
    newTab: function () {
      let setFileName = () => new Promise((resolve, reject) => {
        let newfile = window.prompt("Enter file name:");
        if (newfile == null || newfile == '') { // filename validation
          reject("File name must not be null");
        }
        newfile += ".txt";
        for (let tab of this.openFiles) {
          if (newfile === tab.name) {
            reject("The file name " + newfile + " already exists.");
          }
        }
        resolve(newfile);
      });

      let postFile = (fileName) => fetch(`${this.host}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fileName, text: '' })
      })
      .then(res => {
        if (res.status === 200) {
          return fileName;
        } else {
          throw 'file already exists'
        }
      }).catch(error => {
        throw error;
      });

      let pushFile = (fileName) => {
        this.$emit('newFile', {
          name: fileName,
          text: "",
          cursor: 0
        });
        this.$emit('changeTab', this.openFiles.length - 1);
      };

      setFileName()
        .then(fileName => postFile(fileName))
        .then(data => pushFile(data))
        .catch(error => window.alert(error));
    }
  }
};
</script>

<style scoped>
nav {
  grid-area: tabbar;
  display: flex;
}
button {
  flex: 0 0 auto;
  align-self: top;
  margin: 3px 0px;
  width: 22px;
  height: 22px;
  padding: 0;
}
button:hover {
  cursor: pointer;
}
ul {
  align-self: center;
  padding-inline-start: 0;
  display: flex;
  flex-flow: row wrap;
  font-size: 12px;
  margin: 0;
}
li {
	flex: 0 0 auto;
	list-style-type: none;
	margin: 3px;
	padding: 3px 5px;
	border: 1px solid black;
}
li.selected {
	background-color: lightgray;
}
</style>