export class SignaturePadManager {
    constructor() {
        this.padInstance = null;
        this.initialized = false;
        this.currentIframe = null;
        this.resizeObserver = null;
    }

    async initializeInIframe(iframe) {
        if (!iframe) {
            console.error('No se proporcionó iframe');
            return null;
        }

        this.currentIframe = iframe;
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Verificar si es el formulario correcto para agregar signature pad
        // const signatureForm = sessionStorage.getItem('signatureForm');
        // const currentFormValue = this.getCurrentFormValue(iframe);

        // if (signatureForm !== currentFormValue) {
        //     return null;
        // }

        // Verificar si el documento está completamente cargado
        if (iframeDocument.readyState !== 'complete') {
            return new Promise((resolve) => {
                iframe.addEventListener('load', () => {
                    resolve(this.initializeInIframe(iframe));
                });
            });
        }

        // Cargar librería SignaturePad si no está cargada
        await this.loadSignaturePadLibrary(iframeDocument);

        // Insertar HTML del signature pad si no existe
        await this.insertSignaturePadHTML(iframeDocument);

        // return this.initializePad(iframeDocument);
        return this.padInstance;
    }

    setupResizeObserver(iframeDocument) {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        const canvas = iframeDocument.getElementById('signature-pad');
        if (!canvas) return;

        this.resizeObserver = new ResizeObserver(() => {
            this.setupCanvasDimensions(canvas);
        });

        this.resizeObserver.observe(canvas.parentElement);
    }

    setupCanvasDimensions(canvas) {
        const container = canvas.parentElement;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        
        // Obtener dimensiones reales del contenedor
        const rect = container.getBoundingClientRect();
        
        // Guardar el contenido actual si existe
        let signatureData = null;
        if (this.padInstance && !this.padInstance.isEmpty()) {
            signatureData = this.padInstance.toData();
        }

        // Actualizar dimensiones
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);

        // Restaurar el contenido si existía
        if (signatureData) {
            this.padInstance.fromData(signatureData);
        }
    }

    // Método para obtener el valor del formulario actual
    getCurrentFormValue(iframe) {
        // Extraer el valor del formulario de la URL del iframe
        const src = iframe.src;
        const match = src.match(/(\w+-\d+)\.html/);
        return match ? match[1] : null;
    }

    async loadSignaturePadLibrary(iframeDocument) {
        // Check if library is already loaded
        if (iframeDocument.defaultView.SignaturePad) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = iframeDocument.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js';
            script.onload = () => {
                // Make SignaturePad available in iframe context
                iframeDocument.defaultView.SignaturePad = window.SignaturePad;
                resolve();
            };
            script.onerror = reject;
            iframeDocument.head.appendChild(script);
        });
    }

    async insertSignaturePadHTML(iframeDocument) {
        const signatureHTML = `
            <div class="mb-6 border-t border-gray-900/10 pt-6">
                <h2 class="text-lg font-semibold mb-4">Firma del Paciente</h2>
                <div class="signature-container" style="width: 100%; height: 200px; position: relative;">
                    <canvas id="signature-pad" class="border rounded-md" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%;"></canvas>
                    <button type="button" id="clear" class="mt-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400" style="position: absolute; bottom: 10px; left: 10px;">
                        Limpiar Firma
                    </button>
                </div>
            </div>
        `;
        // const signatureHTML = `
        //     <div class="mb-6 border-t border-gray-900/10 pt-6 signature-container" style="display: none;">
        //         <h2 class="text-lg font-semibold mb-4">Firma del Paciente</h2>
        //         <div style="width: 100%; height: 200px; position: relative;">
        //             <canvas id="signature-pad" class="border rounded-md" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%;"></canvas>
        //             <button type="button" id="clear" class="mt-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400" style="position: absolute; bottom: 10px; left: 10px;">
        //                 Limpiar Firma
        //             </button>
        //         </div>
        //     </div>
        // `;

        const formElement = iframeDocument.querySelector('form') || iframeDocument.body;
        
        // Verificar si el signature pad ya existe
        if (!iframeDocument.getElementById('signature-pad')) {
            formElement.insertAdjacentHTML('beforeend', signatureHTML);

            // Inicializar el signature pad después de insertarlo
            await this.initializePad(iframeDocument);
            // setTimeout(() => {
            //     this.initializePad(iframeDocument);
            // }, 100);
        }
    }

    // async loadSignaturePadLibrary(iframeDocument) {
    //     return new Promise((resolve, reject) => {
    //         const script = iframeDocument.createElement('script');
    //         script.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js';
    //         script.onload = () => {
    //             iframeDocument.defaultView.SignaturePad = window.SignaturePad;
    //             resolve();
    //         };
    //         script.onerror = reject;
    //         iframeDocument.head.appendChild(script);
    //     });
    // }

    initializePad(iframeDocument) {
        const canvas = iframeDocument.getElementById('signature-pad');
        if (!canvas) {
            console.error('Canvas no encontrado');
            return null;
        }

        // Esperar un momento para que el canvas se renderice completamente
        // await new Promise(resolve => setTimeout(resolve, 100));

        this.setupCanvasDimensions(canvas);

        const SignaturePad = iframeDocument.defaultView.SignaturePad;
        if (!SignaturePad) {
            console.error('SignaturePad no está disponible');
            return null;
        }

        try {
            // Destruir cualquier instancia existente
            if (this.padInstance) {
                this.padInstance.off();
            }

            this.padInstance = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });

            // Configuraciones adicionales para mejorar la experiencia táctil
            canvas.style.touchAction = 'none';

            // Asegurar que el pad sea interactivo
            canvas.style.pointerEvents = 'auto';
            canvas.style.touchAction = 'none';

            const clearButton = iframeDocument.getElementById('clear');
            if (clearButton) {
                // Remover cualquier listener existente
                // const oldClearButton = clearButton.cloneNode(true);
                clearButton.addEventListener('click', () => {
                    this.padInstance.clear();
                });
            }

            // Añadir event listeners para soporte táctil
            this.addTouchSupport(canvas);

            // this.setupResizeObserver(iframeDocument);
            this.initialized = true;
            return this.padInstance;

        } catch (error) {
            console.error('Error al inicializar SignaturePad:', error);
            return null;
        }
    }

    addTouchSupport(canvas) {
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }, false);

        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }, false);

        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        }, false);
    }

    // setupCanvasDimensions(canvas) {
    //     const container = canvas.parentElement;
    //     const ratio = Math.max(window.devicePixelRatio || 1, 1);
        
    //     // Obtener dimensiones reales del contenedor
    //     const rect = container.getBoundingClientRect();
        
    //     canvas.width = rect.width * ratio;
    //     canvas.height = rect.height * ratio;
    //     canvas.style.width = `${rect.width}px`;
    //     canvas.style.height = `${rect.height}px`;
        
    //     const ctx = canvas.getContext('2d');
    //     ctx.scale(ratio, ratio);
    // }

    getSignatureImage() {
        return this.padInstance ? this.padInstance.toDataURL() : null;
    }

    isEmpty() {
        return this.padInstance ? this.padInstance.isEmpty() : true;
    }

    clear() {
        if (this.padInstance) {
            this.padInstance.clear();
        }
    }
}

export const signaturePadManager = new SignaturePadManager();