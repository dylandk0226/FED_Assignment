document.addEventListener('DOMContentLoaded', async () => {
    await initProfile();
});

async function initProfile() {
    setupMobileMenu();
    await loadUserProfile();
    setupProfileForm();
    setupPasswordForm();
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.add('hidden');
        }
    });
}

async function loadUserProfile() {
    try {
        const user = await API.getUser();
        
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
    } catch (error) {
        console.error('Error loading user profile:', error);
        alert('Error loading profile data. Please refresh the page.');
    }
}

function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleProfileUpdate(profileForm);
    });
}

async function handleProfileUpdate(form) {
    const formData = new FormData(form);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };

    try {
        await API.updateUser(userData);
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
    }
}

function setupPasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handlePasswordChange(passwordForm);
    });
}

async function handlePasswordChange(form) {
    const formData = new FormData(form);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New password and confirmation do not match.');
        return;
    }

    if (currentPassword === newPassword) {
        alert('New password must be different from current password.');
        return;
    }

    try {
        await API.updatePassword(currentPassword, newPassword);
        alert('Password changed successfully!');
        form.reset();
    } catch (error) {
        console.error('Error changing password:', error);
        if (error.response && error.response.status === 401) {
            alert('Current password is incorrect. Please try again.');
        } else {
            alert('Error changing password. Please try again.');
        }
    }
}