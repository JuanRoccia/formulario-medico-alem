Estuvimos haciendo algunos cambios en la app y ahora necesitamos que hagas una revisión de los cambios que hicimos. Por favor, revisa el archivo `context.md` y dime si hay algo que no esté bien. ¡Gracias!
lo que modificamos es el manejo de como crear los pdf en base a los formularios completados, el problema es que solo se estan generando los pdf con el ultimo formulario seleccionado lo cual esta mal porque en caso de haber mas deben salir todos los formularios seleccionados en el pdf, por favor revisa el codigo y dime que cambios debo hacer para que se generen los pdf con todos los formularios seleccionados.

consola del navegador:
Error al procesar formulario 1: TypeError: Cannot read properties of null (reading 'arrayBuffer')
    at generatePdfWithPdfLib (script.js:425:50)
    at async downloadForms (script.js:391:45)
    at async finalizeProcess (script.js:344:17)

// script.js solo con las funcionalidaes correspondientes o que puedan afectar de alguna forma al la implementacion del manejo y descarga de los formularios a formato pdf:

import { signaturePadManager } from './signaturePadManager.js';
import { formManager } from './formManager.js';

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
                showPdfModal(pdfUrl, 'formularios_completos.pdf', pdfBlob);
            } catch (error) {
                console.error('Error al generar PDF:', error);
                // Aquí puedes agregar un método de respaldo si es necesario
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
                // Verifica que el contenido esté completamente cargado
                if (!iframe.contentDocument || iframe.contentDocument.readyState !== 'complete') {
                    console.warn(`Formulario ${i + 1} aún no está completamente cargado. Esperando...`);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
    
                // Capturar el contenido del iframe como canvas
                const canvas = await html2canvas(iframe.contentDocument.body, {
                    scale: 2, // Ajusta la escala si es necesario
                    useCORS: true,
                    backgroundColor: '#ffffff',
                });
    
                // Convertir canvas a imagen embebida en el PDF
                const imgBytes = await new Promise((resolve) => canvas.toBlob(resolve));
                const imgBuffer = await imgBytes.arrayBuffer();
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
    
            } catch (error) {
                console.error(`Error al procesar formulario ${i + 1}:`, error);
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

    const baseUrl = 'https://imagenesalem.netlify.app/index.html?';
    // const baseUrl = 'https://www.imagenesalem.com/index?';
    // const baseUrl = 'https://www.imagenesalem.com/dashboard/index.html?';
    const formParams = selectedForms.map(form => `form=${form.value}&name=${encodeURIComponent(form.name)}`).join('&');
    const fullLink = `${baseUrl}${formParams}`;

    linkInput.value = fullLink;
    generatedLinkDiv.classList.remove('hidden');
}
