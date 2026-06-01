import axios from "axios";

const api = axios.create({

  baseURL:
    "https://saas-pos-backend-m8et.onrender.com",

  withCredentials: true
});


// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(

  (config) => {

    const tenant =
      localStorage.getItem(
        "tenant"
      );

    if (tenant) {

      config.headers[
        "X-Tenant-ID"
      ] = tenant;
    }

    return config;
  }
);


// ✅ RESPONSE INTERCEPTOR
api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest =
      error.config;

    // ACCESS TOKEN EXPIRED
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      try {

        // REFRESH ACCESS TOKEN
        await axios.post(

          "https://saas-pos-backend-m8et.onrender.com/auth/refresh",

          {},

          {
            withCredentials: true,

            headers: {
              "X-Tenant-ID":
                localStorage.getItem(
                  "tenant"
                )
            }
          }
        );

        // RETRY ORIGINAL REQUEST
        return api(originalRequest);

      } catch (refreshError) {

  console.log("REFRESH FAILED");
  console.log(refreshError);

  return;
}
    }

    return Promise.reject(error);
  }
);

export default api;