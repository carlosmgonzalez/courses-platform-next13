import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'

export async function POST(req: Request) {
  try {
    const {userId} = auth()
    const {title} = await req.json()

    if (!userId) return new Response('Anauthorized', {status: 401})

    const course = await db.course.create({
      data: {
        userId,
        title,
      },
    })

    return Response.json(course)
  } catch (error) {
    console.log(`[COURSES]: ${error}`)
    return Response.json(error, {status: 500})
  }
}
