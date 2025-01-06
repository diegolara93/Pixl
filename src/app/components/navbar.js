'use client';

import { useAuth } from "../lib/authcontext";
import { auth } from '../lib/firebase';
import Link from 'next/link'; 
import { useState, useEffect } from 'react';

export default function NavBar() {
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false); 

  useEffect(() => {
    setIsMounted(true);
  }, []);


  if (!isMounted) {
    return null;
  }

  let signInOrOut;

  if (loading) {
 
    signInOrOut = (
      <button className="btn btn-warning" disabled>
        Loading...
      </button>
    );
  } else if (user) {
    signInOrOut = (
      <button onClick={() => auth.signOut()} className="btn btn-warning">
        Sign Out
      </button>
    );
  } else {
    signInOrOut = (
      <Link className="btn btn-warning" href="/sign-in">
      Sign In
      </Link>
    );
  }

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li><Link href="/my-art">My Art</Link></li>
            <li><Link href="/canvas">New Canvas</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl">
        Pixl.io
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/my-art">My Art</Link></li>
          <li><Link href="/canvas">New Canvas</Link></li>
          <li><Link href="/about">About</Link></li>
        </ul>
      </div>
      <div className="navbar-end mr-2">
        {signInOrOut}
      </div>
    </div>
  );
}
