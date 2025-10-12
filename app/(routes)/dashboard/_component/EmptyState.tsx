import Image from 'next/image'
import React from 'react'
import {  FileText, Users, Award } from 'lucide-react'
import CreateInterviewDialog from '../../_components/CreateInterviewDialog'

function EmptyState() {
  return (
    <div className='w-full'>
      {/* Main Empty State Card */}
      <div className='flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 bg-card border border-border rounded-xl shadow-sm'>
        {/* Illustration */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Image 
              src={'/Interview.png'} 
              width={80} 
              height={80} 
              alt='No interviews illustration'
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            No interviews yet
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
            Get started by creating your first interview. Set up questions, customize the experience, and begin interviewing candidates.
          </p>
        </div>

        <CreateInterviewDialog/>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border/50">
            <FileText className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs sm:text-sm font-medium text-foreground text-center">Custom Questions</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border/50">
            <Users className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs sm:text-sm font-medium text-foreground text-center">Multiple Candidates</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border/50">
            <Award className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs sm:text-sm font-medium text-foreground text-center">Smart Evaluation</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyState
