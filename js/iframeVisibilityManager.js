// iframeVisibilityManager.js
window.addEventListener('load', function() { // Wait for the DOM to fully load before executing
    // Obtain the specific containers
    const mainContainer = document.getElementById('mainContainer');
    const formContainer = document.getElementById('formContainer');

    if (!mainContainer || !formContainer) {
        console.log('Required containers not found');
        return;
    }

    // Get all iframes within the containers
    const mainIframes = mainContainer.querySelectorAll('iframe');
    const formIframes = formContainer.querySelectorAll('iframe');

    // Function to hide iframes except the first one
    const hideIframesExceptFirst = (iframes) => {
        if (!iframes.length) return;

        iframes.forEach((iframe, index) => {
            if (index !== 0) {
                iframe.classList.add('hidden');
            }
        });
    };

    // Apply the visibility management to each container
    hideIframesExceptFirst(mainIframes);
    hideIframesExceptFirst(formIframes);

    // Quitar el hidden al ultimo formulario pero cuando se encuentre en el mismo, una referencia de esto puede ser cual el boton de siguiente pasa ser de finalizar
    // Obtener el último formulario seleccionado
    const lastSelectedForm = sessionStorage.getItem('lastSelectedForm');
    if (lastSelectedForm) {
        // Buscar el iframe correspondiente al último formulario seleccionado
        const lastSelectedIframe = Array.from(formIframes).find(iframe => {
            const currentFormValue = formManager.getCurrentFormValue(iframe);
            return currentFormValue === lastSelectedForm;
        });

        // Si se encuentra el iframe, quitar el hidden
        if (lastSelectedIframe) {
            lastSelectedIframe.classList.remove('hidden');
        }
    }
    // Quitar el hidden al ultimo formulario
    const lastForm = formIframes[formIframes.length - 1];
    // if (lastForm) {
    //     lastForm.classList.remove('hidden');
    // }
    // Quitar el hidden al ultimo formulario
    const lastMain = mainIframes[mainIframes.length - 1];
    // if (lastMain) {
    //     lastMain.classList.remove('hidden');
    // }
});