import { useEffect } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

export default function DashBoard(){
    useEffect(() => {
        // Esto inicializa el chatbot y crea el ícono flotante.
        // La librería se encarga de mostrar/ocultar el chat al hacer clic.
        createChat({
            webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
            webhookConfig: {
                method: 'POST',
                headers: {}
            },
            target: '#n8n-chat',
            mode: 'window',
            chatInputKey: 'chatInput',
            chatSessionKey: 'sessionId',
            loadPreviousSession: true,
            metadata: {},
            showWelcomeScreen: false,
            defaultLanguage: 'es',
            initialMessages: [
                'Hola soy tu Asistente Vacacional',
                'En que te puedo ayudar hoy?'
            ],
            i18n: {
                en: {
                    title: 'Hi there! 👋',
                    subtitle: "Start a chat. We're here to help you 24/7.",
                    footer: '',
                    getStarted: 'New Conversation',
                    inputPlaceholder: 'Type your question..',
                },
            },
            enableStreaming: false,
        });


        // El array de dependencias vacío [] asegura que esto se ejecute solo una vez.
    }, []);

    return (
        < >
            <div className="p-4">Bienvenido al dashboard</div>
            {/* El chatbot se montará en el <body>, no necesitas un div específico aquí. */}
        </>
    )
}