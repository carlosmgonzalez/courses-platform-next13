import {db} from '@/lib/db'
import {auth} from '@clerk/nextjs'
import Mux from '@mux/mux-node'

const {Video} = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!,
)

export async function PATCH(
  req: Request,
  {params}: {params: {courseId: string; chapterId: string}},
) {
  try {
    const {userId} = auth()
    const {chapterId, courseId} = params
    const {isPublished, ...values} = await req.json()

    if (!userId) return new Response('Unauthorized', {status: 401})

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    })

    if (!courseOwner) return new Response('Unauthorized', {status: 401})

    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        ...values,
      },
    })

    if (values.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId,
        },
      })

      if (existingMuxData) {
        try {
          await Video.Assets.del(existingMuxData.assetId)
          await db.muxData.delete({
            where: {
              id: existingMuxData.id,
            },
          })
        } catch (error) {
          console.log('[EDIT_CHAPTER_ID_MUX_DATA]', error)
        }
      }

      const asset = await Video.Assets.create({
        input: values.videoUrl,
        playback_policy: 'public',
        test: false,
      })

      await db.muxData.create({
        data: {
          chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      })
    }

    return Response.json(chapter, {status: 200})
  } catch (error) {
    console.log('[CHAPTER_ID]', error)
    return new Response('Internal Error', {status: 500})
  }
}

export async function DELETE(
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

    if (!chapter) return new Response('Chapter not found', {status: 404})

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId,
        },
      })

      console.log(existingMuxData)

      if (existingMuxData) {
        try {
          await Video.Assets.del(existingMuxData.assetId)
          await db.muxData.delete({
            where: {
              id: existingMuxData.id,
            },
          })
        } catch (error) {
          console.log('[MUX_DATA_CHAPTER_DELETE]', error)
        }
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: chapterId,
        courseId,
      },
    })

    const publishedChapterInCourse = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
    })

    if (!publishedChapterInCourse.length) {
      await db.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      })
    }

    return Response.json(deletedChapter, {status: 200})
  } catch (error) {
    console.log('[CHAPTER_ID_DELETE]', error)
    return new Response('Internal Error', {status: 500})
  }
}
