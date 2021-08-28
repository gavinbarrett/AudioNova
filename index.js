const audioContext = new AudioContext();

const container = document.getElementById("container");

const file = document.getElementById("fileupload");

const canvas = document.getElementById("canvas1");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

let audioSource;
let analyzer;

const controller = document.getElementById("controller");

controller.addEventListener('mouseenter', () => {
	console.log('Hovering over the controller');
	let selector = document.getElementById("selector");
	let filelist = document.getElementById("filelist");
	let upload = document.getElementById("fileupload");
	selector.style.display = "flex";
	filelist.style.display = "flex";
	upload.style.display = "flex"
	// show the files list, radio controller, browse file button
});

controller.addEventListener('mouseleave', () => {
	console.log('Leaving the controller');
	let selector = document.getElementById("selector");
	let filelist = document.getElementById("filelist");
	let upload = document.getElementById("fileupload");
	selector.style.display = "none";
	filelist.style.display = "none";
	upload.style.display = "none"
	// hide the files list, radio controller, browse files button
});

file.addEventListener("change", function() {
	console.log(this.files);
	const files = this.files;
	const audio1 = document.getElementById("audio1");
	const fileLength = files.length;
	const filelist = document.getElementById('filelist');
	for (let i = 0; i < files.length; i++) {
		let div = document.createElement("div");
		let song = document.createElement("p");
		song.textContent = files[i].name;
		div.appendChild(song);
		filelist.appendChild(div);
	}
	startPlaying(files);
});

const startPlaying = (files) => {
	// create base64 src
	audio1.src = URL.createObjectURL(files[0]);
	// change set file
	audio1.load();
	// play audio
	audio1.play();
	// get audio source from audio tag
	audioSource = audioContext.createMediaElementSource(audio1);
	// create audio analyzer object
	analyser = audioContext.createAnalyser();
	// connect to analyzer
	audioSource.connect(analyser);
	// connect analyzer to audio output
	analyser.connect(audioContext.destination)
	// set number of analyzer bars
	analyser.fftSize = 512;
	// half the amount of fftSize
	const bufferLength = analyser.frequencyBinCount;
	// create buffer to store data
	let dataArray = new Uint8Array(bufferLength);	
	// size with of audio bars evenly
	const barWidth = (canvas.width/2) / bufferLength;
	let barHeight;
	let x;
	function animate() {
		x = 0;
		// clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// extract next audio data into dataArray
		analyser.getByteFrequencyData(dataArray);
		// call draw function
		animationVisualizer(bufferLength, barHeight, dataArray, x, 1);
		// run animation
		requestAnimationFrame(animate);
	}
	animate();
}

const computePoint = (x, y, length, angle) => {
	let x_1 = x + length * Math.cos(angle);
	let y_1 = y + length * Math.sin(angle);
	return [x_1, y_1];
}

function animationVisualizer(bufferLength, barHeight, dataArray, x, mode) {
	if (mode == 1) {
		drawRadial(bufferLength, barHeight, dataArray);
	} else {
		drawBar(bufferLength, barHeight, dataArray, x);
	}
}

const drawBar = (bufferLength, barHeight, dataArray, x) => {
	console.log(`Drawing bars`);
	const barWidth = (canvas.width/2) / bufferLength;
	// ctx.fillStyle = '#f542ec';
	ctx.fillStyle = '#476FDE';
	for (let i = 0; i < bufferLength; i++) {
		let barHeight = dataArray[i];
		// choose colors
		ctx.fillRect(canvas.width/2 - x, canvas.height - barHeight - 150, barWidth, barHeight);
		x += barWidth;
	}
}

const drawRadial = (bufferLength, barHeight, dataArray) => {
	const anglePoint = 3.0;
	ctx.lineWidth = 2;
	let point = bufferLength - 120;
	dataArray.slice(point, bufferLength);
	//ctx.strokeStyle = '#f542ec'; //`rgb(${red}, ${green}, ${blue})`;
	ctx.strokeStyle = '#476FDE';
	for (let i = 0; i < 120; i++) {
		// get current height
		barHeight = dataArray[i];
		let [newX, newY] = computePoint(canvas.width / 2, canvas.height / 2, barHeight * 2.5, i * anglePoint);
		ctx.beginPath();
		ctx.moveTo(canvas.width / 2, canvas.height / 2);
		ctx.lineTo(newX, newY);
		ctx.stroke();
	}
}