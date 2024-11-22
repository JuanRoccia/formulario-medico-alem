// js/formManager.js
import { signaturePadManager } from './signaturePadManager.js';

export class FormManager {
    constructor() {
        this.forms = [];
        this.currentFormIndex = 0;
        console.log("FormManager inicializado");
    }

    async initializeForms(formContainer) {
        console.log('Inicializando formularios...');
        const iframes = formContainer.getElementsByTagName('iframe');
        console.log(`Encontrados ${iframes.length} iframes`);

        this.forms = Array.from(iframes);

        // Configurar eventos para cada iframe
        for (let iframe of this.forms) {
            console.log(`Configurando iframe: ${iframe.id || 'sin id'}`);
            console.log(`Configurando iframe: ${index + 1}`);


            iframe.addEventListener('load', () => {
                console.log(`Iframe ${index + 1} cargado - Configurando validación`);
                this.setupFormValidation(iframe);
            });
        }

        return this.forms;
    }

    setupFormValidation(iframe) {
        console.log('Configurando validación del formulario...');
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
        console.log(`Encontrados ${requiredInputs.length} campos requeridos`);

        requiredInputs.forEach(input => {
            input.addEventListener('change', () => {
                console.log(`Campo modificado: ${input.name || input.id}`);
                this.checkFormCompleteness(iframe);
            });
        });

        // Verificar completitud inicial
        this.checkFormCompleteness(iframe);
    }

    checkFormCompleteness(iframe) {
        console.log('Verificando completitud del formulario...');
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
        let isComplete = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                console.log(`Campo incompleto: ${input.name || input.id}`);
                isComplete = false;
            }
        });

        // Verificar la firma
        const signaturePad = iframeDocument.getElementById('signature-pad');
        if (signaturePad) {
            console.log('SignaturePad encontrado - verificando estado...');
            const padInstance = signaturePadManager.padInstance;
            if (padInstance && padInstance.isEmpty()) {
                console.log('Firma requerida');
                isComplete = false;
            }
        }

        console.log(`Formulario ${isComplete ? 'completo' : 'incompleto'}`);
        return isComplete;
    }

    // Método para agregar la firma
    async addSignaturePadToLastForm() {
        try {
            console.log('Iniciando proceso de agregar SignaturePad al último formulario...');
            const formContainer = document.getElementById('formContainer');
            if (!formContainer) {
                console.log('Contenedor de formularios no encontrado');
                return;
            }

            const iframes = Array.from(formContainer.getElementsByTagName('iframe'));
            console.log(`Encontrados ${iframes.length} iframes`);
            
            if (iframes.length === 0) {
                console.log('No se encontraron iframes');
                return;
            }

            // Primero, restablecer todos los estilos
            console.log('Restableciendo estilos de iframes...');
            iframes.forEach(iframe => {
                iframe.style.removeProperty('display');
                iframe.style.removeProperty('visibility');
                console.log(`Restableciendo iframe: ${iframe.id || 'sin id'}`);
            });

            const lastFormValue = sessionStorage.getItem('signatureForm');
            console.log(`Valor del form en sessionStorage: ${lastFormValue}`);
            
            const lastIframe = iframes.find(iframe => {
                const currentFormValue = signaturePadManager.getCurrentFormValue(iframe);
                console.log('Comparando valores de formulario:', {
                    current: currentFormValue,
                    target: lastFormValue
                });
                return currentFormValue === lastFormValue;
            });

            if (lastIframe) {
                console.log('Iframe para firma encontrado');
                const isCurrentlyDisplayed = this.currentFormIndex === iframes.indexOf(lastIframe);
                console.log(`¿Es el formulario actual?: ${isCurrentlyDisplayed}`);

                if (isCurrentlyDisplayed) {
                    // Solo aplicar estilos si es el formulario actualmente visible
                    const signatureContainer = lastIframe.contentDocument?.querySelector('.signature-container');
                    if (signatureContainer) {
                        console.log('Contenedor de firma encontrado - Aplicando estilos');
                        signatureContainer.style.display = 'block';
                        signatureContainer.style.visibility = 'visible';
                        
                        // Verificar estilos computados
                        const computedStyles = window.getComputedStyle(signatureContainer);
                        console.log('Estilos computados del contenedor:', {
                            display: computedStyles.display,
                            visibility: computedStyles.visibility,
                            position: computedStyles.position,
                            zIndex: computedStyles.zIndex
                        });
                    } else {
                        console.error('Contenedor de firma no encontrado en el iframe');
                    }
                }
                
                console.log('Inicializando signature pad');
                await signaturePadManager.initializeInIframe(lastIframe);
                console.log('Signature pad inicializado');
            } else {
                console.log('No se encontró el iframe correspondiente al último formulario marcado para firma.');
            }

        } catch (error) {
            console.error('Error al agregar el signature pad:', error);
            console.error('Stack trace:', error.stack);
        }
    }
}

// Añade esta línea donde quieras pausar la ejecución
// debugger;
export const formManager = new FormManager();