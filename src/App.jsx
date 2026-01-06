import { Routes, Route, BrowserRouter as Router} from "react-router-dom";
import Home from "./components/home";
import Login from "./views/login";
import Register from "./views/register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/home/*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
