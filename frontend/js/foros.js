const listaForosDiv = document.getElementById("listaForos");

async function cargarForos() {
  try {
    const res = await fetch("http://localhost:8080/api/forums");
    const data = await res.json();

    if (data.status === "error") {
      listaForosDiv.innerHTML = `<p class="text-center">${data.message}</p>`;
      return;
    }

    const foros = data.payload;
    listaForosDiv.innerHTML = "";

    if (!foros || foros.length === 0) {
      listaForosDiv.innerHTML = "<p class='text-center'>No hay foros creados.</p>";
      return;
    }

    foros.forEach(foro => {
      const foroDiv = document.createElement("div");
      foroDiv.classList.add("foro");

      foroDiv.innerHTML = `
        <h3>${foro.name}</h3>
        <p>${foro.description}</p>
        <small>Miembros: ${foro.members?.length || 0}</small>
        <div class="acciones">
          <button class="btn btn-success btn-sm me-2" data-id="${foro._id}">Unirme</button>
          <button class="btn btn-danger btn-sm" data-id="${foro._id}">Salir</button>
        </div>
      `;

      listaForosDiv.appendChild(foroDiv);
    });

    document.querySelectorAll(".btn-success").forEach(btn =>
      btn.addEventListener("click", () => joinForum(btn.dataset.id))
    );

    document.querySelectorAll(".btn-danger").forEach(btn =>
      btn.addEventListener("click", () => leaveForum(btn.dataset.id))
    );

  } catch (err) {
    console.error(err);
    listaForosDiv.innerHTML = "<p class='text-center'>Error al cargar los foros.</p>";
  }
}

async function joinForum(forumId) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  if (!token || !userId) return alert("Debes iniciar sesión.");

  try {
    const res = await fetch(`http://localhost:8080/api/forums/${forumId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();
    alert(data.message);
    cargarForos();

  } catch (err) {
    console.error(err);
    alert("Error al unirse al foro");
  }
}

async function leaveForum(forumId) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  if (!token || !userId) return alert("Debes iniciar sesión.");

  try {
    const res = await fetch(`http://localhost:8080/api/forums/${forumId}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();
    alert(data.message);
    cargarForos();

  } catch (err) {
    console.error(err);
    alert("Error al salir del foro");
  }
}

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

cargarForos();