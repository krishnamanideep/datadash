
import axios from 'axios';

const API_KEY = "AIzaSyBuTaqQh7CHKavGuj2aA_eCJeFgdmBNXcE";
const EMAIL = "admin@example.com";
const PASSWORD = "adminpassword123";

async function testAuth() {
    console.log('--- Firebase Auth Diagnostic ---');
    console.log(`Testing API Key: ${API_KEY.substring(0, 10)}...`);
    console.log(`Attempting to sign in: ${EMAIL}`);

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

    try {
        const response = await axios.post(url, {
            email: EMAIL,
            password: PASSWORD,
            returnSecureToken: true
        });
        console.log('\n[SUCCESS] Login Successful!');
        console.log('ID Token received. The API Key is VALID and ACTIVE.');
        console.log('If browser login fails, it is due to "HTTP Referrer" restrictions in Google Cloud Console.');
    } catch (error: any) {
        console.error('\n[FAILED] Login Failed.');
        if (error.response) {
            console.error('Error Code:', error.response.data.error.code);
            console.error('Error Message:', error.response.data.error.message);
            console.error('Details:', JSON.stringify(error.response.data.error.errors, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testAuth();
