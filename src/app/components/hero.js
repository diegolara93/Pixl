'use client'
import { useEffect, useState } from "react";
import { useAuth } from "../lib/authcontext";
import Link from "next/link";

export default function Hero() {
  const { user, loading } = useAuth()
  const [isMounted, setIsMounted] = useState(false); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  let signInOrOut;

  if (user) {
    signInOrOut = (
      <>
    <Link href="my-art"><button className="btn btn-info">My Art</button> </Link>
    <Link href="canvas"><button className="btn btn-info">New Canvas</button></Link>
    </>
    )
  } else {
    signInOrOut = (
      <>
    <Link href="sign-in"><button className="btn btn-info">Sign In</button> </Link>
    <Link href="canvas"><button className="btn btn-info">New Canvas</button></Link>
    </>
    )
  }
    return (
        <div className="hero bg-base-100 min-h-[90vh]">
  <div className="hero-content text-center">
    <div className="max-w-md">
      <h1 className="rainbow-text text-7xl font-bold">Pixl.io</h1>
      <p className="rainbow-text py-6">
        A free, open source, pixel art editor built with Next.Js and Go
      </p>
      {signInOrOut}
    </div>
  </div>
</div>
    )
}