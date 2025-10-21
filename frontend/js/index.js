const abrirModalBtn = document.getElementById("abrirModalBtn");
const crearForoBtn = document.getElementById("crearForoBtn");
const modal = new bootstrap.Modal(document.getElementById("modal"));

abrirModalBtn.addEventListener("click", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: 'ForoEstudio',
      text: 'Debes iniciar sesión para crear un foro',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }
  modal.show();
});

crearForoBtn.addEventListener("click", async () => {
  const name = document.getElementById("forumName").value.trim();
  const description = document.getElementById("forumDescription").value.trim();
  const isPremium = document.getElementById("forumPremium").checked;
  const creator = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!name || !description) {
    Swal.fire({ title: 'ForoEstudio', text: 'Por favor completa todos los campos', confirmButtonText: 'Aceptar' });
    return;
  }

  if (!creator || !token) {
    Swal.fire({ title: 'ForoEstudio', text: 'Debes iniciar sesión', confirmButtonText: 'Aceptar' }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/forums", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, isPremium, creator })
    });

    const data = await res.json();

    if (data.status === "success") {
      await Swal.fire({ title: 'ForoEstudio', text: 'Foro creado exitosamente', confirmButtonText: 'Aceptar' });
      modal.hide();
      window.location.href = "foros.html";
    } else {
      Swal.fire({ title: 'ForoEstudio', text: data.message || 'Error al crear el foro', confirmButtonText: 'Aceptar' });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ title: 'ForoEstudio', text: 'Error al crear el foro. Verifica tu conexión.', confirmButtonText: 'Aceptar' });
  }
});
