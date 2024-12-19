async function downloadForms(format) {
        if (format === 'pdf') {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            const formIframes = formContainer.getElementsByTagName('iframe');
    
            for (let i = 0; i < formIframes.length; i++) {
                const iframe = formIframes[i];
                
                try {
                    // Mostrar iframe temporalmente para capturarlo
                    iframe.style.display = 'block';
                    iframe.style.visibility = 'visible';
    
                    // Asegurar que el iframe está cargado y visible
                    await ensureIframeLoaded(iframe);
    
                    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    const signaturePad = iframeDocument.getElementById('signature-pad');
                    let signatureDataUrl = null;

                    // Capturar la firma si el signaturePad esta presente
                    if (signaturePad) {
                        const padInstance = signaturePadManager.padInstance;
                        // Verificar que el pad sea visible y que la firma haya sido realizada
                        console.log('Pad Instance:', padInstance);
                        // Usando el metodo isEmpty()
                        // console.log('Pad Instance isEmpty:', padInstance.isEmpty());
                        
                        if (padInstance && !padInstance.isEmpty()) {
                            // Obtener la firma como DataURL
                            signatureDataUrl = padInstance.toDataURL();
                            // Asegurar que la imagen de la firma se obtuvo correctamente
                            console.log('Signature Data URL:', signatureDataUrl);
                            
                            const tempCanvas = iframeDocument.createElement('canvas');
                            tempCanvas.width = signaturePad.width;
                            tempCanvas.height = signaturePad.height;
                            const tempCtx = tempCanvas.getContext('2d');
                            
                            // Asegurar fondo blanco
                            tempCtx.fillStyle = 'white';
                            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                            
                            // Dibujar la firma en el canvas temporal
                            const img = new Image();
                            await new Promise((resolve) => {
                                img.onload = () => {
                                    tempCtx.drawImage(img, 0, 0);
                                    resolve();
                                };
                                img.src = signatureDataUrl;
                            });

                            // Reemplazar el canvas original con el canvas temporal (opcional)
                            const originalCtx = signaturePad.getContext('2d');
                            originalCtx.clearRect(0, 0, signaturePad.width, signaturePad.height);
                            originalCtx.drawImage(tempCanvas, 0, 0);
                        }
                    }

                    // Aplicar estilos para mejorar la captura
                    const styleElement = iframeDocument.createElement('style');
                    styleElement.textContent = `
                        body { 
                            font-family: Arial, sans-serif;
                            display: block !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                        }
                        * { max-width: 100%; box-sizing: border-box; }
                        #signature-pad {
                            display: block !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                            background-color: white !important;
                        }
                        .signature-container {
                            display: block !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                            position: relative !important;
                            background-color: white !important;
                        }
                        input, textarea {
                            line-height: 2rem!important;
                            margin-top: 1rem!important;
                        }
                        .ial-ot{
                            margin-top:0.4rem;
                        }
                    `;
                    iframeDocument.head.appendChild(styleElement);
    
                    // Forzar la visibilidad del contenido del iframe
                    iframeDocument.body.style.display = 'block';
                    iframeDocument.body.style.opacity = '1';
                    iframeDocument.body.style.visibility = 'visible';
    
                    // Esperar un momento para que los estilos se apliquen
                    await new Promise(resolve => setTimeout(resolve, 1000));
    
                    // Usar html2canvas para capturar el contenido del iframe
                    const canvas = await html2canvas(iframeDocument.body, {
                        scale: 3,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        windowWidth: iframeDocument.body.scrollWidth, // Usar scrollWidth en lugar de clientWidth
                        windowHeight: iframeDocument.body.scrollHeight * 1.05, // Usar scrollHeight y dar un poco de margen extra
                        width: iframeDocument.body.scrollWidth, // Especificar ancho explícitamente
                        height: iframeDocument.body.scrollHeight, // Especificar altura explícitamente
                        x: 0, // Comenzar desde el inicio
                        y: 0, // Comenzar desde el inicio
                        scrollX: 0,
                        scrollY: 0,
                        allowTaint: true, // Permitir captura de contenido cross-origin
                        imageTimeout: 0, // Sin timeout para imagenes
                        removeContainer: true, // Limpiar contenedores temporales

                        onclone: function(clonedDoc) {
                            // Eliminar márgenes y padding en el documento clonado
                            const clonedBody = clonedDoc.body;
                            clonedBody.style.margin = '0';
                            clonedBody.style.padding = '0';
                            clonedBody.style.border = 'none';
                            clonedBody.style.overflow = 'visible';

                            // Restaurar la firma en el documento clonado
                            if (signatureDataUrl) {
                                const clonedSignature = clonedDoc.getElementById('signature-pad');
                                if (clonedSignature) {
                                    const ctx = clonedSignature.getContext('2d');
                                    const img = new Image();
                                    img.src = signatureDataUrl;
                                    ctx.drawImage(img, 0, 0);
                                }
                            }
                        }
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
                    
                    // Obtener el tamaño de página del PDF
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                   // Crear un Image para obtener las dimensiones originales
                    const img = new Image();
                    await new Promise((resolve) => {
                        img.onload = resolve;
                        img.src = imgData;
                    });

                    // Calcular el escalado proporcional
                    let destWidth, destHeight;
                    const imgAspectRatio = img.width / img.height;
                    const pageAspectRatio = pdfWidth / pdfHeight;

                    if (imgAspectRatio > pageAspectRatio) {
                        // La imagen es más ancha en proporción, escalar por ancho
                        destWidth = pdfWidth;
                        destHeight = pdfWidth / imgAspectRatio;
                    } else {
                        // La imagen es más alta en proporción, escalar por altura
                        destHeight = pdfHeight;
                        destWidth = pdfHeight * imgAspectRatio;
                    }

                    // Calcular la posición para centrar la imagen
                    const xOffset = (pdfWidth - destWidth) / 2;
                    const yOffset = (pdfHeight - destHeight) / 2;

                    // Añadir el contenido capturado al PDF
                    if (i > 0) {
                        pdf.addPage();
                    }
                    
                    // Ajustar imagen para eliminar márgenes y ocupar toda la página
                    pdf.addImage(
                        imgData, 
                        'JPEG', 
                        xOffset,   // Posición X centrada
                        yOffset,   // Posición Y centrada
                        pdfWidth, 
                        pdfHeight, 
                        '', 
                        'NONE'
                    );
    
                    // Restaurar el iframe a su estado original
                    iframe.style.display = 'none';
                    iframe.style.visibility = 'hidden';

                    // Restaurar la firma en el canvas
                    if (signatureDataUrl && signaturePad) {
                        const img = new Image();
                        img.src = signatureDataUrl;
                        const ctx = signaturePad.getContext('2d');
                        ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
                        ctx.drawImage(img, 0, 0);
                    }
    
                } catch (error) {
                    console.error(`Error al capturar el contenido del formulario ${i + 1}:`, error);
                    throw new Error(`Error al capturar el contenido del formulario ${i + 1}. Por favor, intente de nuevo.`);
                }
            }

            const pdfBlob = pdf.output('blob');
            const fileName = 'formularios_completos.pdf';
            const pdfUrl = URL.createObjectURL(pdfBlob);

            showPdfModal(pdfUrl, fileName, pdfBlob);
        } else {
            throw new Error('Formato no soportado');
        }
    }

Cliente ID: 864893015805-nkeecbl7nlds55r0ntif19jvbh2e5tti.apps.googleusercontent.com
mail: imagenesalem@gmail.com