
const audioContext = new AudioContext();

const container = document.getElementById("container");

const file = document.getElementById("fileupload");

const canvas = document.getElementById("canvas1");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

let audioSource;
let analyzer;

// FIXME: read file from fs 

container.addEventListener('click', () => {
	const audio1 = document.getElementById("audio1");
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
	analyser.fftSize = 256;
	// half the amount of fftSize
	const bufferLength = analyser.frequencyBinCount;
	// create buffer to store data
	let dataArray = new Uint8Array(bufferLength);	
	// size with of audio bars evenly
	const barWidth = canvas.width / bufferLength;
	let barHeight;
	let x;

	function animate() {
		x = 0;
		// clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// extract next audio data into dataArray
		analyser.getByteFrequencyData(dataArray);

		for (let i = 0; i < bufferLength; i++) {
			barHeight = dataArray[i];
			ctx.fillStyle = 'white';
			ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
			x += barWidth;
		}

		// run animation
		requestAnimationFrame(animate);
	}
	animate();


});

file.addEventListener("change", function() {
	console.log(this.files);
	const files = this.files;
	const audio1 = document.getElementById("audio1");
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
	const barWidth = canvas.width / bufferLength;
	let barHeight;
	let x;


	function animate() {
		x = 0;
		// clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// extract next audio data into dataArray
		analyser.getByteFrequencyData(dataArray);
		// call draw function
		animationVisualizer(bufferLength, x, barWidth, barHeight, dataArray);
		// run animation
		requestAnimationFrame(animate);
	}
	animate();
});

function animationVisualizer(bufferLength, x, barWidth, barHeight, dataArray) {
	for (let i = 0; i < bufferLength; i++) {
		barHeight = dataArray[i];
		const red = i * barHeight/20;
		const green = i * 4;
		const blue = barHeight/2;
		ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
		ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
		x += barWidth;
	}
}
