const runNovaEngine = () => {

	init = () => {
		// set up the canvas sizing and resizing
		this.setupWindow();
		// set up the controller
		this.setupController();
		this.mode = 0;
		// create a new audio context
		this.getNewAudioContext();
		// pull elements from the dom
		this.getAppElements();
		// set up file handlers
		this.getAppFiles();
	}

	setupWindow = () => {
		// save canvas object
		this.canvas = document.getElementById("canvas1");
		// save canvas context object
		this.ctx = this.canvas.getContext("2d");
		// set canvas dimensions
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.colorNum = 4681694;
		this.color = '#476FDE';
		this.colorIndex = 4;
		this.colorMap = [
			0xff0000,	// red
			0xffa500,	// orange
			0xffff00,	// yellow
			0x00ff00,	// green
			0x0000ff,	// blue
			0xa020f0,	// purple
		];
		// reset canvas dimensions upon resizing
		window.onresize = () => {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
		// set keydown event for controlling colors
		document.addEventListener('keydown', event => {
			if (event.key == "ArrowRight") {
				this.colorNum = (this.colorNum + 1) % 16777215;
				this.color = computeColor();
			} else if (event.key == "ArrowUp") {
				this.colorIndex = mod(this.colorIndex + 1, 6);
				this.colorNum = this.colorMap[this.colorIndex];
				this.color = computeColor();
			} else if (event.key == "ArrowDown") {
				this.colorIndex = mod(this.colorIndex - 1, 6);
				this.colorNum = this.colorMap[this.colorIndex];
				this.color = computeColor();
			}
		});
	}

	setupController = () => {
		const controller = document.getElementById("controller");
		const barMode = document.getElementById("bar");
		const radialMode = document.getElementById("radial");
		controller.addEventListener('mouseenter', () => {
			// show controller features
			this.selector.style.display = "flex";
			this.filelist.style.display = "flex";
			this.fileupload.style.display = "flex"
		});
		controller.addEventListener('mouseleave', () => {
			// hide controller features
			this.selector.style.display = "none";
			this.filelist.style.display = "none";
			this.fileupload.style.display = "none"
		});
		barMode.addEventListener('click', () => { mode = 0; });
		radialMode.addEventListener('click', () => { mode = 1; } );
	}

	getNewAudioContext = () => {
		this.audioContext = new AudioContext();
	}

	getAppElements = () => {
		this.selector = document.getElementById("selector");
		this.filelist = document.getElementById("filelist");
		this.fileupload = document.getElementById("fileupload");
		this.audio = document.getElementById("audio1");
		this.audio.addEventListener('ended', () => {
			// increment song counter
			this.songIndex = (this.songIndex + 1) % this.songUploader.files.length;
			// play the next song, or start from the beginning
			startPlaying(this.songUploader.files[this.songIndex]);
		});
	}

	getAppFiles = () => {
		this.songUploader = document.getElementById("fileupload");
		this.songUploader.addEventListener('change', () => {
			this.songIndex = 0;
			this.allSongs = {};
			//console.log(this.songUploader.files);
			const files = this.songUploader.files;
			const fileLength = files.length;
			// clear old files
			this.filelist.innerHTML = '';
			for (let i = 0; i < files.length; i++) {
				let div = document.createElement("div");
				let song = document.createElement("p");
				song.addEventListener('click', s => {
					console.log(`Clicked on a song: ${song.textContent}`);
					console.log(allSongs[song.textContent]);
					startPlaying(allSongs[song.textContent]);
				})
				// add the file to the map
				allSongs[files[i].name] = files[i];
				// add the file name to the list of available files in the controller
				song.textContent = files[i].name;
				// add the song element to the div wrapper; we need the div wrapper for the marquee animation
				div.appendChild(song);
				// add song to the list
				this.filelist.appendChild(div);
			}
			// start playing the first file
			startPlaying(this.songUploader.files[this.songIndex]);
		});
	}

	const startPlaying = file => {
		if (this.analyser) this.analyser.disconnect();
		// create base64 src
		this.audio.src = URL.createObjectURL(file);
		// change set file
		this.audio1.load();
		// play audio
		this.audio1.play();
		// get audio source from audio tag
		this.audioSource = this.audioContext.createMediaElementSource(audio1);
		// create audio analyzer object
		this.analyser = this.audioContext.createAnalyser();
		// connect to analyzer
		this.audioSource.connect(analyser);
		// connect analyzer to audio output
		analyser.connect(this.audioContext.destination)
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
		const animate = () => {
			x = 0;
			// clear canvas
			this.ctx.clearRect(0, 0, canvas.width, canvas.height);
			// extract next audio data into dataArray
			analyser.getByteFrequencyData(dataArray);
			// call draw function
			animationVisualizer(bufferLength, barHeight, dataArray, x, this.mode);
			// run animation
			requestAnimationFrame(animate);
		}
		animate();
	}

	const animationVisualizer = (bufferLength, barHeight, dataArray, x, mode) => {
		// draw bar graph or radial graph based on the mode
		mode ? drawRadial(bufferLength, barHeight, dataArray) : drawBar(bufferLength, dataArray, x);
	}

	const drawBar = (bufferLength, dataArray, x) => {
		const barWidth = 2.5;//(canvas.width/2) / bufferLength;
		// ctx.fillStyle = '#f542ec';
		this.ctx.fillStyle = this.color;
		for (let i = 0; i < bufferLength; i++) {
			let barHeight = dataArray[i];
			// choose colors
			this.ctx.fillRect(canvas.width/2 - x, canvas.height - barHeight - 300, barWidth, barHeight * 2);
			this.ctx.fillRect(canvas.width/2 + x, canvas.height - barHeight - 300, barWidth, barHeight * 2);
			x += barWidth;
		}
	}

	const computeRadialPoint = (x, y, length, angle) => {
		let x_1 = x + length * Math.cos(angle);
		let y_1 = y + length * Math.sin(angle);
		return [x_1, y_1];
	}

	const computeColor = () => {
		// get the hex color
		const num = this.colorNum.toString(16);
		// return the padded hex color
		return '#' + ('0'.repeat(6 - num.length)) + num;
	}

	const mod = (num, modulus) => {
		if (num >= 0) return num % modulus;
		let abs = Math.abs(num);
		if (abs < modulus) return modulus - abs;
		return modulus - (abs % modulus);
	}

	const drawRadial = (bufferLength, barHeight, dataArray) => {
		const angle = 3.0;
		this.ctx.lineWidth = 4;
		let point = bufferLength - 120;
		dataArray.slice(point, bufferLength);
		ctx.strokeStyle = this.color;
		for (let i = 0; i < 120; i++) {
			// get current height
			barHeight = dataArray[i];
			let [newX, newY] = computeRadialPoint(canvas.width / 2, canvas.height / 2, barHeight * 2, i * angle);
			ctx.beginPath();
			ctx.moveTo(canvas.width / 2, canvas.height / 2);
			ctx.lineTo(newX, newY);
			ctx.stroke();
		}
	}
	// initialize the visualizer
	this.init();
}

// run the visualizer
runNovaEngine();