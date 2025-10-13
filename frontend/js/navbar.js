if (localStorage.getItem("token")) {
  document.getElementById("navLogin").style.display = "none";
  document.getElementById("navRegister").style.display = "none";
  document.getElementById("navPerfil").style.display = "block";
  document.getElementById("navLogout").style.display = "block";
}

function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  alert("Sesión cerrada");
  window.location.href = "index.html";
}