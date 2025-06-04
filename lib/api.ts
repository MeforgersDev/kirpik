// api.ts
import axios from "axios";

// API'nizin temel URL'i
const API_URL = "https://kirpikapi.esmedddemo.com/api";

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - her istekte localStorage'dan token alıp Authorization header'ına ekler.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth işlemleri
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post("/auth/register", { name, email, password });
    return response.data;
  } catch (error: any) {
    console.error("Register error:", error.response?.data || error.message);
    throw error;
  }
};

// Ürün işlemleri

// Backend'deki ProductOptionValue'nun içindeki Option bilgisini yansıtan arayüz
export interface ProductOptionForValue {
  id: number;
  name: string; // "Renk", "Beden"
}

// Backend'deki ProductVariantConfiguration'ın OptionValue içindeki yapıyı yansıtan arayüz
export interface ProductOptionValueInConfig {
  id: number;
  value: string; // "Mavi", "S"
  option: ProductOptionForValue; // İlişkili seçenek türü (name ve id ile)
}

// Backend'deki ProductVariantConfiguration yapısını yansıtan arayüz
export interface ProductVariantConfiguration {
    id: number;
    optionValue: ProductOptionValueInConfig;
}

// Backend'deki ProductVariant yapısını yansıtan arayüz
export interface ProductVariant {
  id: number; // Varyantın kendi ID'si
  productId: number;
  sku?: string | null;
  price?: number | null; // Varyanta özel fiyat (null ise ana ürün fiyatı kullanılır)
  stock: number;
  configurations: ProductVariantConfiguration[]; // Varyantı oluşturan seçenek kombinasyonları
}

// Backend'deki ProductImage yapısını yansıtan arayüz
export interface ProductImage {
  id: number;
  url: string;
  productId: number;
  createdAt: string;
}

// Backend'deki ProductOptionValue yapısını yansıtan arayüz (genel seçenekler için)
export interface ProductOptionValue {
    id: number;
    value: string; // "Mavi", "S"
}

// Backend'deki ProductOption yapısını yansıtan arayüz (genel seçenek tanımları için)
export interface ProductOption {
    id: number;
    name: string; // "Renk", "Beden"
    values: ProductOptionValue[]; // O seçeneğin tüm olası değerleri
}


// Backend'deki Product yapısını yansıtan ana ürün arayüzü
export interface Product {
  id: number;
  title: string;
  description?: string | null;
  price: number; // Ana ürün fiyatı, varyantlar için varsayılan
  published: boolean;
  isFavorite: boolean;
  categoryId?: number | null;
  category?: Category | null;
  images: ProductImage[];
  options: ProductOption[]; // Ürünün sahip olduğu seçenek türleri (örn: Renk, Beden)
  variants: ProductVariant[]; // Ürünün tüm satılabilir varyantları
  createdAt: string;
}

// Kategori arayüzü
export interface Category {
  id: number;
  name: string;
}


// Tüm ürünleri çekmek için GET isteği
export const fetchProducts = async () => {
  try {
    const response = await api.get<Product[]>("/products");
    return response.data;
  } catch (error: any) {
    console.error("Fetch products error:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchFavoriteProducts = async () => {
  try {
    const response = await api.get<Product[]>("/products/favorites");
    return response.data;
  } catch (error: any) {
    console.error("Fetch favorite products error:", error.response?.data || error.message);
    throw error;
  }
};

// Admin ürün listesi (taslaklar dahil)
export const fetchProductsAdmin = async () => {
  try {
    const response = await api.get<Product[]>("/products/admin/products");
    return response.data;
  } catch (error: any) {
    console.error("Fetch products admin error:", error.response?.data || error.message);
    throw error;
  }
};

// Belirli bir ürünü ID'sine göre çekmek için GET isteği (Admin için)
export const fetchProductByIdAdmin = async (id: number) => {
  try {
    const response = await api.get<Product>(`/products/admin/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Fetch product by ID (Admin) ${id} error:`, error.response?.data || error.message);
    throw error;
  }
};

// Belirli bir ürünü ID'sine göre çekmek için GET isteği (Public için)
export const fetchProductById = async (id: number) => {
  try {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Fetch product by ID ${id} error:`, error.response?.data || error.message);
    throw error;
  }
};

// Kategori işlemleri
// Tüm kategorileri çekmek için GET isteği
export const fetchCategories = async () => {
  try {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  } catch (error: any) {
    console.error("Fetch categories error:", error.response?.data || error.message);
    throw error;
  }
};

// Slider işlemleri
// Tüm slider verilerini çekmek için GET isteği
export const fetchSliders = async () => {
  try {
    const response = await api.get("/sliders");
    return response.data;
  } catch (error: any) {
    console.error("Fetch sliders error:", error.response?.data || error.message);
    throw error;
  }
};

// Sipariş işlemleri
// Yeni sipariş oluşturmak için POST isteği
export const createOrder = async (orderData: {
  // CartItem artık sadece variantId ve quantity gönderecek
  cartItems: Array<{ productVariantId: number; quantity: number }>;
  address: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  orderNote?: string;
}) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error: any) {
    console.error("Create order error:", error.response?.data || error.message);
    throw error;
  }
};

// Giriş yapmış kullanıcının siparişlerini çekmek için GET isteği
export const fetchUserOrders = async () => {
  try {
    const response = await api.get("/orders/me");
    return response.data;
  } catch (error: any) {
    console.error("Fetch user orders error:", error.response?.data || error.message);
    throw error;
  }
};

// ADMIN Sipariş işlemleri
// Tüm siparişleri çekmek için GET isteği
export const fetchAllOrders = async () => {
    try {
        const response = await api.get("/orders");
        return response.data;
    } catch (error: any) {
        console.error("Fetch all orders error:", error.response?.data || error.message);
        throw error;
    }
};

// Admin işlemleri
// Yeni ürün eklemek için POST isteği
export const addProduct = async (productData: FormData) => {
  try {
    const response = await api.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Add product error:", error.response?.data || error.message);
    throw error;
  }
};

// Mevcut ürünü güncellemek için PUT isteği
export const updateProduct = async (id: number, productData: FormData) => {
  try {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Update product ${id} error:`, error.response?.data || error.message);
    throw error;
  }
};

// Ürün silmek için DELETE isteği
export const deleteProduct = async (id: number) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Delete product ${id} error:`, error.response?.data || error.message);
    throw error;
  }
};

// Yeni kategori eklemek için POST isteği
export const addCategory = async (name: string) => {
  try {
    const response = await api.post("/categories", { name });
    return response.data;
  } catch (error: any) {
    console.error("Add category error:", error.response?.data || error.message);
    throw error;
  }
};

// Kategori silmek için DELETE isteği
export const deleteCategory = async (id: number) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Delete category ${id} error:`, error.response?.data || error.message);
    throw error;
  }
};

// Yeni slider eklemek için POST isteği
export const addSlider = async (sliderData: FormData) => {
  try {
    const response = await api.post("/sliders", sliderData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Add slider error:", error.response?.data || error.message);
    throw error;
  }
};

// Slider silmek için DELETE isteği
export const deleteSlider = async (id: number) => {
  try {
    const response = await api.delete(`/sliders/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Delete slider ${id} error:`, error.response?.data || error.message);
    throw error;
  }
};