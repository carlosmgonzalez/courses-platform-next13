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

    const muxData = await db.muxData.findUnique({
      where: {
        chapterId,
      },
    })

    if (
      !chapter ||
      !muxData ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    )
      return new Response('Course not found or missing required fields', {
        status: 401,
      })

    const publishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: true,
      },
    })

    return Response.json(publishedChapter, {status: 200})
  } catch (error) {
    console.log('[CHAPTER_PUBLISH]', error)
    return new Response('Internal Error', {status: 500})
  }
}
