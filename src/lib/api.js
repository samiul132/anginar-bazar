// ============================================
// API Configuration
// ============================================
export const API_BASE_URL = "https://app.anginarbazar.com/api";

export const API_ENDPOINTS = {
  AUTHENTICATE_CUSTOMER: "/authenticate-customer",
  VERIFY_OTP: "/verify-otp",
  INIT_PROFILE: "/init-profile",
  DELETE_ACCOUNT: "/delete-account",
  ADDRESS: "/address",
  GET_HOME_DATA: "/get-home-data",
  GET_ALL_PRODUCTS: "/get_all_products",
  GET_CATEGORIES: "/get-categories",
  GET_BRANDS: "/get-brands",
  GET_PRODUCTS_BY_CATEGORY: (slug) => `/get-products-by-category/${slug}`,
  GET_PRODUCTS_BY_BRAND: (slug) => `/get-products-by-brand/${slug}`,
  GET_PRODUCT_DETAILS: (slug) => `/get-product-details/${slug}`,
  GET_POPULAR_ITEMS: "/get-popular-items",
  SEARCH: "/search",
  PLACE_ORDER: "/place-order",
  MY_ORDERS: "/my-orders",
  ORDER_DETAILS: (orderId) => `/order-details/${orderId}`,
  CONTACT_US: "/contact-us",
  GET_RELATED_PRODUCTS: (productId) => `/get-related-products/${productId}`,
};

// ============================================
// Storage Helper Functions (for Next.js)
// ============================================
export const storage = {
  getAuthToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  setAuthToken: (token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  getCustomerData: () => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('customer_data');
    return data ? JSON.parse(data) : null;
  },

  setCustomerData: (customerData) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('customer_data', JSON.stringify(customerData));
  },

  clearAuthData: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer_data');
  },

  isAuthenticated: () => {
    return !!storage.getAuthToken();
  },
};

// ============================================
// Main API Request Function
// ============================================
export async function apiRequest(endpoint, options = {}) {
  try {
    const token = storage.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// ============================================
// Image Helper Functions
// ============================================
// thumbnail,full
export const getImageUrl = (imagePath, type = 'full') => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.length < 5) {
    return 'https://via.placeholder.com/200';
  }
  if (imagePath.startsWith('http')) return imagePath;
  return `https://app.anginarbazar.com/uploads/images/${type}/${imagePath}`;
};

export const getSliderImage = (image) => {
  if (!image) return 'https://via.placeholder.com/800x400';
  if (image.startsWith('http')) return image;
  return `https://app.anginarbazar.com/uploads/images/full/${image}`;
};

// ============================================
// API Functions - Authentication
// ============================================
export const auth = {
  authenticateCustomer: async (phone) => {
    return apiRequest(API_ENDPOINTS.AUTHENTICATE_CUSTOMER, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  verifyOtp: async (phone, otp) => {
    const response = await apiRequest(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });

    if (response.token) {
      storage.setAuthToken(response.token);
    }
    if (response.user) {
      storage.setCustomerData(response.user);
    }

    return response;
  },

  initProfile: async (profileData) => {
    const response = await apiRequest(API_ENDPOINTS.INIT_PROFILE, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });

    if (response.status === 'success' && response.user) {
      storage.setCustomerData(response.user);
    }

    return response;
  },

  deleteAccount: async () => {
    return apiRequest(API_ENDPOINTS.DELETE_ACCOUNT, {
      method: 'DELETE',
    });
  },

  logout: () => {
    storage.clearAuthData();
  },
};

// ============================================
// API Functions - Categories & Products
// ============================================
export const categories = {
  getAll: async () => {
    return apiRequest(API_ENDPOINTS.GET_CATEGORIES);
  },

  getProducts: async (slug, page = 1) => {
    const endpoint = page > 1 
      ? `${API_ENDPOINTS.GET_PRODUCTS_BY_CATEGORY(slug)}?page=${page}`
      : API_ENDPOINTS.GET_PRODUCTS_BY_CATEGORY(slug);
    
    const response = await apiRequest(endpoint);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: {
          category: response.data.catInfo,
          products: response.data.products || { data: [], last_page: 1 },
        },
      };
    }
    
    return response;
  },
};

