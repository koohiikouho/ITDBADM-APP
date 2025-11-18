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
import MePage from "@/pages/Me";
import MyOrdersPage from "./pages/orders";

//admin side
import CreateProductPage from "./pages/admin/createproduct";
import CreateBandPage from "./pages/admin/createband";
import DeleteProductPage from "./pages/admin/deleteproduct";
import SentOffersPage from "@/pages/offers";
import { AuthProvider } from "./lib/authContext";
import LikesPage from "./pages/likes";

//bandmanager side
import BandManagerDashboard from "./pages/bandmanager/dashboard";
import EditBandPage from "./pages/bandmanager/edit-band";
import ManageProductsPage from "./pages/bandmanager/manage-products";
import SchedulePage from "./pages/bandmanager/schedule";
import AnalyticsPage from "./pages/bandmanager/analytics";
import EditProductPage from "./pages/bandmanager/edit-product";


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<DocsPage />} path="/docs" />
        <Route element={<BandsPage />} path="/bands" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<AboutPage />} path="/about" />
        <Route element={<BandInfo />} path="/bandinfo/:bandId" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignUpPage />} path="/signup" />
        <Route element={<ProductPage />} path="/product/:productId" />
        <Route element={<CartPage />} path="/cart" />
        <Route element={<MerchandisePage />} path="/merchandise" />
        <Route element={<MePage />} path="/me" />
        <Route element={<BookPage />} path="/book/:bandId" />
        <Route element={<CreateProductPage />} path="/createproduct" />
        <Route element={<CreateBandPage />} path="/createband" />
        <Route element={<DeleteProductPage />} path="/deleteproduct" />
        <Route element={<LikesPage />} path="/likes" />
        <Route element={<BandManagerDashboard />} path="/bandmanager/dashboard" />
        <Route element={<EditBandPage />} path="/bandmanager/edit-band" />
        <Route element={<CreateProductPage />} path="/bandmanager/create-product" />
        <Route element={<ManageProductsPage />} path="/bandmanager/manage-products" />
        <Route element={<EditProductPage />} path="/bandmanager/edit-product/:productId" />
        <Route element={<SchedulePage />} path="/bandmanager/schedule" />
        <Route element={<AnalyticsPage />} path="/bandmanager/analytics" />

        <Route element={<SentOffersPage />} path="sent-offers" />
        <Route element={<MyOrdersPage />} path="/orders" />
      </Routes>
    </AuthProvider>
  );
}

export default App;
