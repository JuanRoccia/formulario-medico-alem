En base a los formularios selecionados aca:
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard del Médico</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans">
    <div class="container mx-auto p-4 max-w-md">
        <!-- Login Form -->
        <div id="loginForm" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h1 class="text-2xl font-bold mb-6 text-gray-800">Iniciar Sesión</h1>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                    Usuario
                </label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Usuario">
            </div>
            <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                    Contraseña
                </label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
            </div>
            <div class="flex items-center justify-between">
                <button id="loginButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                    Iniciar Sesión
                </button>
            </div>
        </div>

        <!-- Dashboard Content (initially hidden) -->
        <div id="dashboardContent" class="hidden">
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h1 class="text-2xl font-bold mb-6 text-gray-800">Dashboard del Médico</h1>
                <div class="mb-4">
                    <label class="inline-flex items-center">
                        <input type="checkbox" id="form1" value="form-1" class="form-checkbox h-5 w-5 text-blue-600">
                        <span class="ml-2 text-gray-700">Formulario 1</span>
                    </label>
                </div>
                <div class="mb-6">
                    <label class="inline-flex items-center">
                        <input type="checkbox" id="form2" value="form-2" class="form-checkbox h-5 w-5 text-blue-600">
                        <span class="ml-2 text-gray-700">Formulario 2</span>
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

    <script>
        const loginForm = document.getElementById('loginForm');
        const dashboardContent = document.getElementById('dashboardContent');
        const loginButton = document.getElementById('loginButton');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const generateButton = document.getElementById('generateButton');
        const form1Checkbox = document.getElementById('form1');
        const form2Checkbox = document.getElementById('form2');
        const generatedLinkDiv = document.getElementById('generatedLink');
        const linkInput = document.getElementById('linkInput');
        const copyButton = document.getElementById('copyButton');
        const alertMessage = document.getElementById('alertMessage');

        loginButton.addEventListener('click', login);
        generateButton.addEventListener('click', generateLink);
        copyButton.addEventListener('click', copyToClipboard);

        function login() {
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (username === 'admin' && password === '123456789') {
                loginForm.classList.add('hidden');
                dashboardContent.classList.remove('hidden');
            } else {
                alert('Credenciales incorrectas. Por favor, intente de nuevo.');
            }
        }

        function generateLink() {
            const selectedForms = [];
            if (form1Checkbox.checked) selectedForms.push(form1Checkbox.value);
            if (form2Checkbox.checked) selectedForms.push(form2Checkbox.value);

            if (selectedForms.length === 0) {
                alert('Por favor, seleccione al menos un formulario.');
                return;
            }

            const baseUrl = 'https://formulario-medico-alem.netlify.app/forms.html?';  // Cambiado a forms.html
            const formParams = selectedForms.map(form => `form=${form}`).join('&');
            const fullLink = `${baseUrl}${formParams}`;

            linkInput.value = fullLink;
            generatedLinkDiv.classList.remove('hidden');
        }

        function copyToClipboard() {
            linkInput.select();
            document.execCommand('copy');
            
            alertMessage.classList.remove('hidden');
            setTimeout(() => {
                alertMessage.classList.add('hidden');
            }, 3000);
        }
    </script>
</body>
</html>

quisiera que los nombre de los mismos, por ejemplo si se selecciona "Formulaio 1" en el checkbox, se muestre luego en el forms.hmtml que se encarga de mostrar los formularios selecionados, para tener una informacion mas clara de los formularios que se estan seleccionando una vez ya en forms.html:
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formularios del Paciente</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
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
    </style>
