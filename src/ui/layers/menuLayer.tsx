import LateralMenu from '../components/LateralMenu'
import { useEffect } from 'react'
import { createChat } from '@n8n/chat'
import '@n8n/chat/style.css'
import { Outlet } from 'react-router-dom'
import { useVerifyAuth } from '#providers/VerifyAuthProvider.tsx'

export default function MenuLayer() {
    const { user, userRole } = useVerifyAuth()
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
    }, []);

    return (
    <div className="h-screen flex bg-[#F5F5F7] overflow-hidden">
        <LateralMenu role={userRole} />
        <main className="flex-1 p-6 flex-col flex overflow-y-auto">
            <header>
                <h1 className="text-2xl font-bold mb-4">Bienvenido, {user?.name}</h1>
            </header>
            <Outlet />
        </main>
    </div>
    )
}
