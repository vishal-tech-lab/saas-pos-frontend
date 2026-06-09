import axios from "axios";

export const loadTenant = async () => {

    const hostname =
        window.location.hostname;

    const parts =
        hostname.split(".");

    if (parts.length < 3) {
        return null;
    }

    const subdomain =
        parts[0];

    const response =
        await axios.get(
            `/tenant/by-subdomain/${subdomain}`
        );

    return response.data;
};