export const products = {
  getDetails: async (slug) => {
    return apiRequest(API_ENDPOINTS.GET_PRODUCT_DETAILS(slug));
  },

  getPopular: async (page = 1) => {
    const endpoint = page > 1 
      ? `${API_ENDPOINTS.GET_POPULAR_ITEMS}?page=${page}`
      : API_ENDPOINTS.GET_POPULAR_ITEMS;
    return apiRequest(endpoint);
  },

  search: async (keywords) => {
    if (!keywords || keywords.trim().length === 0) {
      return {
        success: true,
        data: {
          products: {
            data: [],
            current_page: 1,
            last_page: 1,
            total: 0
          }
        }
      };
    }
    
    const endpoint = `${API_ENDPOINTS.SEARCH}?keywords=${encodeURIComponent(keywords.trim())}`;
    return apiRequest(endpoint);
  },

  getRelatedProducts: async (productId) => {
    return apiRequest(API_ENDPOINTS.GET_RELATED_PRODUCTS(productId));
  },
};

export const brands = {
  getAll: async () => {
    return apiRequest(API_ENDPOINTS.GET_BRANDS);
  },
  getProducts: async (slug) => {
    return apiRequest(API_ENDPOINTS.GET_PRODUCTS_BY_BRAND(slug));
  },
};

// ============================================
// API Functions - Home Data
// ============================================
export const home = {
  getData: async () => {
    return apiRequest(API_ENDPOINTS.GET_HOME_DATA);
  },
};

// ============================================
// API Functions - All Products
// ============================================
export const allProducts = {
  getData: async () => {
    return apiRequest(API_ENDPOINTS.GET_ALL_PRODUCTS);
  },
};

// ============================================
// API Functions - Address
// ============================================
export const address = {
  getAll: async () => {
    return apiRequest(API_ENDPOINTS.ADDRESS);
  },

  add: async (addressData) => {
    return apiRequest(API_ENDPOINTS.ADDRESS, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  update: async (addressId, addressData) => {
    return apiRequest(`${API_ENDPOINTS.ADDRESS}/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  delete: async (addressId) => {
    return apiRequest(`${API_ENDPOINTS.ADDRESS}/${addressId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// API Functions - Orders
// ============================================
export const orders = {
  place: async (orderData) => {
    return apiRequest(API_ENDPOINTS.PLACE_ORDER, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getMyOrders: async (page = 1) => {
    const token = storage.getAuthToken();
    if (!token) {
      return {
        success: false,
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
        message: 'Not authenticated',
      };
    }

    const url = page > 1 
      ? `${API_ENDPOINTS.MY_ORDERS}?page=${page}`
      : API_ENDPOINTS.MY_ORDERS;

    const response = await apiRequest(url, { method: 'POST' });
    
    return {
      success: response.success,
      data: response.data?.myOrders?.data || [],
      current_page: response.data?.myOrders?.current_page || 1,
      last_page: response.data?.myOrders?.last_page || 1,
      total: response.data?.myOrders?.total || 0,
      message: response.message,
    };
  },

  getDetails: async (orderId, isGuest = false) => {
    if (isGuest) {
      return {
        success: true,
        data: null,
        message: 'Guest order - limited details available',
      };
    }

    const response = await apiRequest(API_ENDPOINTS.ORDER_DETAILS(orderId), {
      method: 'POST',
    });

    return {
      success: response.success,
      data: response.data?.order,
      message: response.message,
    };
  },
};

// ============================================
// API Functions - Contact Us
// ============================================
export const contact = {
  send: async (formData) => {
    return apiRequest(API_ENDPOINTS.CONTACT_US, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
};

// ============================================
// Error Handler
// ============================================
export const handleApiError = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// ============================================
// Export all API functions
// ============================================
export const api = {
  auth,
  categories,
  products,
  brands,
  home,
  address,
  orders,
  contact,
};

export default api;