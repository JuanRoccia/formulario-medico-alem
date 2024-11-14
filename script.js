// script.js

import { signaturePadManager } from './js/signaturePadManager.js';

// Primero, asegurémonos de que todas las funciones estén definidas antes de usarlas
let signaturePadInstance = null;

// Función para inicializar el signature pad
function initializeSignaturePad(iframeDocument) {
    if (!iframeDocument) {
        console.log('No se proporcionó documento iframe');
        return null;
    }

    // Esperar a que el DOM esté completamente cargado
    if (iframeDocument.readyState !== 'complete') {
        console.log('Documento no está completamente cargado, esperando...');
        return new Promise((resolve) => {
            iframeDocument.addEventListener('DOMContentLoaded', () => {
                resolve(initializeSignaturePad(iframeDocument));
            });
        });
    }

    const canvas = iframeDocument.getElementById('signature-pad');
    if (!canvas) {
        console.log('Canvas no encontrado en el iframe');
        return null;
    }

    // Establecer dimensiones del canvas
    // const container = canvas.parentElement;
    // canvas.width = container.clientWidth || 600;
    // canvas.height = container.clientHeight || 200;
    // this.setupCanvasDimensions(canvas);

    try {
        // Crear nueva instancia de SignaturePad
        signaturePadInstance = new SignaturePad(canvas, {
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

        console.log('SignaturePad inicializado correctamente');
        return signaturePadInstance;
    } catch (error) {
        console.error('Error al inicializar SignaturePad:', error);
        return null;
    }
}

// Modificar la función addSignaturePadToLastForm
async function addSignaturePadToLastForm() {
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

        const lastIframe = iframes[iframes.length - 1];
        await signaturePadManager.initializeInIframe(lastIframe);

    } catch (error) {
        console.error('Error al agregar el signature pad:', error);
    }
}

// Función para determinar el último formulario y agregar la firma
function addSignatureToLastForm() {
    const selectedForms = [];
    const checkboxes = [
        { checkbox: document.getElementById('form1'), value: 'form-1' },
        { checkbox: document.getElementById('form2'), value: 'form-2' },
        { checkbox: document.getElementById('form3'), value: 'form-3' },
        { checkbox: document.getElementById('form4'), value: 'form-4' },
        { checkbox: document.getElementById('form5'), value: 'form-5' },
        { checkbox: document.getElementById('form7'), value: 'form-7' },
        { checkbox: document.getElementById('form8'), value: 'form-8' }
    ];

    checkboxes.forEach(({ checkbox, value }) => {
        if (checkbox && checkbox.checked) {
            selectedForms.push(value);
        }
    });

    if (selectedForms.length === 0) return;

    const lastForm = selectedForms[selectedForms.length - 1];
    const signatureHtml = `
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

    try {
        sessionStorage.setItem('signatureForm', lastForm);
        sessionStorage.setItem('signatureHtml', signatureHtml);
        console.log('Firma guardada para el formulario:', lastForm);
    } catch (error) {
        console.error('Error al guardar la firma:', error);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('formContainer');
    if (formContainer) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    addSignaturePadToLastForm();
                }
            });
        });

        observer.observe(formContainer, { childList: true });
        
        // Intentar inicializar después de un breve retraso
        setTimeout(addSignaturePadToLastForm, 1000);
    }
});

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

    // Modificar la función checkFormCompleteness para incluir la verificación de firma
    function checkFormCompleteness(iframe) {
        if (!iframe) return false;

        const iframeDocument = iframe.contentWindow.document;
        const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
        let isComplete = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                console.log(`Campo no completado: ${input.name || input.id}`);
                isComplete = false;
            }
        });

        // Verificar la firma si es el último formulario
        const signaturePad = iframeDocument.getElementById('signature-pad');
        if (signaturePad && signaturePadManager.initialized) {
            if (signaturePadManager.isEmpty()) {
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

    // Event Listeners
    // if (formContainer) {
    //     const observer = new MutationObserver(function(mutations) {
    //         mutations.forEach(function(mutation) {
    //             if (mutation.addedNodes.length) {
    //                 addSignaturePadToLastForm();
    //             }
    //         });
    //     });

    //     observer.observe(formContainer, { childList: true });
    //     setTimeout(addSignaturePadToLastForm, 500);
    // }

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
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            const formIframes = formContainer.getElementsByTagName('iframe');
    
            for (let i = 0; i < formIframes.length; i++) {
                const iframe = formIframes[i];
                
                try {
                    // Mostrar iframe temporalmente para capturarlo
                    iframe.style.display = 'block';
                    iframe.style.visibility = 'visible';
    
                    // Asegurar que el iframe está cargado y visible
                    await ensureIframeLoaded(iframe);
    
                    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    const signaturePad = iframeDocument.getElementById('signature-pad');
                    let signatureDataUrl = null;

                    // Capturar la firma si el signaturePad esta presente
                    if (signaturePad) {
                        const padInstance = signaturePadManager.padInstance;
                        // Verificar que el pad sea visible y que la firma haya sido realizada
                        console.log('Pad Instance:', padInstance);
                        // Usando el metodo isEmpty()
                        console.log('Pad Instance isEmpty:', padInstance.isEmpty());
                        
                        if (padInstance && !padInstance.isEmpty()) {
                            // Obtener la firma como DataURL
                            signatureDataUrl = padInstance.toDataURL();
                            // Asegurar que la imagen de la firma se obtuvo correctamente
                            console.log('Signature Data URL:', signatureDataUrl);
                            
                            const tempCanvas = iframeDocument.createElement('canvas');
                            tempCanvas.width = signaturePad.width;
                            tempCanvas.height = signaturePad.height;
                            const tempCtx = tempCanvas.getContext('2d');
                            
                            // Asegurar fondo blanco
                            tempCtx.fillStyle = 'white';
                            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                            
                            // Dibujar la firma en el canvas temporal
                            const img = new Image();
                            await new Promise((resolve) => {
                                img.onload = () => {
                                    tempCtx.drawImage(img, 0, 0);
                                    resolve();
                                };
                                img.src = signatureDataUrl;
                            });

                            // Reemplazar el canvas original con el canvas temporal (opcional)
                            const originalCtx = signaturePad.getContext('2d');
                            originalCtx.clearRect(0, 0, signaturePad.width, signaturePad.height);
                            originalCtx.drawImage(tempCanvas, 0, 0);
                        }
                    }

                    // Aplicar estilos para mejorar la captura
                    const styleElement = iframeDocument.createElement('style');
                    styleElement.textContent = `
                        body { 
                            font-family: Arial, sans-serif;
                            display: block !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                        }
                        * { max-width: 100%; box-sizing: border-box; }
                        #signature-pad {
                            display: block !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                            background-color: white !important;
                        }
                        .signature-container {
                            display: block !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                            position: relative !important;
                            background-color: white !important;
                        }
                    `;
                    iframeDocument.head.appendChild(styleElement);
    
                    // Forzar la visibilidad del contenido del iframe
                    iframeDocument.body.style.display = 'block';
                    iframeDocument.body.style.opacity = '1';
                    iframeDocument.body.style.visibility = 'visible';
    
                    // Esperar un momento para que los estilos se apliquen
                    await new Promise(resolve => setTimeout(resolve, 1000));
    
                    // Usar html2canvas para capturar el contenido del iframe
                    const canvas = await html2canvas(iframeDocument.body, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        windowWidth: iframe.clientWidth || 1000,
                        windowHeight: iframe.clientHeight || 1414,
                        onclone: function(clonedDoc) {
                            // Restaurar la firma en el documento clonado
                            if (signatureDataUrl) {
                                const clonedSignature = clonedDoc.getElementById('signature-pad');
                                if (clonedSignature) {
                                    const ctx = clonedSignature.getContext('2d');
                                    const img = new Image();
                                    img.src = signatureDataUrl;
                                    ctx.drawImage(img, 0, 0);
                                }
                            }
                        }
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
                    // Añadir el contenido capturado al PDF
                    if (i > 0) {
                        pdf.addPage();
                    }
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                    // pdf.addImage(imgData, 'PNG', 15, 40, 180, 160);

    
                    // Restaurar el iframe a su estado original
                    iframe.style.display = 'none';
                    iframe.style.visibility = 'hidden';

                    // Restaurar la firma en el canvas
                    if (signatureDataUrl && signaturePad) {
                        const img = new Image();
                        img.src = signatureDataUrl;
                        const ctx = signaturePad.getContext('2d');
                        ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
                        ctx.drawImage(img, 0, 0);
                    }
    
                } catch (error) {
                    console.error(`Error al capturar el contenido del formulario ${i + 1}:`, error);
                    throw new Error(`Error al capturar el contenido del formulario ${i + 1}. Por favor, intente de nuevo.`);
                }
            }

            const pdfBlob = pdf.output('blob');
            const fileName = 'formularios_completos.pdf';
            const pdfUrl = URL.createObjectURL(pdfBlob);

            showPdfModal(pdfUrl, fileName, pdfBlob);
        } else {
            throw new Error('Formato no soportado');
        }
    }

    // Configuración de WhatsApp Business API
    const WHATSAPP_CONFIG = {
        phoneNumberId: '454721044397297',
        recipientPhone: '+542915278412', // Número de Imágenes Alem
        // Token permanente (System User Access Token)
        token: 'EAB6PZAiZCUJ9oBOZCVa8T2DX5sZAjoYLkfHVya1IaZAxRzvyRd7sFFbhbAK8Jq8qu4R47YqFLaA67G4yQw2DL0IgNmHDm8YIu5kxoNAoY9NpFAm0vpJGxZBZCd0ZAmsHleZBea82FBwwAE1y64RgiTqCjwdhJXBEHR83BMEr9S0UpVOR3NFA4pP0cRlsnLhMMZAdwJ6QZDZD'
    };

    async function sendPdfViaWhatsApp(pdfBlob, fileName) {
        try {
            // Validar el tamaño del archivo (máximo 16MB para WhatsApp Business API)
            const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB en bytes
            if (pdfBlob.size > MAX_FILE_SIZE) {
                throw new Error('El archivo PDF es demasiado grande. El tamaño máximo permitido es 16MB.');
            }
    
            // Crear un FormData para enviar el archivo
            const formData = new FormData();
            formData.append('messaging_product', 'whatsapp');
            formData.append('file', pdfBlob, fileName);
            formData.append('type', 'application/pdf');
    
            // Subir el documento a la Media API de WhatsApp
            console.log('Subiendo archivo a WhatsApp Media API...');
            const mediaUploadResponse = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_CONFIG.phoneNumberId}/media`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`
                    // No incluir Content-Type, dejar que el navegador lo establezca con el boundary correcto
                },
                body: formData
            });
    
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
    
            const mediaData = JSON.parse(mediaResponseText);
            console.log('Media ID:', mediaData.id);
            
            if (!mediaData.id) {
                throw new Error('No se recibió ID del archivo subido');
            }
    
            // Enviar el mensaje con el documento adjunto
            console.log('Enviando mensaje con documento adjunto...');
            const messageResponse = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_CONFIG.phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: WHATSAPP_CONFIG.recipientPhone,
                    type: 'document',
                    document: {
                        id: mediaData.id,
                        filename: fileName,
                        caption: 'Formularios completados'
                    }
                })
            });
    
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
    
            const messageData = JSON.parse(messageResponseText);
            
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
    function ensureIframeLoaded(iframe) {
        return new Promise((resolve, reject) => {
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                resolve();
            } else {
                iframe.onload = resolve;
                iframe.onerror = reject;
                
                // Forzar la recarga del iframe si no está visible o no está cargado
                if (iframe.style.display === 'none' || iframe.style.visibility === 'hidden' || !iframe.contentDocument || iframe.contentDocument.readyState !== 'complete') {
                    iframe.src = iframe.src;
                }
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
        window.location.href = 'dashboard.html';
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
console.log('Dimensiones del canvas:', canvas.width, canvas.height);
