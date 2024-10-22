// signaturePad.js

class SignaturePadManager {
    constructor() {
        this.padInstance = null;
        this.initialized = false;
    }

    // Inicializa el pad en el iframe correcto
    async initializeInIframe(iframe) {
        if (!iframe) {
            console.log('No se proporcionó iframe');
            return null;
        }

        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Esperar a que el DOM esté completamente cargado
        if (iframeDocument.readyState !== 'complete') {
            return new Promise((resolve) => {
                iframe.addEventListener('load', () => {
                    resolve(this.initializeInIframe(iframe));
                });
            });
        }

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

    // Inserta el HTML necesario para el signature pad
    async insertSignaturePadHTML(iframeDocument) {
        const signatureHTML = `
            <div class="mb-6 border-t border-gray-900/10 pt-6">
                <h2 class="text-lg font-semibold mb-4">Firma del Paciente</h2>
                <div class="signature-container" style="width: 100%; height: 200px;">
                    <canvas id="signature-pad" class="border rounded-md" style="width: 100%; height: 100%;"></canvas>
                    <button type="button" id="clear" class="mt-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400">
                        Limpiar Firma
                    </button>
                </div>
            </div>
        `;

        const formElement = iframeDocument.querySelector('form') || iframeDocument.body;
        formElement.insertAdjacentHTML('beforeend', signatureHTML);
    }

    // Carga la librería de SignaturePad
    async loadSignaturePadLibrary(iframeDocument) {
        return new Promise((resolve, reject) => {
            const script = iframeDocument.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            iframeDocument.head.appendChild(script);
        });
    }

    // Inicializa el pad con las configuraciones necesarias
    initializePad(iframeDocument) {
        const canvas = iframeDocument.getElementById('signature-pad');
        if (!canvas) {
            console.log('Canvas no encontrado en el documento');
            return null;
        }

        // Configurar dimensiones del canvas
        this.setupCanvasDimensions(canvas);

        try {
            // Crear instancia de SignaturePad
            this.padInstance = new iframeDocument.defaultView.SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });

            // Configurar botón de limpieza
            const clearButton = iframeDocument.getElementById('clear');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    this.padInstance.clear();
                });
            }

            this.initialized = true;
            console.log('SignaturePad inicializado correctamente');
            return this.padInstance;

        } catch (error) {
            console.error('Error al inicializar SignaturePad:', error);
            return null;
        }
    }

    // Configura las dimensiones del canvas
    setupCanvasDimensions(canvas) {
        const container = canvas.parentElement;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = container.clientWidth * ratio;
        canvas.height = container.clientHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
    }

    // Verifica si hay una firma
    isEmpty() {
        return this.padInstance ? this.padInstance.isEmpty() : true;
    }

    // Obtiene la firma como imagen
    getSignatureImage() {
        return this.padInstance ? this.padInstance.toDataURL() : null;
    }

    // Limpia la firma
    clear() {
        if (this.padInstance) {
            this.padInstance.clear();
        }
    }
}

// Exportar la clase para su uso
export const signaturePadManager = new SignaturePadManager();