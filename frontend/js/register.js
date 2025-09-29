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
      // Guardar token y userId en localStorage
      localStorage.setItem("token", data.payload.token);
      localStorage.setItem("userId", data.payload.user._id);

      alert("Registro exitoso.");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Error al registrarse.");
    }

  } catch (err) {
    console.error(err);
    alert("No se pudo registrar el usuario.");
  }
});