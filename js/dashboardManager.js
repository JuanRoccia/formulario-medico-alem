import { linkGenerator } from './linkGenerator.js';

export class DashboardManager {
    constructor() {
        this.generateButton = null;
        this.linkInput = null;
        this.generatedLinkDiv = null;
    }

    initialize() {
        // Inicializar elementos del DOM
        this.generateButton = document.getElementById('generateButton');
        this.linkInput = document.getElementById('linkInput');
        this.generatedLinkDiv = document.getElementById('generatedLink');
        const copyButton = document.getElementById('copyButton');

        // Configurar event listeners
        if (this.generateButton) {
            this.generateButton.addEventListener('click', () => this.handleGenerateLink());
        }

        if (copyButton) {
            copyButton.addEventListener('click', () => this.handleCopyLink());
        }
    }

    handleGenerateLink() {
        // Generar enlace
        const link = linkGenerator.generateLink();
        
        if (link) {
            // Mostrar enlace generado
            if (this.linkInput) {
                this.linkInput.value = link;
            }
            
            if (this.generatedLinkDiv) {
                this.generatedLinkDiv.classList.remove('hidden');
            }
        }
    }

    handleCopyLink() {
        const link = this.linkInput.value;
        
        if (link) {
            linkGenerator.copyToClipboard(link);
        }
    }
}

// Exportar una instancia del gestor del dashboard
export const dashboardManager = new DashboardManager();