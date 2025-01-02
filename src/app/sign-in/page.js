"use client";
import Card from "../components/card";
import NavBar  from "../components/navbar";
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
        console.log("signed in" + userCredential.user)
        router.push("/")
      } catch (error) {
        console.log(" Email or Password does not match, click forgot password or create an account.");
      }
    };
    return (
        <div className="bg-base-100">
          <NavBar />
          <div className="mt-[8rem] justify-items-center">
            <Card
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
            />
          </div>
        </div>
      )
}