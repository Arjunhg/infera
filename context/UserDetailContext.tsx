
import { UserDetails } from "@/types/Types";
import { createContext } from "react";

type UserDetailContextType = {
    userDetails: UserDetails | null;
    setUserDetails: React.Dispatch<React.SetStateAction<UserDetails | null>>;

}

export const UserDetailContext = createContext<UserDetailContextType | null>(null);