// js/formManager.js
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

    // Método para agregar la firma
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

            // Primero, restablecer todos los estilos
            iframes.forEach(iframe => {
                iframe.style.removeProperty('display');
                iframe.style.removeProperty('visibility');
            });

            const lastFormValue = sessionStorage.getItem('signatureForm');
            const lastIframe = iframes.find(iframe => {
                const currentFormValue = signaturePadManager.getCurrentFormValue(iframe);
                return currentFormValue === lastFormValue;
            });

            if (lastIframe) {
                const isCurrentlyDisplayed = this.currentFormIndex === iframes.indexOf(lastIframe);
                if (isCurrentlyDisplayed) {
                    // Solo aplicar estilos si es el formulario actualmente visible
                    const signatureContainer = lastIframe.contentDocument?.querySelector('.signature-container');
                    if (signatureContainer) {
                        signatureContainer.style.display = 'block';
                        signatureContainer.style.visibility = 'visible';
                    }
                }
                // Asegurarse de que el iframe esté visible
                // lastIframe.style.display = 'block';
                // lastIframe.style.visibility = 'visible';
                await signaturePadManager.initializeInIframe(lastIframe);
            } else {
                console.log('No se encontró el iframe correspondiente al último formulario marcado para firma.');
            }

        } catch (error) {
            console.error('Error al agregar el signature pad:', error);
        }
    }
    // Otros métodos de gestión de formularios...
}

export const formManager = new FormManager();