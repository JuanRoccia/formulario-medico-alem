import { dashboardManager } from './dashboardManager.js';
import { signaturePadManager } from './signaturePadManager.js';
import { formManager } from './formManager.js';
import { pdfGenerator } from './pdfGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar gestores según la página
    const path = window.location.pathname;

    if (path.includes('dashboard.html')) {
        dashboardManager.initialize();
    } else if (path.includes('index.html')) {
        const formContainer = document.getElementById('formContainer');
        
        // Función para inicializar formularios e intentar agregar signature pad
        async function setupForms() {
            // Inicializar formularios
            await formManager.initializeForms(formContainer);

            // Obtener todos los iframes
            const iframes = formContainer.getElementsByTagName('iframe');

            // Intentar inicializar signature pad en cada iframe
            for (let iframe of iframes) {
                await signaturePadManager.initializeInIframe(iframe);
            }
        }

        // Llamar a setupForms
        // setupForms();

        // Agregar lógica para generar PDFs
        const generatePDFButton = document.getElementById('generatePDFButton');
        if (generatePDFButton) {
            generatePDFButton.addEventListener('click', async () => {
                const iframes = formContainer.getElementsByTagName('iframe');
                
                // Verificar completitud del último formulario
                const lastIframe = iframes[iframes.length - 1];
                const isComplete = formManager.checkFormCompleteness(lastIframe);

                if (isComplete) {
                    try {
                        // Generar PDF
                        const pdf = await pdfGenerator.generatePDF(iframes);
                        
                        // Guardar PDF
                        pdf.save('documento.pdf');
                        
                        // Limpiar sessionStorage después de generar el PDF
                        sessionStorage.removeItem('signatureForm');
                    } catch (error) {
                        console.error('Error al generar PDF:', error);
                        alert('Hubo un error al generar el PDF. Por favor, intente nuevamente.');
                    }
                } else {
                    alert('Por favor, complete todos los campos requeridos y firme antes de generar el PDF.');
                }
            });
        }
    }
});