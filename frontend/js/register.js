const form = document.getElementById("registroForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (data.status === "success") {
      // ✅ Corregido: acceder directamente a payload
      const token = data.payload.token;
      const userId = data.payload._id;
      
      // Guardar en variables temporales (no localStorage para Claude.ai)
      // En tu entorno local, usa localStorage normalmente
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("username", data.payload.username);

      alert("Registro exitoso. Bienvenido " + data.payload.username);
      window.location.href = "index.html";
    } else {
      alert(data.message || "Error al registrarse.");
    }

  } catch (err) {
    console.error("Error completo:", err);
    alert("No se pudo registrar el usuario. Verifica que el servidor esté corriendo.");
  }
});