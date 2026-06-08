import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/hello") // flask 주소 uniform resource locator
      .then((res) => res.json())
      .then((data) => setMsg(data.message));
  }, []);

  return (
    <div>
      <h1>{msg}</h1>
    </div>
  );
}

export default App;
