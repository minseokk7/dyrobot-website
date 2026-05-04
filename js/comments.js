/**
 * Comments Logic
 * ==============
 * 댓글 조회, 작성, 삭제
 */

async function loadComments(postId) {
  const container = document.getElementById('commentList');
  try {
    const { data, error } = await db
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    document.getElementById('commentCount').textContent = data?.length || 0;

    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding:30px"><p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p></div>';
      return;
    }

    container.innerHTML = data.map(cmt => `
      <div class="comment-item">
        <div class="comment-top">
          <span class="comment-author">👤 ${escapeHtml(cmt.author)}</span>
          <span class="comment-date">${new Date(cmt.created_at).toLocaleDateString('ko-KR')} ${new Date(cmt.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="comment-text">${escapeHtml(cmt.content)}</div>
        <button class="comment-delete" onclick="deleteComment(${cmt.id})">삭제</button>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><p>댓글을 불러올 수 없습니다.</p></div>';
  }
}

async function submitComment() {
  const author = document.getElementById('cmtAuthor').value.trim();
  const password = document.getElementById('cmtPassword').value;
  const content = document.getElementById('cmtContent').value.trim();

  if (!author || !password || !content) {
    showToast('작성자, 비밀번호, 내용을 모두 입력하세요.', 'error');
    return;
  }

  try {
    const { error } = await db
      .from('comments')
      .insert([{ post_id: parseInt(postId), author, password, content }]);
    if (error) throw error;

    document.getElementById('cmtAuthor').value = '';
    document.getElementById('cmtPassword').value = '';
    document.getElementById('cmtContent').value = '';
    showToast('댓글이 등록되었습니다.', 'success');
    loadComments(postId);
  } catch (err) {
    showToast('댓글 등록 실패: ' + err.message, 'error');
  }
}

async function deleteComment(commentId) {
  const pw = prompt('댓글 비밀번호를 입력하세요:');
  if (!pw) return;

  try {
    const { data } = await db
      .from('comments')
      .select('password')
      .eq('id', commentId)
      .single();

    if (data.password !== pw) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    const { error } = await db
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;

    showToast('댓글이 삭제되었습니다.', 'success');
    loadComments(postId);
  } catch (err) {
    showToast('삭제 실패: ' + err.message, 'error');
  }
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
