// Registro con fetch (Frontend)

$('#btnRegister').addEventListener('click', async () => {
    // const role = $('#regRole').value;
    const username = $('#regUser').value.trim();
    // const name = $('#regName').value.trim();
    const pass = $('#regPass').value;

    if (!username || !pass) {
        alert('Completa usuario y contraseña');
        return;
    }

    try {
        const resp = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                name,
                password: pass,
                role
            })
        });

        if (!resp.ok) {
            const err = await resp.json();
            alert(`Error: ${err.message || 'No se pudo registrar'}`);
            return;
        }

        const data = await resp.json();
        alert('✅ Usuario creado correctamente');

        // Opcional: iniciar sesión automáticamente con el usuario creado
        currentUser = data.user;
        localStorage.setItem('fe_current', JSON.stringify(currentUser));
        refreshUserArea();
        renderAll();
        showView('foros');

        // limpiar campos
        $('#regUser').value = '';
        $('#regName').value = '';
        $('#regPass').value = '';

    } catch (error) {
        console.error(error);
        alert('❌ Error de conexión con el servidor');
    }
});



// /***********************
// Estructuras simples: Usuario, Foros, Posts
// *************************/
// const db = {
//     users: JSON.parse(localStorage.getItem('fe_users') || '[]'),
//     forums: JSON.parse(localStorage.getItem('fe_forums') || '[]'),
//     posts: JSON.parse(localStorage.getItem('fe_posts') || '[]'),
//     blocked: JSON.parse(localStorage.getItem('fe_blocked') || '[]'),
//     subscriptions: JSON.parse(localStorage.getItem('fe_subs') || '[]'),
//     saved: JSON.parse(localStorage.getItem('fe_saved') || '[]')
// }
// function saveDB() {
//     localStorage.setItem('fe_users', JSON.stringify(db.users));
//     localStorage.setItem('fe_forums', JSON.stringify(db.forums));
//     localStorage.setItem('fe_posts', JSON.stringify(db.posts));
//     localStorage.setItem('fe_blocked', JSON.stringify(db.blocked));
//     localStorage.setItem('fe_subs', JSON.stringify(db.subscriptions));
//     localStorage.setItem('fe_saved', JSON.stringify(db.saved));
// }

// // bootstrap admin if none
// if (!db.users.find(u => u.role === 'admin')) {
//     db.users.push({ id: 1, username: 'admin', name: 'Administrador', password: 'admin', role: 'admin' });
//     saveDB();
// }

// // estado
// let currentUser = JSON.parse(localStorage.getItem('fe_current') || 'null');
// const body = document.body;

// // helpers
// const $ = sel => document.querySelector(sel);
// const $$ = sel => Array.from(document.querySelectorAll(sel));

// // show user area
// function refreshUserArea() {
//     const ua = $('#user-area');
//     const logout = $('#logoutBtn');
//     if (currentUser) {
//         ua.innerHTML = `${currentUser.name} <span class="small">(${currentUser.role})</span>`;
//         logout.classList.remove('hidden');
//     } else { ua.innerHTML = 'Invitado'; logout.classList.add('hidden'); }
// }

// // theme toggle
// $('#themeBtn').addEventListener('click', () => {
//     const cur = body.getAttribute('data-theme');
//     body.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
// });

// // navigation
// document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', ev => {
//     showView(btn.getAttribute('data-view'))
// }));
// function hideAll() { document.querySelectorAll('main section').forEach(s => s.classList.add('hidden')) }
// function showView(id) { hideAll(); document.getElementById('view-' + id).classList.remove('hidden'); renderAll(); }
// showView('foros');

// // Auth actions
// $('#btnRegister').addEventListener('click', () => {
//     const role = $('#regRole').value; const username = $('#regUser').value.trim(); const name = $('#regName').value.trim(); const pass = $('#regPass').value;
//     if (!username || !pass) { alert('Completa usuario y contraseña'); return }
//     if (db.users.find(u => u.username === username)) { alert('Usuario ya existe'); return }
//     const id = Date.now(); db.users.push({ id, username, name, password: pass, role }); saveDB(); alert('Registrado correctamente');
//     $('#regUser').value = ''; $('#regPass').value = ''; $('#regName').value = '';
// });

// $('#btnLogin').addEventListener('click', () => {
//     const role = $('#loginRole').value; const username = $('#loginUser').value.trim(); const pass = $('#loginPass').value;
//     const u = db.users.find(x => x.username === username && x.password === pass && (x.role === role || role === 'admin' && x.role === 'admin'));
//     if (!u) { alert('Credenciales incorrectas o rol no coincide'); return }
//     if (db.blocked.includes(u.id)) { alert('Usuario bloqueado'); return }
//     currentUser = u; localStorage.setItem('fe_current', JSON.stringify(currentUser)); refreshUserArea(); renderAll(); showView('foros');
// });

