const urlParams = new URLSearchParams(window.location.search);
const forumId = urlParams.get('id');
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

let currentEditPostId = null;
let currentEditCommentId = null;
let currentSortOrder = 'desc'; // 🆕 Estado del ordenamiento (desc = más nuevas)
const editModal = new bootstrap.Modal(document.getElementById('editPostModal'));
const editCommentModal = new bootstrap.Modal(document.getElementById('editCommentModal'));

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

    if (isMember && token) {
      createPostSection.style.display = 'block';
    }

    loadPosts(forum.posts);

  } catch (err) {
    console.error(err);
    alert("Error al cargar el foro");
  }
}

async function loadPostsSorted() {
  try {
    const res = await fetch(
      `http://localhost:8080/api/posts/forums/${forumId}/posts/sorted/date?order=${currentSortOrder}`
    );
    const data = await res.json();

    if (data.status === "success") {
      loadPosts(data.payload);
    }
  } catch (err) {
    console.error(err);
    alert("Error al ordenar publicaciones");
  }
}

function toggleSortOrder() {
  currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
  loadPostsSorted();
  
  const sortBtn = document.getElementById('sortButton');
  if (sortBtn) {
    sortBtn.innerHTML = currentSortOrder === 'desc' 
      ? '🔽 Más nuevas primero' 
      : '🔼 Más antiguas primero';
  }
}

function loadPosts(posts) {
  const postsListDiv = document.getElementById("postsList");
  
  if (!posts || posts.length === 0) {
    postsListDiv.innerHTML = `
      <p class="text-muted">No hay publicaciones aún</p>
    `;
    return;
  }

  postsListDiv.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Publicaciones (${posts.length})</h3>
      <button class="btn btn-outline-secondary btn-sm" id="sortButton" onclick="toggleSortOrder()">
        ${currentSortOrder === 'desc' ? 'Más nuevas primero' : 'Más antiguas primero'}
      </button>
    </div>
  `;

  posts.forEach(post => {
    const isAuthor = post.author._id === userId;
    const postDate = new Date(post.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let actionButtons = '';
    if (isAuthor) {
      const safeTitle = post.title.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
      const safeContent = post.content.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
      
      actionButtons = `
        <div class="mt-2">
          <button class="btn btn-sm btn-outline-primary" onclick='openEditModal("${post._id}", "${safeTitle}", "${safeContent}")'>Editar</button>
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
        <p class="text-muted small">
          <strong>Por:</strong> ${post.author.username} 
          <span class="mx-2">•</span>
          <strong>Fecha:</strong> ${postDate}
        </p>
        ${actionButtons}
        
        <hr class="mt-3">
        
        <div class="comments-section">
          <h6 class="mb-3">Comentarios (${post.comments?.length || 0})</h6>
          
          ${token ? `
            <div class="add-comment-form mb-3">
              <textarea class="form-control mb-2" id="commentContent-${post._id}" placeholder="Escribe un comentario..." rows="2"></textarea>
              <button class="btn btn-sm btn-primary" onclick="addComment('${post._id}')">Comentar</button>
            </div>
          ` : '<p class="text-muted small">Inicia sesión para comentar</p>'}
          
          <div id="comments-${post._id}" class="comments-list"></div>
        </div>
      </div>
    `;
    
    postsListDiv.appendChild(postDiv);
    
    loadComments(post._id, post.comments);
  });
}

async function loadComments(postId, commentsData) {
  const commentsDiv = document.getElementById(`comments-${postId}`);
  
  if (!commentsData || commentsData.length === 0) {
    commentsDiv.innerHTML = '<p class="text-muted small">No hay comentarios todavía</p>';
    return;
  }

  commentsDiv.innerHTML = '';

  commentsData.forEach(comment => {
    const isCommentAuthor = comment.author._id === userId;
    const commentDate = new Date(comment.createdAt).toLocaleDateString();
    
    let commentActions = '';
    if (isCommentAuthor) {
      const safeContent = comment.content.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
      
      commentActions = `
        <div class="comment-actions">
          <button class="btn btn-sm btn-link p-0 me-2" onclick='openEditCommentModal("${comment._id}", "${safeContent}")'>Editar</button>
          <button class="btn btn-sm btn-link p-0 text-danger" onclick="deleteComment('${comment._id}', '${postId}')">Eliminar</button>
        </div>
      `;
    }

    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item mb-2 p-2 border-start border-3 border-primary';
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
  const content = document.getElementById(`commentContent-${postId}`).value.trim();

  if (!content) {
    alert("Por favor escribe un comentario");
    return;
  }

  if (!userId || !token) {
    alert("Debes iniciar sesión");
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/comments/posts/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content,
        author: userId
      })
    });

    const data = await res.json();

    if (data.status === "success") {
      document.getElementById(`commentContent-${postId}`).value = '';
      loadForumDetails();
    } else {
      alert(data.message || "Error al crear el comentario");
    }
  } catch (err) {
    console.error(err);
    alert("Error al crear el comentario");
  }
}

function openEditCommentModal(commentId, content) {
  currentEditCommentId = commentId;
  document.getElementById('editCommentContent').value = content;
  editCommentModal.show();
}

document.getElementById('saveEditCommentBtn').addEventListener('click', async () => {
  const content = document.getElementById('editCommentContent').value.trim();

  if (!content) {
    alert("El comentario no puede estar vacío");
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/comments/${currentEditCommentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Comentario actualizado exitosamente");
      editCommentModal.hide();
      loadForumDetails();
    } else {
      alert(data.message || "Error al actualizar el comentario");
    }
  } catch (err) {
    console.error(err);
    alert("Error al actualizar el comentario");
  }
});

async function deleteComment(commentId, postId) {
  if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.status === "success") {
      alert("Comentario eliminado exitosamente");
      loadForumDetails();
    } else {
      alert(data.message || "Error al eliminar el comentario");
    }
  } catch (err) {
    console.error(err);
    alert("Error al eliminar el comentario");
  }
}

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

function openEditModal(postId, title, content) {
  currentEditPostId = postId;
  document.getElementById('editPostTitle').value = title;
  document.getElementById('editPostContent').value = content;
  editModal.show();
}

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

loadForumDetails();