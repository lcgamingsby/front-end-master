import React, { createContext, useContext, useState } from "react";

const UserContext = createContext({
    user: undefined,
    setUser: () => {},
});

export function UserProvider({children}) {
    const [user, setUser] = useState(undefined);

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}