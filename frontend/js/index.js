// Inicializar modal de Bootstrap
const modalElement = document.getElementById("modal");
const modal = new bootstrap.Modal(modalElement);

const abrirModalBtn = document.getElementById("abrirModalBtn");
const crearForoBtn = document.getElementById("crearForoBtn");

abrirModalBtn.addEventListener("click", () => {
  modal.show();
});

// Crear foro
crearForoBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para crear un foro.");
    return;
  }

  const name = document.getElementById("forumName").value.trim();
  const description = document.getElementById("forumDescription").value.trim();
  const isPremium = document.getElementById("forumPremium").checked;

  if (!name || !description) {
    alert("Por favor completa todos los campos.");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/forums", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, isPremium })
    });

    const data = await res.json();

    if (data.status === "error") {
      alert(data.message);
      return;
    }

    alert("Foro creado correctamente");
    modal.hide();
    window.location.href = "foros.html";

  } catch (error) {
    console.error(error);
    alert("Error al crear foro");
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("Sesión cerrada.");
  window.location.href = "index.html";
});

// Perfil
document.getElementById("perfilBtn").addEventListener("click", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para ver el perfil.");
  } else {
    window.location.href = "perfil.html";
  }
});
