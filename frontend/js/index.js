document.addEventListener("DOMContentLoaded", () => {
  cargarPostsRandom();
});

async function cargarPostsRandom() {
  try {
    const res = await fetch("http://localhost:8080/api/posts/random?limit=10");
    const data = await res.json();

    if (data.status === "success" && data.payload.length > 0) {
      mostrarPostsRandom(data.payload);
    } else {
      const postsSection = document.getElementById("randomPostsSection");
      postsSection.innerHTML = `
        <div class="text-center text-muted">
          <p>No hay publicaciones disponibles aún</p>
        </div>
      `;
    }
  } catch (err) {
    console.error("Error al cargar posts random:", err);
    const postsSection = document.getElementById("randomPostsSection");
    if (postsSection) {
      postsSection.innerHTML = `
        <div class="text-center text-muted">
          <p>Error al cargar las publicaciones</p>
        </div>
      `;
    }
  }
}

function mostrarPostsRandom(posts) {
  const postsSection = document.getElementById("randomPostsSection");

  if (!postsSection) return;

  postsSection.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Publicaciones Destacadas</h2>
      <button class="btn btn-secondary" onclick="cargarPostsRandom()">
        Actualizar
      </button>
    </div>
    <div class="row" id="postsGrid"></div>
  `;

  const postsGrid = document.getElementById("postsGrid");

  posts.forEach((post) => {
    const postDate = new Date(post.createdAt).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const postCard = document.createElement("div");
    postCard.className = "col-md-6 col-lg-4 mb-4";
    postCard.innerHTML = `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <div class="mb-2">
            <span class="badge bg-secondary">${
              post.forum?.name || "Sin foro"
            }</span>
          </div>
          <h5 class="card-title">${post.title}</h5>
          <p class="card-text text-muted flex-grow-1">
            ${post.content.substring(0, 120)}${
      post.content.length > 120 ? "..." : ""
    }
          </p>
          <div class="mt-auto">
            <hr>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <strong>${post.author?.username || "Anónimo"}</strong>
              </small>
              <small class="text-muted">${postDate}</small>
            </div>
            <div class="mt-2">
              <button class="btn btn-sm btn-secondary w-100" onclick="verPost('${
                post._id
              }', '${post.forum?._id || ""}')">
                Ver publicación
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    postsGrid.appendChild(postCard);
  });
}

function verPost(postId, forumId) {
  if (forumId) {
    window.location.href = `forum-detalle.html?id=${forumId}#post-${postId}`;
  } else {
    Swal.fire({
      title: "La cobra te dice:",
      text: "Este post no tiene foro asociado",
      confirmButtonText: "Aceptar",
    });
  }
}
