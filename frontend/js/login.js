const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.status === "success") {
      localStorage.setItem("token", data.payload.token);
      localStorage.setItem("userId", data.payload.user._id);

      await Swal.fire({
        title: 'ForoEstudio',
        text: 'Inicio de sesión exitoso.',
        confirmButtonText: 'Aceptar'
      });
      window.location.href = "./index.html";
    } else {
      Swal.fire({
        title: 'ForoEstudio',
        text: data.message || "Error al iniciar sesión.",
        confirmButtonText: 'Aceptar'
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: 'ForoEstudio',
      text: 'No se pudo iniciar sesión.',
      confirmButtonText: 'Aceptar'
    });
  }
});
