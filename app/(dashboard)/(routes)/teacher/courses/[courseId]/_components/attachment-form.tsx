'use client'

import {useState} from 'react'
import {Attachment, Course} from '@prisma/client'
import axios from 'axios'
import * as z from 'zod'

import {Button} from '@/components/ui/button'
import toast from 'react-hot-toast'
import {File, ImageIcon, Loader2, Pencil, PlusCircle, X} from 'lucide-react'
import {useRouter} from 'next/navigation'
import Image from 'next/image'
import {FileUpload} from '@/components/file-upload'

interface AttachmentFormProps {
  initialData: Course & {attachments: Attachment[]}
  courseId: string
}

const formSchema = z.object({
  url: z.string().min(1),
})

export const AttachmentForm = ({
  initialData,
  courseId,
}: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const router = useRouter()

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/attachments`, values)
      toast.success('Course updated')
      toggleEdit()
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong')
    }
  }

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`)
      toast.success('Attachment deleted')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className='mt-6 border bg-slate-100 rounded-md p-4'>
      <div className='font-medium flex items-center justify-between'>
        <p>Course attachments</p>
        <Button variant='ghost' onClick={toggleEdit}>
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className='h-4 w-4 mr-2' />
              Add a file
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        <>
          {initialData.attachments.length === 0 ? (
            <p className='text-sm mt-2 text-slate-500 italic'>
              No attachments yet
            </p>
          ) : (
            <div className='space-y-2'>
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className='flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md'
                >
                  <File className='h-4 w-4 mr-2 flex-shrink-0' />
                  <p className='text-sm line-clamp-1'>{attachment.name}</p>
                  {deletingId === attachment.id ? (
                    <div>
                      <Loader2 className='h-4 w-4 animate-spin' />
                    </div>
                  ) : (
                    <button
                      className='ml-auto hover:opacity-75 transition'
                      onClick={() => onDelete(attachment.id)}
                    >
                      <X className='h-4 w-4' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <FileUpload
            endpoint='courseAttachment'
            onChange={(url) => {
              if (url) onSubmit({url: url})
            }}
          />
          <div className='text-xs text-muted-foreground mt-4'>
            Add anything your students might need to complete the course.
          </div>
        </div>
      )}
    </div>
  )
}
