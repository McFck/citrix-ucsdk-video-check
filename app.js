const localVideo = document.querySelector("#localVideo");
const remoteVideo = document.querySelector("#remoteVideo");
const logBox = document.querySelector("#log");

let localStream;
let citrixStream;

function log(message) {
  const line = `[${new Date().toLocaleTimeString()}] ${message}`;
  logBox.textContent += `${line}\n`;
}

function checkUcSdk() {
  const bootstrap = window.CitrixBootstrap;
  const webRtc = window.CitrixWebRTC;

  for (const status of window.sdkScriptStatus || []) {
    log(status);
  }

  log(`CitrixBootstrap: ${bootstrap ? "loaded" : "missing"}`);
  log(`CitrixWebRTC: ${webRtc ? "loaded" : "missing"}`);

  if (bootstrap) {
    log(`CitrixBootstrap exports: ${Object.keys(bootstrap).join(", ") || "(none)"}`);
  }
  if (webRtc) {
    log(`CitrixWebRTC API: ${Object.getOwnPropertyNames(webRtc).join(", ") || "(none)"}`);
  }
}

function initCitrixSdk() {
  const sdk = window.CitrixWebRTC;
  if (!sdk) {
    throw new Error("CitrixWebRTC is not loaded");
  }

  try {
    sdk.initUCSDK("citrix-ucsdk-video-check");
    log("CitrixWebRTC.initUCSDK completed");
  } catch (error) {
    if (String(error.message || error).includes("already initialized")) {
      log("CitrixWebRTC already initialized");
    } else {
      throw error;
    }
  }

  if (typeof sdk.onConnectionChange === "function") {
    sdk.onConnectionChange(true);
    log("CitrixWebRTC.onConnectionChange(true) called");
  }
}

function getCitrixUserMedia(constraints) {
  return new Promise((resolve, reject) => {
    const sdk = window.CitrixWebRTC;
    const returned = sdk.getUserMedia(constraints, resolve, reject);

    if (returned && typeof returned.then === "function") {
      returned.then(resolve, reject);
    }
  });
}

async function start() {
  await stop();
  log("starting check");

  checkUcSdk();
  initCitrixSdk();

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    }
  });

  localVideo.srcObject = localStream;
  log("native browser camera attached");

  window.CitrixWebRTC.mapVideoElement(remoteVideo);
  log("Citrix SDK mapped second video element for optimized overlay rendering");

  citrixStream = await getCitrixUserMedia({
    audio: false,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    }
  });

  remoteVideo.srcObject = citrixStream;
  log("Citrix SDK camera stream attached to second video");
  log("Expected result: second box is rendered by the Citrix optimized endpoint/client path.");
}

async function stop() {
  if (localStream) {
    for (const track of localStream.getTracks()) track.stop();
  }
  localStream = null;

  if (citrixStream && typeof citrixStream.getTracks === "function") {
    for (const track of citrixStream.getTracks()) track.stop();
  }
  citrixStream = null;

  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
}

document.querySelector("#startBtn").addEventListener("click", () => {
  start().catch((error) => log(`error: ${error.message}`));
});
document.querySelector("#stopBtn").addEventListener("click", stop);

log("ready");
