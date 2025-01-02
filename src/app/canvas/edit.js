export function initEditor(canvas, clearButton) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  
    const resolution = 32;
    const pixelSize = canvas.width / resolution;
    let drawColor = 'black';
  
    function drawPixel(x, y) {
      ctx.fillStyle = drawColor;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  
    canvas.addEventListener('mousedown', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / pixelSize);
        const y = Math.floor((event.clientY - rect.top) / pixelSize);
        drawPixel(x, y);
    
        // implements drag draw
        function drawMove(event) {
            const x = Math.floor((event.clientX - rect.left) / pixelSize);
            const y = Math.floor((event.clientY - rect.top) / pixelSize);
             drawPixel(x, y);
        }
    
        canvas.addEventListener('mousemove', drawMove);
    
        canvas.addEventListener('mouseup', function mouseUp(){
            canvas.removeEventListener('mousemove', drawMove);
        });
    
         canvas.addEventListener('mouseleave', function mouseLeave(){
            canvas.removeEventListener('mousemove', drawMove);
        });
    });
  
    function clearCanvas() {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  
    clearButton.addEventListener('mousedown', clearCanvas);
  
    // Return a cleanup function
    return () => {
      // remove event listeners here
      clearButton.removeEventListener('mousedown', clearCanvas);
    };
  }