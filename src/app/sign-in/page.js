"use client";
import Card from "../components/card";
import NavBar  from "../components/navbar";
import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';


export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter()

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("signed in uid to pass to db: " + userCredential.user.uid)
        router.push("/")
      } catch (error) {
        console.log(" Email or Password does not match, click forgot password or create an account.");
      }
    };

    const handleGoogleLogin = async (e) => {
      const provider = new GoogleAuthProvider()
      e.preventDefault()
      try {
        const userCredential = await signInWithPopup(auth, provider)
        console.log("signed in uid to pass to db: " + userCredential.user.uid)
        router.push("/")
      } catch (error) {
        console.log("Error signing in with Google")
      }
    }
    return (
        <div className="bg-base-100">
          <div className="pt-[5rem] justify-items-center">
            <Card
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              handleGoogleLogin={handleGoogleLogin}
            />
          </div>
        </div>
      )
}