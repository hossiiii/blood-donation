import { BrowserRouter, Route, Routes } from "react-router-dom";
import History from "../pages/History";

function RoutingConfig(): JSX.Element {
    return (
        <>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<History />} />
            </Routes>
          </BrowserRouter>
        </>
      );
};
export default RoutingConfig;