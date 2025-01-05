"use client";
import { useState, useEffect } from "react";

// assume you have Firebase auth set up
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function MyArt() {
  const [user, setUser] = useState(null);
  const [drawings, setDrawings] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const token = await firebaseUser.getIdToken();

          const response = await fetch("http://localhost:8080/api/me", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            // Use the capitalized keys from the server
            setDrawings(userData.Drawings ?? []);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // user logged out
        setUser(null);
        setDrawings([]);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-base-100 justify-items-center">
      <h1 className="text-4xl font-bold">Your Art</h1>
      
      {!user && <p>Please log in to see your art.</p>}
      {user && drawings.length === 0 && <p>You have no drawings yet!</p>}

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {drawings.map((drawingObj) => (
          // Provide a unique key, e.g. the drawing ID from the server
          <ArtPreview
            key={drawingObj.ID} 
            drawing={drawingObj.Drawing}
          />
        ))}
      </div>
    </div>
  );
}

function ArtPreview({ drawing }) {
  // 'drawing' should be a 2D array of hex strings (16×16)
  if (!drawing) {
    // If for some reason it's undefined, handle gracefully
    return <div>No drawing data</div>;
  }

  const resolution = 16;
  const tileSize = 10; // each "pixel" is 10px

  return (
    <div
      style={{
        border: "1px solid #ccc",
        width: resolution * tileSize,
        height: resolution * tileSize,
        display: "grid",
        gridTemplateColumns: `repeat(${resolution}, 1fr)`
      }}
    >
      {drawing.map((row, rowIndex) =>
        row.map((color, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`} // unique for each cell
            style={{
              width: tileSize,
              height: tileSize,
              backgroundColor: color
            }}
          />
        ))
      )}
    </div>
  );
}
