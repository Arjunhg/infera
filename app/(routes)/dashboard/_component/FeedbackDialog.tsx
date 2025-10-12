import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { FeedbackType } from '@/types/Types'
import { ArrowRight, Star, MessageSquare, Lightbulb } from 'lucide-react'

type Props = {
    feedbackInfo : FeedbackType;
}

const FeedbackDialog = ({ feedbackInfo }: Props) => {

    // Convert feedbackInfo suggestion into array by splitting on full stop
    const suggestions = feedbackInfo.suggestion ? feedbackInfo.suggestion.split('.').filter(s => s.trim() !== '') : [];

    // Generate star rating display
    const renderStars = (rating: number) => {
        return Array.from({ length: 10 }, (_, index) => (
            <Star
                key={index}
                size={18}
                className={`${index < rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`}
            />
        ));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="shadow-md hover:shadow-lg transition-all duration-200">
                    View Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-scroll no-scrollbar">
                <DialogHeader className="space-y-3 pb-4">
                    <DialogTitle className='text-xl sm:text-2xl font-bold text-foreground'>
                        Interview Feedback
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                        Here's your detailed interview performance feedback and suggestions for improvement.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Rating Section */}
                    <div className="bg-secondary/20 border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="text-primary" size={20} />
                            <h3 className='font-semibold text-lg text-foreground'>Overall Rating</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                {renderStars(feedbackInfo.rating)}
                            </div>
                            <span className="text-lg font-bold text-foreground">
                                {feedbackInfo.rating}/10
                            </span>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="text-primary" size={20} />
                            <h3 className='font-semibold text-lg text-foreground'>Detailed Feedback</h3>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <p className='text-sm sm:text-base text-foreground leading-relaxed'>
                                {feedbackInfo.feedback}
                            </p>
                        </div>
                    </div>

                    {/* Suggestions Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="text-primary" size={20} />
                            <h3 className='font-semibold text-lg text-foreground'>Improvement Suggestions</h3>
                        </div>
                        <div className="space-y-2">
                            {suggestions.length > 0 ? (
                                suggestions.map((item, index) => (
                                    <div key={index} className='bg-accent/30 border border-border rounded-lg p-3 flex items-start gap-3'>
                                        <ArrowRight className='text-primary shrink-0 mt-0.5' size={16}/>
                                        <p className="text-sm sm:text-base text-foreground">{item.trim()}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                                    <p className="text-sm text-muted-foreground">No specific suggestions available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default FeedbackDialog
