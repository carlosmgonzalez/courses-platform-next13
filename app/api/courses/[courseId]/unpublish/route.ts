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
    })

    if (!course) return new Response('Unauthorized', {status: 401})

    const unpublishedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        isPublished: false,
      },
    })

    return Response.json(unpublishedCourse, {status: 200})
  } catch (error) {
    console.log('[COURSE_UNPUBLISHE]', error)
    return new Response('Internal Server Error', {status: 500})
  }
}
