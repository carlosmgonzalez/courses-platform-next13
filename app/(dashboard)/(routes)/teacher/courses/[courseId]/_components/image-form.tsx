'use client'

import {useState} from 'react'
import {Course} from '@prisma/client'
import axios from 'axios'
import * as z from 'zod'

import {Button} from '@/components/ui/button'
import toast from 'react-hot-toast'
import {ImageIcon, Pencil, PlusCircle} from 'lucide-react'
import {useRouter} from 'next/navigation'
import Image from 'next/image'
import {FileUpload} from '@/components/file-upload'

interface ImageFormProps {
  initialData: Course
  courseId: string
}

const formSchema = z.object({
  imageUrl: z.string().min(1, {message: 'Image is required'}),
})

export const ImageForm = ({initialData, courseId}: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const router = useRouter()

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values)
      toast.success('Course updated')
      toggleEdit()
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong')
    }
  }

  return (
    <div className='mt-6 border bg-slate-100 rounded-md p-4'>
      <div className='font-medium flex items-center justify-between'>
        <p>Course image</p>
        <Button variant='ghost' onClick={toggleEdit}>
          {isEditing ? (
            <>Cancel</>
          ) : initialData.imageUrl ? (
            <>
              <Pencil className='h-4 w-4 mr-2' />
              Edit image
            </>
          ) : (
            <>
              <PlusCircle className='h-4 w-4 mr-2' />
              Add an image
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        !initialData.imageUrl ? (
          <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
            <ImageIcon className='h-10 w-10 text-slate-500' />
          </div>
        ) : (
          <div className='relative aspect-video mt-2'>
            <Image
              alt='Upload'
              fill
              className='object-cover rounded-md'
              src={initialData.imageUrl}
            />
          </div>
        )
      ) : (
        <div>
          <FileUpload
            endpoint='courseImage'
            onChange={(url) => {
              if (url) onSubmit({imageUrl: url})
            }}
          />
          <div className='text-xs text-muted-foreground mt-4'>
            16:9 aspect retio recommended
          </div>
        </div>
      )}
    </div>
  )
}
