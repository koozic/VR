const BoardList = ({ posts }) => {
  if (posts.length === 0) return <div>게시글이 없습니다.</div>;
  return (
    <div>
      {posts.map((post) => (
        <div key={post.b_no}>
          <div>{post.b_title}</div>
          <div>{post.b_author}</div>
          <div>{post.b_date}</div>
        </div>
      ))}
    </div>
  );
};
export default BoardList;
