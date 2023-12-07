import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'

export async function POST(
  req: Request,
  {params}: {params: {courseId: string}},
) {
  try {
    const {userId} = auth()
    const {url} = await req.json()
    if (!userId) return new Response('Unauthorized', {status: 401})

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    })

    if (!courseOwner) return new Response('Unauthorized', {status: 401})

    const attachment = await db.attachment.create({
      data: {
        url,
        name: url.split('/').pop(),
        courseId: params.courseId,
      },
    })

    return Response.json(attachment, {status: 200})
  } catch (error) {
    console.log('COURSE_ID_ATTACHMENTS', error)
    return new Response('Internal error', {status: 500})
  }
}
