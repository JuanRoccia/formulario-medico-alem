import { signaturePadManager } from './signaturePadManager.js';

export class FormManager {
    constructor() {
        this.forms = [];
        this.currentFormIndex = 0;
    }

    async initializeForms(formContainer) {
        const iframes = formContainer.getElementsByTagName('iframe');
        this.forms = Array.from(iframes);

        // Configurar eventos para cada iframe
        for (let iframe of this.forms) {
            iframe.addEventListener('load', () => {
                this.setupFormValidation(iframe);
            });
        }

        return this.forms;
    }

    setupFormValidation(iframe) {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
    
        requiredInputs.forEach(input => {
            input.addEventListener('change', () => this.checkFormCompleteness(iframe));
        });

        // Verificar completitud inicial
        this.checkFormCompleteness(iframe);
    }

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

    // Otros métodos de gestión de formularios...
}

export const formManager = new FormManager();