// Funcion para el manejo de contenido adicional en formularios
document.addEventListener('DOMContentLoaded', () => {
    function toggleAdditionalContent(radioName, contentId) {
        const radios = document.querySelectorAll(`input[name="${radioName}"]`);
        
        // Asegurarse de que encuentra elementos
        if (radios.length === 0) {
            console.warn(`No se encontraron inputs con el nombre ${radioName}`);
            return;
        }
        
        radios.forEach((elem) => {
            elem.addEventListener('change', function(event) {
                console.log(`Cambio detectado en ${radioName}:`, event.target.value);
                
                const additionalContent = document.getElementById(contentId);
                
                // Verificamos si el valor del radio seleccionado es 'si'
                if (event.target.value === 'si') {
                    additionalContent.classList.remove('hidden');
                }
                else if (event.target.checked && event.target.value == 'on'){
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
    toggleAdditionalContent('radioterapia-f3', 'additional-radioterapia-f3');
    toggleAdditionalContent('quimioterapia-f3', 'additional-quimioterapia-f3');
    toggleAdditionalContent('medicacion-relacionada', 'medicacion-relacionada');
    toggleAdditionalContent('prolactina', 'prolactina');
    // Formulario 4
    toggleAdditionalContent('estudios_previos', 'additional-estudios');
    toggleAdditionalContent('estudio_mamografia_f4', 'fecha_mamografia_f4');
    toggleAdditionalContent('estudio_ecografia_f4', 'fecha_ecografia_f4');
    toggleAdditionalContent('estudio_resonancia_f4', 'fecha_resonancia_f4');
    toggleAdditionalContent('historia_familiar', 'additional-historia-familiar');
    toggleAdditionalContent('cirugias_mamas', 'additional-cirugias');
    toggleAdditionalContent('biopsia_percutanea', 'additional-biopsia');
    toggleAdditionalContent('tratamiento_cancer', 'additional-tratamiento');
    toggleAdditionalContent('cirugia_mastoplastia', 'cirugia_mastoplastia_f4');
    toggleAdditionalContent('cirugia_biopsia', 'fecha_biopsia_f4');
    toggleAdditionalContent('cirugia_segmentectomia', 'fecha_segmentectomia_f4');
    toggleAdditionalContent('cirugia_mastectomia', 'fecha_mastectomia_f4');
    toggleAdditionalContent('cirugia_reconstruccion', 'reconstrucción_f4');
    toggleAdditionalContent('quimioterapia_f4', 'additional-quimioterapia-f4');
    toggleAdditionalContent('radioterapia_f4', 'additional-radioterapia-f4');
    toggleAdditionalContent('tamoxifeno_f4', 'addition_tamoxifeno_f4');
    toggleAdditionalContent('anticonceptivos_f4', 'addition_anticonceptivos_f4');
    toggleAdditionalContent('terapia_hormonal_f4', 'additional_terapia_hormonal_f4');
    toggleAdditionalContent('cirugia_mastoplastia', 'additional-mastoplastia');
    toggleAdditionalContent('marcadores_sericos', 'additional-marcadores-sericos');
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
    toggleAdditionalContent('pr-intervencion-q-ginecologica', 'pg-intva-adicional');
    toggleAdditionalContent('enfermedades_familiares', 'enfermedades-familiares-adicionales');
    toggleAdditionalContent('diagnostico_cancer', 'cancer-adicional');
    toggleAdditionalContent('cirugia_cancer', 'cirugia-cancer-adicional');
    toggleAdditionalContent('pr-pga-tratamiento-cc', 'pga-tdc-adicional');
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
});
