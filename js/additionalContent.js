// additionalContent.js
export class AdditionalContent {
    constructor() {
        // Inicializa los mapeos de formularios cuando se crea la instancia
        this.initialized = false;
    }

    initialize(iframe) {
        if (!iframe.contentDocument) {
            console.warn('No se pudo acceder al documento del iframe');
            return;
        }

        // Inicializa los mapeos para el iframe específico
        this.initializeFormMappings(iframe.contentDocument);
    }

    initializeFormMappings(doc) {
        // Formulario 2
        this.setupToggle('pregunta-dolor', 'additional-dolor', doc);
        this.setupToggle('pregunta-cirugia', 'additional-content', doc);
        this.setupToggle('pregunta-medicacion', 'additional-medicacion', doc);
        this.setupToggle('pregunta-oncologica', 'additional-onc', doc);
        this.setupToggle('pregunta-deporte', 'additional-deporte', doc);

        // Formulario 3
        this.setupToggle('traumatismo', 'additional-traumatismo', doc);
        this.setupToggle('problemas al nacer', 'additional-problemas', doc);
        this.setupToggle('cirugias-biopsias', 'additional-cirugias', doc);
        this.setupToggle('pregunta-odontologica', 'additional-odontologica', doc);
        this.setupToggle('pregunta-oncologica', 'additional-oncologica', doc);
        this.setupToggle('medicacion-relacionada', 'medicacion-relacionada', doc);
        this.setupToggle('prolactina', 'prolactina', doc);

        // Formulario 4
        this.setupToggle('estudios_previos', 'additional-estudios', doc);
        this.setupToggle('historia_familiar', 'additional-historia-familiar', doc);
        this.setupToggle('cirugias_mamas', 'additional-cirugias', doc);
        this.setupToggle('biopsia_percutanea', 'additional-biopsia', doc);
        this.setupToggle('tratamiento_cancer', 'additional-tratamiento', doc);
        this.setupToggle('cirugia_mastoplastia', 'additional-mastoplastia', doc);
        this.setupToggle('marcadores_sericos', 'additional-marcadores-sericos', doc);

        // Formulario 5
        this.setupToggle('sintomas_abdominales', 'sintomas-adicionales', doc);
        this.setupToggle('infecciones_recientes', 'infecciones-adicionales', doc);
        this.setupToggle('otras_enfermedades', 'enfermedades-adicionales', doc);
        this.setupToggle('hospitalizaciones_previas', 'hospitalizaciones-adicionales', doc);
        this.setupToggle('cirugias_anteriores', 'cirugias-adicionales', doc);
        this.setupToggle('pga-pr-menst', 'pga-mns-adicional', doc);
        this.setupToggle('pr-menopausia', 'pg-mnp-adicional', doc);
        this.setupToggle('pr-metodo-anticonceptivo', 'pg-mntc-adicional', doc);
        this.setupToggle('pr-cesareas', 'pg-mcsa-adicional', doc);
        this.setupToggle('pr-intervencion-q-ginecologica', 'pg-mcsa-adicional', doc);
        this.setupToggle('enfermedades_familiares', 'enfermedades-familiares-adicionales', doc);
        this.setupToggle('diagnostico_cancer', 'cancer-adicional', doc);
        this.setupToggle('cirugia_cancer', 'cirugia-cancer-adicional', doc);
        this.setupToggle('pr-pga-tratamiento-cc', 'pr-pga-tratamiento-cc', doc);
        this.setupToggle('quimioterapia', 'quimioterapia-adicional', doc);
        this.setupToggle('radioterapia', 'radioterapia-adicional', doc);
        this.setupToggle('biopsia_reciente', 'biopsia-adicional', doc);
        this.setupToggle('pga_marcadores_sericos', 'pga-marcadores-adicional', doc);

        // Form 7
        this.setupToggle('pr-rpfst', 'rpfst-adicional', doc);
        this.setupToggle('pr-pm-ciguria-biopsia', 'pm-cbade-adicional', doc);
        this.setupToggle('pr-pm-cirugia-previa', 'pm-tacpe-adicional', doc);
        this.setupToggle('pr-pm-antecedente-familiar', 'pm-afdcm-adicional', doc);
        this.setupToggle('pr-pm-antecedente-personal', 'pm-apdcm-adicional', doc);
        this.setupToggle('pr-pm-intervencion-cc', 'pm-iqdcm-adicional', doc);
        this.setupToggle('pr-pm-tratamiento-cc', 'pm-tdcm-adicional', doc);
        this.setupToggle('pmr-quimioterapia', 'pmr-quimioterapia-adicional', doc);
        this.setupToggle('pmr-radioterapia', 'pmr-radioterapia-adicional', doc);
        this.setupToggle('pmr_marcadores_sericos', 'pmr-marcadores-adicional', doc);

        // Form 8
        this.setupToggle('pr-odontologicos', 'odontologicos-adicional', doc);
        this.setupToggle('pr-mandibula', 'mandibula-adicional', doc);
        this.setupToggle('pr-atm-cirugia-zona', 'atm-cpae-adicional', doc);
        this.setupToggle('pr-atm-antecedente-personal', 'atm-tapdc-adicional', doc);
    }

    setupToggle(radioName, contentId) {
        const radioButtons = document.querySelectorAll(`input[name="${radioName}"]`);
        const additionalContent = document.getElementById(contentId);

        if (!radioButtons.length) {
            // Solo mostrar advertencia si los radio buttons existen en algún formulario
            // console.warn(`No radio buttons found with name '${radioName}'`);
            return;
        }

        if (!additionalContent) {
            // Solo mostrar advertencia si el contenido adicional existe en algún formulario
            // console.warn(`Element with ID '${contentId}' not found`);
            return;
        }

        if (!additionalContent) {
            console.warn(`Element with ID '${contentId}' not found`);
            return;
        }

        radioButtons.forEach(radio => {
            radio.addEventListener('change', (event) => {
                const showContent = event.target.value.toLowerCase() === 'si';
                additionalContent.classList.toggle('hidden', !showContent);
            });
        });
    }
}