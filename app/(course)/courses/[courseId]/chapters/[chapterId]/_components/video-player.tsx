'use client'

import axios from 'axios'
import MuxPlayer from '@mux/mux-player-react'
import {Chapter} from '@prisma/client'
import {cn} from '@/lib/utils'
import {Loader2, Lock} from 'lucide-react'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {toast} from 'react-hot-toast'
import {useConfettiStore} from '@/hooks/use-confetti-store'

interface VideoPlayerProps {
  chapterId: string
  title: string
  courseId: string
  nextChapter?: Chapter
  playbackId: string
  isLocked: boolean
  completeOnEnd: boolean
}

export const VideoPlayer = ({
  chapterId,
  completeOnEnd,
  courseId,
  isLocked,
  nextChapter,
  playbackId,
  title,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState<boolean>(false)
  const router = useRouter()
  const confettiOnOpen = useConfettiStore((state) => state.onOpen)

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {isCompleted: true},
        )
      }

      if (!nextChapter) {
        confettiOnOpen()
      }

      toast.success('Progress updated')
      router.refresh()

      if (nextChapter) {
        router.push(`/courses/${courseId}/chapters/${nextChapter.id}`)
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className='relative aspect-video'>
      {!isReady && !isLocked && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-800'>
          <Loader2 className='h-8 w-8 animate-spin text-secondary' />
        </div>
      )}
      {isLocked && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary'>
          <Lock className='h-8 w-8' />
          <p className='text-sm'>This chapter is locked</p>
        </div>
      )}
      {!isLocked && (
        <MuxPlayer
          title={title}
          className={cn(!isReady && 'hidden')}
          onCanPlay={() => setIsReady(true)}
          onEnded={onEnd}
          autoPlay
          playbackId={playbackId}
        />
      )}
    </div>
  )
}