// $('#btnRecover').addEventListener('click', () => {
//     const user = prompt('Ingresa tu usuario/email para recuperar contraseña:'); if (!user) return;
//     const u = db.users.find(x => x.username === user);
//     if (!u) { alert('Usuario no encontrado'); return }
//     const np = prompt('Nueva contraseña:'); if (!np) return; u.password = np; saveDB(); alert('Contraseña actualizada');
// });

// $('#logoutBtn').addEventListener('click', () => { currentUser = null; localStorage.removeItem('fe_current'); refreshUserArea(); renderAll(); });

// // Foros: create/list
// function renderForums() {
//     const list = $('#forumList'); list.innerHTML = '';
//     let forums = db.forums.slice().sort((a, b) => b.created - a.created);
//     const q = $('#searchInput').value.trim().toLowerCase();
//     if (q) forums = forums.filter(f => f.title.toLowerCase().includes(q) || f.topic.toLowerCase().includes(q));
//     forums.forEach(f => {
//         const el = document.createElement('div'); el.className = 'forum';
//         el.innerHTML = `<div>
//         <strong>${f.title}</strong> <span class="small">- ${f.topic}</span>
//         <div class="meta small">${f.premium ? '<span class="badge">Premium</span>' : ''} ${f.pinned ? '<span class="small">(Fijado)</span>' : ''}</div>
//     </div>
//     <div class="right">
//         <button data-id="${f.id}" class="openForum ghost">Abrir</button>
//         ${currentUser ? `<button data-id="${f.id}" class="subscribeBtn">${db.subscriptions.includes(f.id + ':' + currentUser.id) ? 'Desubscribir' : 'Subscribirse'}</button>` : ''}
//         ${currentUser && (currentUser.role === 'admin' || currentUser.role === 'professor') ? `<button data-id="${f.id}" class="editForum">Editar</button>` : ''}
//         ${currentUser && (currentUser.role === 'admin' || currentUser.role === 'professor') ? `<button data-id="${f.id}" class="delForum danger">Eliminar</button>` : ''}
//     </div>`;
//         list.appendChild(el);
//     })
//     // bind
//     $$('.openForum').forEach(b => b.addEventListener('click', ev => openForum(ev.target.dataset.id)));
//     $$('.subscribeBtn').forEach(b => b.addEventListener('click', ev => toggleSub(ev.target.dataset.id)));
//     $$('.editForum').forEach(b => b.addEventListener('click', ev => editForum(ev.target.dataset.id)));
//     $$('.delForum').forEach(b => b.addEventListener('click', ev => deleteForum(ev.target.dataset.id)));
// }
// function openForum(id) {
//     const f = db.forums.find(x => x.id == id); if (!f) return; // render posts for forum
//     showView('publicaciones'); $('#postEditor').classList.add('hidden'); renderFeed(f.id);
// }
// function toggleSub(id) { if (!currentUser) { alert('Ingresa para subscribirte'); return } const key = id + ':' + currentUser.id; const i = db.subscriptions.indexOf(key); if (i > -1) { db.subscriptions.splice(i, 1) } else db.subscriptions.push(key); saveDB(); renderForums(); }

// $('#btnNewForum').addEventListener('click', () => {
//     if (!currentUser) { alert('Debes ingresar'); return }
//     $('#forumEditor').classList.remove('hidden'); $('#forumEditorTitle').innerText = 'Crear foro'; $('#forumTitle').value = ''; $('#forumTopic').value = ''; $('#forumPremium').checked = false; $('#saveForum').dataset.edit = '';
// });
// $('#cancelForum').addEventListener('click', () => $('#forumEditor').classList.add('hidden'));
// $('#saveForum').addEventListener('click', () => {
//     const title = $('#forumTitle').value.trim(), topic = $('#forumTopic').value.trim(); const premium = $('#forumPremium').checked;
//     if (!title || !topic) { alert('Completa título y tema'); return }
//     if ($('#saveForum').dataset.edit) { // edit
//         const id = $('#saveForum').dataset.edit; const f = db.forums.find(x => x.id == id); f.title = title; f.topic = topic; f.premium = premium; saveDB(); alert('Foro actualizado');
//     } else {
//         const id = Date.now(); db.forums.push({ id, title, topic, premium: premium, created: Date.now(), pinned: false }); saveDB(); alert('Foro creado');
//     }
//     $('#forumEditor').classList.add('hidden'); renderForums();
// });
// function editForum(id) { const f = db.forums.find(x => x.id == id); $('#forumEditor').classList.remove('hidden'); $('#forumEditorTitle').innerText = 'Editar foro'; $('#forumTitle').value = f.title; $('#forumTopic').value = f.topic; $('#forumPremium').checked = f.premium; $('#saveForum').dataset.edit = id; }
// function deleteForum(id) { if (!confirm('Eliminar foro?')) return; db.forums = db.forums.filter(x => x.id != id); db.posts = db.posts.filter(p => p.forumId != id); saveDB(); renderForums(); renderAll(); }

