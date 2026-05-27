const sdkUrls = [
  "https://cdn.jsdelivr.net/npm/@citrix/ucsdk@4.0.2/+esm",
  "https://esm.sh/@citrix/ucsdk@4.0.2",
  "https://unpkg.com/@citrix/ucsdk@4.0.2?module"
];

const localVideo = document.querySelector("#localVideo");
const remoteVideo = document.querySelector("#remoteVideo");
const logBox = document.querySelector("#log");

let localStream;
let pc1;
let pc2;

function log(message) {
  const line = `[${new Date().toLocaleTimeString()}] ${message}`;
  logBox.textContent += `${line}\n`;
}

async function loadUcSdk() {
  for (const url of sdkUrls) {
    try {
      log(`loading @citrix/ucsdk from ${url}`);
      const sdk = await import(url);
      log(`@citrix/ucsdk loaded. exports: ${Object.keys(sdk).join(", ") || "(none)"}`);
      return sdk;
    } catch (error) {
      log(`@citrix/ucsdk load failed from ${url}: ${error.message}`);
    }
  }
  return null;
}

async function probeCitrixBridge() {
  return new Promise((resolve) => {
    let socket;
    const timer = setTimeout(() => {
      if (socket) socket.close();
      log("Citrix bridge ws://127.0.0.1:9002 probe timed out");
      resolve();
    }, 2500);

    try {
      socket = new WebSocket("ws://127.0.0.1:9002");
      socket.onopen = () => {
        clearTimeout(timer);
        log("Citrix bridge ws://127.0.0.1:9002 is reachable");
        socket.close();
        resolve();
      };
      socket.onerror = () => {
        clearTimeout(timer);
        log("Citrix bridge ws://127.0.0.1:9002 is not reachable or blocked");
        resolve();
      };
    } catch (error) {
      clearTimeout(timer);
      log(`Citrix bridge probe failed: ${error.message}`);
      resolve();
    }
  });
}

async function start() {
  await stop();
  log("starting check");

  await loadUcSdk();
  await probeCitrixBridge();

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    }
  });

  localVideo.srcObject = localStream;
  log("camera stream attached to own camera feed");

  pc1 = new RTCPeerConnection();
  pc2 = new RTCPeerConnection();

  pc1.onicecandidate = (event) => {
    if (event.candidate) pc2.addIceCandidate(event.candidate);
  };

  pc2.onicecandidate = (event) => {
    if (event.candidate) pc1.addIceCandidate(event.candidate);
  };

  pc2.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
    log("loopback remote feed received track");
  };

  for (const track of localStream.getTracks()) {
    pc1.addTrack(track, localStream);
  }

  const offer = await pc1.createOffer();
  await pc1.setLocalDescription(offer);
  await pc2.setRemoteDescription(offer);
  const answer = await pc2.createAnswer();
  await pc2.setLocalDescription(answer);
  await pc1.setRemoteDescription(answer);

  log("WebRTC loopback connected");
  log("Expected result: both video boxes should show moving video.");
}

async function stop() {
  if (pc1) pc1.close();
  if (pc2) pc2.close();
  pc1 = null;
  pc2 = null;

  if (localStream) {
    for (const track of localStream.getTracks()) track.stop();
  }
  localStream = null;

  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
}

document.querySelector("#startBtn").addEventListener("click", () => {
  start().catch((error) => log(`error: ${error.message}`));
});
document.querySelector("#stopBtn").addEventListener("click", stop);

log("ready");
