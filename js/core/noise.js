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

	let c = Math.PI/(2*interval);
	let cAlt = 1/interval;

	for (let i = 0; i < noise.length; i++) {
		lerpXPrim.push([]);
		for (let j = 0; j <= w; j++) {
			let lerpPos = j%interval;
			if (lerpPos == 0) lerpXPrim[i][j] = noise[i][j/interval];
			else {
				lerpXPrim[i][j] = noise[i][Math.floor(j/interval)] + (noise[i][Math.ceil(j/interval)] - noise[i][Math.floor(j/interval)])*Math.sin(lerpPos*c);
			}
		}
	}
	for (let i = 0; i < noise[0].length; i++) {
		lerpYPrim.push([]);
		for (let j = 0; j <= h; j++) {
			let lerpPos = j%interval;
			if (lerpPos == 0) lerpYPrim[i][j] = noise[j/interval][i];
			else {
				lerpYPrim[i][j] = noise[Math.floor(j/interval)][i] + (noise[Math.ceil(j/interval)][i] - noise[Math.floor(j/interval)][i])*Math.sin(lerpPos*c);
			}
		}
	}

	for (let i = 0; i <= h; i++) {
		lerpX.push([]);
		for (let j = 0; j <= w; j++) {
			if (i%interval == 0) lerpX[i][j] = lerpXPrim[i/interval][j];
			else {
				let lerpPos = j%interval;
				if (lerpPos == 0) {
					lerpX[i][j] = lerpYPrim[j/interval][i];
				}
				else {
					lerpX[i][j] = lerpYPrim[Math.floor(j/interval)][i] + (lerpYPrim[Math.ceil(j/interval)][i] - lerpYPrim[Math.floor(j/interval)][i])*Math.sin(lerpPos*c);
					if (i == 1 && j < 21) {
						console.log((lerpYPrim[Math.floor(j/interval)][i] + (lerpYPrim[Math.ceil(j/interval)][i] - lerpYPrim[Math.floor(j/interval)][i])*Math.sin(lerpPos*c)).toFixed(3))
					}
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
				if (lerpPos == 0) lerpY[i][j] = lerpXPrim[i/interval][j];
				else {
					lerpY[i][j] = lerpXPrim[Math.floor(i/interval)][j] + (lerpXPrim[Math.ceil(i/interval)][j] - lerpXPrim[Math.floor(i/interval)][j])*Math.sin(lerpPos*c);
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