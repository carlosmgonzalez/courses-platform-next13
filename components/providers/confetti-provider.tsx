'use client'

import Confetti from 'react-confetti'

import {useConfettiStore} from '@/hooks/use-confetti-store'
import {useScreenSize} from '@/hooks/use-screen-size'

export const ConfettiProvider = () => {
  const isOpen = useConfettiStore((state) => state.isOpen)
  const onClose = useConfettiStore((state) => state.onClose)

  const {height, width} = useScreenSize()

  if (!isOpen) return null

  return (
    <Confetti
      className='pointer-events-none z-[100]'
      width={width}
      height={height}
      numberOfPieces={500}
      recycle={false}
      onConfettiComplete={() => {
        onClose()
      }}
    />
  )
}
