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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary">EnterpriseVacation</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Bienvenido de vuelta</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Si no tienes cuenta,{' '}
            <Link to="/auth/register" className="font-medium text-primary hover:text-primary-dark">
              crea una
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="block text-sm mb-2 font-medium text-gray-700">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="dacarreno.24@est.ucab.edu.ve"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mt-2 mb-2 font-medium text-gray-700">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="123456"
                required
                minLength={6}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primaryVar focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Iniciar sesión
            </button>
          </div>
          {error && <p className="text-red-600 text-center text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
}