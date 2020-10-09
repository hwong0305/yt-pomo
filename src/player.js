const tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
let loaded = false;
let playing = false;
let state = "session";
let current;

const stopBtn = document.getElementById("stop");
const startTime = document.getElementById("startTime");
const breakContainer = document.getElementById("break");
const sessionContainer = document.getElementById("session");
const sessionLength = document.getElementById("sessionLength");
const breakLength = document.getElementById("breakLength");
const timeContainer = document.getElementById("time");
const loadBtn = document.getElementById("load");
const youtubeContainer = document.getElementById("yt");
const playButton = document.getElementById("playPause");
const resetButton = document.getElementById("reset");

resetButton.onclick = () => {
  playing = false;
  player.stopVideo(); // always
  playButton.children[0].classList = "icon play";
  if (state === "session") {
    state = "break";
    timeContainer.innerText = `${parseTimeDisplay(breakLength.innerText)}:00`;
  } else {
    state = "session";
    timeContainer.innerText = `${parseTimeDisplay(sessionLength.innerText)}:00`;
  }
  if (playing) {
    clearInterval(current);
    current = null;
  }
};

loadBtn.onclick = setPlayer;

breakContainer.addEventListener("click", function (event) {
  if (event.target.getAttribute("name") === "down" || event.target.parentNode.getAttribute("name") === "down") {
    if (breakLength.innerText === "1") return;
    breakLength.innerText = Number(breakLength.innerText) - 1;
  }
  if (event.target.getAttribute("name") === "up" || event.target.parentNode.getAttribute("name") === "up") {
    breakLength.innerText = Number(breakLength.innerText) + 1;
  }
});

sessionContainer.addEventListener("click", function (event) {
  if (event.target.getAttribute("name") === "down" || event.target.parentNode.getAttribute("name") === "down") {
    if (sessionLength.innerText === "1") return;
    sessionLength.innerText = Number(sessionLength.innerText) - 1;
  }
  if (event.target.getAttribute("name") === "up" || event.target.parentNode.getAttribute("name") === "up") {
    sessionLength.innerText = Number(sessionLength.innerText) + 1;
  }
});

playButton.addEventListener("click", function (event) {
  if (!player || !youtubeContainer.value) return;

  if (!playing) {
    const endTime =
      Date.now() +
      Number(timeContainer.innerText.split(":")[1]) * 1000 +
      Number(timeContainer.innerText.split(":")[0]) * 60 * 1000;
    playing = true;
    playButton.children[0].classList = "icon pause";

    current = setInterval(() => {
      if (Date.now() >= endTime) {
        clearInterval(current);
        timeContainer.innerText = "00:00";
        current = null;
        const parsedTime = Number(startTime.value.split(":")[0]) * 60 + Number(startTime.value.split(":")[1]);
        player.cueVideoById({
          videoId: youtubeContainer.value.split("?v=")[1],
          startSeconds: parsedTime,
        });
        player.playVideo();
        // Limit the clip to 30 seconds
        setTimeout(() => {
          player.stopVideo();
          playButton.children[0].classList = "icon play";
        }, 30000);
      } else {
        timeContainer.innerText = displayTime(endTime);
      }
    }, 500);
  } else {
    playButton.children[0].classList = "icon play";
    player.stopVideo();
    clearInterval(current);
    playing = false;
  }
});

function displayTime(endTime) {
  const diff = endTime - Date.now();
  return `${parseTimeDisplay(Math.floor(diff / 1000 / 60))}:${parseTimeDisplay(Math.floor((diff / 1000) % 60))}`;
}

function parseTimeDisplay(time) {
  return time >= 10 ? time : "0" + time;
}

function setPlayer() {
  if (!loaded) {
    player = new YT.Player("player", {
      height: 0,
      width: 0,
      playerVars: { autoplay: 0 },
      videoId: `${youtubeContainer.value.split("?v=")[1]}`,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

    playing = false;
    loaded = true;
  } else {
    player.cueVideoById({
      videoId: youtubeContainer.value.split("?v=")[1],
      startSeconds: 5,
    });
  }
}

function onPlayerStateChange(event) {
  console.log("event", event);
}

function onPlayerReady(event) {
  event.target.setVolume(100);
}

function onYouTubeIframeAPIReady() {}
