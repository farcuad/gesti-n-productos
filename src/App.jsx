import { Routes, Route, BrowserRouter as Router} from "react-router-dom";
import Home from "./components/home";
import Login from "./views/login";
import Register from "./views/register";
import SendEmail from "./views/sendEmail";
import ResetPassword from "./views/resetPassword";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/send-email" element={<SendEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/home/*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
