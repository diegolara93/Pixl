export function initEditor(canvas, clearButton, drawColorRef) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const resolution = 16;
  const pixelSize = canvas.width / resolution;
  
  function drawPixel(x, y) {
    ctx.fillStyle = drawColorRef.current;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }

  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize);
    const y = Math.floor((event.clientY - rect.top) / pixelSize);
    drawPixel(x, y);

     function drawMove(event) {
      const x = Math.floor((event.clientX - rect.left) / pixelSize);
      const y = Math.floor((event.clientY - rect.top) / pixelSize);
      drawPixel(x, y);
    }

    canvas.addEventListener('mousemove', drawMove);

    const removeListeners = () => {
      canvas.removeEventListener('mousemove', drawMove);
      canvas.removeEventListener('mouseup', mouseUp);
      canvas.removeEventListener('mouseleave', mouseLeave);
    };

    const mouseUp = () => removeListeners();
    const mouseLeave = () => removeListeners();

    canvas.addEventListener('mouseup', mouseUp);
    canvas.addEventListener('mouseleave', mouseLeave);
  });

  function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  clearButton.addEventListener('mousedown', clearCanvas);

  return () => {
    clearButton.removeEventListener('mousedown', clearCanvas);
  };
}