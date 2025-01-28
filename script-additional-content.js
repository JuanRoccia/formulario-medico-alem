// Funcion para el manejo de contenido adicional en formularios
document.addEventListener('DOMContentLoaded', () => {
    /*function toggleAdditionalContent(radioName, contentId) {
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
                const inputs = additionalContent.querySelectorAll('input');
                
                if (event.target.value === 'si' || event.target.value === 'mujer' || (event.target.checked && event.target.value === 'on')) {
                    additionalContent.classList.remove('hidden');
                    inputs.forEach(input => input.setAttribute('required', ''));
                } else {
                    additionalContent.classList.add('hidden');
                    inputs.forEach(input => input.removeAttribute('required'));
                }
            });
        });
    }*/
   

    //funciona bien
    /*function toggleAdditionalContent(radioName, contentId) {
        const radios = document.querySelectorAll(`input[name="${radioName}"]`);
        
        if (radios.length === 0) {
            console.warn(`No se encontraron inputs con el nombre ${radioName}`);
            return;
        }
    
        radios.forEach((elem) => {
            elem.addEventListener('change', function(event) {
                console.log(`Cambio detectado en ${radioName}:`, event.target.value);
                
                const additionalContent = document.getElementById(contentId);
                const inputs = additionalContent.querySelectorAll('input');
    
                if (event.target.value === 'si' || event.target.value === 'mujer' || (event.target.checked && event.target.value === 'on')) {
                    additionalContent.classList.remove('hidden');
                    
                    if (!additionalContent.classList.contains('checkbox-group')) {
                        inputs.forEach((input, index) => {
                            if (!input.classList.contains('required-exception')) {
                                if (input.type === 'radio') {
                                    input.required = index === 0;
                                } else {
                                    input.setAttribute('required', '');
                                }
                            }
                        });
                    }
                } else {
                    additionalContent.classList.add('hidden');
                    
                    if (!additionalContent.classList.contains('checkbox-group')) {
                        inputs.forEach(input => {
                            if (!input.classList.contains('required-exception')) {
                                input.removeAttribute('required');
                            }
                        });
                    }
                }
            });
        });
    }*/

    function toggleAdditionalContent(radioName, contentId) {
        const radios = document.querySelectorAll(`input[name="${radioName}"]`);
        
        if (radios.length === 0) {
            console.warn(`No se encontraron inputs con el nombre ${radioName}`);
            return;
        }
    
        radios.forEach((elem) => {
            elem.addEventListener('change', function(event) {
                console.log(`Cambio detectado en ${radioName}:`, event.target.value);
                
                const additionalContent = document.getElementById(contentId);
                const inputs = additionalContent.querySelectorAll('input');
                let mastoplastia_selector = (event.target.name === 'Opción mastoplastía reductora' || event.target.name === 'Opción mastoplastía prótesis'); 
                let isMastoplastiaChecked = false
                if (mastoplastia_selector) {
                    isMastoplastiaChecked = document.querySelector('input[name="Opción mastoplastía reductora"]')?.checked || 
                                document.querySelector('input[name="Opción mastoplastía prótesis"]')?.checked;
                }
                
                if (isMastoplastiaChecked || event.target.value === 'si' || event.target.value === 'mujer' || (event.target.checked && (event.target.value === 'on' || ['otras', 'otros'].includes(event.target.value)))) {
                    
                    additionalContent.classList.remove('hidden');
                    
                    if (additionalContent.classList.contains('checkbox-group')) {
                        // Manejar grupo de checkboxes
                        const checkboxes = additionalContent.querySelectorAll('input[type="checkbox"]');
                        
                        checkboxes.forEach(checkbox => {
                            // Buscar inputs hermanos siguientes al checkbox
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
    
                            // Trigger inicial basado en el estado actual del checkbox
                            if (checkbox.checked) {
                                associatedInputs.forEach(input => {
                                    if (!input.classList.contains('required-exception')) {
                                        input.setAttribute('required', '');
                                    }
                                });
                            }
                        });
                    } else {
                        // Lógica existente para contenidos que no son grupos de checkbox
                        inputs.forEach((input, index) => {
                            if (!input.classList.contains('required-exception')) {
                                if (input.type === 'radio') {
                                    input.required = index === 0;
                                } else {
                                    input.setAttribute('required', '');
                                }
                            }
                        });
                    }
                } else {
                    additionalContent.classList.add('hidden');
                    
                    if (additionalContent.classList.contains('checkbox-group')) {
                        // Remover required de todos los inputs en el grupo de checkboxes
                        const inputs = additionalContent.querySelectorAll('input:not([type="checkbox"])');
                        inputs.forEach(input => {
                            if (!input.classList.contains('required-exception')) {
                                input.removeAttribute('required');
                            }
                        });
                    } else {
                        inputs.forEach(input => {
                            if (!input.classList.contains('required-exception')) {
                                input.removeAttribute('required');
                            }
                        });
                    }
                }
            });
        });
    }
    // Formulario 1
    toggleAdditionalContent('Otras sustancias', 'additional-otras-sustancias');
    toggleAdditionalContent('Sexo', 'preg-additional-embarazo');
    toggleAdditionalContent('Pregunta elementos metálicos', 'additional-objetos-metalicos');
    toggleAdditionalContent('Pregunta cirugía', 'additional-content');
    toggleAdditionalContent('Pregunta medicación relacionada', 'medicacion-relacionada');
    // Formulario 2
    toggleAdditionalContent('Otros síntomas', 'additional-otros-sintomas-f2');
    //toggleAdditionalContent('Pregunta dolor', 'Seleccione el tipo de dolor');
    toggleAdditionalContent('Pregunta traumatismo', 'additional-fecha-traumatismo');
    toggleAdditionalContent('Pregunta medicación', 'additional-medicacion');
    toggleAdditionalContent('Pregunta antecedentes oncológicos personales', 'additional-onc');
    toggleAdditionalContent('Pregunta deporte', 'additional-deporte');
    // Formulario 3
    toggleAdditionalContent('Otros síntomas', 'additional-otros-sintomas');
    toggleAdditionalContent('Pregunta antecedentes de traumatismos', 'additional-traumatismo');
    toggleAdditionalContent('Pregunta antecedentes de problemas al nacer', 'additional-problemas');
    toggleAdditionalContent('Pregunta cirugias y/o biopsias', 'additional-cirugias');
    toggleAdditionalContent('Pregunta procedimientos odontológicos', 'additional-odontologica');
    toggleAdditionalContent('Antecedentes oncológicos personales', 'additional-oncologica');
    toggleAdditionalContent('Radioterapia', 'additional-radioterapia-f3');
    toggleAdditionalContent('Quimioterapia', 'additional-quimioterapia-f3');
    toggleAdditionalContent('Otras enfermemdades', 'additional-otras-enfermedades');
    toggleAdditionalContent('Pregunta prolactina', 'prolactina');
    // Formulario 4
    //toggleAdditionalContent('Pregunta estudios previos', 'Seleccione estudio previo de la zona a estudiar');
    toggleAdditionalContent('Opción estudio mamografía', 'fecha_mamografia_f4');
    toggleAdditionalContent('Opción estudio ecografía', 'fecha_ecografia_f4');
    toggleAdditionalContent('Opción estudio resonancia', 'fecha_resonancia_f4');
    toggleAdditionalContent('Antecedente familiar de cancer', 'Seleccione familiar afectado de cáncer');
    toggleAdditionalContent('Pregunta cirugías en mamas', 'Seleccione cirugía realizada en mamas');
    toggleAdditionalContent('Pregunta biopsia percutanea', 'additional-biopsia');
    toggleAdditionalContent('Pregunta tratamiento de cancer', 'additional-tratamiento');
    toggleAdditionalContent('Opción mastoplastía reductora', 'additional-fecha-mastoplastia-reductora');
    toggleAdditionalContent('Opción mastoplastía prótesis', 'additional-fecha-mastoplastia-protesis');
    toggleAdditionalContent('Opción biopsia quirúrgica', 'additional-fecha-biopsia-quirurgica');
    toggleAdditionalContent('Opción segmentectomía', 'additional-fecha-segmentectomia');
    toggleAdditionalContent('Opción cirugía mastectomía', 'additional-fecha-mastectomia');
    toggleAdditionalContent('Opción reconstrucción', 'additional-fecha-reconstruccion');
    //toggleAdditionalContent('Opción reconstrucción músculo abdominal', 'additional-fecha-reconstruccion-musculo-abdominal');
    //toggleAdditionalContent('Opción reconstrucción músculo dorsal', 'additional-fecha-reconstruccion-musculo-drosal');
    //toggleAdditionalContent('Opción reconstrucción prótesis', 'additional-fecha-reconstruccion-protesis');
    toggleAdditionalContent('Pregunta quimioterapia', 'additional-quimioterapia-f4');
    toggleAdditionalContent('Pregunta radioterapia', 'additional-radioterapia-f4');
    toggleAdditionalContent('Pregunta tamoxifeno', 'addition_tamoxifeno_f4');
    toggleAdditionalContent('Pregunta anticonceptivos', 'addition_anticonceptivos_f4');
    toggleAdditionalContent('Pregunta terapia hormonal', 'additional_terapia_hormonal_f4');
    toggleAdditionalContent('Opción mastoplastía reductora', 'additional-mastoplastia');
    toggleAdditionalContent('Opción mastoplastía prótesis', 'additional-mastoplastia');
    toggleAdditionalContent('Pregunta marcadores séricos', 'additional-marcadores-sericos');
    // Formulario 5
    toggleAdditionalContent('Pregunta sintomas abdominales', 'sintomas-adicionales');
    toggleAdditionalContent('Pregunta infecciones recientes', 'infecciones-adicionales');
    //toggleAdditionalContent('otras_enfermedades', 'enfermedades-adicionales');
    toggleAdditionalContent('Pregunta hospitalizaciones previas', 'hospitalizaciones-adicionales');
    toggleAdditionalContent('Pregunta cirugias anteriores', 'cirugias-adicionales');
    toggleAdditionalContent('Pregunta menstruación', 'pga-mns-adicional');
    toggleAdditionalContent('Pregunta menstruación', 'additional-mens-condition');
    toggleAdditionalContent('Pregunta menopausia', 'pg-mnp-adicional');
    toggleAdditionalContent('Pregunta método anticonceptivo', 'pg-mntc-adicional');
    toggleAdditionalContent('Pregunta embarazo', 'additional-embarazo-condition');
    toggleAdditionalContent('Pregunta cesáreas', 'pg-mcsa-adicional');
    toggleAdditionalContent('Pregunta intervención ginecológica', 'pg-intva-adicional');
    toggleAdditionalContent('Pregunta antecedentes familiares de cáncer', 'enfermedades-familiares-adicionales');
    toggleAdditionalContent('Pregunta antecedentes personales de cáncer', 'cancer-adicional');
    toggleAdditionalContent('Pregunta antecedentes personales de cáncer', 'additional-cancer-condition');
    toggleAdditionalContent('Pregunta intervención quirúrgica cáncer', 'cirugia-cancer-adicional');
    toggleAdditionalContent('Pregunta tratamiento de cáncer', 'pga-tdc-adicional');
    toggleAdditionalContent('Pregunta tratamiento quimioterapia', 'quimioterapia-adicional');
    toggleAdditionalContent('Pregunta tratamiento radioterapia', 'radioterapia-adicional');
    toggleAdditionalContent('Pregunta biopsia reciente', 'biopsia-adicional');
    toggleAdditionalContent('Pregunta marcadores séricos elevados', 'pga-marcadores-adicional');
    //Form 6 Descartado
    /*toggleAdditionalContent('pr-pg-antecendente-familiar', 'pg-afdc-adicional');
    toggleAdditionalContent('pr-pg-antecedente-personal', 'pg-apdc-adicional');
    toggleAdditionalContent('pr-pg-intervencion-cc', 'pg-iqdc-adicional');
    toggleAdditionalContent('pr-pg-tratamiento-cc', 'pr-pg-tratamiento-cc');*/
    //Form 7
    toggleAdditionalContent('Pregunta pruebas de PSA', 'rpfst-adicional');
    toggleAdditionalContent('Pregunta cirugía previa', 'pm-tacpe-adicional');
    toggleAdditionalContent('Pregunta antecedente familiar de cáncer', 'pm-afdcm-adicional');
    toggleAdditionalContent('Pregunta antecedente personal de cáncer', 'pm-apdcm-adicional');
    toggleAdditionalContent('Pregunta intervención quirúrgica de su cáncer', 'pm-iqdcm-adicional');
    toggleAdditionalContent('Pregunta tratamiento de cáncer', 'pm-tdcm-adicional');
    toggleAdditionalContent('Pregunta de quimioterapia', 'pmr-quimioterapia-adicional');
    toggleAdditionalContent('Pregunta de radioterapia', 'pmr-radioterapia-adicional');
    toggleAdditionalContent('Pregunta cirguías o biopsias', 'pm-cbade-adicional');
    toggleAdditionalContent('Pregunta de marcadores séricos', 'pmr-marcadores-adicional');
    //Form 8
    toggleAdditionalContent('Pregunta procedimientos odontológicos', 'odontologicos-adicional');
    toggleAdditionalContent('Pregunta anormalidades y/o molestias en la mandibula', 'mandibula-adicional');
    toggleAdditionalContent('Pregunta cirugía en la zona a estudiar', 'atm-cpae-adicional');
    toggleAdditionalContent('Pregunta antecedentes personales cáncer', 'atm-tapdc-adicional');
});
