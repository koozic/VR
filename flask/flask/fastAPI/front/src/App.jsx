import { useState, useEffect } from "react";
import axios from "axios";
function App() {
  const [msg, setMsg] = useState("not yet");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000").then((response) => {
      setMsg(response.data.message);
    });
  }, []);

  return <div>fast api {msg} </div>;
}

export default App;
