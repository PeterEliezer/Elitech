// Music Player - Manual Upload Only

document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause');
    const progressBar = document.querySelector('.progress');
    const playlistDiv = document.querySelector('.playlist');

    let musicTracks = [];
    let currentTrackIndex = 0;
    let isPlaying = false;

    // Fetch and display playlist
    function fetchPlaylist() {
        fetch('list-music.php')
            .then(res => res.json())
            .then(data => {
                musicTracks = data;
                displayPlaylist();
            })
            .catch(error => {
                console.error('Error fetching playlist:', error);
                playlistDiv.innerHTML = '<p>Error loading playlist.</p>';
            });
    }

    function displayPlaylist() {
        playlistDiv.innerHTML = '';
        if (musicTracks.length === 0) {
            playlistDiv.innerHTML = '<p>No music uploaded yet.</p>';
            return;
        }
        musicTracks.forEach((track, index) => {
            const trackElement = document.createElement('div');
            trackElement.classList.add('track-item');
            trackElement.innerHTML = `
                <h4>${track.title || track.filename}</h4>
                <p>${track.artist ? track.artist : ''}</p>
                ${track.description ? `<small>${track.description}</small>` : ''}
            `;
            trackElement.addEventListener('click', () => {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
                audioPlayer.play();
                isPlaying = true;
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            });
            playlistDiv.appendChild(trackElement);
        });
        // Load the first track by default
        if (musicTracks.length > 0) {
            loadTrack(currentTrackIndex);
        }
    }

    function loadTrack(index) {
        if (musicTracks[index]) {
            audioPlayer.src = musicTracks[index].url;
            audioPlayer.load();
        }
    }

    function playPauseToggle() {
        if (isPlaying) {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audioPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    }

    playPauseBtn.addEventListener('click', playPauseToggle);

    audioPlayer.addEventListener('timeupdate', () => {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    });

    audioPlayer.addEventListener('ended', () => {
        currentTrackIndex++;
        if (currentTrackIndex < musicTracks.length) {
            loadTrack(currentTrackIndex);
            audioPlayer.play();
        } else {
            currentTrackIndex = 0;
            loadTrack(currentTrackIndex);
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // Initial fetch
    fetchPlaylist();
}); 