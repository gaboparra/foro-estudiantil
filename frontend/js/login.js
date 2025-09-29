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
      // Guardar token y userId en localStorage
      localStorage.setItem("token", data.payload.token);
      localStorage.setItem("userId", data.payload.user._id);

      alert("Inicio de sesión exitoso.");
      window.location.href = "./index.html";
    } else {
      alert(data.message || "Error al iniciar sesión.");
    }

  } catch (err) {
    console.error(err);
    alert("No se pudo iniciar sesión.");
  }
});