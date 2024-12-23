// script.js

import { signaturePadManager } from './signaturePadManager.js';
import { formManager } from './formManager.js';
// import { generatePdfWithPdfLib } from './pdfGenerator.js';

// function loadSignaturePadLibrary(iframeDocument) {
//     return new Promise((resolve, reject) => {
//         // Verificar si SignaturePad ya está cargado
//         if (iframeDocument.defaultView.SignaturePad) {
//             return resolve(iframeDocument.defaultView.SignaturePad);
//         }

//         const script = iframeDocument.createElement('script');
//         script.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js';
//         script.onload = () => {
//             // Hacer SignaturePad disponible en el contexto del iframe
//             iframeDocument.defaultView.SignaturePad = window.SignaturePad;
//             resolve(window.SignaturePad);
//         };
//         script.onerror = reject;
//         iframeDocument.head.appendChild(script);
//     });
// }

// Primero, asegurémonos de que todas las funciones estén definidas antes de usarlas
let signaturePadInstance = null;

// Función para inicializar el signature pad
function initializeSignaturePad(iframe) {
    if (!iframe) {
        console.error('No se proporcionó iframe');
        return;
    }

    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    // Esperar a que el documento esté completamente cargado
    if (iframeDocument.readyState !== 'complete') {
        iframe.addEventListener('load', () => initializeSignaturePad(iframe));
        return;
    }

    // Cargar la librería SignaturePad
    loadSignaturePadLibrary(iframeDocument)
        .then((SignaturePad) => {
            const canvas = iframeDocument.getElementById('signature-pad');
            if (!canvas) {
                console.error('Canvas no encontrado');
                return;
            }

            // Configurar dimensiones del canvas
            const container = canvas.parentElement;
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const rect = container.getBoundingClientRect();
            
            canvas.width = rect.width * ratio;
            canvas.height = rect.height * ratio;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const ctx = canvas.getContext('2d');
            ctx.scale(ratio, ratio);

            // Inicializar SignaturePad
            const signaturePadInstance = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });

            // Configurar botón de limpieza
            const clearButton = iframeDocument.getElementById('clear');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    signaturePadInstance.clear();
                });
            }

            // Añadir soporte táctil
            addTouchSupport(canvas);

            console.log('SignaturePad inicializado correctamente');
        })
        .catch((error) => {
            console.error('Error al inicializar SignaturePad:', error);
        });
}