// // Posts
// $('#btnNewPost').addEventListener('click', () => {
//     if (!currentUser) { alert('Ingresa para publicar'); return }
//     $('#postEditor').classList.remove('hidden'); $('#postTitle').value = ''; $('#postBody').value = ''; $('#postTags').value = ''; $('#postPin').checked = false; $('#savePost').dataset.edit = '';
// });
// $('#cancelPost').addEventListener('click', () => $('#postEditor').classList.add('hidden'));
// $('#savePost').addEventListener('click', () => {
//     const title = $('#postTitle').value.trim(); const bodyText = $('#postBody').value.trim(); const tags = $('#postTags').value.split(',').map(t => t.trim()).filter(Boolean); const pin = $('#postPin').checked;
//     if (!title || !bodyText) { alert('Completa título y cuerpo'); return }
//     const id = $('#savePost').dataset.edit || Date.now(); if ($('#savePost').dataset.edit) { const p = db.posts.find(x => x.id == id); p.title = title; p.body = bodyText; p.tags = tags; p.pinned = pin; } else {
//         db.posts.push({ id, title, body: bodyText, tags, authorId: currentUser.id, authorName: currentUser.name, date: Date.now(), pinned: pin, forumId: null, replies: [] });
//     }
//     saveDB(); $('#postEditor').classList.add('hidden'); renderFeed();
// });

// function renderFeed(forunId) {
//     const feed = $('#feed'); feed.innerHTML = '';
//     let posts = db.posts.slice();
//     if (forunId) posts = posts.filter(p => p.forumId == forunId);
//     const tagFilter = $('#postFilterTags').value.trim().toLowerCase(); if (tagFilter) posts = posts.filter(p => p.tags.join(',').toLowerCase().includes(tagFilter));
//     posts.sort((a, b) => (b.pinned - a.pinned) || (b.date - a.date));
//     posts.forEach(p => {
//         const el = document.createElement('div'); el.className = 'post';
//         el.innerHTML = `<div><strong>${p.title}</strong> <div class="small">por ${p.authorName} • ${new Date(p.date).toLocaleString()}</div>
//         <div style="margin-top:6px">${p.body}</div>
//         <div style="margin-top:6px">${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
//     </div>
//     <div class="right small">
//         ${currentUser ? `<button data-id="${p.id}" class="replyBtn">Responder</button>` : ''}
//         ${currentUser && p.authorId === currentUser.id ? `<button data-id="${p.id}" class="editPost ghost">Editar</button>` : ''}
//         ${currentUser && (currentUser.role === 'admin' || currentUser.id === p.authorId) ? `<button data-id="${p.id}" class="delPost danger">Eliminar</button>` : ''}
//         ${currentUser ? `<button data-id="${p.id}" class="savePost">Guardar</button>` : ''}
//     </div>`;
//         feed.appendChild(el);
//     });
//     // binds
//     $$('.replyBtn').forEach(b => b.addEventListener('click', ev => replyTo(ev.target.dataset.id)));
//     $$('.editPost').forEach(b => b.addEventListener('click', ev => editPost(ev.target.dataset.id)));
//     $$('.delPost').forEach(b => b.addEventListener('click', ev => deletePost(ev.target.dataset.id)));
//     $$('.savePost').forEach(b => b.addEventListener('click', ev => savePostForLater(ev.target.dataset.id)));
// }
// function replyTo(id) { const text = prompt('Respuesta:'); if (!text) return; const p = db.posts.find(x => x.id == id); p.replies.push({ id: Date.now(), authorId: currentUser.id, authorName: currentUser.name, text, date: Date.now() }); saveDB(); renderFeed(); }
// function editPost(id) { const p = db.posts.find(x => x.id == id); $('#postEditor').classList.remove('hidden'); $('#postTitle').value = p.title; $('#postBody').value = p.body; $('#postTags').value = (p.tags || []).join(','); $('#postPin').checked = p.pinned; $('#savePost').dataset.edit = id; }
// function deletePost(id) { if (!confirm('Eliminar publicación?')) return; db.posts = db.posts.filter(x => x.id != id); saveDB(); renderFeed(); }
// function savePostForLater(id) { if (!currentUser) { alert('Ingresa para guardar'); return } const key = id + ':' + currentUser.id; if (db.saved.includes(key)) { db.saved = db.saved.filter(k => k !== key); alert('Guardado eliminado') } else { db.saved.push(key); alert('Guardado') } saveDB(); }

