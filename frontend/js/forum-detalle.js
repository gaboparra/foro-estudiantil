const urlParams = new URLSearchParams(window.location.search);
const forumId = urlParams.get("id");
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

let currentEditPostId = null;
let currentEditCommentId = null;
let currentForumCreatorId = null;
const editModal = new bootstrap.Modal(document.getElementById("editPostModal"));
const editCommentModal = new bootstrap.Modal(
  document.getElementById("editCommentModal")
);

async function loadForumDetails() {
  try {
    const res = await fetch(`http://localhost:8080/api/forums/${forumId}`);
    const data = await res.json();

    if (data.status === "error") {
      await Swal.fire({
        title: "La cobra te dice:",
        text: "No se pudo cargar el foro. Intenta nuevamente más tarde.",
        confirmButtonText: "Aceptar",
      });
      window.location.href = "foros.html";
      return;
    }

    const forum = data.payload;
    currentForumCreatorId = forum.creator._id;
    const forumInfoDiv = document.getElementById("forumInfo");
    const createPostSection = document.getElementById("createPostSection");

    const premiumBadge = forum.isPremium
      ? '<span class="badge bg-warning">Premium</span>'
      : "";
    const isCreator = forum.creator._id === userId;
    const isMember = forum.members.some((m) => m._id === userId);

    let deleteButton = "";
    if (isCreator) {
      deleteButton = `<button class="btn btn-danger btn-sm" onclick="deleteForum()">Eliminar Foro</button>`;
    }

    forumInfoDiv.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h2>${forum.name} ${premiumBadge}</h2>
              <p class="text-muted">${forum.description}</p>
              <p><strong>Creador:</strong> ${forum.creator.username}</p>
              <p><strong>Miembros:</strong> ${forum.members.length}</p>
            </div>
            <div>
              ${deleteButton}
            </div>
          </div>
        </div>
      </div>
    `;

    if (isMember && token) {
      createPostSection.style.display = "block";
    }

    loadPosts(forum.posts);
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "La cobra te dice:",
      text: "No se pudo cargar el foro. Verifica tu conexión o inténtalo nuevamente más tarde.",
      confirmButtonText: "Aceptar",
    });
  }
}

function loadPosts(posts) {
  const postsListDiv = document.getElementById("postsList");

  if (!posts || posts.length === 0) {
    postsListDiv.innerHTML =
      '<p class="text-muted">No hay publicaciones aún</p>';
    return;
  }

  const pinnedPosts = posts.filter((p) => p.isPinned);
  const normalPosts = posts.filter((p) => !p.isPinned);

  const sortedPosts = [...pinnedPosts, ...normalPosts];

  postsListDiv.innerHTML = "";

  sortedPosts.forEach((post) => {
    const isAuthor = post.author._id === userId;
    const isForumCreator = currentForumCreatorId === userId;
    const postDate = new Date(post.createdAt).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const pinnedBadge = post.isPinned
      ? '<span class="badge bg-warning text-dark ms-2">📌 Fijado</span>'
      : "";

    let actionButtons = "";

    if (isAuthor) {
      const safeTitle = post.title
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
      const safeContent = post.content
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');

      actionButtons += `
        <button class="btn btn-sm btn-outline-primary" onclick='openEditModal("${post._id}", "${safeTitle}", "${safeContent}")'>Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deletePost('${post._id}')">Eliminar</button>
      `;
    }

    if (userId && token) {
      actionButtons += `
        <button class="btn btn-sm btn-outline-success" onclick="toggleSavePost('${post._id}')">
          💾 Guardar
        </button>
      `;
    }

    if (isForumCreator) {
      const pinText = post.isPinned ? "Desfijar" : "Fijar";
      const pinColor = post.isPinned ? "btn-secondary" : "btn-warning";
      actionButtons += `
        <button class="btn btn-sm ${pinColor}" onclick="togglePinPost('${post._id}')">
          ${pinText}
        </button>
      `;
    }

    const postDiv = document.createElement("div");
    postDiv.className = `card mb-3 ${post.isPinned ? "border-warning" : ""}`;
    postDiv.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-center mb-2">
          <h5 class="card-title mb-0">${post.title}</h5>
          ${pinnedBadge}
        </div>
        <p class="card-text">${post.content}</p>
        <p class="text-muted small">
          <strong>Por:</strong> ${post.author.username} 
          <span class="mx-2">•</span>
          <strong>Fecha:</strong> ${postDate}
        </p>
        ${
          actionButtons
            ? `<div class="mt-2 d-flex gap-2">${actionButtons}</div>`
            : ""
        }
        
        <hr class="mt-3">
        
        <div class="comments-section">
          <h6 class="mb-3">Comentarios (${post.comments?.length || 0})</h6>
          
          ${
            token
              ? `
            <div class="add-comment-form mb-3">
              <textarea class="form-control mb-2" id="commentContent-${post._id}" placeholder="Escribe un comentario..." rows="2"></textarea>
              <button class="btn btn-sm btn-primary" onclick="addComment('${post._id}')">Comentar</button>
            </div>
          `
              : '<p class="text-muted small">Inicia sesión para comentar</p>'
          }
          
          <div id="comments-${post._id}" class="comments-list"></div>
        </div>
      </div>
    `;

    postsListDiv.appendChild(postDiv);

    loadComments(post._id, post.comments);
  });
}

