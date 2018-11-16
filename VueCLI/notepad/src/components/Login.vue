<template>
  <form onsubmit="return false">
		<label class="userLabel">
			username: 
		</label>
		<input class="userInput" autocomplete="on" v-model="userName">
		<label class="passLabel">
			password: 
		</label>
		<input class="passInput" autocomplete="on" type="password" v-model="password">
		<button @click="loginClick">
			login
		</button>
  </form>
</template>

<script>
export default {
    name: "Login",
    props: {
		host: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			userName: "",
			password: ""
		}
	},
	methods: {
		loginClick: function () {
			fetch(this.host + '/login', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			    body: JSON.stringify({
					username: this.userName,
					password: this.password
				})
			})
			.then(res => {
				if (res.status === 200) {
					res.json();
				} else {
					throw 'error';
				}
			})
			.then(data => {
				this.$emit('changeUser', this.userName);
			})
			.catch(data => {
				console.log(data.message);
			})
		}
	}
};
</script>

<style scoped>
form {
	padding-top: 200px;
	margin: auto;
	display: grid;
	max-width: 250px;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: auto;
	grid-row-gap: 5px;
	grid-template-areas:
	"uLabel uInput uInput"
	"pLabel pInput pInput"
	". . login"
}
.userLabel {
	grid-area: uLabel;
}
.userInput {
	grid-area: uInput;
}
.passLabel {
	grid-area: pLabel;
}
.passInput {
	grid-area: pInput;
}
button {
	grid-area: login;
}
</style>