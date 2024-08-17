forms.html:

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formularios del Paciente</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        #mainContainer {
            flex: 1 0 auto;
            display: flex;
            flex-direction: column;
        }
        #formContainer {
            flex: 1 0 auto;
        }
        #navigationContainer {
            flex-shrink: 0;
            z-index: 1000;
            padding: 10px 0;
            background-color: white;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body class="bg-gray-100 font-sans">
    <div id="mainContainer" class="container mx-auto p-4 flex flex-col">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Formularios del Paciente</h1>
        <div id="formList" class="mb-4">
            <!-- Lista de formularios seleccionados se insertará aquí -->
        </div>
        <div id="formContainer" class="mb-4">
            <!-- Los iframes se insertarán aquí dinámicamente -->
        </div>
    </div>
    <div id="navigationContainer" class="w-full">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <button id="prevBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50" disabled>Anterior</button>
            <div id="pageIndicator" class="text-gray-700"></div>
            <button id="nextBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Siguiente</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

    <script>
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

                // Inicializar el pad de firma
                const signaturePad = initializeSignaturePad(iframeDocument);

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
                        // Descargar los formularios en formato PDF y jpg
                        // downloadForms();
                        // console.log('Formularios descargados');
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

            async function downloadForms() {
                for (let index = 0; index < forms.length; index++) {
                    const iframe = formContainer.getElementsByTagName('iframe')[index];
                    const iframeContent = iframe.contentWindow.document.body;

                    // Convert to PDF
                    await html2pdf().from(iframeContent).save(`form_${index + 1}.pdf`);

                    // Convert to JPG
                    const canvas = await html2canvas(iframeContent);
                    const link = document.createElement('a');
                    link.download = `form_${index + 1}.jpg`;
                    link.href = canvas.toDataURL('image/jpeg');
                    link.click();
                }
            }

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

        // Funcion para asignar firma al ultimo formulario (script.js)
        // function addSignaturePadToLastForm() {
        //     const signatureForm = localStorage.getItem('signatureForm');
        //     const signatureHtml = localStorage.getItem('signatureHtml');
        //     console.log('signatureForm:', signatureForm);
        //     console.log('signatureHtml:', signatureHtml);
        //     if (signatureForm && signatureHtml) {
        //         const formElement = document.querySelector(`[data-form="${signatureForm}"]`);
        //         if (formElement) {
        //             console.log('formElement:', formElement);
        //             formElement.insertAdjacentHTML('beforeend', signatureHtml);
        //             initSignaturePad();
        //         }
        //     }
        // }
    </script>
    <!-- Agregar el script.js -->
    <script src="script.js"></script>
</body>
</html>

el formEleemnt me esta dando null

scriot.js:
// Determina cuál es el último formulario seleccionado 
// y prepara el HTML de la firma para ser agregado a dicho form.
function addSignatureToLastForm() {
    const selectedForms = [];
    if (form1Checkbox.checked) selectedForms.push(form1Checkbox.value);
    if (form2Checkbox.checked) selectedForms.push(form2Checkbox.value);
    if (form3Checkbox.checked) selectedForms.push(form3Checkbox.value);
    if (form4Checkbox.checked) selectedForms.push(form4Checkbox.value);
    if (form5Checkbox.checked) selectedForms.push(form5Checkbox.value);

    if (selectedForms.length === 0) {
        alert('Por favor, seleccione al menos un formulario antes de generar el enlace.');
        return;
    }

    const lastForm = selectedForms[selectedForms.length - 1];
    const signatureHtml = `
        <!-- Sección de Firma -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold mb-4">Firma</h2>
          <div class="">
            <label for="signature-pad" class="block text-sm font-medium leading-6 text-gray-900">Firma del paciente</label>
            <div class="mt-2">
              <canvas id="signature-pad" class="border rounded-md"></canvas>
            </div>
            <button type="button" id="clear" class="mt-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400">Limpiar</button>
          </div>
        </div>
    `;

    // Almacenar la información de la firma en localStorage
    localStorage.setItem('signatureForm', lastForm);
    localStorage.setItem('signatureHtml', signatureHtml);
}

// Modificar la función generateLink para incluir la llamada a addSignatureToLastForm
function generateLink() {
    const selectedForms = [];
    if (form1Checkbox.checked) selectedForms.push({value: form1Checkbox.value, name: 'Formulario 1'});
    if (form2Checkbox.checked) selectedForms.push({value: form2Checkbox.value, name: 'Formulario 2'});
    if (form3Checkbox.checked) selectedForms.push({value: form3Checkbox.value, name: 'Formulario 3'});
    if (form4Checkbox.checked) selectedForms.push({value: form4Checkbox.value, name: 'Formulario 4'});
    if (form5Checkbox.checked) selectedForms.push({value: form5Checkbox.value, name: 'Formulario 5'});

    if (selectedForms.length === 0) {
        alert('Por favor, seleccione al menos un formulario.');
        return;
    }

    addSignatureToLastForm(); // Llamar a la nueva función

    const baseUrl = 'https://formulario-medico-alem.netlify.app/forms.html?';
    const formParams = selectedForms.map(form => `form=${form.value}&name=${encodeURIComponent(form.name)}`).join('&');
    const fullLink = `${baseUrl}${formParams}`;

    linkInput.value = fullLink;
    generatedLinkDiv.classList.remove('hidden');
}

// Agregar la función addSignaturePadToLastForm() al script en forms.html
function addSignaturePadToLastForm() {
    const signatureForm = localStorage.getItem('signatureForm');
    const signatureHtml = localStorage.getItem('signatureHtml');
    console.log('signatureForm:', signatureForm);
    console.log('signatureHtml:', signatureHtml);
    if (signatureForm && signatureHtml) {
        const formElement = document.querySelector(`[data-form="${signatureForm}"]`);
        console.log('formElement:', formElement);
        if (formElement) {
            formElement.insertAdjacentHTML('beforeend', signatureHtml);
            initSignaturePad();
            console.log('Firma agregada al formulario:', signatureForm);
        }
    }
}

// Función para inicializar el pad de firma (script.js)
function initSignaturePad() {
    const canvas = document.getElementById('signature-pad');
    const clearButton = document.getElementById('clear');
    const signaturePad = new SignaturePad(canvas);
    
    clearButton.addEventListener('click', () => {
        signaturePad.clear();
    });
}

// Llamar a esta función cuando se cargue forms.html
document.addEventListener('DOMContentLoaded', addSignaturePadToLastForm);
