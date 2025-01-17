// Store login status when the user logs in
localStorage.setItem('isLoggedIn', true);

// Check login status on other pages
if (localStorage.getItem('isLoggedIn')) {
    // Apply back button prevention logic
    history.pushState(null, null, location.href);
    window.onpopstate = function() {
        history.pushState(null, null, location.href);
    };
}
// JavaScript function to toggle the side panel visibility
function toggleSidePanel() {
    const sidePanel = document.getElementById('sidePanel');
    const menuToggle = document.querySelector('.menu-toggle');
  
    // Toggle the "active" class to show/hide the side panel
    sidePanel.classList.toggle('active');
    
    // Optionally, toggle the active class for the hamburger icon to show "close"
    menuToggle.classList.toggle('active');
  }
  
document.addEventListener('DOMContentLoaded', function () {
    // Toggle the profile menu visibility
    function toggleProfileMenu() {
        const profileMenu = document.getElementById('profileMenu');
        profileMenu.classList.toggle('show'); // Toggle the 'show' class
    }

    // Attach the toggle function to the profile link
    const profileLink = document.querySelector('.profile-link');
    profileLink.addEventListener('click', toggleProfileMenu);
});


