import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'

export async function DELETE(
  req: Request,
  {params}: {params: {attachmentId: string; courseId: string}},
) {
  try {
    const {userId} = auth()
    const {attachmentId, courseId} = params
    if (!userId) return new Response('Unauthorized', {status: 401})

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    })

    if (!courseOwner) return new Response('Unauthorized', {status: 401})

    const attachment = await db.attachment.delete({
      where: {
        id: attachmentId,
        courseId,
      },
    })

    return Response.json(attachment, {status: 200})
  } catch (error) {
    console.log('COURSE_ID_ATTACHMENT_DELETE', error)
    return new Response('Internal Error', {
      status: 500,
    })
  }
}
