const userInput = document.getElementById('username');
const passInput = document.getElementById('password');
const resultOut = document.getElementById('result');
const outbox = document.getElementById('outbox');
const body = document.querySelector('body');

function displayLoading(loading = true) {
    if (loading) {
        body.style.cursor = 'wait';
        return;
    }
    body.style.cursor = 'default';
}
async function submit() {
    displayLoading();
    console.log(`submit: ${userInput.value}`);
    const o = { user: userInput.value, passwd: passInput.value };
    try {
        const fetched = await fetch('/login', {
            method: 'POST',
            body: JSON.stringify(o),
            headers: { 'Content-Type': 'application/json' },
        });
        if (fetched.ok) {
            return (window.location.href = `/index.html`);
        }
        const status = fetched.status;
        let json;
        try {
            json = await fetched.json();
        } catch (err) {
            json = err.message;
        }
        displayResult(status, json);
    } catch (err) {
        displayResult(undefined, err.message);
    } finally {
        displayLoading(false);
    }
}
const colors = ['#aaf0aa', 'lightgrey', '#f0a7a7', 'lightsalmon', '#9d7149'];
function displayResult(stat, res) {
    const str = JSON.stringify(res, null, 2);
    //console.log(str);
    resultOut.innerHTML = `Status: ${stat}<br>${str}`;
    stat = stat ? stat : 600;
    outbox.style.backgroundColor = colors[Math.floor(stat / 100) - 2];
}
