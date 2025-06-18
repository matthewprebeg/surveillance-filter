const lines = [
  ">>> INITIATING NETWORK SEQUENCE...",
  ">>> SCANNING FOR HUMAN PRESENCE...",
  ">>> SIGNAL ACQUIRED",
  ">>> CALIBRATING GAZE PROTOCOL...",
  ">>> LOADING SURVEILLANCE MODULE...",
  ">>> AUTHORIZATION REQUIRED",
   "",
  ">>> DO YOU CONSENT TO BE SEEN?"
];

let index = 0;
const output = document.getElementById('terminal-output');
const btn = document.getElementById('consent-button');

function typeNextLine() {
  if (index < lines.length) {
    output.textContent += lines[index] + "\n";
    index++;
    setTimeout(typeNextLine, 700);
  } else {
    btn.style.display = 'inline-block';
  }
}

window.addEventListener('load', () => {
  btn.style.display = 'none';
  typeNextLine();
});

btn.addEventListener('click', () => {
  const boot = document.getElementById('boot-screen');
  boot.classList.add('glitch-out');

  setTimeout(() => {
    boot.style.display = 'none';
    document.getElementById('content').style.display = 'block';
  }, 1000); // match the animation duration
});

