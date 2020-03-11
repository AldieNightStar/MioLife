// details {width, height, cellWidth, cellHeight, borderStyle, borderWidth, hoverColor}
function addTable(dest, details, clickFn) {
	let table = document.createElement("table");
	{
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = `.haxitable_11_03_2020 td:hover { color: ${details.hoverColor || "#FF0000"};}`;
		console.log(style.innerHTML)
		document.getElementsByTagName('head')[0].appendChild(style);
	}
	table.className = "haxitable_11_03_2020";

	let matrix = [];
	for (let y = 0; y < details.height; y++) {
		let tr = document.createElement("tr");
		matrix[y] = [];
		for (let x = 0; x < details.width; x++) {
			let td = document.createElement("td");
			td.style.width = (details.cellWidth   || 25) + "px";
			td.style.height = (details.cellHeight || 25) + "px";
			td.style.border = details.borderStyle || "solid";
			td.style["border-color"] = "solid";
			td.style["border-width"] = (details.borderWidth || 1) + "px";
			td.mouseover = () => {
				console.log("Hover", x, y)
			}
			td.onclick = () => {
				clickFn(x, y, td);
			}
			matrix[y][x] = td;
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	if (dest.appendChild) {
		dest.appendChild(table);
	}
	// Add special functions
	matrix.color = (x, y, color) => {
		try {
			if (color === undefined) {
				return matrix[y][x].style["background-color"];
			}
			matrix[y][x].style["background-color"] = color;
		} catch(e) {
			console.log(e);
		}
	}
	matrix.text = (x, y, text, color) => {
		try {
			if (text === undefined) {
				return matrix[y][x].innerHTML;
			}
			if (color !== undefined) {
				matrix[y][x].style.color = color;
			}
			matrix[y][x].innerHTML = text;
		} catch(e) {
			console.log(e);
		}
	}
	return matrix;
}

class Matrix {
	constructor(w, h) {
		this.m = [];
		this.max = {w, h};
		for (let y = 0; y < h; y++) {
			this.m[y] = [];
		}
	}

	getArr() {
		return this.m
	}

	get(x, y) {
		if (x < 0) return;
		if (x > this.max.w - 1) return;
		if (y < 0) return;
		if (y > this.max.h - 1) return;
		return this.m[y][x];
	}

	getOrDefault(x, y, defaultVal) {
		let o = this.get(x, y);
		if (o === undefined) {
			return defaultVal
		}
		return o;
	}

	set(x, y, value) {
		if (x < 0) return;
		if (x > this.max.w - 1) return;
		if (y < 0) return;
		if (y > this.max.h - 1) return;
		this.m[y][x] = value;
	}

	// func(x, y, value, setterFn, breakFn, continueFn)
	forEach(func) {
		let breakIt = false;
		let continueIt = false;
		let breakFn = () => breakIt = true;
		let continueFn = () => continueIt = true;

		for (let y = 0; y < this.max.h; y++) {
			for (let x = 0; x < this.max.w; x++) {
				let setter = (value) => this.m[y][x] = value;
				func(x, y, this.m[y][x], setter, breakFn, continueFn);
				if (breakIt) break;
				if (continueIt) {
					continueIt = false;
					continue;
				}
			}
			if (breakIt) break;
		}
	}
}

let W = 25;
let H = 20;
let matrix = new Matrix(W, H);
let table = null;
let stop = () => {};

function zentiEventHandler(x, y, elem) {
	let v = !matrix.getOrDefault(x, y, false);
	matrix.set(x, y, v);
	render(x, y);
}

window.addEventListener("load", function() {
	table = addTable(document.body, {
		width: W,
		height: H,
		cellWidth: 20,
		cellHeight: 20,
		hoverColor: "red"
	}, zentiEventHandler);
});


function render(x, y) {
	table.color(x, y, matrix.getOrDefault(x, y, false) ? "yellow" : "");
}

function life(ms) {
	let life = setInterval(function() {
		let t = new Then();

		matrix.forEach((x, y, v, setVal) => {
			let nbs = neighbors(x, y);
			if (nbs == 2) {
				if (v != true) {
					t.add(() => {
						setVal(true);
						render(x, y);
					})
				}
			} else {
				if (v != false) {
					t.add(() => {
						setVal(false)
						render(x, y);
					});
				}
			}
			render(x, y);
		})

		t.callAll();
	}, ms);
	stop = () => clearTimeout(life);
	return life;
}

function neighbors(x, y) {
	let g = (x, y) => matrix.getOrDefault(x, y, false);
	let cnt = 0;
	if (g(x+1, y)) cnt++;
	if (g(x-1, y)) cnt++;
	if (g(x, y-1)) cnt++;
	if (g(x, y+1)) cnt++;
	if (g(x+1, y+1)) cnt++;
	if (g(x-1, y+1)) cnt++;
	if (g(x+1, y-1)) cnt++;
	if (g(x-1, y-1)) cnt++;
	return cnt;
}

function clear() {
	matrix.forEach((x, y, v, setter) => {
		setter(false);
		render(x, y);
	});
}