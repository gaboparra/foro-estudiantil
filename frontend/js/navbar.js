if (localStorage.getItem("token")) {
  document.getElementById("navLogin").style.display = "none";
  document.getElementById("navRegister").style.display = "none";
  document.getElementById("navPerfil").style.display = "block";
  document.getElementById("navLogout").style.display = "block";
}

async function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");

  await Swal.fire({
    title: 'ForoEstudio',
    text: 'Sesión cerrada',
    confirmButtonText: 'Aceptar'
  });

  window.location.href = "index.html";
}
