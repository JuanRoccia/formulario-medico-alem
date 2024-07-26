El problema que estás experimentando con la firma en el segundo formulario parece estar relacionado con cómo se inicializa y maneja el componente de firma en cada formulario. Vamos a analizar el código y proponer una solución:

Inicialización del pad de firma:
En ambos formularios, estás inicializando el pad de firma de la misma manera, pero hay algunas diferencias en cómo se maneja el evento DOMContentLoaded.
Manejo de eventos:
Los eventos para el pad de firma se están agregando correctamente, pero el evento de envío del formulario está intentando acceder a un elemento con id 'myForm' que no existe en ninguno de los HTML proporcionados.
Problemas de scope:
Las variables canvas y signaturePad se declaran en el scope global, lo que podría causar conflictos cuando se cargan múltiples formularios en la misma página.

Para solucionar estos problemas, te sugiero hacer los siguientes cambios:

Encapsula toda la lógica del pad de firma en una función que se pueda llamar para cada formulario.
Asegúrate de que los IDs de los elementos sean únicos en cada formulario.
Usa querySelector en lugar de getElementById para seleccionar elementos dentro del iframe.

Aquí tienes un ejemplo de cómo podrías modificar el código en ambos formularios:
javascriptCopyfunction initializeSignaturePad(formDocument) {
  const canvas = formDocument.querySelector('#signature-pad');
  const signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)'
  });

  formDocument.querySelector('#clear').addEventListener('click', function() {
    signaturePad.clear();
  });

  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    canvas.style.width = canvas.offsetWidth + 'px';
    canvas.style.height = canvas.offsetHeight + 'px';
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    signaturePad.clear();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Resto del código para manejar eventos táctiles y de ratón...

  return signaturePad;
}

document.addEventListener("DOMContentLoaded", function() {
  const signaturePad = initializeSignaturePad(document);
  
  document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (signaturePad.isEmpty()) {
      alert('Por favor, proporcione una firma.');
    } else {
      const signatureData = signaturePad.toDataURL();
      console.log(signatureData);
      // Continúa con el envío del formulario
    }
  });
});
Asegúrate de aplicar estos cambios en ambos archivos HTML (form-1.html y form-2.html).
Además, en el archivo forms.html, donde cargas los iframes, podrías agregar un paso adicional para inicializar el pad de firma en cada iframe después de que se cargue:
javascriptCopyfunction setupFormValidation(iframe, index) {
  const iframeDocument = iframe.contentWindow.document;
  const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');

  requiredInputs.forEach(input => {
    input.addEventListener('change', () => checkFormCompleteness(iframe));
  });

  // Inicializar el pad de firma
  const signaturePad = initializeSignaturePad(iframeDocument);

  // Verificar completitud inicial
  checkFormCompleteness(iframe);
}
Estos cambios deberían resolver el problema de la firma en el segundo formulario, asegurando que cada formulario tenga su propio pad de firma inicializado correctamente.

