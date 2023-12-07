import {IconBadge} from '@/components/icon-badge'
import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'
import {ArrowLeft, Eye, LayoutDashboard, Video} from 'lucide-react'
import Link from 'next/link'
import {redirect} from 'next/navigation'
import {boolean} from 'zod'
import {ChapterTitleForm} from './_components/chapter-title-form'
import {ChapterDescriptionForm} from './_components/chapter-description-form'
import {ChapterAccessForm} from './_components/chapter-access-form'
import {ChapterVideoForm} from './_components/chapter-video-form'
import {Banner} from '@/components/banner'
import {ChapterActions} from './_components/chapter-actions'

const Page = async ({
  params,
}: {
  params: {chapterId: string; courseId: string}
}) => {
  const {userId} = auth()
  if (!userId) return redirect('/')

  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      muxData: true,
    },
  })

  if (!chapter) return redirect('/')

  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl]

  const totalFields = requiredFields.length
  const completedField = requiredFields.filter(Boolean).length

  const completionText = `(${completedField}/${totalFields})`

  const isComplete = requiredFields.every(Boolean)

  return (
    <>
      {!chapter.isPublished ? (
        <Banner
          variant='warning'
          label='This chapter is unpublished. It will not be visible in the course'
        />
      ) : (
        <Banner
          variant='success'
          label='This chapter is published. It will be visible in the course'
        />
      )}
      <div className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='w-full'>
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className='flex items-center text-sm hover:opacity-75 transition mb-6'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to course setup
            </Link>
            <div className='flex items-center justify-between w-full'>
              <div className='flex flex-col gap-y-2'>
                <h1 className='text-2xl font-medium'>Chapter Creation</h1>
                <span className='text-sm text-slate-700'>
                  Complete all fields {completionText}
                </span>
              </div>
              <ChapterActions
                disabled={!isComplete}
                courseId={params.courseId}
                chapterId={params.chapterId}
                isPublished={chapter.isPublished}
              />
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-16'>
          <div className='space-y-4'>
            <div>
              <div className='flex items-center gap-x-2'>
                <IconBadge icon={LayoutDashboard} />
                <h2 className='text-xl'>Customize your chapter</h2>
              </div>
              <ChapterTitleForm
                chapterId={chapter.id}
                initialData={chapter}
                courseId={params.courseId}
              />
              <ChapterDescriptionForm
                chapterId={chapter.id}
                initialData={chapter}
                courseId={params.courseId}
              />
            </div>
            <div>
              <div className='flex items-center gap-x-2'>
                <IconBadge icon={Eye} />
                <h2 className='text-xl'>Access Settings</h2>
              </div>
              <ChapterAccessForm
                chapterId={chapter.id}
                initialData={chapter}
                courseId={params.courseId}
              />
            </div>
          </div>
          <div>
            <div className='flex items-center gap-x-2'>
              <IconBadge icon={Video} />
              <h2 className='text-xl'>Add a video</h2>
            </div>
            <ChapterVideoForm
              chapterId={chapter.id}
              initialData={chapter}
              courseId={params.courseId}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
