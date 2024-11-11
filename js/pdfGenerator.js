import { signaturePadManager } from './signaturePadManager.js';

export class PDFGenerator {
    async generatePDF(iframes) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        for (let i = 0; i < iframes.length; i++) {
            const iframe = iframes[i];
            
            try {
                // Capturar contenido del iframe
                const canvas = await html2canvas(iframe.contentDocument.body, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });
                const imgData = canvas.toDataURL('image/jpeg');

                // Añadir imagen al PDF
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

                // Capturar y añadir firma si existe
                const signaturePad = iframe.contentDocument.getElementById('signature-pad');
                if (signaturePad) {
                    const signatureImg = signaturePad.toDataURL();
                    if (signatureImg && signatureImg !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==') {
                        pdf.addPage();
                        pdf.addImage(signatureImg, 'PNG', 10, 10, 190, 50);
                    }
                }

            } catch (error) {
                console.error(`Error al procesar formulario ${i + 1}:`, error);
            }
        }

        return pdf;
    }
}

export const pdfGenerator = new PDFGenerator();