</head>
<body class="bg-gray-100 font-sans">
    <div id="mainContainer" class="container mx-auto p-4 flex flex-col">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Formularios del Paciente</h1>
        <div id="formContainer" class="mb-4">
            <!-- Los iframes se insertarán aquí dinámicamente -->
        </div>
    </div>
    <div id="navigationContainer" class="w-full">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <button id="prevBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50" disabled>Anterior</button>
            <div id="pageIndicator" class="text-gray-700"></div>
            <button id="nextBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Siguiente</button>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const forms = urlParams.getAll('form');
            const formContainer = document.getElementById('formContainer');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const pageIndicator = document.getElementById('pageIndicator');
            let currentFormIndex = 0;

            function createIframes() {
                forms.forEach((form, index) => {
                    const iframe = document.createElement('iframe');
                    iframe.src = `${form}.html`;
                    iframe.className = 'w-full h-full border-0 top-0 left-0 transition-opacity duration-300';
                    iframe.style.display = index === 0 ? 'block' : 'none';
                    iframe.style.opacity = index === 0 ? '1' : '0';
                    
                    iframe.addEventListener('load', function() {
                        adjustIframeHeight(this);
                        setupFormValidation(this, index);
                    });

                    iframe.addEventListener('error', function() {
                        console.error(`Error al cargar el formulario: ${form}.html`);
                        // Manejar el error, tal vez mostrar un mensaje al usuario
                    });
                    
                    formContainer.appendChild(iframe);
                });
            }

            function adjustIframeHeight(iframe) {
                iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
                iframe.contentWindow.document.documentElement.style.overflow = 'hidden';
                iframe.contentWindow.document.documentElement.style.scrollbarWidth = 'none';
                iframe.contentWindow.document.documentElement.style.webkitScrollbar = 'display: none';
                
                const resizeObserver = new ResizeObserver(() => {
                    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
                });
                resizeObserver.observe(iframe.contentWindow.document.body);
            }

            function setupFormValidation(iframe, index) {
                const iframeDocument = iframe.contentWindow.document;
                const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
            
                requiredInputs.forEach(input => {
                    input.addEventListener('change', () => checkFormCompleteness(iframe));
                });

                // Verificar completitud inicial
                checkFormCompleteness(iframe);
            }

            function checkFormCompleteness(iframe) {
                const iframeDocument = iframe.contentWindow.document;
                const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
                console.log('requiredInputs:', requiredInputs);

                let isComplete = true;
                requiredInputs.forEach(input => {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        const name = input.name;
                        const checkedInputs = iframeDocument.querySelectorAll(`input[name="${name}"]:checked`);
                        if (checkedInputs.length === 0) {
                            console.log(`Campo no completado: ${input.name}`);
                            isComplete = false;
                        }
                    } else if (!input.value.trim()) {
                        console.log(`Campo no completado: ${input.name || input.id}`);
                        isComplete = false;
                    }
                });

                // nextBtn.disabled = !isComplete;
                return isComplete;
            }

            function updatePageIndicator() {
                pageIndicator.textContent = `Página ${currentFormIndex + 1} de ${forms.length}`;
            }

            function showForm(index) {
                const iframes = formContainer.getElementsByTagName('iframe');
                Array.from(iframes).forEach((iframe, i) => {
                    if (i === index) {
                        iframe.style.display = 'block';
                        setTimeout(() => { iframe.style.opacity = '1'; }, 50);
                    } else {
                        iframe.style.opacity = '0';
                        setTimeout(() => { iframe.style.display = 'none'; }, 300);
                    }
                });
                currentFormIndex = index;
                updatePageIndicator();
                prevBtn.disabled = currentFormIndex === 0;
                nextBtn.textContent = currentFormIndex === forms.length - 1 ? 'Finalizar' : 'Siguiente';
            }

            prevBtn.addEventListener('click', () => {
                if (currentFormIndex > 0) {
                    showForm(currentFormIndex - 1);
                }
            });

            nextBtn.addEventListener('click', () => {
                // alert('Estas tocando el boton siguiente');
                const currentIframe = formContainer.getElementsByTagName('iframe')[currentFormIndex];
                const iframeDocument = currentIframe.contentWindow.document;
                const requiredInputs = iframeDocument.querySelectorAll('input[required], select[required], textarea[required]');
                
                if (currentIframe && checkFormCompleteness(currentIframe)) {
                    if (currentFormIndex < forms.length - 1) {
                        showForm(currentFormIndex + 1);
                    } else {
                        alert('Has completado todos los formularios.');
                        // Aquí puedes agregar código para enviar los datos o redirigir al usuario
                    }
                } else {
                    let incompleteFields = [];
                    requiredInputs.forEach(input => {
                        if ((input.type === 'checkbox' || input.type === 'radio') && !iframeDocument.querySelector(`input[name="${input.name}"]:checked`)) {
                            incompleteFields.push(input.name);
                        } else if (!input.value.trim()) {
                            incompleteFields.push(input.name || input.id);
                        }
                    });
                    alert(`Por favor, completa los siguientes campos antes de continuar: ${incompleteFields.join(', ')}`);
                }
            });

            if (forms.length === 0) {
                formContainer.innerHTML = '<p class="text-red-500">No se han seleccionado formularios.</p>';
            } else {
                createIframes();
                updatePageIndicator();
            }

        });
    </script>
</body>
</html>