function addTouchSupport(canvas) {
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

// Función para determinar el último formulario y agregar la firma
// function addSignatureToLastForm() {
//     const selectedForms = [];
//     const checkboxes = [
//         { checkbox: document.getElementById('form1'), value: 'form-1' },
//         { checkbox: document.getElementById('form2'), value: 'form-2' },
//         { checkbox: document.getElementById('form3'), value: 'form-3' },
//         { checkbox: document.getElementById('form4'), value: 'form-4' },
//         { checkbox: document.getElementById('form5'), value: 'form-5' },
//         { checkbox: document.getElementById('form7'), value: 'form-7' },
//         { checkbox: document.getElementById('form8'), value: 'form-8' }
//     ];

//     checkboxes.forEach(({ checkbox, value }) => {
//         if (checkbox && checkbox.checked) {
//             selectedForms.push(value);
//         }
//     });

//     if (selectedForms.length === 0) return;

//     const lastForm = selectedForms[selectedForms.length - 1];
//     const signatureHtml = `
//         <div class="mb-6 border-t border-gray-900/10 pt-6">
//             <h2 class="text-lg font-semibold mb-4">Firma del Paciente</h2>
//             <div class="signature-container" style="width: 100%; height: 200px;">
//                 <canvas id="signature-pad" class="border rounded-md" style="width: 100%; height: 100%;"></canvas>
//                 <button type="button" id="clear" class="mt-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400">
//                     Limpiar Firma
//                 </button>
//             </div>
//         </div>
//     `;

//     try {
//         sessionStorage.setItem('signatureForm', lastForm);
//         sessionStorage.setItem('signatureHtml', signatureHtml);
//         console.log('Firma guardada para el formulario:', lastForm);
//     } catch (error) {
//         console.error('Error al guardar la firma:', error);
//     }
// }

// Event listeners
// document.addEventListener('DOMContentLoaded', () => {
//     const formContainer = document.getElementById('formContainer');
//     if (formContainer) {
//         const iframes = formContainer.getElementsByTagName('iframe');
//         if (iframes.length > 0) {
//             // Inicializar el primer iframe
//             initializeSignaturePad(iframes[0]);
//         }

//         // Observador para iframes adicionales
//         const observer = new MutationObserver((mutations) => {
//             mutations.forEach((mutation) => {
//                 if (mutation.addedNodes.length) {
//                     const iframe = mutation.addedNodes[0];
//                     if (iframe.tagName === 'IFRAME') {
//                         initializeSignaturePad(iframe);
//                     }
//                 }
//             });
//         });

//         observer.observe(formContainer, { childList: true });
//     }
// });

// Funcionalidades de index.html
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const forms = urlParams.getAll('form');
    const formNames = urlParams.getAll('name');
    const formContainer = document.getElementById('formContainer');
    const formList = document.getElementById('formList');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    let currentFormIndex = 0;

    function createFormList() {
        const list = document.createElement('ul');
        list.className = 'list-disc pl-5 mb-4';
        formNames.forEach((name, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = decodeURIComponent(name);
            listItem.className = 'mb-1';
            list.appendChild(listItem);
        });
        formList.appendChild(list);
    }

    function createIframes() {
        forms.forEach((form, index) => {
            const iframe = document.createElement('iframe');
            iframe.src = `${form}.html`;
            iframe.className = 'w-full h-full border-0 top-0 left-0 transition-opacity duration-300';
            iframe.style.display = index === 0 ? 'block' : 'none';
            iframe.style.opacity = index === 0 ? '1' : '0';
            
            iframe.addEventListener('load', function() {
                adjustIframeHeight(this);
                setupFormValidation(this, index);
            });

            iframe.addEventListener('error', function() {
                console.error(`Error al cargar el formulario: ${form}.html`);
                // Manejar el error, tal vez mostrar un mensaje al usuario
            });
            
            formContainer.appendChild(iframe);
        });
    }

    function adjustIframeHeight(iframe) {
        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
        iframe.contentWindow.document.documentElement.style.overflow = 'hidden';
        iframe.contentWindow.document.documentElement.style.scrollbarWidth = 'none';
        iframe.contentWindow.document.documentElement.style.webkitScrollbar = 'display: none';
        
        const resizeObserver = new ResizeObserver(() => {
            iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
        });
        resizeObserver.observe(iframe.contentWindow.document.body);
    }

    function setupFormValidation(iframe, index) {
        const iframeDocument = iframe.contentWindow.document;
        const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
    
        requiredInputs.forEach(input => {
            input.addEventListener('change', () => checkFormCompleteness(iframe));
        });

        // Verificar completitud inicial
        checkFormCompleteness(iframe);
    }

    function checkFormCompleteness(iframe) {
        if (!iframe) return false;

        const iframeDocument = iframe.contentWindow.document;
        const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
        let isComplete = true;

        const checkboxGroups = iframeDocument.querySelectorAll('.checkbox-group');

        checkboxGroups.forEach(checkboxGroup => {
            // Si el grupo tiene la clase hidden, saltamos todo el procesamiento
            if (checkboxGroup.classList.contains('hidden')) {
                return;
            }
        
            const checkboxes = checkboxGroup.querySelectorAll('input[type="checkbox"]');
            
            checkboxes.forEach(checkbox => {
                const associatedInputs = [];
                let nextSibling = checkbox.parentElement.nextElementSibling;
                while (nextSibling && nextSibling.tagName !== 'LABEL') {
                    if (nextSibling.tagName === 'INPUT') {
                        associatedInputs.push(nextSibling);
                    }
                    nextSibling = nextSibling.nextElementSibling;
                }
                
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        associatedInputs.forEach(input => {
                            if (!input.classList.contains('required-exception')) {
                                input.setAttribute('required', '');
                            }
                        });
                    } else {
                        associatedInputs.forEach(input => {
                            if (!input.classList.contains('required-exception')) {
                                input.removeAttribute('required');
                            }
                        });
                    }
                });
        
                if (checkbox.checked) {
                    associatedInputs.forEach(input => {
                        if (!input.classList.contains('required-exception')) {
                            input.setAttribute('required', '');
                        }
                    });
                }
            });
        
            const hasCheckedBox = Array.from(checkboxes).some(checkbox => checkbox.checked);
        
            if (!hasCheckedBox) {
                console.log(`Checkbox group without selection: ${checkboxGroup.id || 'No identifier'}`);
                isComplete = false;
            }
        });

        requiredInputs.forEach(input => {
            const type = input.type;

            if (type === 'radio' || type === 'checkbox') {
                // Verificar si hay al menos un input del grupo seleccionado
                const name = input.name;
                if (name && !iframeDocument.querySelector(`input[name="${name}"]:checked`)) {
                    console.log(`Campo requerido no completado (radio/checkbox): ${name}`);
                    isComplete = false;
                }
            } else if (type === 'date') {
                // Verificar que el input de tipo date tenga un valor
                if (!input.value) {
                    console.log(`Campo requerido no completado (date): ${input.name || input.id}`);
                    isComplete = false;
                }
            } else if (!input.value.trim()) {
                // Para los demás tipos de input (text, number, etc.)
                console.log(`Campo requerido no completado: ${input.name || input.id}`);
                isComplete = false;
            }
        });

        // Verificar la firma
        const signaturePad = iframeDocument.getElementById('signature-pad');
        if (signaturePad) {
            const signaturePadInstance = signaturePad.signaturePad;
            
            if (!signaturePadInstance || signaturePadInstance.isEmpty()) {
                console.log('Firma requerida');
                isComplete = false;
            }
        }
        return isComplete;
    }

    function updatePageIndicator() {
        pageIndicator.textContent = `Página ${currentFormIndex + 1} de ${forms.length}`;
    }

    function updateButtonText() {
        nextBtn.textContent = forms.length === 1 || currentFormIndex === forms.length - 1 ? 'Finalizar' : 'Siguiente';
    }

    function showForm(index) {
        const iframes = formContainer.getElementsByTagName('iframe');
        Array.from(iframes).forEach((iframe, i) => {
            if (i === index) {
                iframe.style.display = 'block';
                setTimeout(() => { iframe.style.opacity = '1'; }, 50);
            } else {
                iframe.style.opacity = '0';
                setTimeout(() => { iframe.style.display = 'none'; }, 300);
            }
        });
        currentFormIndex = index;
        updatePageIndicator();
        prevBtn.disabled = currentFormIndex === 0;
        // nextBtn.textContent = currentFormIndex === forms.length - 1 ? 'Finalizar' : 'Siguiente';
        updateButtonText();
    }

    function showLoadingIndicator() {
        console.log('Mostrando indicador de carga...');
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        } else {
            console.error('Elemento loadingIndicator no encontrado');
        }
    }

    function hideLoadingIndicator() {
        console.log('Ocultando indicador de carga...');
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        } else {
            console.error('Elemento loadingIndicator no encontrado');
        }
    }

    function areAllFormsComplete() {
        for (let i = 0; i < forms.length; i++) {
            const iframe = formContainer.getElementsByTagName('iframe')[i];
            if (!checkFormCompleteness(iframe)) {
                return false;
            }
        }
        return true;
    }

    async function finalizeProcess() {
        if (areAllFormsComplete()) {
            showLoadingIndicator();
            try {
                await downloadForms('pdf');
                hideLoadingIndicator();
            } catch (error) {
                hideLoadingIndicator();
                alert('Hubo un error al generar los PDFs: ' + error.message);
                console.error(error);
            }
        } else {
            alert('Por favor, completa todos los formularios antes de finalizar.');
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentFormIndex > 0) {
            showForm(currentFormIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        const currentIframe = formContainer.getElementsByTagName('iframe')[currentFormIndex];
        
        if (currentIframe && checkFormCompleteness(currentIframe)) {
            if (currentFormIndex < forms.length - 1) {
                showForm(currentFormIndex + 1);
            } else {
                finalizeProcess();
            }
        } else {
            const iframeDocument = currentIframe.contentWindow.document;
            const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
            let incompleteFields = [];

            // Verificar específicamente la firma
            const signaturePad = iframeDocument.getElementById('signature-pad');
            if (signaturePad) {
                const signaturePadInstance = signaturePad.signaturePad;
                
                if (!signaturePadInstance || signaturePadInstance.isEmpty()) {
                    incompleteFields.push('Firma');
                }
            }
            
            // Verificar grupos de checkbox
            const checkboxGroups = iframeDocument.querySelectorAll('.checkbox-group');
            checkboxGroups.forEach(checkboxGroup => {
                // Solo verificar si el grupo NO está oculto
                if (!checkboxGroup.classList.contains('hidden')) {
                    const checkboxes = checkboxGroup.querySelectorAll('input[type="checkbox"]');
                    const hasCheckedBox = Array.from(checkboxes).some(checkbox => checkbox.checked);
                    
                    if (!hasCheckedBox) {
                        // Usar el ID o un texto descriptivo para el grupo de checkbox
                        incompleteFields.push(checkboxGroup.id || 'Grupo de checkboxes');
                    }
                }
            });
            
            requiredInputs.forEach(input => {
                if ((input.type === 'checkbox' || input.type === 'radio') && !iframeDocument.querySelector(`input[name="${input.name}"]:checked`)) {
                    incompleteFields.push(input.name);
                } else if (!input.value.trim()) {
                    incompleteFields.push(input.name || input.id);
                }
            });

            alert(`Por favor, completa los siguientes campos antes de continuar: ${incompleteFields.join(', ')}`);
        }
    });

    async function downloadForms(format) {
        if (format === 'pdf') {
            try {
                const { pdfUrl, pdfBlob } = await generatePdfWithPdfLib(formContainer);
                if (pdfUrl && pdfBlob) {
                    showPdfModal(pdfUrl, 'formularios_completos.pdf', pdfBlob);
                } else {
                    throw new Error('No se pudo generar el PDF');
                }
            } catch (error) {
                console.error('Error al generar PDF:', error);
                alert('Hubo un problema al generar los PDFs. Por favor, inténtelo de nuevo.');
            }
        } else {
            throw new Error('Formato no soportado');
        }
    }
    
    async function generatePdfWithPdfLib(formContainer) {
        const pdfDoc = await PDFLib.PDFDocument.create();
        const formIframes = formContainer.getElementsByTagName('iframe');
        
        for (let i = 0; i < formIframes.length; i++) {
            const iframe = formIframes[i];
    
            try {
                // Debug: Verificar el estado del iframe
                console.log(`Procesando iframe ${i + 1}:`, {
                    src: iframe.src,
                    display: iframe.style.display,
                    visibility: iframe.style.visibility,
                    readyState: iframe.contentDocument ? iframe.contentDocument.readyState : 'documento no accesible'
                });
    
                // Temporal fix: Forzar visibilidad para captura
                const originalDisplay = iframe.style.display;
                iframe.style.display = 'block';
                iframe.style.opacity = '1';
                iframe.style.position = 'absolute';
                iframe.style.top = '-9999px';
                iframe.style.left = '-9999px';
                iframe.style.width = '100%';
                iframe.style.height = 'auto';
    
                // Asegurar que el iframe está completamente cargado
                await new Promise((resolve) => {
                    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                        resolve();
                    } else {
                        iframe.onload = resolve;
                    }
                });
    
                // Esperar un momento adicional para asegurar que el contenido esté renderizado
                await new Promise(resolve => setTimeout(resolve, 500));
    
                // Debug: Verificar contenido del iframe
                const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDocument) {
                    console.warn(`No se puede acceder al documento del iframe ${i + 1}`);
                    // Restaurar estilo original
                    iframe.style.display = originalDisplay;
                    continue;
                }

                // Agregar styles para corregir los iframes
                const styleElement = iframeDocument.createElement('style');
                styleElement.textContent = `
                    input, textarea {
                        line-height: 2rem!important;
                        margin-top: 1rem!important;
                    }
                    .ial-ot{
                        margin-top:0.4rem;
                    }
                `;
                iframeDocument.head.appendChild(styleElement);
    
                // Capturar el contenido
                const canvasElement = await html2canvas(iframeDocument.body, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: true
                });
    
                // Restaurar estilo original
                iframe.style.display = originalDisplay;
                iframe.style.position = '';
                iframe.style.top = '';
                iframe.style.left = '';
                iframe.style.width = '';
                iframe.style.height = '';
    
                // Convertir canvas a imagen embebida en el PDF
                const imgBlob = await new Promise((resolve) => canvasElement.toBlob(resolve, 'image/png'));
                
                // Verificar que el blob no sea nulo
                if (!imgBlob) {
                    console.warn(`No se pudo generar la imagen para el formulario ${i + 1}`);
                    continue;
                }
    
                const imgBuffer = await imgBlob.arrayBuffer();
                const img = await pdfDoc.embedPng(imgBuffer);
    
                // Crear una página nueva y ajustar la imagen
                const page = pdfDoc.addPage();
                const { width, height } = page.getSize();
                const imgAspectRatio = img.width / img.height;
                const pageAspectRatio = width / height;
    
                let drawWidth, drawHeight, x, y;
                if (imgAspectRatio > pageAspectRatio) {
                    // Escalar por ancho
                    drawWidth = width;
                    drawHeight = width / imgAspectRatio;
                    x = 0;
                    y = (height - drawHeight) / 2;
                } else {
                    // Escalar por altura
                    drawHeight = height;
                    drawWidth = height * imgAspectRatio;
                    x = (width - drawWidth) / 2;
                    y = 0;
                }
    
                page.drawImage(img, {
                    x: x,
                    y: y,
                    width: drawWidth,
                    height: drawHeight,
                });

                styleElement.textContent = `
                    input, textarea {
                        line-height: inherit!important;
                        margin-top: inherit!important;
                    }
                    .ial-ot{
                        margin-top:0;
                    }
                `;
                iframeDocument.head.appendChild(styleElement);
    
            } catch (error) {
                console.error(`Error completo al procesar formulario ${i + 1}:`, error);
                continue;
            }
        }
    
        // Guardar el PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
    
        return { pdfUrl: url, pdfBlob: blob };
    }
    
    // function showPdfModal(url, filename, blob) {
    //     // Lógica para mostrar o descargar el PDF
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = filename;
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    // }    

    async function sendPdfViaWhatsApp(pdfBlob, fileName) {
        const WHATSAPP_CONFIG = {
            phoneNumberId: '140509369155603',
            recipientPhone: '542915278412', // Número de Imágenes Alem
            version: 'v21.0',
            token: 'EAATNyuEEXiIBO2IReMInnIVSmubkiCxF7WcUjSSSyTtBDlHFZCgShsJCZCTMR6quNYhrxrXNwdDkG0Xv5Lg5rP7hMxWKJvhUjNZA7M5lZBMeIgxNBEZCIk125qQNVTTRzAlb8WWckWZBCZB5Q7t3iRVfql1JgtZAuZAZB2tgKZAZBvvHH0pjLgZC8ZCuGE9nzqvnnqKzBTuwZDZD'
        };

        try {
            // Validar el tamaño del archivo (máximo 16MB para WhatsApp Business API)
            const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB en bytes
            if (pdfBlob.size > MAX_FILE_SIZE) {
                throw new Error('El archivo PDF es demasiado grande. El tamaño máximo permitido es 16MB.');
            }
    
            // 1. Subir el PDF a la Media API
            const formData = new FormData();
            formData.append('file', pdfBlob, fileName);
            formData.append('messaging_product', 'whatsapp');
            formData.append('type', 'application/pdf');
    
            // Subir el documento a la Media API de WhatsApp
            console.log('Subiendo archivo a WhatsApp Media API...');
            const mediaUploadResponse = await fetch(
                `https://graph.facebook.com/${WHATSAPP_CONFIG.version}/${WHATSAPP_CONFIG.phoneNumberId}/media`, 
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`
                    },
                    body: formData
                }
            );
    
            // if (!mediaUploadResponse.ok) {
            //     throw new Error(`Error al subir el archivo: ${await mediaUploadResponse.text()}`);
            // }    

            const mediaResponseText = await mediaUploadResponse.text();
    
            if (!mediaUploadResponse.ok) {
                let errorMessage = 'Error al subir el archivo';
                try {
                    const errorData = JSON.parse(mediaResponseText);
                    errorMessage = errorData.error?.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing media response:', e);
                }
                throw new Error(`${errorMessage} (Status: ${mediaUploadResponse.status})`);
            }

            let mediaData;
            try {
                mediaData = JSON.parse(mediaResponseText);
            } catch (e) {
                console.error('Error parsing media response:', e);
                throw new Error('Error al analizar la respuesta de la Media API');
            
            }
            // const mediaData = JSON.parse(mediaResponseText);
            // console.log('Media ID:', mediaData.id);
            
            if (!mediaData.id) {
                throw new Error('No se recibió ID del archivo subido');
            }
            console.log('Media ID:', mediaData.id);

            // 2. Enviar el mensaje usando el ID del media
            const messagePayload = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: WHATSAPP_CONFIG.recipientPhone,
                type: "template",
                template: {
                    name: "formulario",
                    language: {
                        code: "es"
                    },
                    components: [
                        {
                            type: "header",
                            parameters: [
                                {
                                    type: "document",
                                    document: {
                                        id: mediaData.id,
                                        filename: fileName
                                    }
                                }
                            ]
                        },
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: "Estimado"
                                }
                            ]
                        }
                    ]
                }
            };
    
            // Enviar el mensaje con el documento adjunto
            console.log('Enviando mensaje con documento adjunto...');
            const messageResponse = await fetch(
                `https://graph.facebook.com/${WHATSAPP_CONFIG.version}/${WHATSAPP_CONFIG.phoneNumberId}/messages`, 
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messagePayload)
                }
            );
    
            const messageResponseText = await messageResponse.text();
            console.log('Message API Response:', messageResponseText);
    
            if (!messageResponse.ok) {
                let errorMessage = 'Error al enviar el mensaje';
                try {
                    const errorData = JSON.parse(messageResponseText);
                    errorMessage = errorData.error?.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing message response:', e);
                }
                throw new Error(`${errorMessage} (Status: ${messageResponse.status})`);
            }
    
            // const messageData = JSON.parse(messageResponseText);
            
            let messageData;
            try {
                messageData = JSON.parse(messageResponseText);
            } catch (e) {
                console.error('Error parsing message response:', e);
                throw new Error('Error al analizar la respuesta del mensaje');
            }

            if (!messageData.messages?.[0]?.id) {
                throw new Error('No se recibió confirmación del mensaje enviado');
            }
    
            return true;
        } catch (error) {
            console.error('Error al enviar el PDF por WhatsApp:', error);
            
            // Determinar un mensaje de error más específico basado en el tipo de error
            let userMessage = 'Error al enviar el PDF. ';
            
            if (error.message.includes('401')) {
                userMessage += 'El token de acceso no es válido o ha expirado. Por favor, contacte al administrador.';
            } else if (error.message.includes('403')) {
                userMessage += 'No hay permisos suficientes para realizar esta acción. Por favor, contacte al administrador.';
            } else if (error.message.includes('429')) {
                userMessage += 'Se ha excedido el límite de mensajes. Por favor, intente más tarde.';
            } else if (error.message.includes('tamaño')) {
                userMessage += 'El archivo es demasiado grande. Intente reducir su tamaño.';
            } else {
                userMessage += error.message;
            }
            
            throw new Error(userMessage);
        }
    }

    function showPdfModal(pdfUrl, fileName, pdfBlob) {
        const modalHtml = `
            <div id="pdfModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div class="bg-white p-5 rounded-lg shadow-xl">
                    <h2 class="text-xl font-bold mb-4">PDF Generado</h2>
                    <p class="mb-4">Tu PDF ha sido generado exitosamente. ¿Qué deseas hacer?</p>
                    <div class="flex justify-center space-x-4">
                        <a href="${pdfUrl}" download="${fileName}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Descargar PDF
                        </a>
                        <button onclick="sendToWhatsApp('${fileName}', '${pdfUrl}')" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center">
                            <span>Enviar a Imágenes Alem</span>
                            <div id="whatsappSpinner" class="hidden ml-2">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            </div>
                        </button>
                    </div>
                    <button onclick="closeModal()" class="mt-4 text-sm text-gray-500 hover:text-gray-700">Cerrar</button>
                </div>
            </div>
        `;
    
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    window.closeModal = function() {
        const modal = document.getElementById('pdfModal');
        if (modal) {
            modal.remove();
        }
    }

    // Función para mostrar el modal y manejar el envío
    window.sendToWhatsApp = async function(fileName, pdfUrl) {
        const spinner = document.getElementById('whatsappSpinner');
        
        try {
            spinner.classList.remove('hidden');
            console.log('Iniciando proceso de envío de PDF...');
            const pdfBlob = await fetch(pdfUrl).then(res => res.blob());
            console.log('PDF obtenido, tamaño:', pdfBlob.size);
            await sendPdfViaWhatsApp(pdfBlob, fileName);
            alert('PDF enviado exitosamente a Imágenes Alem');
            closeModal();
        } catch (error) {
            console.error('Error en el proceso de envío:', error);
            alert(error.message);
        } finally {
            spinner.classList.add('hidden');
        }
    }
    
    // Función auxiliar para asegurar que el iframe está cargado y visible
    // function ensureIframeLoaded(iframe) {
    //     return new Promise((resolve, reject) => {
    //         if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
    //             resolve();
    //         } else {
    //             iframe.onload = resolve;
    //             iframe.onerror = reject;
                
    //             // Forzar la recarga del iframe si no está visible o no está cargado
    //             if (iframe.style.display === 'none' || iframe.style.visibility === 'hidden' || !iframe.contentDocument || iframe.contentDocument.readyState !== 'complete') {
    //                 iframe.src = iframe.src;
    //             }
    //         }
    //     });
    // }

    // Validar que el contenido del iframe esté completamente cargado
    function ensureIframeLoaded(iframe) {
        return new Promise((resolve, reject) => {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDocument && iframeDocument.readyState === 'complete') {
                resolve();
            } else {
                iframe.onload = () => resolve();
                iframe.onerror = () => reject(new Error(`El iframe con ID ${iframe.id} no pudo cargarse.`));
            }
        });
    }

    if (forms.length === 0) {
        formContainer.innerHTML = '<p class="text-red-500">No se han seleccionado formularios.</p>';
    } else {
        createFormList();
        createIframes();
        updatePageIndicator();
        updateButtonText();
    }

});
// FIN Funcionalidades de index.html

