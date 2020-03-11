class Then {
	constructor() {
		this.t = []
	}

	add(func) {
		this.t.push(func);
	}

	callAll() {
		for (let i = 0; i < this.t.length; i++) {
			this.t[i]();
		}
	}
}