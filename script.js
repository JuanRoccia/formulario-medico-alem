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
// Formulario 5
toggleAdditionalContent('sintomas_abdominales', 'sintomas-adicionales');
toggleAdditionalContent('infecciones_recientes', 'infecciones-adicionales');
toggleAdditionalContent('otras_enfermedades', 'enfermedades-adicionales');
toggleAdditionalContent('hospitalizaciones_previas', 'hospitalizaciones-adicionales');
toggleAdditionalContent('cirugias_anteriores', 'cirugias-adicionales');
toggleAdditionalContent('enfermedades_familiares', 'enfermedades-familiares-adicionales');
toggleAdditionalContent('diagnostico_cancer', 'cancer-adicional');
toggleAdditionalContent('cirugia_cancer', 'cirugia-cancer-adicional');
toggleAdditionalContent('quimioterapia', 'quimioterapia-adicional');
toggleAdditionalContent('radioterapia', 'radioterapia-adicional');
toggleAdditionalContent('biopsia_reciente', 'biopsia-adicional');
toggleAdditionalContent('marcadores_sericos', 'marcadores-adicional');
//Form 6
toggleAdditionalContent('pr-menst', 'pg-mns-adicional');
toggleAdditionalContent('pr-menopausia', 'pg-mnp-adicional');
toggleAdditionalContent('pr-metodo-anticonceptivo', 'pg-mntc-adicional');
toggleAdditionalContent('pr-cesareas', 'pg-mcsa-adicional');
toggleAdditionalContent('pr-intervencion-q-ginecologica', 'pg-mcsa-adicional');
toggleAdditionalContent('pr-pg-antecendente-familiar', 'pg-afdc-adicional');
toggleAdditionalContent('pr-pg-antecedente-personal', 'pg-apdc-adicional');
toggleAdditionalContent('pr-pg-intervencion-cc', 'pg-iqdc-adicional');
toggleAdditionalContent('pr-pg-tratamiento-cc', 'pr-pg-tratamiento-cc');
//Form 7
toggleAdditionalContent('pr-pm-ciguria-biopsia', 'pm-cbade-adicional');
toggleAdditionalContent('pr-pm-cirugia-previa', 'pm-tacpe-adicional');
toggleAdditionalContent('pr-pm-antecedente-familiar', 'pm-afdcm-adicional');
toggleAdditionalContent('pr-pm-antecedente-personal', 'pm-apdcm-adicional');
toggleAdditionalContent('pr-pm-intervencion-cc', 'pm-iqdcm-adicional');
toggleAdditionalContent('pr-pm-tratamiento-cc', 'pm-tdcm-adicional');
//Form 8
toggleAdditionalContent('pr-fistula', 'rpfst-adicional');
toggleAdditionalContent('pr-cirugia-biopsia', 'cbade-adicional');
toggleAdditionalContent('pr-cirugia-zona', 'cpae-adicional');
toggleAdditionalContent('pr-antecedente-familiar', 'afdcm-adicional');
toggleAdditionalContent('pr-antecedente-personal', 'tapdc-adicional');
toggleAdditionalContent('pr-tratamiento-cc', 'tdcm-adicional');
