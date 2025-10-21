import { useEffect, useState } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx';
import { userRepo } from '#repository/databaseRepositoryImpl.tsx';

export default function DashBoard(){
    const [vacationDays, setVacationDays] = useState<number>(0)
    const { user } = useVerifyAuth()
    useEffect(() => {
        async function fetchVacationDays() {
            if (!user) return;
            const { data, error } = await userRepo.getVacationBalance(user.employedID) 
            if (error) throw error
            if (data) {
                setVacationDays(data.totalAvailable)
            }
        } fetchVacationDays()
    }, [])

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
                es: {
                    title: '¡Hola! 👋',
                    subtitle: "Inicia un chat. Estamos aquí para ayudarte 24/7.",
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
            <div className="p-4">Bienvenido al dashboard {vacationDays} días de vacaciones disponibles</div>
            {/* El chatbot se montará en el <body>, no necesitas un div específico aquí. */}
        </>
    )
}