Como deberia quedar el script del form-2.html:
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js"></script>
      
      <script>
        function initializeSignaturePad(formDocument) {
          const canvas = formDocument.querySelector('#signature-pad-2');
          const signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)'
          });
      
          formDocument.querySelector('#clear').addEventListener('click', function() {
            signaturePad.clear();
          });
      
          function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            canvas.style.width = canvas.offsetWidth + 'px';
            canvas.style.height = canvas.offsetHeight + 'px';
            const ctx = canvas.getContext("2d");
            ctx.scale(ratio, ratio);
            signaturePad.clear();
          }
      
          function getMousePos(canvas, evt) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
              x: (evt.clientX - rect.left) * scaleX,
              y: (evt.clientY - rect.top) * scaleY
            };
          }
      
          const originalOnMouseDown = signaturePad._onMouseDown;
          signaturePad._onMouseDown = function(event) {
            const position = getMousePos(canvas, event);
            originalOnMouseDown.call(this, { ...event, clientX: position.x, clientY: position.y });
          };
      
          const originalOnMouseMove = signaturePad._onMouseMove;
          signaturePad._onMouseMove = function(event) {
            const position = getMousePos(canvas, event);
            originalOnMouseMove.call(this, { ...event, clientX: position.x, clientY: position.y });
          };
      
          canvas.addEventListener('touchstart', function(event) {
            const touch = event.touches[0];
            const mouseEvent = new MouseEvent("mousedown", {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
          }, false);
      
          canvas.addEventListener('touchmove', function(event) {
            const touch = event.touches[0];
            const mouseEvent = new MouseEvent("mousemove", {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
          }, false);
      
          canvas.addEventListener('touchend', function() {
            const mouseEvent = new MouseEvent("mouseup", {});
            canvas.dispatchEvent(mouseEvent);
          }, false);
      
          window.addEventListener('load', resizeCanvas);
          window.addEventListener('resize', resizeCanvas);
      
          return signaturePad;
        }
      
        document.addEventListener("DOMContentLoaded", function() {
          const signaturePad = initializeSignaturePad(document);
          
          document.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (signaturePad.isEmpty()) {
              alert('Por favor, proporcione una firma.');
            } else {
              const signatureData = signaturePad.toDataURL();
              console.log(signatureData);
              // Aquí iría la lógica para enviar el formulario, posiblemente por WhatsApp
              alert('Formulario enviado');
            }
          });
      
          const canvas = document.getElementById("signature-pad-2");
          const container = canvas.parentElement;
          canvas.width = container.clientWidth;
          canvas.height = 200; 
        });
      </script>

      <script>
        // document.addEventListener("DOMContentLoaded", function() {
        //     var canvas = document.getElementById("signature-pad-2");

        //     var container = canvas.parentElement;
        //     canvas.width = container.clientWidth;
        //     canvas.height = 200; 
        //     var signaturePad = new SignaturePad(canvas, {
        //     });
        // });
      </script>


      <script>
        document.getElementById('fecha').addEventListener('input', function (e) {
          let value = this.value.replace(/[^0-9]/g, '');
          if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
          }
          if (value.length > 5) {
            value = value.slice(0, 5) + '/' + value.slice(5);
          }
          this.value = value;
        });
      </script>
      <script>
        document.querySelectorAll('input[name="pregunta-cirugia"]').forEach((elem) => {
          elem.addEventListener('change', function(event) {
            const additionalContent = document.getElementById('additional-content');
            if (event.target.value === 'si') {
              additionalContent.classList.remove('hidden');
              additionalContent.classList.add('block');
            } else {
              additionalContent.classList.remove('block');
              additionalContent.classList.add('hidden');
            }
          });
        });
        document.querySelectorAll('input[name="pregunta-medicacion"]').forEach((elem) => {
          elem.addEventListener('change', function(event) {
            const additionalContent = document.getElementById('additional-medicacion');
            if (event.target.value === 'si') {
              additionalContent.classList.remove('hidden');
              additionalContent.classList.add('block');
            } else {
              additionalContent.classList.remove('block');
              additionalContent.classList.add('hidden');
            }
          });
        });
        document.querySelectorAll('input[name="pregunta-oncologica"]').forEach((elem) => {
          elem.addEventListener('change', function(event) {
            const additionalContent = document.getElementById('additional-onc');
            if (event.target.value === 'si') {
              additionalContent.classList.remove('hidden');
              additionalContent.classList.add('block');
            } else {
              additionalContent.classList.remove('block');
              additionalContent.classList.add('hidden');
            }
          });
        });
        document.querySelectorAll('input[name="pregunta-deporte"]').forEach((elem) => {
          elem.addEventListener('change', function(event) {
            const additionalContent = document.getElementById('additional-deporte');
            if (event.target.value === 'si') {
              additionalContent.classList.remove('hidden');
              additionalContent.classList.add('block');
            } else {
              additionalContent.classList.remove('block');
              additionalContent.classList.add('hidden');
            }
          });
        });
      </script>

      pasalo en limpio