import { userRepo } from "#repository/databaseRepositoryImpl.tsx";
import { useEffect, useState } from "react";
import supabase from "../../../data/supabase"
import { useNavigate } from "react-router-dom";
import type { User } from "#domain/models.ts";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await userRepo.getAll();
            if (data) {
                console.log("Usuarios registrados:", data);
                setUsers(data)
            }
            if (error) console.error(error);
        };
        fetchUsers();
    }, []);

    async function handleSubmit(e: any) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (submitBtn) submitBtn.disabled = true;

        const email = (form.email as HTMLInputElement).value;
        const password = (form.password as HTMLInputElement).value;

        try {
            if (!users.map(u => u.email).includes(email)) {
                alert('El correo no autorizado.')
                return
            }

            const { error } = await supabase.auth.signUp(
                { email, password }
            );

            if (error) {
                alert('Error: ' + (error.message ?? String(error)));
            } else {
                // success - in many setups an email confirmation is sent
                alert('Registro enviado. Inicia sesión.');
                form.reset();
                navigate('/auth/login');
            }
        } catch (err: any) {
            alert('Error de conexión: ' + (err?.message ?? String(err)));
        } finally {
            if (submitBtn) submitBtn.disabled = false;
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
                                className="bg-blue-400 text-white w-full py-2 px-4 rounded-md shadow-sm hover:bg-blue-500"
                            >
                                Crear cuenta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}