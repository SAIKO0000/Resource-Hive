document.addEventListener('DOMContentLoaded', async function() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        await fetch('components/header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                setupLogoutHandlers();
            });
    }

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        await fetch('components/footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
            });
    }
});

function setupLogoutHandlers() {
    const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    
    const handleLogout = async () => {
        try {
            localStorage.removeItem('isLoggedIn');
            sessionStorage.clear();
            window.location.replace("login.html");
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', handleLogout);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);
}
