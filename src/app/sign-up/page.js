"use client";
import Card from "../components/sign-up-card";
import NavBar from "../components/navbar";
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();


    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            console.log("Signed up:", firebaseUser.email);

            // Send UID and other info to Go backend
            const response = await fetch('http://localhost:8080/api/signup', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await firebaseUser.getIdToken()}`, //  Secures the endpoint
                },
                body: JSON.stringify({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                }),
            });

            if (!response.ok) {
                const resData = await response.json();
                throw new Error(resData.error || 'Failed to create user on backend');
            }

            console.log("User data stored in backend");


            router.push('/'); 
        } catch (error) {
            console.error("Sign-Up error:", error);
        }
    };

    const handleGoogleSignUp = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;
            console.log("Google Sign-Up:", firebaseUser.email);

            const response = await fetch('http://localhost:8080/api/signup', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await firebaseUser.getIdToken()}`, // Optional: Secure the endpoint
                },
                body: JSON.stringify({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    display_name: firebaseUser.displayName,
                }),
            });

            if (!response.ok) {
                const resData = await response.json();
                throw new Error(resData.error || 'Failed to create user on backend');
            }

            console.log("User data stored in backend");

            router.push('/'); 
        } catch (error) {
            console.error("Google Sign-Up error:", error);
        }
    };

    return (
        <div className="bg-base-100">
            <div className="pt-[5rem] flex justify-center">
                <Card
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    handleSignUp={handleSignUp}
                    handleGoogleSignUp={handleGoogleSignUp}
                />
            </div>
        </div>
    );
}
