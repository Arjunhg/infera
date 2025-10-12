'use client';
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import CreateInterviewDialog from '../_components/CreateInterviewDialog';
import { useConvex } from 'convex/react';
import { useUserDetailsConext } from '@/app/Provider';
import { api } from '@/convex/_generated/api';
import { InterviewData } from '@/types/Types';
import InterviewCard from './_component/InterviewCard';
import EmptyState from './_component/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

function Dashboard() {

    const { user } = useUser();
    const [interviewList, setInterviewList] = useState<InterviewData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { userDetails } = useUserDetailsConext();
    const convex = useConvex();


    // console.log(setInterviewList);

    const getInterviewList = async() => {
      try {
          setLoading(true);
          if(userDetails?._id){
            const result = await convex.query(api.Interview.GetInterviewList, {
              uid: userDetails?._id
            });
            // setInterviewList(result);
            // Transform the array to map over each interview
            const transformedList: InterviewData[] = result.map(interview => 
              interview.resumeUrl ? {
                ...interview,
                type: "resume" as const,
                resumeUrl: interview.resumeUrl
              } : {
                ...interview,
                type: "manual" as const
              }
            );
            setInterviewList(transformedList);
            // console.log("Interview List:", transformedList);
          }
      } catch (error) {
        console.error("Error fetching interview list:", error);
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      userDetails && getInterviewList();
    }, [userDetails]);

    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto px-4 py-8 sm:px-6 lg:px-8 xl:px-12 max-w-7xl'>
          
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
            <div className="space-y-1">
              <p className='text-sm sm:text-base text-muted-foreground font-medium'>
                My Dashboard
              </p>
              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground'>
                Welcome back, {user?.fullName || 'User'}
              </h1>
            </div>

            <CreateInterviewDialog/>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {!loading && interviewList.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Interview cards */}
                {
                  interviewList.map((interview, index) => (
                    <InterviewCard key={index} interviewInfo={interview} />
                  ))
                }
              </div>
            )}

            {
              loading && <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {
                      [1,2,3,4,5,6].map((item, index) => (
                        <div className="flex flex-col space-y-3" key={index}>
                          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))
                    }
                  </div>
            }
          </div>
        </div>
      </div>
    )
}

export default Dashboard