const loginForm = document.getElementById('loginForm');
const dashboardContent = document.getElementById('dashboardContent');
const loginButton = document.getElementById('loginButton');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const generateButton = document.getElementById('generateButton');
const form1Checkbox = document.getElementById('form1');
const form2Checkbox = document.getElementById('form2');
const form3Checkbox = document.getElementById('form3');
const form4Checkbox = document.getElementById('form4');
const form5Checkbox = document.getElementById('form5');
// const form6Checkbox = document.getElementById('form6');
const form7Checkbox = document.getElementById('form7');
const form8Checkbox = document.getElementById('form8');
const generatedLinkDiv = document.getElementById('generatedLink');
const linkInput = document.getElementById('linkInput');
const copyButton = document.getElementById('copyButton');
const alertMessage = document.getElementById('alertMessage');

// Verificar si los elementos están presentes en la página
if (document.getElementById('loginButton')) {
    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login(username, password);
    });
}
if (document.getElementById('generateButton')) {
    const generateButton = document.getElementById('generateButton');
    generateButton.addEventListener('click', generateLink);
}
if (document.getElementById('copyButton')) {
    const copyButton = document.getElementById('copyButton');
    copyButton.addEventListener('click', copyToClipboard);
}
if (dashboardContent) {
    checkAuthentication();
}

