const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if (!token || !userId) {
  alert("Debes iniciar sesión para ver tu perfil.");
  window.location.href = "login.html";
}

let currentUser = null;

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

    currentUser = data.payload;

    document.getElementById("username").textContent = currentUser.username;
    document.getElementById("email").textContent = currentUser.email;
    document.getElementById("bio").textContent = currentUser.bio || "Sin biografía";

    cargarMisPosts(currentUser.posts);

  } catch (err) {
    console.error(err);
    alert("Error al cargar el perfil");
  }
}

function toggleEditMode() {
  const viewMode = document.getElementById("viewMode");
  const editMode = document.getElementById("editMode");

  if (viewMode.style.display === "none") {
    viewMode.style.display = "block";
    editMode.style.display = "none";
  } else {
    document.getElementById("editUsername").value = currentUser.username;
    document.getElementById("editEmail").value = currentUser.email;
    document.getElementById("editBio").value = currentUser.bio || "";

    viewMode.style.display = "none";
    editMode.style.display = "block";
  }
}

document.getElementById("editProfileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("editUsername").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const bio = document.getElementById("editBio").value.trim();

  if (!username || !email) {
    alert("El nombre de usuario y email son obligatorios");
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ username, email, bio })
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Perfil actualizado exitosamente");

      if (username !== currentUser.username) {
        localStorage.setItem("username", username);
      }

      await cargarPerfil();
      toggleEditMode();
    } else {
      alert(data.message || "Error al actualizar el perfil");
    }
  } catch (err) {
    console.error(err);
    alert("Error al actualizar el perfil");
  }
});

async function cargarMisForos() {
  try {
    const res = await fetch("http://localhost:8080/api/forums/");
    const data = await res.json();

    if (data.status === "error") {
      document.getElementById("misForos").innerHTML = `<p class="text-muted">${data.message}</p>`;
      return;
    }

    const foros = data.payload;
    const misForosDiv = document.getElementById("misForos");

    const forosUsuario = foros.filter(foro =>
      foro.members && foro.members.some(member => member._id === userId || member === userId)
    );

    if (forosUsuario.length === 0) {
      misForosDiv.innerHTML = '<p class="text-muted">No estás unido a ningún foro.</p>';
      return;
    }

    misForosDiv.innerHTML = "";

    forosUsuario.forEach(foro => {
      const foroDiv = document.createElement("div");
      foroDiv.classList.add("foro-item", "mb-3", "p-3", "border", "rounded");

      const premiumBadge = foro.isPremium ? '<span class="badge bg-warning text-dark ms-2">Premium</span>' : '';

      foroDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5>${foro.name}${premiumBadge}</h5>
            <p class="text-muted mb-0">${foro.description}</p>
          </div>
          <button class="btn btn-sm btn-primary" onclick="window.location.href='forum-detalle.html?id=${foro._id}'">Ver</button>
        </div>
      `;

      misForosDiv.appendChild(foroDiv);
    });

  } catch (err) {
    console.error(err);
    document.getElementById("misForos").innerHTML = '<p class="text-muted">Error al cargar tus foros.</p>';
  }
}

function cargarMisPosts(posts) {
  const misPostsDiv = document.getElementById("misPosts");

  if (!posts || posts.length === 0) {
    misPostsDiv.innerHTML = '<p class="text-muted">No has creado ninguna publicación.</p>';
    return;
  }

  misPostsDiv.innerHTML = "";

  posts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post-item", "mb-3", "p-3", "border", "rounded");

    const postDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Fecha desconocida';

    postDiv.innerHTML = `
      <h5>${post.title}</h5>
      <p class="text-muted mb-2">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
      <small class="text-muted">Publicado el: ${postDate}</small>
    `;

    misPostsDiv.appendChild(postDiv);
  });
}

function resetPasswordForm() {
  document.getElementById("changePasswordForm").reset();
}

document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    Swal.fire("Todos los campos son obligatorios");
    return;
  }

  if (newPassword.length < 6) {
    Swal.fire("La nueva contraseña debe tener al menos 6 caracteres");
    return;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire("Las contraseñas no coinciden");
    return;
  }

  if (currentPassword === newPassword) {
    Swal.fire("La nueva contraseña debe ser diferente a la actual");
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/users/${userId}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    const data = await res.json();

    if (data.status === "success") {
      Swal.fire("Contraseña actualizada exitosamente");
      resetPasswordForm();
    } else {
      Swal.fire(data.message || "Error al cambiar la contraseña");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error al cambiar la contraseña");
  }
});

cargarPerfil();
cargarMisForos();