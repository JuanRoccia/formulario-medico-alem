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
        const iframeDocument = iframe.contentWindow.document;
        const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
        console.log('requiredInputs:', requiredInputs);

        let isComplete = true;
        requiredInputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                const name = input.name;
                const checkedInputs = iframeDocument.querySelectorAll(`input[name="${name}"]:checked`);
                if (checkedInputs.length === 0) {
                    console.log(`Campo no completado: ${input.name}`);
                    isComplete = false;
                }
            } else if (!input.value.trim()) {
                console.log(`Campo no completado: ${input.name || input.id}`);
                isComplete = false;
            }
        });

        // nextBtn.disabled = !isComplete;
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

    prevBtn.addEventListener('click', () => {
        if (currentFormIndex > 0) {
            showForm(currentFormIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        // alert('Estas tocando el boton siguiente');
        const currentIframe = formContainer.getElementsByTagName('iframe')[currentFormIndex];
        const iframeDocument = currentIframe.contentWindow.document;
        const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
        
        if (currentIframe && checkFormCompleteness(currentIframe)) {
            if (currentFormIndex < forms.length - 1) {
                showForm(currentFormIndex + 1);
            } else {
                finalizeProcess();
                // alert('Has completado todos los formularios.');
                // downloadForms();
                // Descarga los formularios en formato PDF y jpg
                // prepareWhatsAppShare();
                // Enviar los formularios por whatsapp

            }
        } else {
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

    function finalizeProcess() {
        alert('Has completado todos los formularios.');
        downloadForms().then(() => {
            prepareWhatsAppShare();
        });
    }

    // async function downloadForms() {
    //     for (let index = 0; index < forms.length; index++) {
    //         const iframe = formContainer.getElementsByTagName('iframe')[index];
    //         const iframeContent = iframe.contentWindow.document.body;

    //         // Convert to PDF
    //         // await html2pdf().from(iframeContent).save(`form_${index + 1}.pdf`);
            
    //         // Clonar estilos CSS al iframe (verificar funcionamineto con console.log)
    //         const styles = document.querySelectorAll("link[rel='stylesheet'], style");
    //         styles.forEach(style => {
    //             try {
    //                 iframeContent.appendChild(style.cloneNode(true));
    //                 console.log('Estilos:', style);
    //             } catch (error) {  
    //                 console.error('Error al clonar estilos:', error);
    //             }
    //         });

    //         // Espera para cargar estilos y fuentes
    //         await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo

    //         // Verificar que las fuentes estén cargadas
    //         document.fonts.ready.then(async () => {
    //             // Convertir a JPG con mayor resolución
    //             const canvas = await html2canvas(iframeContent, { scale: 2 });
    //             const link = document.createElement('a');
    //             link.download = `form_${index + 1}.jpg`;
    //             link.href = canvas.toDataURL('image/jpeg');
    //             link.click();
    //         });

    //         // Convertir a PDF
    //         try {
    //             await html2pdf().from(iframeContent).save(`form_${index + 1}.pdf`);
    //             console.log(`PDF generado: form_${index + 1}.pdf`);
    //         } catch (error) {
    //             console.error('Error al generar PDF:', error);
    //         }
    //     }
    // }

    // window.onload = async function () {
    //     await downloadForms();
    // };

    async function convertFormToPdfOrJpg(form, index, format = 'pdf') {
        const iframe = formContainer.getElementsByTagName('iframe')[index];
        const iframeContent = iframe.contentWindow.document.body;
    
        // Clonar estilos CSS al iframe
        const styles = document.querySelectorAll("link[rel='stylesheet'], style");
        styles.forEach(style => {
            try {
                const clonedStyle = style.cloneNode(true);
                iframeContent.appendChild(clonedStyle);
            } catch (error) {
                console.error('Error al clonar estilos:', error);
            }
        });
    
        // Esperar a que se carguen las fuentes y los estilos
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        // Aplicar estilos inline para mayor compatibilidad
        const elements = iframeContent.querySelectorAll('*');
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            el.style.cssText = Object.values(styles).reduce((str, property) => {
                // Eliminar margenes y paddings
                if (property.startsWith('margin') || property.startsWith('padding')) {
                    return str;
                }
                return `${str}${property}:${styles.getPropertyValue(property)};`;
            }, '');
        });

        // Ajustar el estilo del body del iframe
        iframeContent.style.margin = '0';
        iframeContent.style.padding = '0';
        iframeContent.style.width = '100%';
        iframeContent.style.height = '100%';
    
        if (format === 'pdf') {
            try {
                const pdf = await html2pdf().set({
                    margin: [0, 0, 0, 0],
                    filename: `form_${index + 1}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true,
                        logging: true,
                        onclone: (clonedDoc) => {
                            const clonedContent = clonedDoc.body;
                            clonedContent.style.margin = '0';
                            clonedContent.style.padding = '0';
                            clonedContent.style.width = '100%';
                            clonedContent.style.height = '100%';
                        },
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait',
                        compress: true,
                        precision: 16
                    },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                }).from(iframeContent).save();
                console.log(`PDF generado: form_${index + 1}.pdf`);
                return pdf;
            } catch (error) {
                console.error('Error al generar PDF:', error);
                throw error;
            }
        } else if (format === 'jpg') {
            try {
                const canvas = await html2canvas(iframeContent, { 
                    scale: 2, 
                    useCORS: true,
                    logging: true,
                    onclone: (clonedDoc) => {
                        const clonedStyles = clonedDoc.querySelectorAll("link[rel='stylesheet'], style");
                        clonedStyles.forEach(style => iframeContent.appendChild(style.cloneNode(true)));
                    }
                });
                const link = document.createElement('a');
                link.download = `form_${index + 1}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
                console.log(`JPG generado: form_${index + 1}.jpg`);
                return link.href;
            } catch (error) {
                console.error('Error al generar JPG:', error);
                throw error;
            }
        } else {
            throw new Error('Formato no soportado');
        }
    }
    
    async function downloadForms(format = 'pdf') {
        for (let index = 0; index < forms.length; index++) {
            await convertFormToPdfOrJpg(forms[index], index, format);
        }
    }
    
    window.onload = async function () {
        await downloadForms('pdf'); // 'pdf' o 'jpg' segun corresponda
    };

    function prepareWhatsAppShare() {
        // Aquí puedes implementar la lógica para compartir por WhatsApp
        // Por ejemplo, abrir un nuevo enlace de WhatsApp con un mensaje predefinido
        const message = encodeURIComponent('He completado los formularios. Aquí están adjuntos los archivos PDF y JPG.');
        const whatsappLink = `https://wa.me/?text=${message}`;
        window.open(whatsappLink, '_blank');
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
const form6Checkbox = document.getElementById('form6');
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
    if (username === "admin" && password === "admin") {
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

// Determina cuál es el último formulario seleccionado 
// y prepara el HTML de la firma para ser agregado a dicho form.
function addSignatureToLastForm() {
    const selectedForms = [];
    if (form1Checkbox.checked) selectedForms.push(form1Checkbox.value);
    if (form2Checkbox.checked) selectedForms.push(form2Checkbox.value);
    if (form3Checkbox.checked) selectedForms.push(form3Checkbox.value);
    if (form4Checkbox.checked) selectedForms.push(form4Checkbox.value);
    if (form5Checkbox.checked) selectedForms.push(form5Checkbox.value);
    if (form6Checkbox.checked) selectedForms.push(form6Checkbox.value);
    if (form7Checkbox.checked) selectedForms.push(form7Checkbox.value);
    if (form8Checkbox.checked) selectedForms.push(form8Checkbox.value);

    if (selectedForms.length === 0) {
        alert('Por favor, seleccione al menos un formulario antes de generar el enlace.');
        return;
    }

    const lastForm = selectedForms[selectedForms.length - 1];
    const signatureHtml = `
        <!-- Sección de Firma -->
        <div class="mb-6 border-b border-gray-900/10 pb-12">
          <h2 class="text-2xl font-bold mb-4 text-base font-semibold leading-7 text-gray-900">Firma</h2>
          <div class="mt-10">
            <label for="signature-pad" class="block text-sm font-medium leading-6 text-gray-900">Firma del paciente</label>
            <div class="mt-2">
              <canvas id="signature-pad" class="border rounded-md w-full h-32"></canvas>
            </div>
            <button type="button" id="clear" class="mt-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400">Limpiar</button>
          </div>
        </div>
    `;

    // Almacenar la información de la firma en localStorage
    localStorage.setItem('signatureForm', lastForm);
    localStorage.setItem('signatureHtml', signatureHtml);
}

// Función generateLink con la llamda a addSignatureToLastForm
function generateLink() {
    const selectedForms = [];
    if (form1Checkbox.checked) selectedForms.push({value: form1Checkbox.value, name: 'Formulario 1'});
    if (form2Checkbox.checked) selectedForms.push({value: form2Checkbox.value, name: 'Formulario 2'});
    if (form3Checkbox.checked) selectedForms.push({value: form3Checkbox.value, name: 'Formulario 3'});
    if (form4Checkbox.checked) selectedForms.push({value: form4Checkbox.value, name: 'Formulario 4'});
    if (form5Checkbox.checked) selectedForms.push({value: form5Checkbox.value, name: 'Formulario 5'});
    if (form6Checkbox.checked) selectedForms.push({value: form6Checkbox.value, name: 'Formulario 6'});
    if (form7Checkbox.checked) selectedForms.push({value: form7Checkbox.value, name: 'Formulario 7'});
    if (form8Checkbox.checked) selectedForms.push({value: form8Checkbox.value, name: 'Formulario 8'});

    if (selectedForms.length === 0) {
        alert('Por favor, seleccione al menos un formulario.');
        return;
    }

    // addSignatureToLastForm();

    const baseUrl = 'https://formulario-medico-alem.netlify.app/index.html?';
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

// Agrega el pad de firma al último formulario seleccionado
// Agregar la función addSignaturePadToLastForm() al script en index.html
function addSignaturePadToLastForm() {
    const signatureForm = localStorage.getItem('signatureForm');
    const signatureHtml = localStorage.getItem('signatureHtml');
    console.log('signatureForm:', signatureForm);
    console.log('signatureHtml:', signatureHtml);
    if (signatureForm && signatureHtml) {
        const iframes = document.getElementsByTagName('iframe');
        const lastIframe = iframes[iframes.length - 1];
        console.log('Iframes:', iframes);
        if (lastIframe) {
            lastIframe.addEventListener('load', function() {
                const iframeDocument = lastIframe.contentWindow.document;
                const formElement = iframeDocument.querySelector('form') || iframeDocument.body;
                
                if (formElement) {
                    formElement.insertAdjacentHTML('beforeend', signatureHtml);
                    initSignaturePad(iframeDocument);
                    console.log('Firma agregada al formulario:', signatureForm);
                }
            });
        }
    }
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
document.addEventListener('DOMContentLoaded', addSignaturePadToLastForm);

// Funcion para el manejo de contenido adicional en formularios
function toggleAdditionalContent(radioName, contentId) {
    document.querySelectorAll(`input[name="${radioName}"]`).forEach((elem) => {
        elem.addEventListener('change', function(event) {
            const additionalContent = document.getElementById(contentId);
            if (event.target.value === 'si') {
                additionalContent.classList.remove('hidden');
            } else {
                additionalContent.classList.add('hidden');
            }
        });
    });
}
// Formulario 2
toggleAdditionalContent('pregunta-dolor', 'additional-dolor');
toggleAdditionalContent('pregunta-cirugia', 'additional-content');
toggleAdditionalContent('pregunta-medicacion', 'additional-medicacion');
toggleAdditionalContent('pregunta-oncologica', 'additional-onc');
toggleAdditionalContent('pregunta-deporte', 'additional-deporte');
// Formulario 3
toggleAdditionalContent('traumatismo', 'additional-traumatismo');
toggleAdditionalContent('problemas al nacer', 'additional-problemas');
toggleAdditionalContent('cirugias-biopsias', 'additional-cirugias');
toggleAdditionalContent('pregunta-odontologica', 'additional-odontologica');
toggleAdditionalContent('pregunta-oncologica', 'additional-oncologica');
toggleAdditionalContent('medicacion-relacionada', 'medicacion-relacionada');
toggleAdditionalContent('prolactina', 'prolactina');
// Formulario 4
toggleAdditionalContent('estudios_previos', 'additional-estudios');
toggleAdditionalContent('historia_familiar', 'additional-historia-familiar');
toggleAdditionalContent('cirugias_mamas', 'additional-cirugias');
toggleAdditionalContent('biopsia_percutanea', 'additional-biopsia');
toggleAdditionalContent('tratamiento_cancer', 'additional-tratamiento');
toggleAdditionalContent('cirugia_mastoplastia', 'additional-mastoplastia')
toggleAdditionalContent('marcadores_sericos', 'additional-marcadores-sericos')
// Formulario 5
toggleAdditionalContent('sintomas_abdominales', 'sintomas-adicionales');
toggleAdditionalContent('infecciones_recientes', 'infecciones-adicionales');
toggleAdditionalContent('otras_enfermedades', 'enfermedades-adicionales');
toggleAdditionalContent('hospitalizaciones_previas', 'hospitalizaciones-adicionales');
toggleAdditionalContent('cirugias_anteriores', 'cirugias-adicionales');
toggleAdditionalContent('pga-pr-menst', 'pga-mns-adicional');
toggleAdditionalContent('pr-menopausia', 'pg-mnp-adicional');
toggleAdditionalContent('pr-metodo-anticonceptivo', 'pg-mntc-adicional');
toggleAdditionalContent('pr-cesareas', 'pg-mcsa-adicional');
toggleAdditionalContent('pr-intervencion-q-ginecologica', 'pg-mcsa-adicional');
toggleAdditionalContent('enfermedades_familiares', 'enfermedades-familiares-adicionales');
toggleAdditionalContent('diagnostico_cancer', 'cancer-adicional');
toggleAdditionalContent('cirugia_cancer', 'cirugia-cancer-adicional');
toggleAdditionalContent('pr-pga-tratamiento-cc', 'pr-pga-tratamiento-cc');
toggleAdditionalContent('quimioterapia', 'quimioterapia-adicional');
toggleAdditionalContent('radioterapia', 'radioterapia-adicional');
toggleAdditionalContent('biopsia_reciente', 'biopsia-adicional');
toggleAdditionalContent('pga_marcadores_sericos', 'pga-marcadores-adicional');
//Form 6 Descartado
toggleAdditionalContent('pr-pg-antecendente-familiar', 'pg-afdc-adicional');
toggleAdditionalContent('pr-pg-antecedente-personal', 'pg-apdc-adicional');
toggleAdditionalContent('pr-pg-intervencion-cc', 'pg-iqdc-adicional');
toggleAdditionalContent('pr-pg-tratamiento-cc', 'pr-pg-tratamiento-cc');
//Form 7
toggleAdditionalContent('pr-rpfst', 'rpfst-adicional');
toggleAdditionalContent('pr-pm-ciguria-biopsia', 'pm-cbade-adicional');
toggleAdditionalContent('pr-pm-cirugia-previa', 'pm-tacpe-adicional');
toggleAdditionalContent('pr-pm-antecedente-familiar', 'pm-afdcm-adicional');
toggleAdditionalContent('pr-pm-antecedente-personal', 'pm-apdcm-adicional');
toggleAdditionalContent('pr-pm-intervencion-cc', 'pm-iqdcm-adicional');
toggleAdditionalContent('pr-pm-tratamiento-cc', 'pm-tdcm-adicional');
toggleAdditionalContent('pmr-quimioterapia', 'pmr-quimioterapia-adicional');
toggleAdditionalContent('pmr-radioterapia', 'pmr-radioterapia-adicional');
toggleAdditionalContent('pmr_marcadores_sericos', 'pmr-marcadores-adicional');
//Form 8
toggleAdditionalContent('pr-odontologicos', 'odontologicos-adicional');
toggleAdditionalContent('pr-mandibula', 'mandibula-adicional');
toggleAdditionalContent('pr-atm-cirugia-zona', 'atm-cpae-adicional');
toggleAdditionalContent('pr-atm-antecedente-personal', 'atm-tapdc-adicional');