function checkAuthentication() {
    if (localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}

function login(username, password) {
    if (username === "imagenesalem" && password === "esCiUmawlm899NRlq") {
        localStorage.setItem('loggedIn', 'true');
        window.open('dashboard.html', '_blank');
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

function logout() {
    localStorage.removeItem('loggedIn');
    window.location.href = 'login.html';
}

// Función generateLink con la llamda a addSignatureToLastForm
function generateLink() {
    const selectedForms = [];
    if (form1Checkbox.checked) selectedForms.push({value: form1Checkbox.value, name: 'Formulario General'});
    if (form2Checkbox.checked) selectedForms.push({value: form2Checkbox.value, name: 'Formulario Músculo Esquelético'});
    if (form3Checkbox.checked) selectedForms.push({value: form3Checkbox.value, name: 'Formulario Formulario Neuro-Cabeza y Cuello'});
    if (form4Checkbox.checked) selectedForms.push({value: form4Checkbox.value, name: 'Formulario Mama'});
    if (form5Checkbox.checked) selectedForms.push({value: form5Checkbox.value, name: 'Formulario Pelvis Gineco y Abdomen'});
    // if (form6Checkbox.checked) selectedForms.push({value: form6Checkbox.value, name: 'Formulario 6'});
    if (form7Checkbox.checked) selectedForms.push({value: form7Checkbox.value, name: 'Formulario Pelvis Masculina y Recto'});
    if (form8Checkbox.checked) selectedForms.push({value: form8Checkbox.value, name: 'Formulario ATM'});

    if (selectedForms.length === 0) {
        alert('Por favor, seleccione al menos un formulario.');
        return;
    }

    // addSignatureToLastForm();

    const baseUrl = 'https://imagenesalem.netlify.app/index.html?';
    // const baseUrl = 'https://www.imagenesalem.com/index?';
    // const baseUrl = 'https://www.imagenesalem.com/dashboard/index.html?';
    const formParams = selectedForms.map(form => `form=${form.value}&name=${encodeURIComponent(form.name)}`).join('&');
    const fullLink = `${baseUrl}${formParams}`;

    linkInput.value = fullLink;
    generatedLinkDiv.classList.remove('hidden');
}

// Funcion para copiar al portapapeles
function copyToClipboard() {
    linkInput.select();
    document.execCommand('copy');
    
    alertMessage.classList.remove('hidden');
    setTimeout(() => {
        alertMessage.classList.add('hidden');
    }, 3000);
}

// Función para inicializar el pad de firma (script.js)
function initSignaturePad(doc) {
    const canvas = doc.getElementById('signature-pad');
    const clearButton = doc.getElementById('clear');
    const signaturePad = new SignaturePad(canvas);
    
    clearButton.addEventListener('click', () => {
        signaturePad.clear();
    });
}

// Llamar a esta función cuando se cargue index.html
// document.addEventListener('DOMContentLoaded', addSignaturePadToLastForm);

// Verificar signature pad
console.log('SignaturePad disponible:', typeof SignaturePad !== 'undefined');
console.log('Canvas encontrado:', !!document.getElementById('signature-pad'));
// console.log('Dimensiones del canvas:', canvas.width, canvas.height);
