import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";

function RoutingConfig(): JSX.Element {
    return (
        <>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
            </Routes>
          </BrowserRouter>
        </>
      );
};
export default RoutingConfig;