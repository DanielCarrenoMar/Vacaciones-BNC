import supabase from "#repository/Auth/AuthRepository.ts"

export default function RegisterPage() {

    async function handleSubmit(e: any) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (submitBtn) submitBtn.disabled = true;

        const email = (form.email as HTMLInputElement).value;
        const password = (form.password as HTMLInputElement).value;

        try {
            // Use Supabase client to sign up the user
            // supabase-js v2: signUp credentials with metadata in the second arg
            // v1 used auth.signUp returning user/session; handle both shapes
            // @ts-ignore
            const { data, error } = await supabase.auth.signUp(
                { email, password }
            );

            if (error) {
                alert('Error: ' + (error.message ?? String(error)));
            } else {
                // success - in many setups an email confirmation is sent
                alert('Registro enviado. Revisa tu correo para confirmar tu cuenta.');
                form.reset();
            }
        } catch (err: any) {
            alert('Error de conexión: ' + (err?.message ?? String(err)));
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    async function handleOAuth(provider = 'google') {
        try {
            const redirectTo = `${window.location.origin}/dashboard`;
            // Try to use supabase client OAuth helper
            // @ts-ignore
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider as any,
                options: { redirectTo },
            });
            if (error) {
                // If client helper fails, fallback to building URL
                console.warn('supabase OAuth helper error:', error);
                const url = `${(import.meta.env.VITE_SUPABASE_URL as string)}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;
                window.location.href = url;
            } else if (data && data.url) {
                // v1/v2 behavior may differ: if url is provided redirect
                window.location.href = data.url;
            }
        } catch (err: any) {
            const redirectTo = `${window.location.origin}/dashboard`;
            const url = `${(import.meta.env.VITE_SUPABASE_URL as string)}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;
            window.location.href = url;
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crear cuenta</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Usa tu correo para registrarte o inicia con Google
                    </p>
                </div>

                <div className="rounded-lg bg-white px-8 py-6 shadow">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            >
                                Crear cuenta
                            </button>
                        </div>
                    </form>

                    <div className="mt-4 flex items-center">
                        <div className="flex-grow border-t border-gray-200" />
                        <span className="mx-3 text-sm text-gray-500">o</span>
                        <div className="flex-grow border-t border-gray-200" />
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={() => handleOAuth('google')}
                            className="w-full inline-flex items-center justify-center py-2 px-4 border rounded-md shadow-sm bg-white hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#4285F4" d="M533.5 278.4c0-17.8-1.6-35-4.6-51.6H272.1v97.7h146.9c-6.4 34.5-25.9 63.7-55.3 83.2v69.1h89.2c52.3-48.2 82.6-119.1 82.6-198.4z"/>
                                <path fill="#34A853" d="M272.1 544.3c74.6 0 137.2-24.7 182.9-67.2l-89.2-69.1c-25.1 17.1-57.3 27.2-93.8 27.2-72.1 0-133-48.6-154.7-113.9H27.3v71.6C72.9 485.9 167.3 544.3 272.1 544.3z"/>
                                <path fill="#FBBC05" d="M117.4 323.3c-10.6-31.2-10.6-64.8 0-96l-73.4-71.6C12 204.4 0 244.6 0 287s12 82.6 43.9 131.2l73.5-95z"/>
                                <path fill="#EA4335" d="M272.1 107.7c39.9 0 75.8 13.7 104.1 40.6l78-78C403.1 24.3 339.7 0 272.1 0 167.3 0 72.9 58.4 27.3 145.9l73.5 71.6C139.1 156.3 200 107.7 272.1 107.7z"/>
                            </svg>
                            Continuar con Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}