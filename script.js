const canvas = document.getElementById("screen");
const context = canvas.getContext("2d");
let currentEmulator = "nes"; // default

// NES setup
const nes = new jsnes.NES({
  onFrame(frameBuffer) {
    const imageData = context.createImageData(256, 240);
    for (let i = 0; i < frameBuffer.length; i++) {
      const color = frameBuffer[i]; // 0xAARRGGBB
      imageData.data[i * 4 + 0] = (color >> 16) & 0xff;
      imageData.data[i * 4 + 1] = (color >> 8) & 0xff;
      imageData.data[i * 4 + 2] = color & 0xff;
      imageData.data[i * 4 + 3] = 0xff;
    }
    context.putImageData(imageData, 0, 0);
  },
  onStatusUpdate: console.log,
  onAudioSample: () => {}
});

// Game Boy setup
let gb;
function initGB(romBuffer) {
  gb = new GameBoy(canvas, romBuffer);
  gb.start();
}

// file loader
document.getElementById("romLoader").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function() {
    if (currentEmulator === "nes") {
      nes.loadROM(reader.result);
      requestAnimationFrame(frameLoop);
    } else if (currentEmulator === "gb") {
      const arrayBuffer = reader.result;
      initGB(arrayBuffer);
    }
  };

  if (currentEmulator === "nes") {
    reader.readAsBinaryString(file);
  } else {
    reader.readAsArrayBuffer(file);
  }
});

// render loop for NES
let lastFrameTime = 0;
function frameLoop(timestamp) {
  if (timestamp - lastFrameTime >= 1000 / 60) {
    nes.frame();
    lastFrameTime = timestamp;
  }
  requestAnimationFrame(frameLoop);
}

// fullscreen
function goFullscreen() {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  }
}

// keyboard mapping (NES only)
document.addEventListener("keydown", e => {
  if (currentEmulator !== "nes") return;
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
  if (currentEmulator !== "nes") return;
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

// modal
const modal = document.getElementById("controlsModal");
const showBtn = document.getElementById("showControls");
const closeBtn = document.getElementById("closeModal");
const controlsList = document.getElementById("controlsList");

showBtn.onclick = () => { 
  modal.style.display = "block"; 
  updateControls();
};
closeBtn.onclick = () => { modal.style.display = "none"; };
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

function updateControls() {
  if (currentEmulator === "nes") {
    controlsList.innerHTML = `
      <li>⬆️ ⬇️ ⬅️ ➡️ = D-Pad</li>
      <li>Z = A button</li>
      <li>X = B button</li>
      <li>Enter = Start</li>
      <li>Shift = Select</li>`;
  } else {
    controlsList.innerHTML = `
      <li>⬆️ ⬇️ ⬅️ ➡️ = D-Pad</li>
      <li>Z = A button</li>
      <li>X = B button</li>
      <li>Enter = Start</li>
      <li>Backspace = Select</li>`;
  }
}

// tab switching
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentEmulator = btn.dataset.emulator;
    context.clearRect(0, 0, canvas.width, canvas.height);
  });
});
