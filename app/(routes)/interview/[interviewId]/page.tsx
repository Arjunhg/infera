'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Send } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

const Interview = () => {

    const { interviewId } = useParams();

  return (
    <div className='min-h-screen bg-background flex flex-col justify-center items-center py-8 px-4'>
      <div className='max-w-4xl w-full'>
        {/* Hero Image */}
        <div className="flex justify-center items-center mb-6">
          <div className="relative w-full max-w-25 sm:max-w-30">
            <Image 
              src={'/Interview.png'} 
              alt="Job Interview" 
              width={250}
              height={188}
              className='w-full h-auto object-contain rounded-xl shadow-lg'
              priority
            />
          </div>
        </div>

        {/* Main Content */}
        <div className='bg-card border border-border rounded-xl p-6 sm:p-8 lg:p-10 shadow-sm'>
          <div className='flex flex-col items-center space-y-6 text-center'>
            <h1 className='font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground'>
              Ready to Start Interview?
            </h1>
            
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
              The interview will last approximately 30 minutes. Make sure you're in a quiet environment and ready to begin.
            </p>

            <Link href={`/interview/${interviewId}/start`}>
                <Button
                    size="lg"
                    className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                Start Interview 
                <ArrowRight size={20} />
            </Button>

            </Link>
            {/* Divider */}
            <div className="w-full border-t border-border my-6"></div>

            {/* Share Section */}
            <div className="w-full max-w-2xl">
              <div className="bg-secondary/30 border border-border rounded-lg p-4 sm:p-6 space-y-4">
                <h2 className='font-semibold text-lg sm:text-xl lg:text-2xl text-foreground text-center'>
                  Share Interview Link
                </h2>
                
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Send this interview to a candidate via email
                </p>
                
                <div className='flex flex-col sm:flex-row gap-3 w-full items-stretch sm:items-center'>
                  <Input 
                    placeholder='Enter candidate email address' 
                    className='flex-1 w-full'
                  />
                  <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                    <Send size={16}/>
                    <span className="sm:hidden">Send Invitation</span>
                  </Button>   
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Interview
