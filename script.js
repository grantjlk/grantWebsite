// sidebar toggle logic
const toggleButton = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const navLinks = document.getElementById('navLinks');

toggleButton.addEventListener('click', () => {
  sidebar.classList.toggle('expanded');
});