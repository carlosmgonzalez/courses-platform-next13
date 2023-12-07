'use client'

import {useState} from 'react'
import {Chapter} from '@prisma/client'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import axios from 'axios'
import * as z from 'zod'

import {
  Form,
  FormControl,
  FormMessage,
  FormField,
  FormItem,
  FormDescription,
} from '@/components/ui/form'
import {Button} from '@/components/ui/button'
import toast from 'react-hot-toast'
import {Pencil} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {cn} from '@/lib/utils'
import {Editor} from '@/components/editor'
import {Preview} from '@/components/preview'
import {Checkbox} from '@/components/ui/checkbox'
import {Badge} from '@/components/ui/badge'

interface ChapterAccessFormProps {
  initialData: Chapter
  courseId: string
  chapterId: string
}

const formSchema = z.object({
  isFree: z.boolean().default(false),
})

export const ChapterAccessForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterAccessFormProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const router = useRouter()

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: initialData.isFree,
    },
  })

  const {isSubmitting, isValid} = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        values,
      )
      toast.success('Chapter updated')
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
        <p>Chapter access</p>
        <Button variant='ghost' onClick={toggleEdit}>
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className='h-4 w-4 mr-2' />
              Edit access
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        <div
          className={cn(
            'text-sm mt-2',
            !initialData.isFree && 'tet-slate-500 italic',
          )}
        >
          {initialData.isFree ? (
            <>This chapter is free for preview.</>
          ) : (
            <>This chapter is not free.</>
          )}
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 mt-4'
          >
            <FormField
              control={form.control}
              name='isFree'
              render={({field}) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormDescription>
                      Check this box is you want to make this chapter free for
                      preview
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className='flex items-center gap-x-2'>
              <Button disabled={isSubmitting || !isValid} type='submit'>
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
