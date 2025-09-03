console.log('Lets write JavaScript for My Music');
let currentSong = new Audio();
let songs;
let currFolder;
let isShuffled = false;
let isRepeating = false;
let songHistory = [];
let historyIndex = -1;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>My Music</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
    
    // Update full screen player details
    document.querySelector("#full-screen-song-title").textContent = decodeURI(track);
    document.querySelector("#full-screen-artist-name").textContent = "My Music";
    
    // Add to history
    songHistory.push(track);
    historyIndex = songHistory.length - 1;
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    });
}

function playNextSong() {
    let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (isShuffled) {
        let randomIndex = Math.floor(Math.random() * songs.length);
        playMusic(songs[randomIndex]);
    } else if (isRepeating) {
        playMusic(songs[currentIndex]);
    } else {
        if ((currentIndex + 1) < songs.length) {
            playMusic(songs[currentIndex + 1]);
        }
    }
}


async function main() {
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    await displayAlbums()

    // Event listeners for playbar controls
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })
    
    // Play next song automatically when current song ends
    currentSong.addEventListener("ended", playNextSong);

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Added shuffle and repeat buttons
    document.querySelector("#shuffle").addEventListener("click", () => {
        isShuffled = !isShuffled;
        document.querySelector("#shuffle").style.filter = isShuffled ? "invert(0) sepia(100%) saturate(1000%) hue-rotate(80deg) brightness(1.2)" : "invert(1)";
    });

    document.querySelector("#repeat").addEventListener("click", () => {
        isRepeating = !isRepeating;
        document.querySelector("#repeat").style.filter = isRepeating ? "invert(0) sepia(100%) saturate(1000%) hue-rotate(80deg) brightness(1.2)" : "invert(1)";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range input").value = 10;
        }
    });

    // Full screen player on album art click
    document.querySelector('.playbar').addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG' && event.target.alt === 'Album Art') {
            document.querySelector('.full-screen-player-overlay').style.display = 'flex';
        }
    });

    // Exit full screen on click
    document.querySelector('.full-screen-player-overlay').addEventListener('click', () => {
        document.querySelector('.full-screen-player-overlay').style.display = 'none';
    });

    // Dark/Light Mode toggle
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLightMode = document.body.classList.contains('light-mode');
        darkModeToggle.querySelector('img').src = isLightMode ? "img/moon.svg" : "img/sun.svg";
        document.documentElement.style.setProperty('--main-bg', isLightMode ? '#f0f0f0' : '#1c1c1e');
        document.documentElement.style.setProperty('--panel-bg', isLightMode ? '#ffffff' : '#2a2a2e');
        document.documentElement.style.setProperty('--card-bg', isLightMode ? '#e0e0e0' : '#2d2d31');
        document.documentElement.style.setProperty('--text-color', isLightMode ? '#333333' : '#ffffff');
    });

}

main();