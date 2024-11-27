export class LinkGenerator {
    constructor() {
        this.selectedForms = [];
        this.baseUrl = 'https://imagenesalem.netlify.app/index.html?';
    }

    // Mapeo de formularios
    getFormMapping() {
        return {
            'form1': { value: 'form-1', name: 'Formulario General' },
            'form2': { value: 'form-2', name: 'Formulario Músculo Esquelético' },
            'form3': { value: 'form-3', name: 'Formulario Neuro-Cabeza y Cuello' },
            'form4': { value: 'form-4', name: 'Formulario Mama' },
            'form5': { value: 'form-5', name: 'Formulario Pelvis Gineco y Abdomen' },
            'form7': { value: 'form-7', name: 'Formulario Pelvis Masculina y Recto' },
            'form8': { value: 'form-8', name: 'Formulario ATM' }
        };
    }

    // Método para seleccionar formularios
    selectForms() {
        const formMapping = this.getFormMapping();
        this.selectedForms = [];

        Object.keys(formMapping).forEach(formId => {
            const checkbox = document.getElementById(formId);
            if (checkbox && checkbox.checked) {
                this.selectedForms.push(formMapping[formId]);
            }
        });

        return this.selectedForms;
    }

    // Generar enlace
    generateLink() {
        // Seleccionar formularios
        const selectedForms = this.selectForms();

        // Validar selección
        if (selectedForms.length === 0) {
            alert('Por favor, seleccione al menos un formulario.');
            return null;
        }

        // En lugar de agregar signature pad, solo guardar información
        this.markLastFormForSignature(selectedForms);

        // Construir parámetros del enlace
        const formParams = selectedForms
            .map(form => `form=${form.value}&name=${encodeURIComponent(form.name)}`)
            .join('&');

        return `${this.baseUrl}${formParams}`;
    }

    // Método para marcar el último formulario para signature pad
    markLastFormForSignature(selectedForms) {
        // Obtener el último formulario seleccionado
        const lastForm = selectedForms[selectedForms.length - 1];

        try {
            // Guardar información del último formulario en sessionStorage
            sessionStorage.setItem('signatureForm', lastForm.value);
            console.log('Último formulario marcado para firma:', lastForm.value);
        } catch (error) {
            console.error('Error al marcar formulario para firma:', error);
        }
    }

    // Copiar enlace al portapapeles
    copyToClipboard(link) {
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        // Mostrar mensaje de confirmación
        const alertMessage = document.getElementById('alertMessage');
        if (alertMessage) {
            alertMessage.classList.remove('hidden');
            setTimeout(() => {
                alertMessage.classList.add('hidden');
            }, 3000);
        }
    }
}

// Exportar una instancia del generador de enlaces
export const linkGenerator = new LinkGenerator();
