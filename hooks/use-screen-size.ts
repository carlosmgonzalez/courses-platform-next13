import {useEffect, useState} from 'react'

export const useScreenSize = () => {
  const [width, setWidth] = useState<number>()
  const [height, setHeight] = useState<number>()

  const updateDimensaions = () => {
    setHeight(window.innerHeight)
    setWidth(window.innerWidth)
  }

  useEffect(() => {
    setHeight(window.innerHeight)
    setWidth(window.innerWidth)

    window.addEventListener('resize', updateDimensaions)
    return window.removeEventListener('resize', updateDimensaions)
  }, [])

  return {width, height}
}
