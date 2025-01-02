"use client";
import { useEffect, useRef, useState } from "react";
import { initEditor } from "./edit";
import NavBar from "../components/navbar";


const colorPalette = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00",
  "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#800000", "#808000", "#008000", "#800080",
  "#008080", "#000080", "#C0C0C0", "#808080"
];

export default function CanvasPage() {
    const canvasRef = useRef(null);
    const clearButtonRef = useRef(null);
    const saveButtonRef = useRef(null);
    const downloadButtonRef = useRef(null);
    

    const [drawColor, setDrawColor] = useState("#000000"); 
    
    const drawColorRef = useRef(drawColor);
  
    useEffect(() => {
      drawColorRef.current = drawColor;
    }, [drawColor]);
  
    useEffect(() => {
      if (!canvasRef.current || !clearButtonRef.current) return;
      const cleanup = initEditor(canvasRef.current, clearButtonRef.current, drawColorRef);
      return cleanup;
    }, []);
  return (
    <div className="bg-base-100 justify-content-center"><NavBar></NavBar>
    <div className="bg-base-100 p-4">
      <div className="flex flex-col md:flex-row items-center justify-center mt-10">
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            id="editor"
            className="bg-white border-2 border-black"
            width="500"
            height="500"
          ></canvas>
          <div className="mt-4 flex space-x-2">
            <button ref={saveButtonRef} id="save" className="btn btn-primary">
              Save
            </button>
            <button ref={downloadButtonRef} id="download" className="btn btn-secondary">
              Download
            </button>
            <button ref={clearButtonRef} id="clear" className="btn btn-accent">
              Clear
            </button>
          </div>
        </div>
  
        <div className="mt-10 md:mt-0 md:ml-10 w-full max-w-xs">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Color Palette</h2>
            <div className="grid grid-cols-4 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  className="w-10 h-10 rounded border-2"
                  style={{ backgroundColor: color }}
                  onClick={() => setDrawColor(color)}
                  aria-label={`Select color ${color}`}
                ></button>
              ))}
            </div>
          </div>
  
          <div>
            <h2 className="text-lg font-semibold mb-2">Color Picker</h2>
            <input
              type="color"
              value={drawColor}
              onChange={(e) => setDrawColor(e.target.value)}
              className="w-full h-10 p-0 border-0"
              aria-label="Pick a custom color"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}