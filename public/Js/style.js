"use strict"

const apiUrl = {
    login: '/login',
    addUser: '/addUser',
};

// Logout Button Show

document.addEventListener('DOMContentLoaded', () => {
    // Load Navigation Component
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        axios.get('/admin/nav')
            .then(response => {
                navPlaceholder.innerHTML = response.data;

                const logoutBtn = document.getElementById("logoutBtn");

                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                console.log(currentUser, "currentUser");
                if (currentUser && logoutBtn) {
                    logoutBtn.style.display = "block";
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('currentUser');
                    });
                } else {
                    if (logoutBtn) logoutBtn.style.display = "none";
                }
            })
            .catch(err => console.error('Error loading nav:', err));
    }

    // Load Website Navigation Component
    const navBuykartPlaceholder = document.getElementById('nav_buykart-placeholder');
    if (navBuykartPlaceholder) {
        axios.get('/buykart/nav')
            .then(response => {
                navBuykartPlaceholder.innerHTML = response.data;
            })
            .catch(err => console.error('Error loading buykart nav:', err));
    }
});

// Login Function
async function loginPage(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    try {
        const response = await axios.post(apiUrl.login, { username, password });
        const currentUser = response.data.user;
        console.log(currentUser, "currentUser");
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = '/home';
    } catch (error) {
        console.error("Login error:", error);
        alert(error.response?.data?.message || "Something went wrong. Please try again.");
    }
}

async function saveUser(userDetails) {
    try {
        const response = await axios.post(apiUrl.addUser, userDetails);
        alert(response.data.message);
        resetNewUserForm()
        window.location.href = '/';
    } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data?.message || "Error adding user");
    }
}