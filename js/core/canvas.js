let c, ctx;

function loadCanvas() {
	c = document.querySelector("#c");
	ctx = c.getContext("2d");
	c.width = 1000;
	c.height = 421;

	let testNoise = Noise(21, 21);
	let testLerp = Lerp(testNoise, 20);
	for (let i in testLerp) {
		for (let j in testLerp[i]) {
			ctx.fillStyle = `rgb(${testLerp[i][j]*255}, ${testLerp[i][j]*255}, ${testLerp[i][j]*255})`;
			ctx.fillRect(i, j, 1, 1);
		}
	}
	for (let i in testNoise) {
		for (let j in testNoise[i]) {
			ctx.fillStyle = `rgb(${testNoise[i][j]*255}, ${testNoise[i][j]*255}, ${testNoise[i][j]*255})`;
			ctx.fillRect(i*20 + 500, j*20, 20, 20);
		}
	}
}