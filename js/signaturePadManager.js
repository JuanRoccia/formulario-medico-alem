export class SignaturePadManager {
    constructor() {
        this.padInstance = null;
        this.initialized = false;
        this.currentIframe = null;
    }

    async initializeInIframe(iframe) {
        if (!iframe) {
            console.error('No se proporcionó iframe');
            return null;
        }

        this.currentIframe = iframe;
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Verificar si es el formulario correcto para agregar signature pad
        const signatureForm = sessionStorage.getItem('signatureForm');
        const currentFormValue = this.getCurrentFormValue(iframe);

        if (signatureForm !== currentFormValue) {
            return null;
        }

        // Verificar si el documento está completamente cargado
        if (iframeDocument.readyState !== 'complete') {
            return new Promise((resolve) => {
                iframe.addEventListener('load', () => {
                    resolve(this.initializeInIframe(iframe));
                });
            });
        }

        // Insertar HTML del signature pad si no existe
        await this.insertSignaturePadHTML(iframeDocument);

        // Cargar librería SignaturePad si no está cargada
        await this.loadSignaturePadLibrary(iframeDocument);

        return this.initializePad(iframeDocument);
    }

    // Método para obtener el valor del formulario actual
    getCurrentFormValue(iframe) {
        // Extraer el valor del formulario de la URL del iframe
        const src = iframe.src;
        const match = src.match(/(\w+-\d+)\.html/);
        return match ? match[1] : null;
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
        
        // Verificar si el signature pad ya existe
        if (!iframeDocument.getElementById('signature-pad')) {
            formElement.insertAdjacentHTML('beforeend', signatureHTML);
        }
    }

    async loadSignaturePadLibrary(iframeDocument) {
        return new Promise((resolve, reject) => {
            const script = iframeDocument.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js';
            script.onload = () => {
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
            console.error('Canvas no encontrado');
            return null;
        }

        try {
            const SignaturePad = iframeDocument.defaultView.SignaturePad;
            
            this.padInstance = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });

            const clearButton = iframeDocument.getElementById('clear');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    this.padInstance.clear();
                });
            }

            this.initialized = true;
            return this.padInstance;

        } catch (error) {
            console.error('Error al inicializar SignaturePad:', error);
            return null;
        }
    }

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