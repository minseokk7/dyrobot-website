/**
 * Board CRUD Logic
 * ================
 * 게시판 목록 조회, 검색, 페이지네이션
 */

const POSTS_PER_PAGE = 10;
let currentPage = 1;
let totalPosts = 0;
let searchKeyword = '';

async function loadPosts(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('postTableBody');
  tbody.innerHTML = '<tr><td colspan="5"><div class="loading-spinner"><div class="spinner"></div></div></td></tr>';

  try {
    // Count total
    let countQuery = db.from('posts').select('*', { count: 'exact', head: true });
    if (searchKeyword) {
      countQuery = countQuery.or(`title.ilike.%${searchKeyword}%,content.ilike.%${searchKeyword}%`);
    }
    const { count } = await countQuery;
    totalPosts = count || 0;
    document.getElementById('postCount').textContent = `총 ${totalPosts}건`;

    // Fetch posts with comment count
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    let query = db
      .from('posts')
      .select('id, title, author, created_at, views, comments(count)')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (searchKeyword) {
      query = query.or(`title.ilike.%${searchKeyword}%,content.ilike.%${searchKeyword}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5">
          <div class="empty-state">
            <div class="icon">📭</div>
            <p>게시글이 없습니다.</p>
          </div>
        </td></tr>`;
      renderPagination();
      return;
    }

    tbody.innerHTML = data.map((post, i) => {
      const num = totalPosts - from - i;
      const date = new Date(post.created_at).toLocaleDateString('ko-KR');
      const cmtCount = post.comments?.[0]?.count || 0;
      return `
        <tr>
          <td>${num}</td>
          <td>
            <a class="post-title" href="board-view.html?id=${post.id}">
              ${escapeHtml(post.title)}
              ${cmtCount > 0 ? `<span class="comment-count">[${cmtCount}]</span>` : ''}
            </a>
          </td>
          <td>${escapeHtml(post.author)}</td>
          <td>${date}</td>
          <td>${post.views || 0}</td>
        </tr>`;
    }).join('');

    renderPagination();
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="empty-state">
          <div class="icon">⚠️</div>
          <p>데이터를 불러올 수 없습니다. Supabase 설정을 확인하세요.</p>
        </div>
      </td></tr>`;
  }
}

function renderPagination() {
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE) || 1;
  const container = document.getElementById('pagination');
  let html = '';

  if (currentPage > 1) {
    html += `<button onclick="loadPosts(${currentPage - 1})">‹</button>`;
  }

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  for (let p = startPage; p <= endPage; p++) {
    html += `<button class="${p === currentPage ? 'active' : ''}" onclick="loadPosts(${p})">${p}</button>`;
  }

  if (currentPage < totalPages) {
    html += `<button onclick="loadPosts(${currentPage + 1})">›</button>`;
  }

  container.innerHTML = html;
}

function searchPosts() {
  searchKeyword = document.getElementById('searchInput').value.trim();
  loadPosts(1);
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// 초기 로드
loadPosts(1);
