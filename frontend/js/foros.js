const listaForosDiv = document.getElementById("listaForos");

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
          <div class="no-foros-icon">📋</div>
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

      foroDiv.innerHTML = `
        <div class="foro-header">
          <h3 class="foro-title">${foro.name}</h3>
          ${premiumBadge}
        </div>
        <p class="foro-description">${foro.description}</p>
        <div class="foro-footer">
          <div class="miembros-count">
            👥 <strong>${foro.members?.length || 0}</strong> miembros
          </div>
          <div class="d-flex btn-group-acciones">
            <button class="btn btn-success btn-sm" onclick="joinForum('${foro._id}')">Unirme</button>
            <button class="btn btn-outline-danger btn-sm" onclick="leaveForum('${foro._id}')">Salir</button>
          </div>
        </div>
      `;

      listaForosDiv.appendChild(foroDiv);
    });

  } catch (err) {
    console.error(err);
    listaForosDiv.innerHTML = `
      <div class="no-foros">
        <div class="no-foros-icon">⚠️</div>
        <h3>Error al cargar los foros</h3>
        <p>Por favor, intenta nuevamente más tarde</p>
      </div>
    `;
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

cargarForos();