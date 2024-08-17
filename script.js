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

// Llamar a esta función cuando se cargue forms.html
document.addEventListener('DOMContentLoaded', addSignaturePadToLastForm);
