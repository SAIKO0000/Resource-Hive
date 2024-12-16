function toggleEditForm() {
    const form = document.querySelector('.edit-form');
    form.style.display = form.style.display === 'none' || form.style.display === '' ? 'block' : 'none';
}

function saveChanges() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    document.querySelector('.profile-card h1').textContent = name;
    document.querySelector('.profile-card p:nth-child(3)').textContent = `Email: ${email}`;
    document.querySelector('.profile-card p:nth-child(4)').textContent = `Role: ${role}`;

    toggleEditForm();
    alert('Profile updated successfully!');
}