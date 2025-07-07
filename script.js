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



// hover spotlight effect
document.addEventListener('mousemove', (e) => {
  const x = `${e.clientX}px`;
  const y = `${e.clientY}px`;
  document.documentElement.style.setProperty('--x', x);
  document.documentElement.style.setProperty('--y', y);
});