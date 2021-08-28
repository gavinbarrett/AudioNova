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
		// reset canvas dimensions upon resizing
		window.onresize = () => {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
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
		mode ? drawRadial(bufferLength, barHeight, dataArray) : drawBar(bufferLength, dataArray, x);
	}

	const drawBar = (bufferLength, dataArray, x) => {
		const barWidth = 2.5;//(canvas.width/2) / bufferLength;
		// ctx.fillStyle = '#f542ec';
		this.ctx.fillStyle = '#476FDE';
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

	const drawRadial = (bufferLength, barHeight, dataArray) => {
		const angle = 3.0;
		this.ctx.lineWidth = 2;
		let point = bufferLength - 120;
		dataArray.slice(point, bufferLength);
		//ctx.strokeStyle = '#f542ec'; //`rgb(${red}, ${green}, ${blue})`;
		ctx.strokeStyle = '#476FDE';
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

// FIXME: Update audiovis when:
//		1) User clicks on a new song
//		2) User loads a list of new songs
//		3) User switches modesc