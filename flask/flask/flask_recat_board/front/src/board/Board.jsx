import React, { useState } from "react";
import BoardList from "./BoardList";

const Board = () => {
  const [posts, setPosts] = useState([
    {
      b_no: 1,
      b_title: "첫 번째 게시글",
      b_author: "사용자1",
      b_date: "2025-03-24",
      b_content: "내용",
    },
    {
      b_no: 2,
      b_title: "첫 번째 게시글",
      b_author: "사용자1",
      b_date: "2025-03-24",
      b_content: "내용",
    },
    {
      b_no: 3,
      b_title: "첫 번째 게시글",
      b_author: "사용자1",
      b_date: "2025-03-24",
      b_content: "내용",
    },
  ]);
  return (
    <div>
      <BoardList posts={posts} />
    </div>
  );
};

export default Board;
