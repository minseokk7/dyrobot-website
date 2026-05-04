-- =============================================
-- 로봇소프트웨어과 자유게시판 테이블 생성
-- Supabase Migration
-- =============================================

-- 1. posts 테이블: 게시글
CREATE TABLE IF NOT EXISTS public.posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  password TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. comments 테이블: 댓글
CREATE TABLE IF NOT EXISTS public.comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);

-- 4. 조회수 증가 RPC 함수
CREATE OR REPLACE FUNCTION public.increment_views(post_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS (Row Level Security) 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책: 누구나 읽기 가능
CREATE POLICY "posts_select_all" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "comments_select_all" ON public.comments
  FOR SELECT USING (true);

-- 7. RLS 정책: 누구나 삽입 가능 (anon key)
CREATE POLICY "posts_insert_anon" ON public.posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "comments_insert_anon" ON public.comments
  FOR INSERT WITH CHECK (true);

-- 8. RLS 정책: 누구나 수정/삭제 가능 (비밀번호는 JS에서 확인)
CREATE POLICY "posts_update_anon" ON public.posts
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "posts_delete_anon" ON public.posts
  FOR DELETE USING (true);

CREATE POLICY "comments_delete_anon" ON public.comments
  FOR DELETE USING (true);

-- 9. 샘플 데이터 (테스트용)
INSERT INTO public.posts (title, content, author, password) VALUES
  ('로봇소프트웨어과 자유게시판에 오신 것을 환영합니다!', '이 게시판은 학과 학생들이 자유롭게 소통할 수 있는 공간입니다.
자유롭게 글을 남겨주세요!', '관리자', '1234'),
  ('2026 로봇 경진대회 팀원 모집합니다', '안녕하세요! 이번 로봇 경진대회에 함께 참가할 팀원을 모집합니다.
관심 있으신 분은 댓글 남겨주세요.

- 대회명: 2026 전국 로봇 소프트웨어 경진대회
- 일시: 2026.06.15
- 모집인원: 2~3명', '김민수', '1234'),
  ('아두이노 프로젝트 질문있습니다', 'DHT11 센서로 온습도 측정하는 프로젝트 하고 있는데,
LCD에 출력이 안 됩니다. 혹시 비슷한 경험 있으신 분?', '이준호', '1234');

INSERT INTO public.comments (post_id, content, author, password) VALUES
  (1, '환영합니다! 좋은 게시판이 생겼네요 👍', '박서연', '1234'),
  (2, '저도 참가하고 싶습니다! 연락처 알려주세요', '정다현', '1234'),
  (3, '핀 연결 확인해보세요. I2C 주소가 다를 수도 있습니다.', '최영훈', '1234');
