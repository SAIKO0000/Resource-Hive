// JavaScript function to toggle the side panel visibility
function toggleSidePanel() {
  const sidePanel = document.getElementById('sidePanel');
  const menuToggle = document.querySelector('.menu-toggle');

  // Toggle the "active" class to show/hide the side panel
  sidePanel.classList.toggle('active');
  
  // Optionally, toggle the active class for the hamburger icon to show "close"
  menuToggle.classList.toggle('active');
}
