const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if (!token || !userId) {
  alert("Debes iniciar sesión para ver tu perfil.");
  window.location.href = "login.html";
}

async function cargarPerfil() {
  try {
    const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.status === "error") {
      alert(data.message);
      return;
    }

    const user = data.payload;

    document.getElementById("username").textContent = user.username;
    document.getElementById("email").textContent = user.email;

    // const fecha = new Date(user.createdAt).toLocaleDateString('es-ES', {
    //   year: 'numeric',
    //   month: 'long',
    //   day: 'numeric'
    // });
    // document.getElementById("fechaRegistro").textContent = fecha;

  } catch (err) {
    console.error(err);
    alert("Error al cargar el perfil");
  }
}

async function cargarMisForos() {
  try {
    const res = await fetch("http://localhost:8080/api/forums");
    const data = await res.json();

    if (data.status === "error") {
      document.getElementById("misForos").innerHTML = `<p class="text-muted">${data.message}</p>`;
      return;
    }

    const foros = data.payload;
    const misForosDiv = document.getElementById("misForos");

    const forosUsuario = foros.filter(foro =>
      foro.members && foro.members.includes(userId)
    );

    if (forosUsuario.length === 0) {
      misForosDiv.innerHTML = '<p class="text-muted">No estás unido a ningún foro.</p>';
      return;
    }

    misForosDiv.innerHTML = "";

    forosUsuario.forEach(foro => {
      const foroDiv = document.createElement("div");
      foroDiv.classList.add("foro-item");

      foroDiv.innerHTML = `
        <h5>${foro.name}</h5>
        <p>${foro.description}</p>
      `;

      misForosDiv.appendChild(foroDiv);
    });

  } catch (err) {
    console.error(err);
    document.getElementById("misForos").innerHTML = '<p class="text-muted">Error al cargar tus foros.</p>';
  }
}

cargarPerfil();
cargarMisForos();