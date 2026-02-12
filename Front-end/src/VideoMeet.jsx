import React, { useEffect, useRef, useState } from "react";
import "./videoMeet.css";
import Button from "@mui/material/Button";
import io from "socket.io-client";
import { Badge, styled, TextField } from "@mui/material";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import CallEndOutlinedIcon from "@mui/icons-material/CallEndOutlined";
import ScreenShareOutlinedIcon from "@mui/icons-material/ScreenShareOutlined";
import StopScreenShareOutlinedIcon from "@mui/icons-material/StopScreenShareOutlined";
import MarkChatUnreadOutlinedIcon from "@mui/icons-material/MarkChatUnreadOutlined";
import SendSharpIcon from "@mui/icons-material/SendSharp";

import { useNavigate } from "react-router-dom";
const serverurl = "http://localhost:9000";

const connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  let socketIdRef = useRef();
  const navigate = useNavigate();
  let localVideoRef = useRef();
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();

  let [video, setVideo] = useState(true);
  let [audio, setAudio] = useState(true);
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState(false);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessage, setNewMessage] = useState(3);
  let [askForUserName, setAskForUserName] = useState(true);
  let [username, setUserName] = useState("");
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      // Get existing senders
      const senders = connections[id].getSenders();

      // Replace or add tracks
      stream.getTracks().forEach((track) => {
        const sender = senders.find(
          (s) => s.track && s.track.kind === track.kind,
        );
        if (sender) {
          // Replace existing track
          sender.replaceTrack(track);
        } else {
          // Add new track if no sender exists for this kind
          connections[id].addTrack(track, stream);
        }
      });

      connections[id]
        .createOffer()
        .then((description) => {
          connections[id].setLocalDescription(description).then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          });
        })
        .catch((e) => console.log(e));
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let track = localVideoRef.current.srcObject.getTracks();
            track.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].getSenders().forEach((sender) => {
              connections[id].removeTrack(sender);
            });

            window.localStream.getTracks().forEach((track) => {
              connections[id].addTrack(track, window.localStream);
            });

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }),
    );
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    // Instead of recreating the stream, just toggle the tracks
    if (window.localStream) {
      const videoTracks = window.localStream.getVideoTracks();
      const audioTracks = window.localStream.getAudioTracks();

      // Toggle video track
      videoTracks.forEach((track) => {
        track.enabled = video && videoAvailable;
      });

      // Toggle audio track
      audioTracks.forEach((track) => {
        track.enabled = audio && audioAvailable;
      });
    }
  };

  const getPermissions = async () => {
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (userMediaStream) {
        setVideoAvailable(true);
        setAudioAvailable(true);
        window.localStream = userMediaStream;
        window.Stream = userMediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
      }
    } catch (error) {
      if (error.name === "NotAllowedError") {
        console.warn("User denied camera/microphone permissions.");
      } else {
        console.warn(
          "Failed to get both video and audio, trying individually:",
          error,
        );
      }

      let vStream, aStream;
      try {
        vStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoAvailable(true);
      } catch (vError) {
        setVideoAvailable(false);
      }

      try {
        aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioAvailable(true);
      } catch (aError) {
        setAudioAvailable(false);
      }

      if (vStream || aStream) {
        const combinedStream = new MediaStream([
          ...(vStream ? vStream.getVideoTracks() : []),
          ...(aStream ? aStream.getAudioTracks() : []),
        ]);
        window.localStream = combinedStream;
        window.Stream = combinedStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = combinedStream;
        }
      }
    }

    if (navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    } else {
      setScreenAvailable(false);
    }
  };

  let gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let addMessage = (data, message, soketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);

    if (soketIdSender === socketIdRef.current) {
      setMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io(serverurl, {
      transports: ["websocket"],
      secure: false,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully! ID:", socketRef.current.id);
      setAskForUserName(false);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.emit("join-call", window.location.href);
    });

    // Set up signal handler
    socketRef.current.on("signal", gotMessageFromServer);

    // Set up message handler
    socketRef.current.on("message", addMessage);

    // Set up user-left handler
    socketRef.current.on("user-left", (id) => {
      setVideos((videos) => videos.filter((video) => video.socketId !== id));
    });

    // Set up user-joined handler - FIXED: removed duplicate nested listeners
    socketRef.current.on("user-joined", (id, clients) => {
      clients.forEach((socketListId) => {
        // Prevent reconnecting to existing peers or self
        if (connections[socketListId] || socketListId === socketIdRef.current) {
          return;
        }

        connections[socketListId] = new RTCPeerConnection(
          peerConfigConnections,
        );

        connections[socketListId].onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit(
              "signal",
              socketListId,
              JSON.stringify({ ice: event.candidate }),
            );
          }
        };

        // Use ontrack instead of deprecated onaddstream
        connections[socketListId].ontrack = (event) => {
          console.log(
            "ontrack triggered for socket:",
            socketListId,
            "stream:",
            event.streams[0],
          );

          // Check if this peer's video already exists in the state
          setVideos((prevVideos) => {
            const videoExists = prevVideos.find(
              (video) => video.socketId === socketListId,
            );

            if (videoExists) {
              // Update existing video with the new stream
              const updatedVideos = prevVideos.map((video) =>
                video.socketId === socketListId
                  ? { ...video, stream: event.streams[0] }
                  : video,
              );
              videoRef.current = updatedVideos;
              return updatedVideos;
            } else {
              // Add new video only if it doesn't exist
              let newvideo = {
                socketId: socketListId,
                stream: event.streams[0],
                autoplay: true,
                playsinline: true,
              };
              const updatedVideos = [...prevVideos, newvideo];
              videoRef.current = updatedVideos;
              return updatedVideos;
            }
          });
        };

        if (window.localStream !== undefined && window.localStream !== null) {
          window.localStream.getTracks().forEach((track) => {
            connections[socketListId].addTrack(track, window.localStream);
          });
        } else {
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          window.localStream.getTracks().forEach((track) => {
            connections[socketListId].addTrack(track, window.localStream);
          });
        }
      });

      if (id === socketIdRef.current) {
        for (let id2 in connections) {
          if (id2 === socketIdRef.current) continue;

          try {
            window.localStream.getTracks().forEach((track) => {
              connections[id2].addTrack(track, window.localStream);
            });
          } catch (e) {}

          connections[id2]
            .createOffer()
            .then((description) => {
              return connections[id2].setLocalDescription(description);
            })
            .then(() => {
              socketRef.current.emit(
                "signal",
                id2,
                JSON.stringify({ sdp: connections[id2].localDescription }),
              );
            })
            .catch((e) => console.log(e));
        }
      }
    });
  };

  useEffect(() => {
    getPermissions();
  }, []);

  // Effect to handle video/audio state changes
  useEffect(() => {
    if (!askForUserName && socketRef.current) {
      getUserMedia();
    }
  }, [video, audio]);

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getDisplayMediaSuccess = (stream) => {
    // Store the original camera/mic stream before replacing it
    window.originalStream = window.localStream;

    // Set the screen share stream as the local stream
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    // Replace video track in all peer connections
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      const senders = connections[id].getSenders();
      const screenVideoTrack = stream.getVideoTracks()[0];

      // Find and replace the video sender
      const videoSender = senders.find(
        (sender) => sender.track && sender.track.kind === "video",
      );
      if (videoSender && screenVideoTrack) {
        videoSender
          .replaceTrack(screenVideoTrack)
          .catch((e) => console.log("Error replacing video track:", e));
      }

      // Create new offer after track replacement
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    // Handle when user stops screen share from browser UI
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);
        }),
    );
  };

  let stopScreenShare = () => {
    try {
      // Stop all tracks from the screen share stream
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log("Error stopping screen share tracks:", e);
    }

    // Restore the original camera/mic stream
    if (window.originalStream) {
      window.localStream = window.originalStream;
      localVideoRef.current.srcObject = window.originalStream;

      // Replace tracks back to camera in all peer connections
      for (let id in connections) {
        if (id === socketIdRef.current) continue;

        const senders = connections[id].getSenders();
        const cameraVideoTrack = window.originalStream.getVideoTracks()[0];

        // Find and replace the video sender back to camera
        const videoSender = senders.find(
          (sender) => sender.track && sender.track.kind === "video",
        );
        if (videoSender && cameraVideoTrack) {
          videoSender
            .replaceTrack(cameraVideoTrack)
            .catch((e) => console.log("Error replacing video track:", e));
        }

        // Create new offer after track replacement
        connections[id].createOffer().then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription }),
              );
            })
            .catch((e) => console.log(e));
        });
      }
    } else {
      // Fallback: request camera/mic again if original stream is not available
      navigator.mediaDevices
        .getUserMedia({ video: videoAvailable, audio: audioAvailable })
        .then(getUserMediaSuccess)
        .catch((e) => console.log("Error restoring camera:", e));
    }
  };
  let getDisplayMedia = () => {
    if (screen) {
      // Start screen share
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .catch((e) => {
            console.log("Screen share error:", e);
            // Reset screen state if user cancels or error occurs
            setScreen(false);
          });
      }
    } else {
      // Stop screen share
      stopScreenShare();
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  return (
    <div className="">
      {askForUserName === true ? (
        <div className="onboarding">
          <h2 className=" mt-6">Enter into lobby</h2>

          <TextField
            id="outlined-basic"
            label="Enter UserName"
            variant="outlined"
            // className="white"
          />
          <Button variant="contained" onClick={connectToSocketServer}>
            Connect
          </Button>
          <div className="flex ml-30px">
            <video
              className="w-2xl rounded-xl    "
              ref={localVideoRef}
              autoPlay
              muted>
              {" "}
            </video>
          </div>
        </div>
      ) : (
        <div className="videoMeet">
          {showModal ? (
            <div className="chatroom">
              Chat
              <div className="chat">
                {message}
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  type="text"
                  className="messagebox"
                  placeholder="Message..."
                />
                <SendSharpIcon className="sendIcon" onClick={sendMessage} />
              </div>
            </div>
          ) : (
            ""
          )}

          <video
            className={`meetUserVideo ${video ? "" : "hidden"}`}
            ref={(ref) => {
              if (ref && window.localStream) {
                ref.srcObject = window.localStream;
              }
              localVideoRef.current = ref;
            }}
            autoPlay
            muted
          />
          <div
            className={`confrenceView ${
              videos.length === 1 ? "fullscreen-mode" : "grid-mode"
            }`}>
            {videos.map((video) => (
              <div
                className={`video-container ${
                  videos.length === 1 ? "fullscreen-video" : "grid-video"
                }`}
                key={video.socketId}>
                <video
                  className="conf-video"
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                />
              </div>
            ))}
          </div>
          <div className="buttonContainers">
            <div
              onClick={() => {
                setVideo(!video);
              }}
              // className="button-icon"
              style={{ cursor: "pointer" }}>
              {video == true ? (
                <VideocamOutlinedIcon className="svg1" />
              ) : (
                <VideocamOffOutlinedIcon className="svg1" />
              )}
            </div>

            <div
              onClick={() => {
                setAudio(!audio);
              }}
              className="button-icon"
              style={{ cursor: "pointer" }}>
              {audio == true ? (
                <MicNoneOutlinedIcon className="svg1" />
              ) : (
                <MicOffOutlinedIcon className="svg1" />
              )}
              {/* MicOffOutlinedIcon */}
            </div>

            <div
              onClick={handleScreen}
              className="button-icon"
              style={{ cursor: "pointer" }}>
              {screen == true ? (
                <ScreenShareOutlinedIcon className="svg1" />
              ) : (
                <StopScreenShareOutlinedIcon className="svg1" />
              )}
            </div>

            <Badge
              badgeContent={newMessage}
              onClick={() => setShowModal(!showModal)}
              color="secondary">
              <MarkChatUnreadOutlinedIcon className="svg1 " />
            </Badge>
            <CallEndOutlinedIcon
              className="callend"
              onClick={() => navigate("/")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
