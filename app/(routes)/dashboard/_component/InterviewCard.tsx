import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InterviewData } from '@/types/Types'
import Link from 'next/link'
import React from 'react'
import FeedbackDialog from './FeedbackDialog'
import { Calendar, FileText, User } from 'lucide-react'

type Props = {
    interviewInfo: InterviewData
}

const InterviewCard = ({ interviewInfo }: Props) => {
    const TYPE = interviewInfo?.type;
    const STATUS = interviewInfo?.status;
    
    return (
        <div className='bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4'>
                <div className="flex-1 min-w-0">
                    <h2 className='font-semibold text-lg sm:text-xl text-foreground line-clamp-2'>
                        {TYPE === 'resume' ? 'Resume-Based Interview' : interviewInfo.jobTitle || 'Manual Interview'}
                    </h2>
                </div>
                <Badge 
                    variant={STATUS === 'completed' ? 'default' : 'secondary'}
                    className="shrink-0"
                >
                    {STATUS === 'draft' ? 'Ready' : STATUS === 'completed' ? 'Completed' : STATUS || 'Unknown'}
                </Badge>
            </div>

            {/* Description */}
            <p className='text-sm sm:text-base text-muted-foreground line-clamp-2 mb-4'>
                {TYPE === 'resume' 
                    ? 'Interview questions generated from your uploaded resume to assess relevant skills and experience.' 
                    : interviewInfo.jobDescription || 'Custom interview questions tailored for this position.'
                }
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    {TYPE === 'resume' ? <FileText size={14} /> : <User size={14} />}
                    <span>{TYPE === 'resume' ? 'Resume Based' : 'Manual Setup'}</span>
                </div>
                {interviewInfo._creationTime && (
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(interviewInfo._creationTime).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className='flex justify-end'>
                {STATUS === 'draft' ? (
                    <Link href={'/interview/' + interviewInfo._id}>
                        <Button size="sm" className="shadow-md hover:shadow-lg transition-all duration-200">
                            Start Interview
                        </Button>
                    </Link>
                ) : (
                    <FeedbackDialog feedbackInfo={interviewInfo?.feedback!}/>
                )}
            </div>
        </div>
    )
}

export default InterviewCard
