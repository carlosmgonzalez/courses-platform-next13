import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'

export async function PATCH(
  req: Request,
  {params}: {params: {courseId: string}},
) {
  try {
    const {userId} = auth()
    const {courseId} = params

    if (!userId) return new Response('Unauthorized', {status: 401})

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      include: {
        chapters: true,
      },
    })

    if (!course) return new Response('Course not found', {status: 404})

    const hasPublishedChapter = course?.chapters.some(
      (chapter) => chapter.isPublished,
    )

    if (
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.price ||
      !course.categoryId ||
      !hasPublishedChapter
    )
      return new Response('Some files are required', {
        status: 401,
      })

    const publishedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        isPublished: true,
      },
    })

    return Response.json(publishedCourse, {status: 200})
  } catch (error) {
    console.log('[COURSE_PUBLISHE]', error)
    return new Response('Internal Server Error', {status: 500})
  }
}
