const urlParams = new URLSearchParams(window.location.search);
const forumId = urlParams.get('id');
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

let currentEditPostId = null;
const editModal = new bootstrap.Modal(document.getElementById('editPostModal'));

async function loadForumDetails() {
  try {
    const res = await fetch(`http://localhost:8080/api/forums/${forumId}`);
    const data = await res.json();

    if (data.status === "error") {
      alert(data.message);
      window.location.href = "foros.html";
      return;
    }

    const forum = data.payload;
    const forumInfoDiv = document.getElementById("forumInfo");
    const createPostSection = document.getElementById("createPostSection");
    
    const premiumBadge = forum.isPremium ? '<span class="badge bg-warning">Premium</span>' : '';
    const isCreator = forum.creator._id === userId;
    const isMember = forum.members.some(m => m._id === userId);
    
    let deleteButton = '';
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

    // Mostrar formulario de crear post solo si es miembro
    if (isMember && token) {
      createPostSection.style.display = 'block';
    }

    loadPosts(forum.posts);

  } catch (err) {
    console.error(err);
    alert("Error al cargar el foro");
  }
}

function loadPosts(posts) {
  const postsListDiv = document.getElementById("postsList");
  
  if (!posts || posts.length === 0) {
    postsListDiv.innerHTML = '<p class="text-muted">No hay publicaciones aún</p>';
    return;
  }

  postsListDiv.innerHTML = '';

  posts.forEach(post => {
    const isAuthor = post.author._id === userId;
    const postDate = new Date(post.createdAt).toLocaleDateString();
    
    let actionButtons = '';
    if (isAuthor) {
      actionButtons = `
        <div class="mt-2">
          <button class="btn btn-sm btn-outline-primary" onclick="openEditModal('${post._id}', '${post.title.replace(/'/g, "\\'")}', '${post.content.replace(/'/g, "\\'")}')">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deletePost('${post._id}')">Eliminar</button>
        </div>
      `;
    }

    const postDiv = document.createElement('div');
    postDiv.className = 'card mb-3';
    postDiv.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${post.title}</h5>
        <p class="card-text">${post.content}</p>
        <p class="text-muted small">Por: ${post.author.username} - ${postDate}</p>
        ${actionButtons}
      </div>
    `;
    
    postsListDiv.appendChild(postDiv);
  });
}

// Crear post
document.getElementById('createPostForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();

  if (!title || !content) {
    alert("Por favor completa todos los campos");
    return;
  }

  if (!userId || !token) {
    alert("Debes iniciar sesión");
    return;
  }

  try {
    const res = await fetch('http://localhost:8080/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        content,
        author: userId,
        forum: forumId
      })
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Publicación creada exitosamente");
      document.getElementById('postTitle').value = '';
      document.getElementById('postContent').value = '';
      loadForumDetails();
    } else {
      alert(data.message || "Error al crear la publicación");
    }
  } catch (err) {
    console.error(err);
    alert("Error al crear la publicación");
  }
});

// Abrir modal de edición
function openEditModal(postId, title, content) {
  currentEditPostId = postId;
  document.getElementById('editPostTitle').value = title;
  document.getElementById('editPostContent').value = content;
  editModal.show();
}

// Guardar edición
document.getElementById('saveEditBtn').addEventListener('click', async () => {
  const title = document.getElementById('editPostTitle').value.trim();
  const content = document.getElementById('editPostContent').value.trim();

  if (!title || !content) {
    alert("Por favor completa todos los campos");
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/posts/${currentEditPostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        content,
        userId
      })
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Publicación actualizada exitosamente");
      editModal.hide();
      loadForumDetails();
    } else {
      alert(data.message || "Error al actualizar la publicación");
    }
  } catch (err) {
    console.error(err);
    alert("Error al actualizar la publicación");
  }
});

// Eliminar post
async function deletePost(postId) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Publicación eliminada exitosamente");
      loadForumDetails();
    } else {
      alert(data.message || "Error al eliminar la publicación");
    }
  } catch (err) {
    console.error(err);
    alert("Error al eliminar la publicación");
  }
}

// Eliminar foro
async function deleteForum() {
  if (!confirm("¿Estás seguro de que quieres eliminar este foro? Esta acción no se puede deshacer.")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/forums/${forumId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Foro eliminado exitosamente");
      window.location.href = "foros.html";
    } else {
      alert(data.message || "Error al eliminar el foro");
    }
  } catch (err) {
    console.error(err);
    alert("Error al eliminar el foro");
  }
}

// Cargar detalles al iniciar
loadForumDetails();