const key = "AIzaSyBJTaqUn7cAKsxGujZwA_eCJeFp6a0XHrE";
const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`;

console.log(`Testing API Key: ${key}`);

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true })
})
    .then(async res => {
        const data = await res.json();
        console.log(`Response Status: ${res.status}`);
        if (data.error) {
            console.log("API Error Code:", data.error.code);
            console.log("API Error Message:", data.error.message);
        } else {
            console.log("API Response: Success (Key is valid)");
        }
    })
    .catch(err => console.error("Fetch Error:", err));
