import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'

export async function PUT(
  req: Request,
  {params}: {params: {courseId: string; chapterId: string}},
) {
  try {
    const {userId} = auth()
    const {isCompleted} = await req.json()

    if (!userId) return new Response(`Unauthorized`, {status: 401})

    console.log({params, isCompleted})

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: params.chapterId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId,
        chapterId: params.chapterId,
        isCompleted,
      },
    })

    return new Response('Ok', {status: 200})
  } catch (error) {
    console.log('[CHAPTER_ID_PROGRESS]', error)
    return new Response('Internal server error', {status: 500})
  }
}
