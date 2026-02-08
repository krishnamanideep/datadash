'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
    // Auth State
    const [step, setStep] = useState<'PHONE' | 'OTP' | 'FORM'>('PHONE');
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Phone Auth State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState<'admin' | 'client'>('client');

    const router = useRouter();

    // Whitelist - Replace with your allowed numbers
    const ALLOWED_NUMBERS = [
        '+919876543210', // Example
        // Add more numbers here
    ];

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            try {
                const { RecaptchaVerifier } = require('firebase/auth');
                (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {
                        // reCAPTCHA solved
                    }
                });
            } catch (error: any) {
                console.error("Recaptcha Setup Error:", error);
                setStatus("Error initializing security check.");
            }
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        // Basic formatting
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`; // Defaulting to +91 if no code

        // Whitelist Check
        // In a real app, do this on server. For this setup page, client-side is "okay" as a gatekeeper.
        /* 
           NOTE: For strict security, you should use Firebase Blocking Functions or check this backend side.
           For this specific "Setup Page" utility, this prevents accidental access.
        */
        // const isAllowed = ALLOWED_NUMBERS.includes(formattedPhone);
        // if (!isAllowed) {
        //   setStatus("Access Denied: This number is not authorized for setup.");
        //   setLoading(false);
        //   return;
        // }

        try {
            setupRecaptcha();
            const { signInWithPhoneNumber } = await import('firebase/auth');
            const appVerifier = (window as any).recaptchaVerifier;

            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            (window as any).confirmationResult = confirmationResult;
            setVerificationId(confirmationResult.verificationId);
            setStep('OTP');
            setStatus(`OTP sent to ${formattedPhone}`);
        } catch (error: any) {
            console.error(error);
            setStatus(`Error sending OTP: ${error.message}. Ensure "Phone" is enabled in Firebase Console.`);
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('Verifying...');

        try {
            const confirmationResult = (window as any).confirmationResult;
            await confirmationResult.confirm(otp);
            // If successful, user is signed in. 
            // We can now show the form.
            setStep('FORM');
            setStatus('Phone Verified! You can now create the credentials.');

            // Optional: Sign out immediately so we don't accidentally link the "Phone User" to the "Email User" 
            // if we want them to be separate. But actually, `createUserWithEmailAndPassword` will sign in the NEW user anyway.
            // Let's just proceed. The "Phone Auth" session served its purpose as a gatekeeper.
            await signOut(auth);

        } catch (error: any) {
            console.error(error);
            setStatus(`Invalid OTP. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const createAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(`Creating ${role} account...`);

        if (password.length < 6) {
            setStatus("Error: Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            // Try to sign in first to see if user exists
            try {
                await signInWithEmailAndPassword(auth, email, password);
                setStatus(`User ${email} already exists. Updating role to ${role}...`);
            } catch (e) {
                // If user doesn't exist, create them
                await createUserWithEmailAndPassword(auth, email, password);
                setStatus(`User ${email} created in Auth.`);
            }

            const currentUser = auth.currentUser;
            if (currentUser) {
                // Update profile with display name
                if (displayName) {
                    await updateProfile(currentUser, { displayName });
                }

                // Write to Firestore
                await setDoc(doc(db, 'users', currentUser.uid), {
                    email,
                    role,
                    displayName: displayName || (role === 'admin' ? 'Administrator' : 'Client User'),
                    createdAt: new Date().toISOString()
                }, { merge: true });

                setStatus(`Success! ${role} account created/updated for ${email}.`);
                await signOut(auth);
                setEmail('');
                setPassword('');
                setDisplayName('');
            }
        } catch (error: any) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">System Setup</h1>

                {/* Step 1: Phone Input */}
                {step === 'PHONE' && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Authorized Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="+91 98765 43210"
                            />
                            <p className="text-xs text-gray-400 mt-1">Enter number with country code (e.g., +91)</p>
                        </div>
                        <div id="recaptcha-container"></div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? 'Sending OTP...' : 'Verify Number'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Input */}
                {step === 'OTP' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="123456"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {loading ? 'Verifying...' : 'Confirm OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('PHONE')}
                            className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
                        >
                            Change Number
                        </button>
                    </form>
                )}

                {/* Step 3: Account Creation Form */}
                {step === 'FORM' && (
                    <form onSubmit={createAccount} className="space-y-4">
                        <div className="bg-green-50 p-3 rounded mb-4 text-sm text-green-700 border border-green-200">
                            ✓ Identity Verified. You may now create credentials.
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="user@datadock.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="********"
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'admin' | 'client')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="client">Client</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                )}

                {status && (
                    <div className={`mt-6 p-4 rounded text-sm whitespace-pre-wrap ${status.startsWith('Error') || status.startsWith('Access') || status.startsWith('Invalid') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {status}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-blue-600 hover:underline"
                    >
                        Go to Login Page
                    </button>
                </div>
            </div>
        </div>
    );
}
