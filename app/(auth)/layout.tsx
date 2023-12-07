import React from 'react'

const layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='w-full h-full flex justify-center items-center bg-neutral-300/30'>
      {children}
    </div>
  )
}

export default layout