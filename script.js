const canvas = document.getElementById("screen");
const context = canvas.getContext("2d");
const imageData = context.getImageData(0, 0, 256, 240);

const nes = new jsnes.NES({
  onFrame(frameBuffer) {
    for (let i = 0; i < frameBuffer.length; i++) {
      imageData.data[i * 4 + 0] = (frameBuffer[i] >> 16) & 0xff; // red
      imageData.data[i * 4 + 1] = (frameBuffer[i] >> 8) & 0xff;  // green
      imageData.data[i * 4 + 2] = frameBuffer[i] & 0xff;         // blue
      imageData.data[i * 4 + 3] = 0xff;                          // alpha
    }
  },
  onStatusUpdate: console.log,
  onAudioSample: () => {}
});

// load rom file
document.getElementById("romLoader").addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function() {
      nes.loadROM(reader.result);
      requestAnimationFrame(frameLoop);
    };
    reader.readAsBinaryString(file);
  }
});

// render loop, locked to 60fps
let lastFrameTime = 0;
function frameLoop(timestamp) {
  if (timestamp - lastFrameTime >= 1000 / 60) {
    nes.frame();
    context.putImageData(imageData, 0, 0);
    lastFrameTime = timestamp;
  }
  requestAnimationFrame(frameLoop);
}

// fullscreen support
function goFullscreen() {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  }
}

// keyboard input mapping
document.addEventListener("keydown", e => {
  switch (e.key.toLowerCase()) {
    case "arrowup": nes.buttonDown(1, jsnes.Controller.BUTTON_UP); break;
    case "arrowdown": nes.buttonDown(1, jsnes.Controller.BUTTON_DOWN); break;
    case "arrowleft": nes.buttonDown(1, jsnes.Controller.BUTTON_LEFT); break;
    case "arrowright": nes.buttonDown(1, jsnes.Controller.BUTTON_RIGHT); break;
    case "z": nes.buttonDown(1, jsnes.Controller.BUTTON_A); break;
    case "x": nes.buttonDown(1, jsnes.Controller.BUTTON_B); break;
    case "enter": nes.buttonDown(1, jsnes.Controller.BUTTON_START); break;
    case "shift": nes.buttonDown(1, jsnes.Controller.BUTTON_SELECT); break;
  }
});

document.addEventListener("keyup", e => {
  switch (e.key.toLowerCase()) {
    case "arrowup": nes.buttonUp(1, jsnes.Controller.BUTTON_UP); break;
    case "arrowdown": nes.buttonUp(1, jsnes.Controller.BUTTON_DOWN); break;
    case "arrowleft": nes.buttonUp(1, jsnes.Controller.BUTTON_LEFT); break;
    case "arrowright": nes.buttonUp(1, jsnes.Controller.BUTTON_RIGHT); break;
    case "z": nes.buttonUp(1, jsnes.Controller.BUTTON_A); break;
    case "x": nes.buttonUp(1, jsnes.Controller.BUTTON_B); break;
    case "enter": nes.buttonUp(1, jsnes.Controller.BUTTON_START); break;
    case "shift": nes.buttonUp(1, jsnes.Controller.BUTTON_SELECT); break;
  }
});

// modal logic
const modal = document.getElementById("controlsModal");
const showBtn = document.getElementById("showControls");
const closeBtn = document.getElementById("closeModal");

showBtn.onclick = () => { modal.style.display = "block"; };
closeBtn.onclick = () => { modal.style.display = "none"; };
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
