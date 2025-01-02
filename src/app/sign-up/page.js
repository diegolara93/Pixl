"use client";
import Card from "../components/sign-up-card";
import NavBar  from "../components/navbar";
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from 'next/navigation'


export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const googleProvider = new GoogleAuthProvider();

    const handleSignUp = async (e) => {
      e.preventDefault();
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("signed up" + userCredential.user)
        router.push("/")
      } catch (error) {
        console.log("Error creating account, try signing in.");
      }
    };

    const handleGoogleSignUp = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log("Google Sign-Up:", user.email);
            await userCredential.user.sendEmailVerification();
            router.push("/")
        } catch (error) {
            console.log("Google Sign-Up error:", error);
        }
    }
    return (
        <div className="bg-base-100">
          <NavBar />
          <div className="mt-[8rem] justify-items-center">
            <Card
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleSignUp}
              handleGoogleSignUp={handleGoogleSignUp}
            />
          </div>
        </div>
      )
}