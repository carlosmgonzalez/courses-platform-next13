import Mux from '@mux/mux-node'
import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'

const {Video} = new Mux(process.env.MUX_TOKEN_ID!, process.env.MUX_TOKEN!)

export async function PATCH(
  req: Request,
  {params}: {params: {courseId: string}},
) {
  const courseId = params.courseId
  const values = await req.json()

  try {
    const {userId} = auth()

    if (!userId) return new Response('Unauthorized', {status: 401})

    const course = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        ...values,
      },
    })

    return Response.json(course, {status: 200})
  } catch (error) {
    console.log('[COURSE_ID]', error)
    return new Response('Internal Error', {status: 500})
  }
}

export async function DELETE(
  req: Request,
  {params}: {params: {courseId: string}},
) {
  const courseId = params.courseId

  try {
    const {userId} = auth()

    if (!userId) return new Response('Unauthorized', {status: 401})

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    })

    if (!course) return new Response('Unauthorized or not found', {status: 401})

    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        try {
          await Video.Assets.del(chapter.muxData.assetId)
        } catch (error) {
          console.log('DELETE_COURSE_CHAPTERS_WITH_MUX_DATA_DEPRECATE')
        }
      }
    }

    const deletedCourse = await db.course.delete({
      where: {
        id: courseId,
        userId,
      },
    })

    return Response.json(deletedCourse, {status: 200})
  } catch (error) {
    console.log('[COURSE_ID]', error)
    return new Response('Internal Error', {status: 500})
  }
}
