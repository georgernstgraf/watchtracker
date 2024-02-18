import { Component } from './component.mjs';
class LoginForm extends Component {
    // all html elements are already there in index.html, we need only the logic here
    static colors = [
        '#aaf0aa',
        'lightgrey',
        '#f0a7a7',
        'lightsalmon',
        '#9d7149',
    ];
    constructor(parent, anchor) {
        // parent has domElement (<div>)
        super(parent, anchor);
        this.userInput = document.getElementById('loginFormUsername');
        this.passInput = document.getElementById('loginFormPassword');
        this.resultOut = document.getElementById('loginFormResult');
        this.outbox = document.getElementById('loginFormResult');
        this.body = document.querySelector('body');
        this.submitButton = document.getElementById('loginFormSubmit');
        this.submitButton.addEventListener('click', this.submit.bind(this));
    }
    display() {
        this.anchor.showModal();
    }
    hide() {
        this.anchor.close();
    }
    displayLoading(loading = true) {
        if (loading) {
            this.body.style.cursor = 'wait';
            this.resultOut.textContent = 'Loading';
            return;
        }
        this.body.style.cursor = 'default';
        this.resultOut.textContent = '';
    }
    async submit() {
        this.displayLoading();
        console.log(
            `submit: ${this.userInput.value} / ${this.passInput.value.replace(
                /./g,
                '*'
            )}`
        );
        const o = { user: this.userInput.value, passwd: this.passInput.value };
        try {
            const fetched = await fetch('login', {
                method: 'POST',
                body: JSON.stringify(o),
                headers: { 'Content-Type': 'application/json' },
            });
            if (fetched.ok) {
                const response = await fetched.json();
                this.anchor.close();
                window.app.handleLogin(response.user);
            }
            const status = fetched.status;
            let message;
            try {
                message = await fetched.json();
                if (status == 401) {
                    message = message.error;
                } else {
                    message = JSON.stringify(message, null, 2);
                }
            } catch (err) {
                message = err.message;
            }
            this.displayResult(status, message);
        } catch (err) {
            this.displayResult(undefined, err.message);
        } finally {
            this.displayLoading(false);
        }
    }
    displayResult(stat, res) {
        this.resultOut.innerHTML = `Status: ${stat}<br>${res}`;
    }
}
export { LoginForm };
