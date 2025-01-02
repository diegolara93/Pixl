"use client";
import { useEffect, useRef } from "react";
import { initEditor } from "./edit";
import NavBar from "../components/navbar";

export default function CanvasPage() {
  const canvasRef = useRef(null);
  const clearButtonRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !clearButtonRef.current) return;
    const cleanup = initEditor(canvasRef.current, clearButtonRef.current);
    return cleanup;
  }, []);

  return (
    <div className="bg-base-100">
      <NavBar />
      <div className="justify-items-center">
        <canvas
          ref={canvasRef}
          id="editor"
          className="mt-20 bg-white border-2 border-black-500"
          width="500"
          height="500"
        ></canvas>
      </div>
      <div className="mt-3 justify-self-center">
      <button ref={clearButtonRef} id="clear"
      className="btn ml-4 btn-accent">
        Save
      </button>
      <button ref={clearButtonRef} id="clear"
      className="btn ml-4 btn-accent">
        Download
      </button>
      <button ref={clearButtonRef} id="clear"
      className="btn ml-4 btn-accent">
        Clear
      </button>
      </div>
    </div>
  );
}