const listaForosDiv = document.getElementById("listaForos");
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

async function cargarForos() {
  try {
    const res = await fetch("http://localhost:8080/api/forums");
    const data = await res.json();

    if (data.status === "error") {
      listaForosDiv.innerHTML = `<div class="no-foros"><p>${data.message}</p></div>`;
      return;
    }

    const foros = data.payload;
    listaForosDiv.innerHTML = "";

    if (!foros || foros.length === 0) {
      listaForosDiv.innerHTML = `
        <div class="no-foros">
          <h3>No hay foros disponibles</h3>
          <p>Sé el primero en crear uno desde la página de inicio</p>
        </div>
      `;
      return;
    }

    foros.forEach(foro => {
      const foroDiv = document.createElement("div");
      foroDiv.classList.add("foro-card");

      const premiumBadge = foro.isPremium ? '<span class="badge-premium">Premium</span>' : '';
      const isCreator = foro.creator._id === userId;
      const isMember = foro.members.some(member => member._id === userId);

      let memberButtons = '';
      if (!isMember) {
        memberButtons = `<button class="btn btn-success btn-sm" onclick="joinForum('${foro._id}')">Unirme</button>`;
      } else {
        memberButtons = `<button class="btn btn-outline-danger btn-sm" onclick="leaveForum('${foro._id}')">Salir</button>`;
      }

      let deleteButton = '';
      if (isCreator) {
        deleteButton = `<button class="btn btn-danger btn-sm ms-2" onclick="deleteForum('${foro._id}')">Eliminar</button>`;
      }

      foroDiv.innerHTML = `
        <div class="foro-header">
          <h3 class="foro-title">${foro.name}</h3>
          ${premiumBadge}
        </div>
        <p class="foro-description">${foro.description}</p>
        <p class="text-muted small">Creador: ${foro.creator.username}</p>
        <div class="foro-footer">
          <div class="miembros-count">
            <strong>${foro.members?.length || 0}</strong> miembros | 
            <strong>${foro.posts?.length || 0}</strong> posts
          </div>
          <div class="d-flex btn-group-acciones">
            <button class="btn btn-primary btn-sm" onclick="verForo('${foro._id}')">Ver Foro</button>
            ${memberButtons}
            ${deleteButton}
          </div>
        </div>
      `;

      listaForosDiv.appendChild(foroDiv);
    });

  } catch (err) {
    console.error(err);
    listaForosDiv.innerHTML = `
      <div class="no-foros">
        <h3>Error al cargar los foros</h3>
        <p>Por favor, intenta nuevamente más tarde</p>
      </div>
    `;
  }
}

function verForo(forumId) {
  window.location.href = `forum-detalle.html?id=${forumId}`;
}

async function joinForum(forumId) {
  if (!token || !userId) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
    return;
  }

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
    if (data.status === "success") {
      cargarForos();
    }

  } catch (err) {
    console.error(err);
    alert("Error al unirse al foro");
  }
}

async function leaveForum(forumId) {
  if (!token || !userId) {
    alert("Debes iniciar sesión.");
    return;
  }

  if (!confirm("¿Estás seguro de que quieres salir de este foro?")) {
    return;
  }

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
    if (data.status === "success") {
      cargarForos();
    }

  } catch (err) {
    console.error(err);
    alert("Error al salir del foro");
  }
}

async function deleteForum(forumId) {
  if (!token || !userId) {
    alert("Debes iniciar sesión.");
    return;
  }

  if (!confirm("¿Estás seguro de que quieres eliminar este foro? Esta acción no se puede deshacer y eliminará todas las publicaciones.")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/forums/${forumId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();
    alert(data.message);
    if (data.status === "success") {
      cargarForos();
    }

  } catch (err) {
    console.error(err);
    alert("Error al eliminar el foro");
  }
}

cargarForos();