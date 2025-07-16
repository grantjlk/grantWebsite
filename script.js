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
async function loadRandomSong() {
  const res = await fetch('http://localhost:8888/api/random-track');
  const { embedUrl } = await res.json();

  const iframe = document.querySelector('.song-header-row iframe');
  iframe.src = embedUrl;
}

loadRandomSong();
