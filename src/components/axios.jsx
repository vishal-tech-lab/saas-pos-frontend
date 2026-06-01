import axios from "axios";

const api = axios.create({

  baseURL:
    "http://localhost:8080",

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

          "http://localhost:8080/auth/refresh",

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

        // LOGOUT USER
        localStorage.clear();

        const tenant =
          localStorage.getItem(
            "tenant"
          );

        window.location.href =
          `/login/${
            tenant || "tenant_test"
          }`;

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;