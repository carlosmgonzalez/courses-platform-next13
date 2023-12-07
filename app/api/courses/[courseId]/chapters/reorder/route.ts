import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'

export async function PUT(
  req: Request,
  {params}: {params: {courseId: string}},
) {
  try {
    const {userId} = auth()
    const {list} = (await req.json()) as {
      list: {id: string; position: number}[]
    }
    const {courseId} = params

    if (!userId) return new Response('Unauthorized', {status: 401})

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    })

    if (!courseOwner) return new Response('Unaunthorized', {status: 401})

    for (let item of list) {
      await db.chapter.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      })
    }

    return new Response('Success', {status: 200})
  } catch (error) {
    console.log('[REORDER_CHAPTER]', error)
    return new Response('Internal Error', {status: 500})
  }
}
