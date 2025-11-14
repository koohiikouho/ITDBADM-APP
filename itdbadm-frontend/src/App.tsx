import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/";
import BandsPage from "@/pages/bands";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import BandInfo from "@/pages/band/bandinfo";
import LoginPage from "@/pages/login";
import SignUpPage from "./pages/signup";
import ProductPage from "./pages/band/product";
import BookPage from "./pages/band/book";
import CartPage from "./pages/cart";
import MerchandisePage from "./pages/merchandise";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<BandsPage />} path="/bands" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<BandInfo />} path="/bandinfo" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<SignUpPage />} path="/signup" />
      <Route element={<ProductPage />} path="/product" />
      <Route element={<CartPage />} path="/cart" />
      <Route element={<MerchandisePage />} path="/merchandise" />
      <Route element={<BookPage />} path="/book" />
    </Routes>
  );
}

export default App;
