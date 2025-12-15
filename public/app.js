// Use relative path for API calls, works in dev and production
const API_BASE_URL = '/api';

// --- Auth Helper Functions ---
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
}

// Redirects user based on authentication status
function checkAuth() {
    const token = getToken();
    const path = window.location.pathname;
    const isAuthPage = path.includes('login.html') || path.includes('signup.html');

    if (!token && !isAuthPage) {
        window.location.href = 'login.html';
    } else if (token && isAuthPage) {
        window.location.href = 'index.html';
    }
}


// --- Event Listener Setup ---

// Logout Button
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removeToken();
        window.location.href = 'login.html';
    });
}

// Login Form
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setToken(data.token);
                localStorage.setItem('userId', data.user._id);
                localStorage.setItem('username', data.user.username);
                window.location.href = 'index.html';
            } else {
                document.getElementById('error-msg').innerText = data.msg || 'Login failed';
            }
        } catch (err) {
            console.error('Login error:', err);
            document.getElementById('error-msg').innerText = 'An error occurred.';
        }
    });
}

// Signup Form
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setToken(data.token);
                localStorage.setItem('userId', data.user._id);
                localStorage.setItem('username', data.user.username);
                window.location.href = 'index.html';
            } else {
                document.getElementById('error-msg').innerText = data.msg || 'Signup failed';
            }
        } catch (err) {
            console.error('Signup error:', err);
            document.getElementById('error-msg').innerText = 'An error occurred.';
        }
    });
}

// Create Post Form
const createPostForm = document.getElementById('create-post-form');
if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('content').value;
        const token = getToken();

        try {
            const res = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ content })
            });
            if (res.ok) {
                window.location.href = 'index.html';
            } else {
                const data = await res.json();
                document.getElementById('error-msg').innerText = data.msg || 'Failed to create post.';
            }
        } catch (err) {
            console.error('Create post error:', err);
            document.getElementById('error-msg').innerText = 'An error occurred.';
        }
    });
}


// --- Dynamic Content Loading ---

// Load Posts (Home Page)
const postsContainer = document.getElementById('posts-container');
if (postsContainer) {
    loadPosts();
}

