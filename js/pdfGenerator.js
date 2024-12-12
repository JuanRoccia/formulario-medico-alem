import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import html2canvas from 'html2canvas';

export async function generatePdfWithPdfLib(formContainer) {
  // Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create();
  const formIframes = formContainer.getElementsByTagName('iframe');

  for (let i = 0; i < formIframes.length; i++) {
    const iframe = formIframes[i];

    try {
      // Capturar el contenido del iframe como canvas
      const canvas = await html2canvas(iframe.contentDocument.body, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Convertir canvas a imagen embebida en el PDF
      const imgBytes = await canvas.toBlob();
      const imgBuffer = await imgBytes.arrayBuffer();
      const img = await pdfDoc.embedPng(imgBuffer);

      // Crear una página nueva y ajustar la imagen
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const imgAspectRatio = img.width / img.height;
      const pageAspectRatio = width / height;

      let drawWidth, drawHeight, x, y;
      if (imgAspectRatio > pageAspectRatio) {
        // Escalar por ancho
        drawWidth = width;
        drawHeight = width / imgAspectRatio;
        x = 0;
        y = (height - drawHeight) / 2;
      } else {
        // Escalar por altura
        drawHeight = height;
        drawWidth = height * imgAspectRatio;
        x = (width - drawWidth) / 2;
        y = 0;
      }

      // Dibujar la imagen en la página
      page.drawImage(img, {
        x: x,
        y: y,
        width: drawWidth,
        height: drawHeight
      });
    } catch (error) {
      console.error(`Error al procesar formulario ${i + 1}:`, error);
      console.error(`Error al procesar formulario ${i + 1}:`, error);

    }
  }

  // Guardar el PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  return { pdfUrl: url, pdfBlob: blob };
}