'use client'
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { UserDetails } from '@/types/Types';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { useContext, useEffect } from 'react'
import { ReactNode } from "react";


function Provider({children}: {children: ReactNode}) {

  const [userDetails, setUserDetails] = React.useState<UserDetails | null>(null);

  const CreateUser = useMutation(api.users.CreateNewUser);

  const { user } = useUser();

  const CreateNewUser = async () => {
    if(user){
        try {
          console.log("Creating/fetching user for:", user.primaryEmailAddress?.emailAddress);
          const result = await CreateUser({
            email: user?.primaryEmailAddress?.emailAddress || '',
            imageUrl: user?.imageUrl || '',
            name: user?.fullName || ''
          })
          // console.log("User result from Convex:", result);
          setUserDetails(result);
        } catch (error) {
          console.error("Error creating/fetching user:", error);
        }
    }
  }

  useEffect(() => {
    user && CreateNewUser();
  }, [user])


  return (
      <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
        <div>
          {children}
        </div>
      </UserDetailContext.Provider>
  )
}

export default Provider;

export const useUserDetailsConext = () => {
  const context = useContext(UserDetailContext);
  if (!context) {
    throw new Error('useUserDetailsContext must be used within a UserDetailProvider');
  }
  return context;
}