async function togglePinPost(postId) {
  if (!userId || !token) {
    Swal.fire({
      title: "La cobra te dice:",
      text: "Debes iniciar sesión para fijar o desfijar publicaciones.",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/posts/${postId}/pin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (data.status === "success") {
      await Swal.fire({
        title: "La cobra te dice:",
        text: "Publicación fijada/desfijada correctamente.",
        confirmButtonText: "Aceptar",
      });
      loadForumDetails();
    } else {
      Swal.fire({
        title: "La cobra te dice:",
        text: "No se pudo cambiar el estado de fijado. Intenta nuevamente.",
        confirmButtonText: "Aceptar",
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "La cobra te dice:",
      text: "Ocurrió un error al fijar/desfijar la publicación. Intenta de nuevo más tarde.",
      confirmButtonText: "Aceptar",
    });
  }
}

async function loadComments(postId, commentsData) {
  const commentsDiv = document.getElementById(`comments-${postId}`);

  if (!commentsData || commentsData.length === 0) {
    commentsDiv.innerHTML =
      '<p class="text-muted small">No hay comentarios todavía</p>';
    return;
  }

  commentsDiv.innerHTML = "";

  commentsData.forEach((comment) => {
    const isCommentAuthor = comment.author._id === userId;
    const commentDate = new Date(comment.createdAt).toLocaleDateString();

    let commentActions = "";
    if (isCommentAuthor) {
      const safeContent = comment.content
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');

      commentActions = `
        <div class="comment-actions">
          <button class="btn btn-sm btn-link p-0 me-2" onclick='openEditCommentModal("${comment._id}", "${safeContent}")'>Editar</button>
          <button class="btn btn-sm btn-link p-0 text-danger" onclick="deleteComment('${comment._id}', '${postId}')">Eliminar</button>
        </div>
      `;
    }

    const commentDiv = document.createElement("div");
    commentDiv.className =
      "comment-item mb-2 p-2 border-start border-3 border-primary";
    commentDiv.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <strong class="d-block">${comment.author.username}</strong>
          <p class="mb-1">${comment.content}</p>
          <small class="text-muted">${commentDate}</small>
        </div>
        ${commentActions}
      </div>
    `;

    commentsDiv.appendChild(commentDiv);
  });
}

async function addComment(postId) {
  const content = document
    .getElementById(`commentContent-${postId}`)
    .value.trim();

  if (!content) {
    Swal.fire({
      title: "La cobra te dice:",
      text: "El comentario está vacío. Escribe algo antes de publicar.",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  if (!userId || !token) {
    Swal.fire({
      title: "La cobra te dice:",
      text: "Debes iniciar sesión para comentar en este foro.",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:8080/api/comments/posts/${postId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          author: userId,
        }),
      }
    );

    const data = await res.json();

    if (data.status === "success") {
      document.getElementById(`commentContent-${postId}`).value = "";
      loadForumDetails();
    } else {
      Swal.fire({
        title: "La cobra te dice:",
        text: "No se pudo publicar el comentario. Intenta nuevamente.",
        confirmButtonText: "Aceptar",
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "La cobra te dice:",
      text: "Ocurrió un error al crear el comentario. Verifica tu conexión e inténtalo otra vez.",
      confirmButtonText: "Aceptar",
    });
  }
}

function openEditCommentModal(commentId, content) {
  currentEditCommentId = commentId;
  document.getElementById("editCommentContent").value = content;
  editCommentModal.show();
}

document
  .getElementById("saveEditCommentBtn")
  .addEventListener("click", async () => {
    const content = document.getElementById("editCommentContent").value.trim();

    if (!content) {
      Swal.fire({
        title: "La cobra te dice:",
        text: "El comentario no puede estar vacío. Escribe algo antes de guardar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/comments/${currentEditCommentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        await Swal.fire({
          title: "La cobra te dice:",
          text: "Comentario actualizado correctamente.",
          confirmButtonText: "Aceptar",
        });
        editCommentModal.hide();
        loadForumDetails();
      } else {
        Swal.fire({
          title: "La cobra te dice:",
          text: "No se pudo actualizar el comentario. Intenta nuevamente.",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "La cobra te dice:",
        text: "Ocurrió un error al actualizar el comentario. Intenta de nuevo más tarde.",
        confirmButtonText: "Aceptar",
      });
    }
  });

async function deleteComment(commentId, postId) {
  const result = await Swal.fire({
    title: "La cobra te dice:",
    text: "¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.status === "success") {
      await Swal.fire({
        title: "La cobra te dice:",
        text: "Comentario eliminado correctamente.",
        confirmButtonText: "Aceptar",
      });
      loadForumDetails();
    } else {
      Swal.fire({
        title: "La cobra te dice:",
        text: "No se pudo eliminar el comentario. Intenta de nuevo.",
        confirmButtonText: "Aceptar",
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "La cobra te dice:",
      text: "Ocurrió un error al eliminar el comentario. Intenta nuevamente.",
      confirmButtonText: "Aceptar",
    });
  }
}

document
  .getElementById("createPostForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();

    if (!title || !content) {
      Swal.fire({
        title: "La cobra te dice:",
        text: "Por favor completa el título y el contenido de la publicación antes de enviar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (!userId || !token) {
      Swal.fire({
        title: "La cobra te dice:",
        text: "Debes iniciar sesión para crear publicaciones en este foro.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          author: userId,
          forum: forumId,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        await Swal.fire({
          title: "La cobra te dice:",
          text: "Tu publicación se creó correctamente.",
          confirmButtonText: "Aceptar",
        });
        document.getElementById("postTitle").value = "";
        document.getElementById("postContent").value = "";
        loadForumDetails();
      } else {
        Swal.fire({
          title: "La cobra te dice:",
          text: "No se pudo crear la publicación. Intenta nuevamente.",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "La cobra te dice:",
        text: "Ocurrió un error al crear la publicación. Revisa tu conexión e inténtalo de nuevo.",
        confirmButtonText: "Aceptar",
      });
    }
  });

function openEditModal(postId, title, content) {
  currentEditPostId = postId;
  document.getElementById("editPostTitle").value = title;
  document.getElementById("editPostContent").value = content;
  editModal.show();
}

document.getElementById("saveEditBtn").addEventListener("click", async () => {
  const title = document.getElementById("editPostTitle").value.trim();
  const content = document.getElementById("editPostContent").value.trim();

  if (!title || !content) {
    Swal.fire({
      title: "La cobra te dice:",
      text: "Por favor completa el título y el contenido antes de guardar los cambios.",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:8080/api/posts/${currentEditPostId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          userId,
        }),
      }
    );

    const data = await res.json();

    if (data.status === "success") {
      await Swal.fire({
        title: "La cobra te dice:",
        text: "Tu publicación fue actualizada correctamente.",
        confirmButtonText: "Aceptar",
      });
      editModal.hide();
      loadForumDetails();
    } else {
      Swal.fire({
        title: "La cobra te dice:",
        text: "No se pudo actualizar la publicación. Intenta nuevamente.",
        confirmButtonText: "Aceptar",
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "La cobra te dice:",
      text: "Ocurrió un error al actualizar la publicación. Intenta de nuevo más tarde.",
      confirmButtonText: "Aceptar",
    });
  }
});

async function deletePost(postId) {
  const result = await Swal.fire({
    title: "La cobra te dice:",
    text: "¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`http://localhost:8080/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (data.status === "success") {
      await Swal.fire({
        title: "La cobra te dice:",
        text: "La publicación fue eliminada correctamente.",
        confirmButtonText: "Aceptar",
      });
      loadForumDetails();
    } else {
      Swal.fire({
        title: "La cobra te dice:",
        text: "No se pudo eliminar la publicación. Intenta nuevamente.",
        confirmButtonText: "Aceptar",
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "La cobra te dice:",
      text: "Ocurrió un error al eliminar la publicación. Intenta de nuevo más tarde.",
      confirmButtonText: "Aceptar",
    });
  }
}

async function deleteForum() {
  const result = await Swal.fire({
    title: "La cobra te dice:",
    text: "¿Estás seguro de que quieres eliminar este foro? Esta acción eliminará todas las publicaciones y comentarios asociados.",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`http://localhost:8080/api/forums/${forumId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (data.status === "success") {
      await Swal.fire({
        title: "La cobra te dice:",
        text: "El foro fue eliminado correctamente. Serás redirigido a la lista de foros.",
        confirmButtonText: "Aceptar",
      });
      window.location.href = "foros.html";
    } else {
      Swal.fire({
        title: "La cobra te dice:",
        text: "No se pudo eliminar el foro. Intenta nuevamente más tarde.",
        confirmButtonText: "Aceptar",
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "La cobra te dice:",
      text: "Ocurrió un error al eliminar el foro. Intenta de nuevo más tarde.",
      confirmButtonText: "Aceptar",
    });
  }
}

window.toggleSavePost = async function (postId) {
  if (!userId || !token) {
    return Swal.fire({
      title: "La cobra te dice:",
      text: "Debés iniciar sesión para guardar publicaciones",
      confirmButtonText: "Aceptar",
    });
  }

  try {
    const res = await fetch(
      `http://localhost:8080/api/users/${userId}/save-post`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      }
    );

    const data = await res.json();

    Swal.fire({
      title: "La cobra te dice:",
      text: "Se guardó la publicación correctamente",
      confirmButtonText: "Aceptar",
    });

    loadForumDetails();
  } catch (error) {
    console.error(error);
    Swal.fire({
      title: "La cobra te dice:",
      text: "Error al guardar la publicación",
      confirmButtonText: "Aceptar",
    });
  }
};

loadForumDetails();
