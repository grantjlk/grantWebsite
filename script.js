// Fetch the sidebar file
fetch('sidebar.html')
    .then(res => res.text())        
    .then(html => {
        // insert sidebar html into the placeholder
        document.getElementById('sidebar-placeholder').innerHTML = html;

        // sidebar toggle behavior after loaded
        const toggleButton = document.getElementById('toggleSidebar');
        const sidebar = document.getElementById('sidebar');
        const navLinks = document.getElementById('navLinks');

        toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
        });
    });

// hover spotlight effect, if on homepage
if (window.location.pathname.endsWith('index.html')){
    document.addEventListener('mousemove', (e) => {
	    const x = `${e.clientX}px`;
        const y = `${e.clientY}px`;
        document.documentElement.style.setProperty('--x', x);
        document.documentElement.style.setProperty('--y', y);
    });
}

//load random song for music page
// Music page functionality
if (window.location.pathname.endsWith('music.html')) {
    // Load random song function
    async function loadRandomSong() {
        try {
            const res = await fetch('http://localhost:8888/api/random-track');
            const { embedUrl } = await res.json();
            const iframe = document.querySelector('.song-header-row iframe');
            iframe.src = embedUrl;
        } catch (error) {
            console.error('Error loading random song:', error);
        }
    }

    // Load initial random song
    loadRandomSong();

    // Add reload button functionality
    document.addEventListener('DOMContentLoaded', () => {
        const reloadBtn = document.querySelector('.reload-btn');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', async () => {
                // Disable button during loading
                reloadBtn.disabled = true;
                reloadBtn.textContent = '🔄 Loading...';
                
                try {
                    await loadRandomSong();
                } catch (error) {
                    console.error('Error reloading song:', error);
                }
                
                // Re-enable button
                reloadBtn.disabled = false;
                reloadBtn.textContent = '🔄 Reload Song';
            });
        }
    });
}

loadRandomSong();
