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
      const token = data.payload.token;
      const userId = data.payload._id;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", data.payload.username);

      await Swal.fire({
        title: 'La cobra te dice:',
        text: 'Registro exitoso. Bienvenido ' + data.payload.username,
        confirmButtonText: 'Aceptar'
      });
      window.location.href = "index.html";
    } else {
      Swal.fire({
        title: 'La cobra te dice:',
        text: data.message || "Error al registrarse.",
        confirmButtonText: 'Aceptar'
      });
    }
  } catch (err) {
    console.error("Error completo:", err);
    Swal.fire({
      title: 'La cobra te dice:',
      text: 'No se pudo registrar el usuario. Verifica que el servidor esté corriendo.',
      confirmButtonText: 'Aceptar'
    });
  }
});
