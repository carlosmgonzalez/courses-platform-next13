'use client'

import {useState} from 'react'
import {Course} from '@prisma/client'
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
} from '@/components/ui/form'
import {Button} from '@/components/ui/button'
import toast from 'react-hot-toast'
import {Pencil} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {cn} from '@/lib/utils'
import {Textarea} from '@/components/ui/textarea'
import {Combobox} from '@/components/ui/combobox'

interface CategoryFormProps {
  initialData: Course
  courseId: string
  options: {
    label: string
    value: string
  }[]
}

const formSchema = z.object({
  categoryId: z.string().min(1),
})

export const CategoryForm = ({
  initialData,
  courseId,
  options,
}: CategoryFormProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const router = useRouter()

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || '',
    },
  })

  const {isSubmitting, isValid} = form.formState

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

  const selectedOption = options.find(
    (option) => option.value === initialData.categoryId,
  )

  return (
    <div className='mt-6 border bg-slate-100 rounded-md p-4'>
      <div className='font-medium flex items-center justify-between'>
        <p>Course category</p>
        <Button variant='ghost' onClick={toggleEdit}>
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className='h-4 w-4 mr-2' />
              Edit category
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        <p
          className={cn(
            'text-sm mt-2',
            !initialData.categoryId && 'tet-slate-500 italic',
          )}
        >
          {selectedOption?.label || 'No category'}
        </p>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 mt-4'
          >
            <FormField
              control={form.control}
              name='categoryId'
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Combobox options={options} {...field} />
                  </FormControl>
                  <FormMessage />
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
