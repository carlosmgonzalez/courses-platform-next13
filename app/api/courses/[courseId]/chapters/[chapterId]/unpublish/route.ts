import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'

export async function PATCH(
  req: Request,
  {params}: {params: {courseId: string; chapterId: string}},
) {
  try {
    const {userId} = auth()
    const {chapterId, courseId} = params

    if (!userId) return new Response('Unauthorized', {status: 401})

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    })

    if (!courseOwner) return new Response('Unauthorized', {status: 401})

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      },
    })

    if (!chapter)
      return new Response('Course not found', {
        status: 404,
      })

    const unpublishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: false,
      },
    })

    const publishedChapterInCourse = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
    })

    if (!publishedChapterInCourse.length) {
      await db.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      })
    }

    return Response.json(unpublishedChapter, {status: 200})
  } catch (error) {
    console.log('[CHAPTER_UNPUBLISH]', error)
    return new Response('Internal Error', {status: 500})
  }
}