// // STUDENT / PROFESSOR profiles
// $('#editProfile').addEventListener('click', () => {
//     if (!currentUser) { alert('Ingresa'); return }
//     const newName = prompt('Nuevo nombre:', currentUser.name); if (!newName) return; currentUser.name = newName; const u = db.users.find(x => x.id === currentUser.id); u.name = newName; localStorage.setItem('fe_current', JSON.stringify(currentUser)); saveDB(); refreshUserArea(); renderAll();
// });
// $('#deleteProfile').addEventListener('click', () => { if (!confirm('Eliminar tu perfil?')) return; db.users = db.users.filter(u => u.id !== currentUser.id); db.posts = db.posts.filter(p => p.authorId !== currentUser.id); saveDB(); currentUser = null; localStorage.removeItem('fe_current'); refreshUserArea(); alert('Perfil eliminado'); renderAll(); });

// $('#editProf').addEventListener('click', () => { $('#editProfile').click(); });
// $('#deleteProf').addEventListener('click', () => { $('#deleteProfile').click(); });

// $('#createPremium').addEventListener('click', () => {
//     if (!currentUser || currentUser.role !== 'professor') { alert('Solo profesores'); return }
//     const title = $('#premiumTitle').value.trim(), topic = $('#premiumTopic').value.trim(); if (!title || !topic) return; const id = Date.now(); db.forums.push({ id, title, topic, premium: true, created: Date.now(), pinned: false }); saveDB(); alert('Foro premium creado'); renderForums();
// });

// // blocking users
// function blockUser(id) { if (!currentUser || currentUser.role !== 'admin') { alert('Solo admin puede bloquear'); return } if (!confirm('Bloquear usuario?')) return; db.blocked.push(id); saveDB(); alert('Usuario bloqueado'); }

// // SEARCH / FILTER
// $('#applyFilter').addEventListener('click', () => {
//     const tag = $('#tagFilter').value.trim().toLowerCase(); const order = $('#orderFilter').value;
//     const results = db.posts.filter(p => p.tags.join(',').toLowerCase().includes(tag));
//     const container = $('#filterResults'); container.innerHTML = ''; results.sort((a, b) => order === 'date' ? b.date - a.date : 0).forEach(p => {
//         const el = document.createElement('div'); el.className = 'post'; el.innerHTML = `<strong>${p.title}</strong><div class='small'>${p.tags.join(', ')}</div><div>${p.body}</div>`; container.appendChild(el);
//     })
// });

// // utility render
// function renderAll() { renderForums(); renderFeed(); renderProfileCards(); }
// function renderProfileCards() { const pc = $('#profileCard'); const prof = $('#profCard'); if (currentUser) { pc.innerHTML = `<strong>${currentUser.name}</strong><div class='small'>${currentUser.username} • ${currentUser.role}</div>`; prof.innerHTML = pc.innerHTML; } else { pc.innerHTML = '<div class="small">No hay sesión iniciada</div>'; prof.innerHTML = pc.innerHTML } }

// // initial sample data if empty
// if (db.forums.length === 0) { db.forums.push({ id: 111, title: 'Dudas programación', topic: 'programación', premium: false, created: Date.now(), pinned: false }); db.forums.push({ id: 112, title: 'Exámenes y parciales', topic: 'examenes', premium: false, created: Date.now(), pinned: true }); saveDB(); }
// if (db.posts.length === 0) { db.posts.push({ id: 201, title: '¿Cómo resolver ejercicio 5?', body: 'Necesito ayuda con el ejercicio 5 de la práctica.', tags: ['ayuda', 'practica'], authorId: 1, authorName: 'admin', date: Date.now(), pinned: false, forumId: 111, replies: [] }); saveDB(); }

// // quick search binds
// $('#searchInput').addEventListener('input', () => renderForums()); $('#quickSearch').addEventListener('input', () => { $('#searchInput').value = $('#quickSearch').value; renderForums(); });

// // initial
// refreshUserArea(); renderAll();