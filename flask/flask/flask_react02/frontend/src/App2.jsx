import { useEffect, useState } from "react";

const App2 = () => {
  const [message, setMessage] = useState("fail");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/")
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);

  return (
    <div>
      <h1>flask {message}</h1>
    </div>
  );
};

export default App2;
