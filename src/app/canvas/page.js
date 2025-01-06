"use client";
import { useEffect, useRef, useState } from "react";
import { initEditor } from "./edit";
import { auth } from "../lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth"; 

const colorPalette = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00",
  "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#800000", "#808000", "#008000", "#800080",
  "#008080", "#000080", "#C0C0C0", "#808080"
];

export default function CanvasPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const canvasRef = useRef(null);
  const clearButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const downloadButtonRef = useRef(null);

  const [drawColor, setDrawColor] = useState("#000000");
  const drawColorRef = useRef(drawColor);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    drawColorRef.current = drawColor;
  }, [drawColor]);

  useEffect(() => {
    if (!canvasRef.current || !clearButtonRef.current) return;
    const cleanup = initEditor(canvasRef.current, clearButtonRef.current, drawColorRef);
    return cleanup;
  }, []);

  const handleSave = async () => {
    if (!canvasRef.current) return;

    if (!user) {
      alert("Please log in before saving a drawing!");
      return;
    }

    const ctx = canvasRef.current.getContext("2d");
    const resolution = 16;
    const pixelSize = canvasRef.current.width / resolution;
    const drawing = [];

    for (let y = 0; y < resolution; y++) {
      const row = [];
      for (let x = 0; x < resolution; x++) {
        const imageData = ctx.getImageData(x * pixelSize, y * pixelSize, 1, 1).data;
        const hexColor = rgbToHex(imageData[0], imageData[1], imageData[2]);
        row.push(hexColor);
      }
      drawing.push(row);
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/save-drawing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ drawing })
      });

      if (response.ok) {
        alert("Drawing saved successfully!");
      } else {
        alert("Failed to save drawing.");
      }
    } catch (error) {
      console.error("Error saving drawing:", error);
      alert("An error occurred while saving the drawing.");
    }
  };

  // Convert (r,g,b) to hex since thats how it's stored in the db
  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  return (
    <div className="bg-base-100 min-h-screen p-4">
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
            <button onClick={handleSave} ref={saveButtonRef} id="save" className="btn btn-primary">
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
  );
}
