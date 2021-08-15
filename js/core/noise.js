function random() {
	s += v;
	return (Math.pow(s, 1.2)%d)/d
}
let d = 7919;
let v = 1299709;
let s = 0;

function Noise(x, y, initMap, scalar=1) {
	let map = [];
	for (let i = 0; i < x; i++) {
		map.push([]);
		for (let j = 0; j < y; j++) {
			map[i][j] = random()*scalar + (initMap && initMap[i] && initMap[i][j] ? initMap[i][j] : 0);
		}
	}
	return map;
}

function Lerp(noise, interval) {
	let lerpX = [], lerpXPrim = [];
	let w = noise.length*interval - interval;
	let lerpY = [], lerpYPrim = [];
	let h = noise[0].length*interval - interval;

	let c = Math.PI/(2*interval)

	for (let i = 0; i < noise.length; i++) {
		lerpXPrim.push([]);
		for (let j = 0; j <= w; j++) {
			let lerpPos = j%interval;
			if (lerpPos == 0) lerpXPrim[i][j] = noise[i][j/interval];
			else {
				lerpXPrim[i][j] = noise[i][Math.floor(j/interval)]*Math.cos(lerpPos/c) + noise[i][Math.ceil(j/interval)]*Math.sin(lerpPos/c);
			}
		}
	}
	for (let i = 0; i < noise[0].length; i++) {
		lerpYPrim.push([]);
		for (let j = 0; j <= h; j++) {
			let lerpPos = j%interval;
			if (lerpPos == 0) lerpYPrim[i][j] = noise[j/interval][i];
			else {
				lerpYPrim[i][j] = noise[Math.floor(j/interval)][i]*Math.cos(lerpPos/c) + noise[Math.ceil(j/interval)][i]*Math.sin(lerpPos/c);
			}
		}
	}

	for (let i = 0; i <= h; i++) {
		lerpX.push([]);
		for (let j = 0; j <= w; j++) {
			if (i%interval == 0) lerpX[i][j] = lerpXPrim[i/interval][j];
			else {
				let lerpPos = j%interval;
				if (lerpPos%interval == 0) lerpX[i][j] = lerpYPrim[lerpPos/interval][i];
				else {
					lerpX[i][j] = lerpYPrim[Math.floor(lerpPos/interval)][i]*Math.cos(lerpPos/c) + lerpYPrim[Math.ceil(lerpPos/interval)][i]*Math.sin(lerpPos/c);
				}
			}
		}
	}
	for (let i = 0; i <= h; i++) {
		lerpY.push([]);
		let lerpPos = i%interval;
		for (let j = 0; j <= w; j++) {
			if (j%interval == 0) lerpY[i][j] = lerpYPrim[j/interval][i];
			else {
				if (lerpPos%interval == 0) lerpY[i][j] = lerpXPrim[lerpPos/interval][j];
				else {
					lerpY[i][j] = lerpXPrim[Math.floor(lerpPos/interval)][j]*Math.cos(lerpPos/c) + lerpXPrim[Math.ceil(lerpPos/interval)][i]*Math.sin(lerpPos/c);
				}
			}
		}
	}

	return lerpX.map((arr, x) => {
		return arr.map((val, y) => {
			return (val + lerpY[x][y])/2 
		})
	})
}