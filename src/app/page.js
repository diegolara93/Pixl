import Image from "next/image";
import NavBar from "./components/navbar";
import Hero from "./components/hero";

export default function Home() {
  return (
    <div className="bg-base-100">
      <Hero></Hero>
    </div>
  );
}
