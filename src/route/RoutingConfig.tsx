import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Donation from "../pages/Donation";
import Record from "../pages/Record";
import Infomation from "../pages/Infomation";
import Setting from "../pages/Setting";

function RoutingConfig(): JSX.Element {
    return (
        <>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/donation" element={<Donation />} />
              <Route path="/record" element={<Record />} />
              <Route path="/infomation" element={<Infomation />} />
              <Route path="/setting" element={<Setting />} />
            </Routes>
          </BrowserRouter>
        </>
      );
};
export default RoutingConfig;