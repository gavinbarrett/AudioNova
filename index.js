const button1 = document.getElementById("button1");

let audio1 = new Audio();
audio1.src = 'bsd.u_hidden-bonus.mp3';

button1.addEventListener('click', () => {
	audio1.play();
});
