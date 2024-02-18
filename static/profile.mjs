import { Component } from './component.mjs';
class Profile extends Component {
    userName;
    constructor(parent) {
        // parent has domElement (<div>)
        super(parent);
        this.boundLogout = this.logout.bind(this);
        this.logoutButton = document.getElementById('profileLogoutButton');
        this.profileUsername = document.getElementById('profileUsername');
    }
    setApp(app) {
        this.app = app;
        this.boundLogin = app.showLoginForm.bind(app);
    }
    update() {
        this.logoutButton.removeEventListener('click', this.boundLogout);
        this.logoutButton.removeEventListener('click', this.boundLogin);
        if (this.userName) {
            this.profileUsername.textContent = this.userName;
            this.logoutButton.textContent = 'logout';
            this.logoutButton.addEventListener('click', this.boundLogout);
        } else {
            this.profileUsername.textContent = 'nicht eingeloggt';
            this.logoutButton.textContent = 'login';
            this.logoutButton.addEventListener('click', this.boundLogin);
        }
    }
    populate(user) {
        this.userName = user;
        this.update();
    }
    logout() {
        fetch('logout', { method: 'GET' })
            .then((response) => {
                if (!response.ok) throw new Error('Logout failed');
                return response.json();
            })
            .then((data) => {
                console.log(`logout: ${data.message}`);
                this.userName = undefined;
                this.update();
                window.app.handleLogout();
            })
            .catch((error) => window.app.handleError(error));
    }
    whoami() {
        // Get username from /whoami endpoint
        // JWT might be present / valid / absent
        this.userName = undefined;
        fetch('whoami', { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    if (response.status == 401) {
                        return window.app.unauthorized();
                    }
                    throw new Error('Failed to get username');
                }
                return response.json();
            })
            .then((data) => {
                if (data) this.userName = data.user;
                else this.userName = undefined;
                this.update();
                window.app.handleLogin(this.userName);
            })
            .catch((error) => {
                this.update();
                window.app.handleError(error);
            });
    }
}
export { Profile };
