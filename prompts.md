<!-- Contexto para la IA -->
Se sigue visualizando solo el ultimo fromulario en el pdf con los cambios realizados, se espera que se visualicen todos los formularios.
script.js con las funciones pertinetes:

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
                alert('Has completado todos los formularios.');
                prepareWhatsAppShare();
            } catch (error) {
                hideLoadingIndicator();
                alert('Hubo un error al generar los PDFs. Por favor, intenta de nuevo.');
                console.error(error);
            }
        } else {
            alert('Por favor, completa todos los formularios antes de finalizar.');
        }
    }

    async function convertFormToPdf(form, index) {
        const iframe = formContainer.getElementsByTagName('iframe')[index];
        const iframeContent = iframe.contentWindow.document.body;
        const iframeDocument = iframe.contentWindow.document;
    
        // Clonar estilos CSS en el iframe
        const styles = document.querySelectorAll("link[rel='stylesheet'], style");
        styles.forEach(style => {
            try {
                const clonedStyle = style.cloneNode(true);
                iframeContent.appendChild(clonedStyle);
            } catch (error) {
                console.error('Error al clonar estilos:', error);
            }
        });
    
        // Estilos específicos para PDF
        const pdfStyles = `
            @page { size: A4; margin: 0; }
            body {
                font-family: Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.5;
                color: #333;
                margin: 0;
                padding: 20mm;
                box-sizing: border-box;
                img: { max-width: 100%; height: auto; }
            }
            #content-wrapper {
                max-width: 180mm;
                margin: 0 auto;
            }
            img { max-width: 100%; height: auto; }
        `;
    
        const styleElement = iframeDocument.createElement('style');
        styleElement.textContent = pdfStyles;
        iframeContent.appendChild(styleElement);
    
        // Envolver contenido en un div para escalar y diseñar
        const contentWrapper = iframeDocument.createElement('div');
        contentWrapper.id = 'content-wrapper';
        while (iframeContent.firstChild) {
            contentWrapper.appendChild(iframeContent.firstChild);
        }
        iframeContent.appendChild(contentWrapper);
    
        // Ajustar estilos inline para mejor escalado
        const elements = iframeContent.querySelectorAll('*');
        elements.forEach(el => {
            el.style.maxWidth = '100%';
            el.style.boxSizing = 'border-box';
            el.style.pageBreakInside = 'avoid';
        });
    
        // Esperar a que las fuentes y estilos se carguen
        await document.fonts.ready;
    
        // Generar PDF
        try {
            const canvas = await html2canvas(iframeContent, {
                scale: 2,
                useCORS: true,
                logging: true,
                letterRendering: true
            });
    
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
    

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`form_${index + 1}.pdf`);
    
            console.log(`PDF generado: form_${index + 1}.pdf`);
            return pdf;
        } catch (error) {
            console.error('Error generando PDF:', error);
            throw error;
        }
    }

    async function downloadForms(format) {
        if (format === 'pdf') {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            const formIframes = formContainer.getElementsByTagName('iframe');

            for (let i = 0; i < formIframes.length; i++) {
                const iframe = formIframes[i];
                
                try {
                    // Guardar el estado original de visibilidad
                    const originalDisplay = iframe.style.display;
                    const originalVisibility = iframe.style.visibility;

                    // Hacer el iframe visible temporalmente
                    iframe.style.display = 'block';
                    iframe.style.visibility = 'visible';

                    // Asegurar que el iframe está cargado y visible
                    await ensureIframeLoaded(iframe);

                    // Aplicar estilos para mejorar la captura
                    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    const styleElement = iframeDocument.createElement('style');
                    styleElement.textContent = `
                        body { 
                            font-family: Arial, sans-serif;
                            display: block !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                        }
                        * { max-width: 100%; box-sizing: border-box; }
                    `;
                    iframeDocument.head.appendChild(styleElement);

                    // Forzar la visibilidad del contenido del iframe
                    iframeDocument.body.style.display = 'block';
                    iframeDocument.body.style.opacity = '1';
                    iframeDocument.body.style.visibility = 'visible';

                    // Esperar un momento para que los estilos se apliquen
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Usar html2canvas para capturar el contenido del iframe
                    const canvas = await html2canvas(iframeDocument.body, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        windowWidth: iframe.clientWidth || 1000, // Valor por defecto si clientWidth es 0
                        windowHeight: iframe.clientHeight || 1414 // Valor por defecto si clientHeight es 0 (aproximadamente A4)
                    });
                    const imgData = canvas.toDataURL('image/jpeg', 1.0);

                    // Añadir el contenido capturado al PDF
                    if (i > 0) {
                        pdf.addPage();
                    }
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

                    // Restaurar el estado original de visibilidad
                    iframe.style.display = originalDisplay;
                    iframe.style.visibility = originalVisibility;

                } catch (error) {
                    console.error(`Error al capturar el contenido del formulario ${i + 1}:`, error);
                    throw new Error(`Error al capturar el contenido del formulario ${i + 1}. Por favor, intente de nuevo.`);
                }
            }

            // Guardar el PDF combinado
            pdf.save('formularios_completos.pdf');
        } else {
            throw new Error('Formato no soportado');
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

    function prepareWhatsAppShare() {
        // Aquí puedes implementar la lógica para compartir por WhatsApp
        // Por ejemplo, abrir un nuevo enlace de WhatsApp con un mensaje predefinido
        const message = encodeURIComponent('He completado los formularios. Aquí están adjuntos los archivos PDF.');
        const whatsappLink = `https://wa.me/542915278412?text=${message}`;
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

Ahora te voy a mostrar el index y un formulario de ejemplo para que entiendas mejor el contexto:
index.html:
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- index.html -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formularios del Paciente</title>
    <!-- <script src="https://cdn.tailwindcss.com"></script> -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.15/dist/tailwind.min.css" rel="stylesheet">
    <!-- <link href="https://cdn.jsdelivr.net/npm/tailwindcss@latest/dist/tailwind.min.css" rel="stylesheet"> -->
    <link rel="stylesheet" href="css/styles.css">
    <style>
        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            /* color: white !important; */
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
        * {
            overflow: visible !important;
        }
        body button#clear {
            color: white !important;
            /* background-color: black; */
        }
    </style>
</head>
<body class="bg-gray-100 font-sans">
    <!-- Contenedor principal -->
    <div id="mainContainer" class="container mx-auto p-4 flex flex-col">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Formularios del Paciente</h1>
        <div id="formList" class="mb-4">
            <!-- Lista de formularios seleccionados se insertará aquí -->
        </div>
        <div id="formContainer" class="mb-4">
            <!-- Los iframes se insertarán aquí dinámicamente -->
        </div>
    </div>
    <!-- Barra de navegacion inferior -->
    <div id="navigationContainer" class="w-full">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <button id="prevBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50" disabled>Anterior</button>
            <div id="pageIndicator" class="text-gray-700"></div>
            <button id="nextBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Siguiente</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    
    <!-- Agregar el script.js -->
    <script src="script.js"></script>
    <!-- Indicador de descarga -->
    <div id="loadingIndicator" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden flex items-center justify-center">
        <div class="p-8 bg-white shadow-lg rounded-lg">
            <div class="flex items-center space-x-4">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <p class="text-xl font-semibold text-gray-700">Generando PDFs...</p>
            </div>
            <p class="mt-4 text-sm text-gray-500">Por favor, espera mientras se procesan tus formularios.</p>
        </div>
    </div>
</body>
</html>

form-1.html:
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RESONANCIA MAGNÉTICA</title>
    <!-- Tailwind CDN -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.15/dist/tailwind.min.css" rel="stylesheet">
    <!-- <script src="https://cdn.tailwindcss.com"></script> -->
    <!-- Font CDN -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
    <link href="css/styles.css" rel="stylesheet">
  </head>
  <body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8 flex justify-center">
      <form class="bg-white w-full max-w-screen-lg shadow-md rounded px-4 px-10 sm:px-20 pt-6 pb-8 mb-4">
        <header class="header flex justify-center py-4 px-2">
          <div class="w-full sm:w-auto flex justify-center">
            <img src="images/logo-imagenes-alem-hrz.webp" 
              alt="Logo Imágenes Alem" 
              class="object-contain">
          </div>
        </header>
        <div class="mb-6 text-center">
          <h2 class="sm:text-md md:text-xl xl:text-2xl font-bold mb-4">CUESTIONARIO GENERAL<span> RESONANCIA MAGNETICA</span></h2>    
        </div>
        <div class="mb-6 py-2 border border-black">
          <h4 class="text-sm sm:text-base px-3">La Resonancia Magnética Nuclear (RMN) es una técnica de imagen que combina la acción de un gran campo
            magnético creado por un imán con la aplicación de ondas de radiofrecuencias. No emplea radiaciones ionizantes
          </h4>  
        </div>
        <div class="mb-6 py-2 border border-black">
          <h4 class="text-sm sm:text-base px-3">EN RMN ALGUNOS OBJETOS METÁLICOS PODRÍAN SUPONER UN INCONVENIENTE O UNA CONTRAINDICACION
            PARA REALIZARLE LA EXPLORACIÓN SOLICITADA. SI NECESITA AYUDA, CONSULTE CON NUESTRO PERSONAL            
          </h4>  
        </div>
        <!-- Datos Generales del Paciente -->
        <div class="mb-6">
          <h2 class="text-xl font-bold mb-4">Información del Paciente</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2" for="nombre">
                Nombre
              </label>
              <input class="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" id="nombre" type="text" required>
            </div> 
            <div>    
              <label class="block text-sm font-medium text-gray-900 mb-2" for="apellido">
                Apellido
              </label>
              <input class="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" id="apellido" type="text" required>        
            </div>
            <div>     
              <label class="block text-sm font-medium text-gray-900 mb-2" for="edad">
                  Edad
              </label>
              <input class="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" id="edad" type="number" required>
            </div>  
          </div>
          <div class="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2" for="ocupacion">
                Ocupación
              </label>
              <input class="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" id="ocupacion" type="text" required>    
            </div> 
          </div>
        </div>
        <!-- Cuestionario -->
        <div class="mb-6" id="cuestionario-resonancia-magnetica">
          <div class="space-y-4">
            <ol class="custom-list">
              <li>
                <span class="number">1.</span>
                ¿Cuál es su sexo biológico?
                <div class="flex items-center space-x-4 mt-2">
                  <label class="inline-flex items-center w-full md:w-auto">
                    <input type="radio" class="form-radio" name="pregunta1" value="hombre">
                    <span class="ml-2">Hombre</span>
                  </label>
                  <label class="inline-flex items-center w-full md:w-auto">
                    <input type="radio" class="form-radio" name="pregunta1" value="mujer">
                    <span class="ml-2">Mujer</span>
                  </label>
                </div>
                <div id="women-preg" class="flex items-center space-x-4 mt-2 hidden">
                  ¿Está usted embarazada o sospecha estarlo?
                  <label class="inline-flex items-center condicional">
                    <input type="radio" class="form-radio" name="pregunta2" value="si">
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center condicional">
                    <input type="radio" class="form-radio" name="pregunta2" value="no">
                    <span class="ml-2">No</span>
                  </label>
                </div>
              </li>
              <li>
                <span class="number">2.</span>
                ¿Es usted portador de marcapasos?
                <div class="flex items-center space-x-4 mt-2">
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta2" value="si">
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta2" value="no">
                    <span class="ml-2">No</span>
                  </label>
                </div>
              </li>
              <li>
                <span class="number">3.</span>
                ¿Es usted alérgico a alguna sustancia?
                <div class="mb-4 md:mb-0 md:mr-4 mt-2">
                  <div class="flex flex-wrap items-center space-x-0 space-y-1 md:space-y-0"> <!--md:space-x-4-->
                    <label class="inline-flex items-center w-full md:w-auto">
                      <input type="checkbox" class="form-checkbox ml-3" name="movimiento" value="option1">
                      <span class="ml-2">IODO</span>
                    </label>
                    <label class="inline-flex items-center w-full md:w-auto">
                      <input type="checkbox" class="form-checkbox ml-3" name="reposo" value="option2">
                      <span class="ml-1">GADOLINEO</span>
                    </label>
                    <label class="inline-flex items-center w-full md:w-auto">
                      <input type="checkbox" class="form-checkbox ml-3" name="tumefacción" value="option3">
                      <span class="ml-1">PENICILINA</span>
                    </label>
                    <label class="inline-flex items-center w-full md:w-auto">
                      <input type="checkbox" class="form-checkbox ml-3" name="calambres" value="option4">
                      <span class="ml-1">BUSCAPINA</span>
                    </label>
                    <label class="inline-flex items-center w-full md:w-auto">
                      <input type="checkbox" class="form-checkbox ml-3" name="inestabilidad" value="option5">
                      <span class="ml-1">ANESTESIA</span>
                    </label>
                    <label class="inline-flex items-center w-full md:w-auto">
                      <input type="checkbox" class="form-checkbox ml-3" name="bloqueo articular" value="option6">
                      <span class="ml-1">ANESTESIA</span>
                    </label>
                  </div>
                  <div class="flex items-center space-x-2 ml-3">        
                    <p>Otros:</p>        
                    <input type="text" class="form-input block w-full" placeholder="Escriba aquí">
                  </div>
                </div>
              </li>
              <li>
                <span class="number">4.</span>
                ¿Tiene insuficiencia renal?
                <div class="flex items-center space-x-4 mt-2">
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta4" value="si">
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta4" value="no">
                    <span class="ml-2">No</span>
                  </label>
                </div>
              </li>
              <li>
                <span class="number">5.</span>
                ¿Posee elementos metálicos en el cuerpo? (por ejemplo: implantes como placas, clavos, tornillos; implantes o arreglos dentales metálicos; dentadura postiza; implantes cocleares o prótesis de oído; audífonos implantados; clips cerebrales; bomba de infusión de medicación implantada; filtros, stent vasculares o material similar; prótesis de válvula metálica o prótesis cardíaca; neuroestimulador, entre otros)
                <div class="flex items-center space-x-4 mt-2">
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta5" value="si">
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta5" value="no">
                    <span class="ml-2">No</span>
                  </label>
                </div>
              </li>
              <li>
                <span class="number">6.</span>
                ¿Está operado de aneurisma?
                <div class="flex items-center space-x-4 mt-2">
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta6" value="si">
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta6" value="no">
                    <span class="ml-2">No</span>
                  </label>
                </div>
              </li>
              <li>
                <span class="number">7.</span>
                ¿Lleva tatuajes, piercing u otros?
                <div class="flex items-center space-x-4 mt-2">
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta7" value="si">
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta7" value="no">
                    <span class="ml-2">No</span>
                  </label>
                </div>
              </li> 
              <li>
                <span class="number">8.</span>
                ¿Es usted Fumador?
                <div class="flex items-center space-x-4 mt-2">
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta8" value="si">
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta8" value="no">
                    <span class="ml-2">No</span>
                  </label>
                </div>
              </li> 
              <li>
                <span class="number">9.</span>
                A los fines de saber si existe la posibilidad de que tenga una esquirla metálica en el cuerpo.
                ¿Ha trabajado en lugares donde estuviese en contacto con metales? (por ejemplo, soldadura) 
                <div class="flex items-center space-x-4 mt-2">
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta9" value="si">
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta9" value="no">
                    <span class="ml-2">No</span>
                  </label>
                </div>
              </li>
              <li>
                <span class="number">10.</span>
                ¿Ha tenido algún accidente producido por objetos metálicos?
                <div class="flex items-center space-x-4 mt-2">
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta10" value="si">
                    <span class="ml-2">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" name="pregunta10" value="no">
                    <span class="ml-2">No</span>
                  </label>
                </div>
              </li>
            </ol>
          </div>      
        </div>
        </form>
      </div>
      <script src="script.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  </body> 
</html>

dashboard.html:
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard del Médico</title>
    <!-- <script src="https://cdn.tailwindcss.com"></script> -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.15/dist/tailwind.min.css" rel="stylesheet">
    <!-- <link href="https://cdn.jsdelivr.net/npm/tailwindcss@latest/dist/tailwind.min.css" rel="stylesheet"> -->
</head>
<body class="bg-black font-sans max-h">
    <div class="relative min-h-screen bg-cover bg-center" style="background-image: url('images/centrodediagnostico3.webp');">
        <div class="absolute inset-0 bg-black opacity-50"></div> <!-- Capa de opacidad -->
    
        <div class="relative container mx-auto p-4 max-w-md">
            <!-- Dashboard Content-->
            <div id="dashboardContent">
                <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img class="mx-auto w-40 mb-4" src="images/image-logo-white.webp" alt="Imagenes Alem Logo">
                    </div>
                <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h1 class="text-2xl font-bold mb-6 text-gray-800">Dashboard del Médico</h1>
                    <div class="mb-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="form1" value="form-1" class="form-checkbox h-5 w-5 text-blue-600" checked>
                            <span class="ml-2 text-gray-700">Formulario 1</span>
                        </label>
                    </div>
                    <div class="mb-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="form2" value="form-2" class="form-checkbox h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Formulario 2</span>
                        </label>
                    </div>
                    <div class="mb-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="form3" value="form-3" class="form-checkbox h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Formulario 3</span>
                        </label>
                    </div>
                    <div class="mb-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="form4" value="form-4" class="form-checkbox h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Formulario 4</span>
                        </label>
                    </div>
                    <div class="mb-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="form5" value="form-5" class="form-checkbox h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Formulario 5</span>
                        </label>
                    </div>
                    <div class="mb-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="form6" value="form-6" class="form-checkbox h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Formulario 6</span>
                        </label>
                    </div>
                    <div class="mb-4">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="form7" value="form-7" class="form-checkbox h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Formulario 7</span>
                        </label>
                    </div>
                    <div class="mb-6">
                        <label class="inline-flex items-center">
                            <input type="checkbox" id="form8" value="form-8" class="form-checkbox h-5 w-5 text-blue-600">
                            <span class="ml-2 text-gray-700">Formulario 8</span>
                        </label>
                    </div>
                    <button id="generateButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Generar Enlace
                    </button>
                    <div id="generatedLink" class="mt-6 hidden">
                        <p class="text-gray-700 mb-2">Enlace generado:</p>
                        <div class="flex">
                            <input type="text" id="linkInput" readonly class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <button id="copyButton" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2 focus:outline-none focus:shadow-outline">
                                Copiar
                            </button>
                        </div>
                    </div>
                    <div id="alertMessage" class="mt-4 hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span class="block sm:inline">Enlace copiado al portapapeles</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Agregar el script.js -->
    <script src="script.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</body>
</html>
