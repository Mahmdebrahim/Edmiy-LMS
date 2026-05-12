import { RouterProvider } from "react-router-dom";
import router from "./router";
import ScrollToTop from "./components/common/ScrollToTop";
        
const App = () => {
  return (
    <main>
      <ScrollToTop />
      <RouterProvider router={router} />
    </main>
  );
}

export default App
