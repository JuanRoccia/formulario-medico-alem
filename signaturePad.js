// signaturePad.js

class SignaturePadManager {
    constructor() {
        this.padInstance = null;
        this.initialized = false;
        this.currentIframe = null;
    }

    async initializeInIframe(iframe) {
        if (!iframe) {
            console.log('No se proporcionó iframe');
            return null;
        }

        // Guardar referencia al iframe actual
        this.currentIframe = iframe;

        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Esperar a que el iframe esté completamente cargado
        if (iframeDocument.readyState !== 'complete') {
            return new Promise((resolve) => {
                iframe.addEventListener('load', () => {
                    resolve(this.initializeInIframe(iframe));
                });
            });
        }

        // Reinicializar cuando el iframe se hace visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.style.display === 'block') {
                    this.reinitializePad(iframeDocument);
                }
            });
        });

        observer.observe(iframe, {
            attributes: true,
            attributeFilter: ['style']
        });

        // Insertar HTML del signature pad si no existe
        if (!iframeDocument.getElementById('signature-pad')) {
            await this.insertSignaturePadHTML(iframeDocument);
        }

        // Cargar la librería SignaturePad si no está cargada
        if (typeof iframeDocument.defaultView.SignaturePad === 'undefined') {
            await this.loadSignaturePadLibrary(iframeDocument);
        }

        return this.initializePad(iframeDocument);
    }

    async reinitializePad(iframeDocument) {
        const canvas = iframeDocument.getElementById('signature-pad');
        if (!canvas) return;

        // Reconfigurar dimensiones
        this.setupCanvasDimensions(canvas);

        // Reinicializar pad
        try {
            this.padInstance = new iframeDocument.defaultView.SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });

            // Asegurar que los eventos táctiles funcionen
            canvas.style.touchAction = 'none';
            
            this.initialized = true;
        } catch (error) {
            console.error('Error al reinicializar SignaturePad:', error);
        }
    }

    setupCanvasDimensions(canvas) {
        const container = canvas.parentElement;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        
        // Obtener dimensiones reales del contenedor
        const rect = container.getBoundingClientRect();
        
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);
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

        const formElement = iframeDocument.querySelector('form') || iframeDocument.body;
        formElement.insertAdjacentHTML('beforeend', signatureHTML);

        // Asegurar que el contenedor tenga posición relativa
        const container = iframeDocument.querySelector('.signature-container');
        if (container) {
            container.style.position = 'relative';
        }
    }

    async loadSignaturePadLibrary(iframeDocument) {
        return new Promise((resolve, reject) => {
            const script = iframeDocument.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js';
            script.onload = () => {
                // Asegurar que la librería está disponible en el contexto del iframe
                iframeDocument.defaultView.SignaturePad = window.SignaturePad;
                resolve();
            };
            script.onerror = reject;
            iframeDocument.head.appendChild(script);
        });
    }

    initializePad(iframeDocument) {
        const canvas = iframeDocument.getElementById('signature-pad');
        if (!canvas) {
            console.log('Canvas no encontrado en el documento');
            return null;
        }

        this.setupCanvasDimensions(canvas);

        try {
            // Asegurar que SignaturePad está disponible en el contexto correcto
            const SignaturePad = iframeDocument.defaultView.SignaturePad || window.SignaturePad;
            
            this.padInstance = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });

            // Asegurar que los eventos táctiles funcionen
            canvas.style.touchAction = 'none';

            const clearButton = iframeDocument.getElementById('clear');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    this.padInstance.clear();
                });
            }

            // Agregar listener para redimensionar el canvas cuando el contenedor cambie
            const resizeObserver = new ResizeObserver(() => {
                this.setupCanvasDimensions(canvas);
            });
            resizeObserver.observe(canvas.parentElement);

            this.initialized = true;
            return this.padInstance;

        } catch (error) {
            console.error('Error al inicializar SignaturePad:', error);
            return null;
        }
    }

    isEmpty() {
        return this.padInstance ? this.padInstance.isEmpty() : true;
    }

    getSignatureImage() {
        return this.padInstance ? this.padInstance.toDataURL() : null;
    }

    clear() {
        if (this.padInstance) {
            this.padInstance.clear();
        }
    }
}

export const signaturePadManager = new SignaturePadManager();