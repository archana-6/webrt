/*const WebSocket= new Websocket("ws://127.0.0.1:3000");

let username;
function sendUserName(){
  username = document.getElementById("username").value;
  sendData({
      type: "store_user", //store the user in server
  })
}
//server knows how is the data belongs to
function sendData(data){
    data.username = username
    WebSocket.send(JSON.stringify(data))
}

let localStream
function startCall(){
    document.getElementById("video-call")
    .style.display ="inline"
    var mediaConstraints = {
        audio: true, // We want an audio track
        video: true // ...and we want a video track
      };
    navigator.getUserMedia({
        Video: {
            frameRate: 24,
            width: {
                min:480, ideal:720, max:1280
            },
            aspectRatio:1.33333
        },
        audio:true
    }, (stream) => {
        localStream= stream
        document.getElementById("localVideo").srcObject=localStream
    }, (error)=>{
        console.log(error);
    });
};*/
const webSocket = new WebSocket("ws://192.168.62.13:3000")
//it passes the msg from server to websocket
webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

let username
function sendUsername() {

    username = document.getElementById("username").value
    sendData({
        type: "store_user"
    })
}
//server knows how is the data belongs to
function sendData(data) {
    data.username = username
    webSocket.send(JSON.stringify(data))
}


let localStream
let peerConn
//start call  function is done to get the video and audio 
function startCall() {
    document.getElementById("video-call")
    .style.display = "inline"

    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        localStream = stream
        document.getElementById("localVideo").srcObject = localStream
          // calling turn & stun server
       let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }
 
        //establish the the peer connection to connect two peer
        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
            document.getElementById("remoteVideo")
            .srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })

        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })
}

//offer store in server if someone try to connect this peer the server send the offer and get that person offer
function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })

        peerConn.setLocalDescription(offer)
    }, (error) => {
        console.log(error)
    })
}

let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
} 
