import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../../../data/supabase"
import { userRepo } from "#repository/databaseRepositoryImpl.tsx";
import type { User } from "#domain/models.ts";

export default function LoginPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await userRepo.getAll();
      if (data) setUsers(data)
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
        setError('El correo no autorizado.');
        return;
      }

      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });

      if (signError) {
        setError(signError.message ?? String(signError));
        return;
      }

      // success
      setError("");
      navigate('/');
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Iniciar sesión</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Si no tienes cuenta, <Link to="/auth/register">crea una</Link>
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
                Iniciar sesión
              </button>
            </div>
            {error && <p className="text-red-600 text-center pt-4">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}