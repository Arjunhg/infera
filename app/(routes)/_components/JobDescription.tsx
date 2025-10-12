import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { onInputChangeType } from '@/types/Types'
import React from 'react'

const JobDescription = ({onInputChange}: {onInputChange: onInputChangeType}) => {

  return (
    <div className='w-full space-y-6'>
      <div className="space-y-2 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          Job Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Provide job information to generate relevant interview questions.
        </p>
      </div>

      <div className='bg-card border border-border rounded-lg p-4 sm:p-6 space-y-6'>
        <div className="space-y-2">
          <label htmlFor="jobTitle" className="text-sm font-medium text-foreground">
            Job Title <span className="text-destructive">*</span>
          </label>
          <Input 
            id="jobTitle"
            placeholder='e.g., Senior Full Stack Developer' 
            className="w-full"
            onChange={(e) => onInputChange('jobTitle', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="jobDescription" className="text-sm font-medium text-foreground">
            Job Description <span className="text-destructive">*</span>
          </label>
          <Textarea 
            id="jobDescription"
            placeholder='Describe the role, responsibilities, required skills, and qualifications...' 
            className='min-h-[180px] sm:min-h-[200px] resize-none'
            onChange={(e) => onInputChange('jobDescription', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Be specific about required skills and experience for better interview questions.
          </p>
        </div>
      </div>
    </div>
  )
}

export default JobDescription
