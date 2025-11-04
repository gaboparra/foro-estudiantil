const listaForosDiv = document.getElementById("listaForos");
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

const abrirModalBtn = document.getElementById("abrirModalBtn");
const crearForoBtn = document.getElementById("crearForoBtn");
const modal = new bootstrap.Modal(document.getElementById("modal"));

abrirModalBtn.addEventListener("click", () => {
  if (!token) {
    Swal.fire({
      title: 'La cobra te dice:',
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
    Swal.fire({ 
      title: 'La cobra te dice:', 
      text: 'Por favor completa todos los campos', 
      confirmButtonText: 'Aceptar' 
    });
    return;
  }

  if (!creator || !token) {
    Swal.fire({ 
      title: 'La cobra te dice:', 
      text: 'Debes iniciar sesión', 
      confirmButtonText: 'Aceptar' 
    }).then(() => {
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
      await Swal.fire({ 
        title: 'La cobra te dice:', 
        text: 'Foro creado exitosamente', 
        confirmButtonText: 'Aceptar' 
      });
      modal.hide();

      document.getElementById("forumName").value = '';
      document.getElementById("forumDescription").value = '';
      document.getElementById("forumPremium").checked = false;

      cargarForos();
    } else {
      Swal.fire({ 
        title: 'La cobra te dice:', 
        text: data.message || 'Error al crear el foro', 
        confirmButtonText: 'Aceptar' 
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ 
      title: 'La cobra te dice:', 
      text: 'Error al crear el foro. Verifica tu conexión.', 
      confirmButtonText: 'Aceptar' 
    });
  }
});

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
          <p>Sé el primero en crear uno</p>
        </div>
      `;
      return;
    }

    foros.forEach(foro => {
      const foroDiv = document.createElement("div");
      foroDiv.classList.add("foro-card");

      if (foro.isPinned) {
        foroDiv.classList.add("foro-pinned");
      }

      const premiumBadge = foro.isPremium ? '<span class="badge-premium">Premium</span>' : '';
      const pinnedBadge = foro.isPinned ? '<span class="badge-pinned">Fijado</span>' : '';

      const isCreator = foro.creator._id === userId;
      const isMember = foro.members.some(member => member._id === userId);

      let memberButtons = '';
      if (!isMember) {
        memberButtons = `<button class="btn btn-success btn-sm" onclick="joinForum('${foro._id}')">Unirme</button>`;
      } else {
        memberButtons = `<button class="btn btn-outline-danger btn-sm" onclick="leaveForum('${foro._id}')">Salir</button>`;
      }

      let creatorButtons = '';
      if (isCreator) {
        const pinText = foro.isPinned ? 'Desfijar' : 'Fijar';
        creatorButtons = `
          <button class="btn btn-warning btn-sm ms-2" onclick="togglePinForum('${foro._id}')">
            ${pinText}
          </button>
          <button class="btn btn-danger btn-sm ms-2" onclick="deleteForum('${foro._id}')">Eliminar</button>
        `;
      }

      foroDiv.innerHTML = `
        <div class="foro-header">
          <h3 class="foro-title">${foro.name}</h3>
          <div>
            ${pinnedBadge}
            ${premiumBadge}
          </div>
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
            ${creatorButtons}
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
    Swal.fire({
      title: 'La cobra te dice:',
      text: 'Debes iniciar sesión',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      window.location.href = "login.html";
    });
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
    
    Swal.fire({
      title: 'La cobra te dice:',
      text: data.message,
      confirmButtonText: 'Aceptar'
    });
    
    if (data.status === "success") {
      cargarForos();
    }

  } catch (err) {
    console.error(err);
    Swal.fire({
      title: 'La cobra te dice:',
      text: 'Error al unirse al foro',
      confirmButtonText: 'Aceptar'
    });
  }
}

async function leaveForum(forumId) {
  if (!token || !userId) {
    Swal.fire({
      title: 'La cobra te dice:',
      text: 'Debes iniciar sesión',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const result = await Swal.fire({
    title: 'La cobra te dice:',
    text: '¿Estás seguro de que quieres salir de este foro?',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) {
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
    
    Swal.fire({
      title: 'La cobra te dice:',
      text: data.message,
      confirmButtonText: 'Aceptar'
    });
    
    if (data.status === "success") {
      cargarForos();
    }

  } catch (err) {
    console.error(err);
    Swal.fire({
      title: 'La cobra te dice:',
      text: 'Error al salir del foro',
      confirmButtonText: 'Aceptar'
    });
  }
}

async function togglePinForum(forumId) {
  if (!token || !userId) {
    Swal.fire({
      title: 'La cobra te dice:',
      text: 'Debes iniciar sesión',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/forums/${forumId}/pin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();
    
    Swal.fire({
      title: 'La cobra te dice:',
      text: data.message,
      confirmButtonText: 'Aceptar'
    });
    
    if (data.status === "success") {
      cargarForos();
    }

  } catch (err) {
    console.error(err);
    Swal.fire({
      title: 'La cobra te dice:',
      text: 'Error al fijar/desfijar el foro',
      confirmButtonText: 'Aceptar'
    });
  }
}

async function deleteForum(forumId) {
  if (!token || !userId) {
    Swal.fire({
      title: 'La cobra te dice:',
      text: 'Debes iniciar sesión',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const result = await Swal.fire({
    title: 'La cobra te dice:',
    text: '¿Estás seguro de que quieres eliminar este foro? Esta acción no se puede deshacer y eliminará todas las publicaciones.',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33'
  });

  if (!result.isConfirmed) {
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
    
    Swal.fire({
      title: 'La cobra te dice:',
      text: data.message,
      confirmButtonText: 'Aceptar'
    });
    
    if (data.status === "success") {
      cargarForos();
    }

  } catch (err) {
    console.error(err);
    Swal.fire({
      title: 'La cobra te dice:',
      text: 'Error al eliminar el foro',
      confirmButtonText: 'Aceptar'
    });
  }
}

cargarForos();