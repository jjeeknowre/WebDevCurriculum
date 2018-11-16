<template>
  <div>
    <ul>
      <li v-for="(file, key) in files" :key="file.name" :class="{ selected: key == selectedIndex }" @click="selectFile(key)">
        {{ file.name }}
      </li>
    </ul>
    <button class="openbtn" @click="$emit('openFile', selectedIndex)" :disabled="selectedIndex == -1">open</button>
    <button class="deletebtn" @click="deleteFile" :disabled="selectedIndex == -1">delete</button>
  </div>
</template>

<script>
  export default {
    name: "filelist",
    props: {
      files: {
        type: Array,
        required: true
      },
      host: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        selectedIndex: null
      }
    },
    methods: {
      selectFile: function (index) {
        this.selectedIndex = index;
      },
      deleteFile: function () {
        this.$emit("deleteFile", this.selectedIndex);
        this.selectedIndex--;
      }
    }
  }
</script>

<style scoped>
div {
	display: flex;
	flex-flow: column nowrap;
	margin: 0px 3px;
	border: 1px solid gray;
	max-height: 500px;
	grid-area: filelist;
	padding-inline-start: 0;
}
ul {
	flex: 1 0 auto;
	display: flex;
	flex-flow: column nowrap;
	margin-block-start: 0;
	margin-block-end: 0;
	padding-inline-start: 0;
}
ul > li {
	list-style-type: none;
	padding: 1px 5px;
}
ul > li.selected {
	background-color: lightgray;
}
.openbtn {
	flex: 0 0 25px;
	margin: 0px 5px;
	padding: 2px;
}
.deletebtn {
	flex: 0 0 25px;
	margin: 5px;
	padding: 2px;
}
</style>