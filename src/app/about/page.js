import React from "react";

export default function About() {
  return (
    <div className="bg-base-100 min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-3xl bg-base-200 shadow-xl p-8">
        <h1 className="text-4xl font-bold text-primary mb-4">About</h1>

        <p className="text-lg text-base-content mb-4 leading-relaxed">
          This project was made with <span className="font-semibold">NextJS</span> and <span className="font-semibold">Go</span>, using <span className="font-semibold">Echo</span> as the backend.
          <span className="block mt-2">PostgreSQL is used for the database and Firebase Authentication deals with user credentials.</span>
        </p>


        <p className="text-lg text-base-content mb-4 leading-relaxed">
          I'm currently a 3rd year Computer Science student so I can’t always implement new features as quickly as I’d like but I will try to as quick as I can
        </p>


        <p className="text-lg text-base-content leading-relaxed mb-2">
          The canvas size is currently limited to <span className="font-semibold">16×16</span>, but I plan to add:
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>Dynamic canvas sizing</li>
          <li>Ability to save color palettes</li>
        </ul>


        <p className="text-lg text-base-content leading-relaxed">
          You can find my GitHub at{" "}
          <a 
            href="https://github.com/diegolara93" 
            className="link link-primary font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/diegolara93
          </a>
          . If you’d like to reach out for any reason, feel free to email me at{" "}
          <span className="font-semibold">diegolara93345@gmail.com</span>.
        </p>
      </div>
    </div>
  );
}
