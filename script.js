// fetch the songs 
let currentSong = new Audio()
let songs;
let currFolder;
let cardContainer = document.querySelector('.cardContainer')

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`)
    //convert response into text
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response
    // select the "a" tag name from the response where all local songs and directory are store
    let as = div.getElementsByTagName('a')
    //empty list songs array
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        //select the file where href ended in ".mp3" and select the songs part using a split method
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }

    }
    // select the element where the songs display
    let songul = document.querySelector('.left-songlist').getElementsByTagName('ul')[0]
    songul.innerHTML = ""
    for (const song of songs) {
        //display songs in the form of list
        songul.innerHTML = songul.innerHTML + `
        <li>
        <img src="./resoures/icons/music.svg" alt="">
        <div class="song-info">
            <div class="song-name">${song.replaceAll('%20', ' ')}</div>
            <div class="song-artist">Bilal</div>
        </div>
        <div class="playnow">
            <span>play now</span>
            <img src="./resoures/icons/play.svg" alt="">
        </div>
    </li>`
    }
    Array.from(document.querySelector('.left-songlist').getElementsByTagName('li')).forEach((e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector('.song-info').firstElementChild.innerHTML.replaceAll('%20', '_'));
        })
    }))
}
let play = document.getElementById('play-bar')
const playMusic = (track, pause = false) => {
    currentSong.src = `http://127.0.0.1:5500/${currFolder}/` + track

    if (!pause) {
        currentSong.play()
        play.src = './resoures/icons/pause.svg'
    }
    document.querySelector('.song-detail').innerHTML = decodeURI(track)
    document.querySelector('.song-time').innerHTML = '00:00 / 00:00'



}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/resoures/songs/`)
    let response = await a.text()


    let div = document.createElement('div')
    div.innerHTML = response
    let anchors = div.getElementsByTagName('a')
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/resoures/songs/") && !e.href.includes(".mp3")) {
            let folder = e.href.split('/').slice(-1)[0];
            let a = await fetch(`http://127.0.0.1:5500/resoures/songs/${folder}/info.json`)
            // get the data from folder
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder="${folder}" class="card ">
        <div class="card-data">
            <div class="play-icon"><img src="./resoures/icons/play.svg" alt=""></div>
            <img src="./resoures/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.discription}</p>
        </div>
    </div>`
        }
    }


    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getSongs(`/resoures/songs/${item.currentTarget.dataset.folder}`)

        })
    })


}
async function main() {
    // get all songs
    await getSongs('/resoures/songs')
    playMusic(songs[0], true)
    // display the album
    displayAlbums()
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = './resoures/icons/pause.svg'
        }
        else {
            currentSong.pause()
            play.src = './resoures/icons/play-bar.svg'
        }
    })
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return "00:00"
        }
        const totalSeconds = Math.floor(seconds); // Remove any fractional part of the seconds
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        // Pad the minutes and seconds with leading zeros if necessary
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    currentSong.addEventListener('timeupdate', () => {

        document.querySelector('.song-time').innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%'
    })
    document.querySelector('.seekbar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('.circle').style.left = percent + '%'
        currentSong.currentTime = currentSong.duration * percent / 100
    })
    document.querySelector('.burger').addEventListener('click', () => {
        document.querySelector('.left').style.left = "0%"
    })
    document.querySelector('.cross').addEventListener('click', () => {
        document.querySelector('.left').style.left = "-200%"
    })
    document.querySelector('#previous').addEventListener('click', () => {
        if (!songs || songs.length === 0) {
            console.log("Songs array is empty or not defined");
            return;
        }
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    document.querySelector('#next').addEventListener('click', () => {
        if (!songs || songs.length === 0) {
            console.log("Songs array is empty or not defined");
            return;
        }
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        console.log(songs);


        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }


    })
    document.querySelector('.vol-range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume == 0) {
            document.querySelector('.vol-img').src = document.querySelector('.vol-img').src.replace('volume.svg', 'mute.svg')

        }
        else if (currentSong.volume > 0) {
            document.querySelector('.vol-img').src = document.querySelector('.vol-img').src.replace('mute.svg', 'volume.svg')
        }

    })
    document.querySelector('.vol-img').addEventListener('click', (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace('volume.svg', 'mute.svg')
            currentSong.volume = 0;
            document.querySelector('.vol-range').getElementsByTagName('input')[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace('mute.svg', 'volume.svg')
            currentSong.volume = 0.1;
        }

    })




}
main()
