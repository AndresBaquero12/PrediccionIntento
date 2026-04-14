import { loginOrRegister } from "@/actions";
import { redirect } from "next/navigation";

export default function Home() {
  async function onSubmit(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    
    const user = await loginOrRegister(username, email);
    
    // Simplest approach: put user ID in a cookie or simply query params for this basic example
    // As basic implementation, we'll redirect to dashboard with user id in query params (not secure, but fast for this basic level)
    redirect(`/dashboard?userId=${user.id}`);
  }

  return (
    <div className="container">
      <main className="form-wrapper">
        <h1 className="title">
          <span>Pronósticos</span> Deportivos
        </h1>
        <p className="subtitle">Demuestra cuánto sabes en la fase de grupos</p>
        
        <form action={onSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              placeholder="Ej: juanperez10" 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico (Opcional)</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Ej: juan@mail.com" 
            />
          </div>

          <button type="submit" className="primary-btn">
            Entrar / Registrarme
          </button>
        </form>
      </main>
    </div>
  );
}
