// Template HTML actualizado con el botón de borrador
const template = `
<div class="flex flex-col items-center">
  <!-- Contenedor de imágenes -->
  <div class="flex flex-col sm:flex-row items-center justify-center gap-4 my-10 px-4">
    <!-- Primer imagen y texto -->
    <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
      <span class="border border-black px-2 py-1 mb-2 sm:mb-0 text-sm">DERECHA</span>
      <div class="relative">
        <img src="images/frontal.webp" alt="Imagen 1" class="body-img w-52 h-auto object-contain">
        <canvas id="canvasFrontal" class="absolute top-0 left-0 z-10"></canvas>
      </div>
    </div>
    <!-- Segunda imagen y texto -->
    <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
      <span class="border border-black px-2 py-1 mb-2 sm:mb-0 text-sm">IZQUIERDA</span>
      <div class="relative">
        <img src="images/espalda.webp" alt="Imagen 2" class="body-img w-52 h-auto object-contain">
        <canvas id="canvasEspalda" class="absolute top-0 left-0 z-10"></canvas>
      </div>
    </div>
  </div>

  <!-- Controles de dibujo en fila separada -->
  <div class="flex flex-wrap justify-center gap-4 mt-4 pb-8">
    <!--<button id="penBtn" class="px-4 py-2 bg-blue-500 text-white rounded">Lápiz</button>-->
    <button id="clearBtn1" class="px-4 py-2 bg-red-500 text-white rounded">Borrar Imagen 1</button>
    <button id="clearBtn2" class="px-4 py-2 bg-red-500 text-white rounded">Borrar Imagen 2</button>
  </div>
</div>
`;

const styles = `
.canvas-container {
  position: relative;
  display: inline-block;
}

canvas {
  cursor: crosshair;
}

.tool-active {
  outline: 2px solid #000;
  outline-offset: -2px;
}
`;

class BodyDrawing {
    constructor(container) {
        this.container = container;
        this.isDrawing = false;
        this.color = '#ff0000';
        this.brushSize = 2;
        this.canvasFrontal = null;
        this.canvasEspalda = null;
        this.ctxFrontal = null;
        this.ctxEspalda = null;
        this.currentTool = 'pen';
    }

    initialize() {
        const container = this.container;
        container.innerHTML = template;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        const images = document.querySelectorAll('.body-img');
        images.forEach(img => {
            img.onload = () => this.setupCanvas(img);
        });

        this.setupEventListeners();
        document.getElementById('penBtn').classList.add('tool-active');
    }

    /*setupCanvas(img) {
        const canvas = img.nextElementSibling;
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        // Asignar el canvas correcto en función de su id
        if (canvas.id === 'canvasFrontal') {
          this.canvasFrontal = canvas;
          this.ctxFrontal = ctx;
        } else if (canvas.id === 'canvasEspalda') {
          this.canvasEspalda = canvas;
          this.ctxEspalda = ctx;
        }
    }*/

    setupCanvas(img) {
      const canvas = img.nextElementSibling;
      // Usar getBoundingClientRect para obtener el tamaño real renderizado
      const rect = img.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const ctx = canvas.getContext('2d');
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      if (canvas.id === 'canvasFrontal') {
          this.canvasFrontal = canvas;
          this.ctxFrontal = ctx;
      } else if (canvas.id === 'canvasEspalda') {
          this.canvasEspalda = canvas;
          this.ctxEspalda = ctx;
      }
    }

  /*setupEventListeners() {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      canvas.addEventListener('mousedown', this.startDrawing.bind(this));
      canvas.addEventListener('mousemove', this.draw.bind(this));
      canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
      canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    });

    document.getElementById('clearBtn1').addEventListener('click', (e) => {
        e.preventDefault();
        this.clearCanvas1();
    });
    document.getElementById('clearBtn2').addEventListener('click', (e) => {
        e.preventDefault();
        this.clearCanvas2();
    });
    document.getElementById('penBtn').addEventListener('click', (e) => {
        e.preventDefault();
        this.setTool('pen');
    });
    
    document.getElementById('penBtn').addEventListener('click', () => this.setTool('pen'));
  }*/

  setupEventListeners() {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        // Eventos del mouse
        canvas.addEventListener('mousedown', (e) => this.startDrawing(e, 'mouse'));
        canvas.addEventListener('mousemove', (e) => this.draw(e, 'mouse'));
        canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Eventos táctiles
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevenir scroll
            this.startDrawing(e, 'touch');
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevenir scroll
            this.draw(e, 'touch');
        });
        canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        canvas.addEventListener('touchcancel', this.stopDrawing.bind(this));
    });

    document.getElementById('clearBtn1').addEventListener('click', (e) => {
      e.preventDefault();
      this.clearCanvas1();
    });
    document.getElementById('clearBtn2').addEventListener('click', (e) => {
        e.preventDefault();
        this.clearCanvas2();
    });
    document.getElementById('penBtn').addEventListener('click', (e) => {
        e.preventDefault();
        this.setTool('pen');
    });
    
    document.getElementById('penBtn').addEventListener('click', () => this.setTool('pen'));
  }

  setTool(tool) {
    this.currentTool = tool;
    
    document.getElementById('penBtn').classList.toggle('tool-active', tool === 'pen');
  }

  /*startDrawing(e) {
    this.isDrawing = true;
    const ctx = e.target.getContext('2d');
    ctx.beginPath();
    const rect = e.target.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }*/

  startDrawing(e, inputType) {
    this.isDrawing = true;
    const canvas = inputType === 'mouse' ? e.target : e.touches[0].target;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    
    const rect = canvas.getBoundingClientRect();
    const pos = this.getPosition(e, inputType, rect);
    
    ctx.moveTo(pos.x, pos.y);
  }

  /*draw(e) {
    if (!this.isDrawing) return;
    
    const ctx = e.target.getContext('2d');
    const rect = e.target.getBoundingClientRect();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.brushSize;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }*/

  draw(e, inputType) {
    if (!this.isDrawing) return;
    
    const canvas = inputType === 'mouse' ? e.target : e.touches[0].target;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const pos = this.getPosition(e, inputType, rect);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.brushSize;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  getPosition(e, inputType, rect) {
    if (inputType === 'mouse') {
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    } else { // touch
        const touch = e.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }
  }

  stopDrawing() {
    this.isDrawing = false;
  }
  clearCanvas1() {
    if (this.canvasFrontal && this.ctxFrontal) {
        this.ctxFrontal.clearRect(0, 0, this.canvasFrontal.width, this.canvasFrontal.height);
    }
  }

  clearCanvas2() {
    if (this.canvasEspalda && this.ctxEspalda) {
        this.ctxEspalda.clearRect(0, 0, this.canvasEspalda.width, this.canvasEspalda.height);
    }
  } 

  getDrawings() {
    return {
      frontal: this.canvasFrontal ? this.canvasFrontal.toDataURL() : null,
      espalda: this.canvasEspalda ? this.canvasEspalda.toDataURL() : null
    };
  }
}
