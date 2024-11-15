Arreglar el signature pad para poder firmar el ultimo formulario, el signature debe colocarse en el ultimo formulario y poder hacerse ña firma actulmente el signature se ubica correctamente en el ultimo formulario pero no se puede firmar, en cambio cuando se encuentra en el primer formulario si se puede y funciona correctamente, el proyecto es un proyecto vanilla que consiste en un dashboard donde se seleccionan los formularios que el ususario debe rellenar y estos despues se envian o se descargan en un pdf junto con la firma ubicada en el ultimo formulario

la logica implementada para el manejo del signature es la siguiente

js/dashboardManager.js:
import { linkGenerator } from './linkGenerator.js';
import { formManager } from './formManager.js';
export class DashboardManager {
    constructor() {
        this.generateButton = null;
        this.linkInput = null;
        this.generatedLinkDiv = null;
    }
    // mas código
    handleGenerateLink() {
            // Generar enlace
            const link = linkGenerator.generateLink();
            
            if (link) {
                // Mostrar enlace generado
                if (this.linkInput) {
                    this.linkInput.value = link;
                }
                
                if (this.generatedLinkDiv) {
                    this.generatedLinkDiv.classList.remove('hidden');
                }

                // Agregar el signature pad al último formulario
                formManager.addSignaturePadToLastForm(); // Llama a la función aquí
            }
        }
    // etc
}
export const dashboardManager = new DashboardManager();

js/script.js:
import { signaturePadManager } from './signaturePadManager.js';
import { formManager } from './formManager.js';
<!-- mas codigo -->
// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('formContainer');
    if (formContainer) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    formManager.addSignaturePadToLastForm();
                    // addSignaturePadToLastForm();
                }
            });
        });

        observer.observe(formContainer, { childList: true });
        
        // Intentar inicializar después de un breve retraso
        setTimeout(formManager.addSignaturePadToLastForm, 1000);
    }
});
<!-- resto del código -->

js/linkGenerator.js:
export class LinkGenerator {
    constructor() {
        this.selectedForms = [];
        this.baseUrl = 'https://imagenesalem.netlify.app/index.html?';
    }
    // Mapeo de formularios
    getFormMapping() {
        return {
            'form1': { value: 'form-1', name: 'Formulario General' },
            'form2': { value: 'form-2', name: 'Formulario Músculo Esquelético' },
            'form3': { value: 'form-3', name: 'Formulario Neuro-Cabeza y Cuello' },
            'form4': { value: 'form-4', name: 'Formulario Mama' },
            'form5': { value: 'form-5', name: 'Formulario Pelvis Gineco y Abdomen' },
            'form7': { value: 'form-7', name: 'Formulario Pelvis Masculina y Recto' },
            'form8': { value: 'form-8', name: 'Formulario ATM' }
        };
    }
    // Método para seleccionar formularios
    selectForms() {
        const formMapping = this.getFormMapping();
        this.selectedForms = [];

        Object.keys(formMapping).forEach(formId => {
            const checkbox = document.getElementById(formId);
            if (checkbox && checkbox.checked) {
                this.selectedForms.push(formMapping[formId]);
            }
        });

        return this.selectedForms;
    }
    // Generar enlace
    generateLink() {
        // Seleccionar formularios
        const selectedForms = this.selectForms();

        // Validar selección
        if (selectedForms.length === 0) {
            alert('Por favor, seleccione al menos un formulario.');
            return null;
        }

        // En lugar de agregar signature pad, solo guardar información
        this.markLastFormForSignature(selectedForms);

        // Construir parámetros del enlace
        const formParams = selectedForms
            .map(form => `form=${form.value}&name=${encodeURIComponent(form.name)}`)
            .join('&');

        return `${this.baseUrl}${formParams}`;
    }
    // Método para marcar el último formulario para signature pad
    markLastFormForSignature(selectedForms) {
        // Obtener el último formulario seleccionado
        const lastForm = selectedForms[selectedForms.length - 1];

        try {
            // Guardar información del último formulario en sessionStorage
            sessionStorage.setItem('signatureForm', lastForm.value);
            console.log('Último formulario marcado para firma:', lastForm.value);
        } catch (error) {
            console.error('Error al marcar formulario para firma:', error);
        }
    }
}
export const linkGenerator = new LinkGenerator();

js/formManager.js:
import { signaturePadManager } from './signaturePadManager.js';
export class FormManager {
    constructor() {
        this.forms = [];
        this.currentFormIndex = 0;
    }
    <!-- otros métodos -->
    checkFormCompleteness(iframe) {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
        let isComplete = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                console.log(`Campo no completado: ${input.name || input.id}`);
                isComplete = false;
            }
        });

        // Verificar la firma
        const signaturePad = iframeDocument.getElementById('signature-pad');
        if (signaturePad) {
            const padInstance = signaturePadManager.padInstance;
            if (padInstance && padInstance.isEmpty()) {
                console.log('Firma requerida');
                isComplete = false;
            }
        }

        return isComplete;
    }
    async addSignaturePadToLastForm() {
        try {
            const formContainer = document.getElementById('formContainer');
            if (!formContainer) {
                console.log('Contenedor de formularios no encontrado');
                return;
            }

            const iframes = Array.from(formContainer.getElementsByTagName('iframe'));
            if (iframes.length === 0) {
                console.log('No se encontraron iframes');
                return;
            }

            const lastFormValue = sessionStorage.getItem('signatureForm');
            const lastIframe = iframes.find(iframe => {
                const currentFormValue = signaturePadManager.getCurrentFormValue(iframe);
                return currentFormValue === lastFormValue;
            });

            if (lastIframe) {
                await signaturePadManager.initializeInIframe(lastIframe);
            } else {
                console.log('No se encontró el iframe correspondiente al último formulario marcado para firma.');
            }

        } catch (error) {
            console.error('Error al agregar el signature pad:', error);
        }
    }
}
export const formManager = new FormManager();

js/signaturePadManager.js:
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
        // Cargar librería SignaturePad si no está cargada
        await this.loadSignaturePadLibrary(iframeDocument);
        // Insertar HTML del signature pad si no existe
        await this.insertSignaturePadHTML(iframeDocument);
        // return this.initializePad(iframeDocument);
        return this.padInstance;
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
        const formElement = iframeDocument.querySelector('form') || iframeDocument.body;
        
        // Verificar si el signature pad ya existe
        if (!iframeDocument.getElementById('signature-pad')) {
            formElement.insertAdjacentHTML('beforeend', signatureHTML);

            // Inicializar el signature pad después de insertarlo
            await this.initializePad(iframeDocument);
        }
    }
    initializePad(iframeDocument) {
        const canvas = iframeDocument.getElementById('signature-pad');
        if (!canvas) {
            console.error('Canvas no encontrado');
            return null;
        }
        this.setupCanvasDimensions(canvas);
        const SignaturePad = iframeDocument.defaultView.SignaturePad;
        if (!SignaturePad) {
            console.error('SignaturePad no está disponible');
            return null;
        }
        try {
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

-css
-favicon
-images
-js
    dashboardManager.js
    formManager.js
    linkGenerator.js
    main.js
    pdfGenerator.js
    script.js
    signaturePadManager.js
    bodyDrawing.js
dashboard.html
form1.html
form2.html
form3.html
form4.html
form5.html
form7.html
form8.html
index.html
login.html