async function loadPosts() {
    const token = getToken();
    try {
        const res = await fetch(`${API_BASE_URL}/posts`, {
            headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error('Failed to fetch posts');
        const posts = await res.json();
        postsContainer.innerHTML = posts.map(post => createPostHTML(post)).join('');
        attachPostEventListeners();
    } catch (err) {
        console.error(err);
        postsContainer.innerHTML = '<p class="error-msg">Could not load feed.</p>';
    }
}

// Load Profile (Profile Page)
const userPostsContainer = document.getElementById('user-posts-container');
const profileInfo = document.getElementById('profile-info');
if (userPostsContainer && profileInfo) {
    loadProfile();
}

async function loadProfile() {
    const token = getToken();
    try {
        // Get current user's info
        const userRes = await fetch(`${API_BASE_URL}/users/me`, {
             headers: { 'x-auth-token': token }
        });
        if (!userRes.ok) throw new Error('Failed to fetch user profile');
        const user = await userRes.json();

        profileInfo.innerHTML = `
            <h1>${user.username}</h1>
            <p>Email: ${user.email}</p>
            <p>Followers: ${user.followers.length} | Following: ${user.following.length}</p>
        `;

        // Get user's posts
        const postsRes = await fetch(`${API_BASE_URL}/posts/user/${user._id}`, {
            headers: { 'x-auth-token': token }
        });
        if (!postsRes.ok) throw new Error('Failed to fetch user posts');
        const posts = await postsRes.json();
        userPostsContainer.innerHTML = posts.map(post => createPostHTML(post)).join('');
        attachPostEventListeners();

    } catch (err) {
        console.error(err);
        profileInfo.innerHTML = `<p class="error-msg">${err.message}</p>`;
    }
}


// --- HTML Generation ---

function createPostHTML(post) {
    const currentUserId = localStorage.getItem('userId');
    const isLiked = post.likes.includes(currentUserId);
    // Ensure post.user is an object before trying to access username
    const username = post.user ? post.user.username : 'Unknown User';
    return `
        <div class="post" data-id="${post._id}">
            <div class="post-header">
                <strong>${username}</strong>
                <span>${new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button data-action="like">${isLiked ? 'Unlike' : 'Like'} (<span class="like-count">${post.likes.length}</span>)</button>
                <button data-action="toggle-comments">Comment (<span class="comment-count">${post.comments.length}</span>)</button>
                ${post.user && post.user._id === currentUserId ? `<button data-action="delete">Delete</button>` : ''}
            </div>
            <div class="comment-section" style="display:none;">
                <div class="comments-list">
                    ${post.comments.map(c => `
                        <div class="comment">
                            <strong>${c.user ? c.user.username : 'You'}:</strong> ${c.text}
                        </div>`).join('')}
                </div>
                <form class="comment-form">
                    <input type="text" placeholder="Write a comment..." name="comment" required>
                    <button type="submit">Post</button>
                </form>
            </div>
        </div>
    `;
}

// --- Event Delegation for Posts ---

async function handlePostAction(e) {
    const target = e.target;
    const action = target.dataset.action;
    
    // Handle form submission for comments
    if (target.closest('.comment-form')) {
        e.preventDefault();
        const postElement = target.closest('.post');
        const postId = postElement.dataset.id;
        const input = postElement.querySelector('input[name="comment"]');
        const text = input.value.trim();

        if (!text) return;
        await postComment(postId, text, postElement);
        input.value = '';
        return;
    }
    
    if (!action) return; // Not a button click we care about

    const postElement = target.closest('.post');
    const postId = postElement.dataset.id;

    switch (action) {
        case 'like':
            await likePost(postId, postElement);
            break;
        case 'toggle-comments':
            const commentsSection = postElement.querySelector('.comment-section');
            commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
            break;
        case 'delete':
            if (confirm('Are you sure you want to delete this post?')) {
                await deletePost(postId, postElement);
            }
            break;
    }
}

async function likePost(postId, postElement) {
    const token = getToken();
    try {
        const res = await fetch(`${API_BASE_URL}/interactions/like/${postId}`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error('Like action failed');
        const updatedPost = await res.json();
        
        // Update UI directly
        const likeButton = postElement.querySelector('[data-action="like"]');
        const likeCountSpan = postElement.querySelector('.like-count');
        const currentUserId = localStorage.getItem('userId');
        const isLiked = updatedPost.likes.includes(currentUserId);
        
        likeButton.textContent = isLiked ? 'Unlike' : 'Like';
        likeCountSpan.textContent = updatedPost.likes.length;
        // Re-add the count span that we just overwrote
        likeButton.append(' (', likeCountSpan, ')');

    } catch (err) {
        console.error('Error liking post:', err);
    }
}

async function deletePost(postId, postElement) {
    const token = getToken();
    try {
        const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error('Failed to delete post');
        postElement.remove(); // Efficiently remove from DOM
    } catch (err) {
        console.error('Error deleting post:', err);
    }
}

async function postComment(postId, text, postElement) {
    const token = getToken();
    try {
        const res = await fetch(`${API_BASE_URL}/interactions/comment/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ text })
        });
        if (!res.ok) throw new Error('Failed to post comment');
        const newComment = await res.json();
        
        // Update UI directly
        const commentsList = postElement.querySelector('.comments-list');
        const commentCountSpan = postElement.querySelector('.comment-count');
        
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        // The backend returns the new comment object, which should have the user populated
        commentElement.innerHTML = `<strong>${newComment.user.username}:</strong> ${newComment.text}`;
        commentsList.appendChild(commentElement);

        // Update comment count
        commentCountSpan.textContent = parseInt(commentCountSpan.textContent) + 1;

    } catch (err) {
        console.error('Error posting comment:', err);
    }
}


function attachPostEventListeners() {
    const container = postsContainer || userPostsContainer;
    if (container) {
        container.addEventListener('click', handlePostAction);
        container.addEventListener('submit', handlePostAction);
    }
}

// --- Initial Load ---
checkAuth();