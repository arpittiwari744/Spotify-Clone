let currentSong = new Audio();
let songs;
let currFolder;
//Toggle hamburger
function toggleContainer() {
  let container = document.querySelector(".left");
  container.style.left = "0";
}

//close container
document.getElementById("cross").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-120%";
});
//Function for show time in playbar
function secondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds with leading zeros
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  // Return the formatted string
  return `${formattedMinutes}:${formattedSeconds}`;
}

//Function for get all songs
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/assets/${folder}/`);
  let res = await a.text();

  let div = document.createElement("div");
  div.innerHTML = res;
  let as = div.getElementsByTagName("a");

  songs = [];

  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //Show all the songs in playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = `
    <li>
      <img class="invert" src="assets/svgs/music.svg" alt="musicimg"/>
      My Playlists
    </li>
  `;
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="assets/svgs/music.svg" alt="musicimg"/>
        ${song.replaceAll("%20", " ").split(".mp3")[0]}
      </li>`;
  }

  //After clicking, song will play
  Array.from(document.querySelector(".songlist").getElementsByTagName("li"))
    .slice(1)
    .forEach((e) => {
      e.addEventListener("click", (element) => {
        playMusic(e.textContent.trim());
      });
    });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/assets/${currFolder}/` + track + ".mp3";
  //   let audio = new Audio("/assets/songs/"+track+".mp3");
  //   audio.play();
  if (!pause) {
    currentSong.play();
    play.src = "assets/svgs/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML =
    decodeURI(track).split(".mp3")[0];
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

//Display albums
async function displayAlbums() {
  let a = await fetch(`/assets/songs/`);
  let res = await a.text();
  let div = document.createElement("div");
  div.innerHTML = res;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      //Get the meta data of the folder
      let a = await fetch(`/assets/songs/${folder}/info.json`);
      let res = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="cards">
      <svg
        class="play-button"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="48" fill="#00FF00" />
        <polygon points="35,25 35,75 75,50" fill="#000000" />
      </svg>
      <img
        src="assets/songs/${folder}/cover.jpg"
        alt="hits"
      />
      <h2>${res.title}</h2>
      <p>${res.description}</p>
    </div>`;
    }
  }
  //Load the folder when clicked
  Array.from(document.getElementsByClassName("cards")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0].replace(/\.mp3$/, ""));
    });
  });
}

//Main Function
async function main() {
  await getSongs("songs/Hindi");

  playMusic(songs[0].replace(/\.mp3$/, ""), true);

  //Display Albums
  displayAlbums();

  //Changing svgs in playbar of play button and play current song
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "assets/svgs/pause.svg";
    } else {
      currentSong.pause();
      play.src = "assets/svgs/play.svg";
    }
  });

  //Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )}/${secondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Change occurs after clicking seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add an event listener for next button
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      currentSong.pause();
      playMusic(songs[index + 1].replace(/\.mp3$/, ""));
    }
  });

  //Add an event listener for previous button
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index - 1 >= 0) {
      currentSong.pause();
      playMusic(songs[index - 1].replace(/\.mp3$/, ""));
    }
  });

  //Add an event listener for volume button
  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "vol.svg");
      } else {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("vol.svg", "mute.svg");
      }
    });
  //Add event listener for mute the music
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("vol.svg")) {
      e.target.src = e.target.src.replace("vol.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "vol.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
