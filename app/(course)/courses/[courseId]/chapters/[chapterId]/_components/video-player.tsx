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
  const router = useRouter()
  useConfettiStore()
  return <div className={cn()}></div>
}
