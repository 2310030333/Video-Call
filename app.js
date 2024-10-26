const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startCallButton = document.getElementById("startCall");
const endCallButton = document.getElementById("endCall");

let localStream;
let peerConnection;
const signalingServerURL = "ws://localhost:3000"; // WebSocket server for signaling

// Initialize WebSocket for signaling
const signalingSocket = new WebSocket(signalingServerURL);

signalingSocket.onmessage = async (message) => {
    const data = JSON.parse(message.data);
    if (data.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingSocket.send(JSON.stringify({ answer }));
    } else if (data.answer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
};

// Initialize the video call
async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection();
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) signalingSocket.send(JSON.stringify({ candidate }));
    };

    peerConnection.ontrack = (event) => {
        [remoteVideo.srcObject] = event.streams;
    };

    // Create offer and send to server
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signalingSocket.send(JSON.stringify({ offer }));
}

// End the call
function endCall() {
    peerConnection.close();
    peerConnection = null;
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
}

startCallButton.onclick = startCall;
endCallButton.onclick = endCall;
