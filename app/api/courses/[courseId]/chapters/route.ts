import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'

export async function POST(
  req: Request,
  {params}: {params: {courseId: string}},
) {
  try {
    const {userId} = auth()
    const {courseId} = params
    const {title} = await req.json()

    if (!userId) return new Response('Unauthorized', {status: 401})

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    })

    if (!courseOwner) return new Response('Unauthorized', {status: 401})

    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId: courseId,
      },
      orderBy: {
        position: 'desc',
      },
    })

    const newPosition = lastChapter ? lastChapter.position + 1 : 0

    const chapter = await db.chapter.create({
      data: {
        title,
        courseId,
        position: newPosition,
      },
    })

    return Response.json(chapter, {status: 200})
  } catch (error) {
    console.log('COURSE_ID_CHAPTER', error)
    return new Response('Internel Error', {status: 500})
  }
}
