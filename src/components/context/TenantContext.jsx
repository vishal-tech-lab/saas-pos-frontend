import {
    createContext,
    useContext,
    useState
} from "react";

const TenantContext =
    createContext();

export const TenantProvider = ({
    children
}) => {

    const [tenant,setTenant] =
        useState(null);

    return (
        <TenantContext.Provider
            value={{
                tenant,
                setTenant
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant =
    () => useContext(TenantContext);