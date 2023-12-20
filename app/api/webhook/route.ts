import {db} from '@/lib/db'
import {stripe} from '@/lib/stripe'
import Stripe from 'stripe'
import {headers} from 'next/headers'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (error: any) {
    return new Response(`Webhook Error: ${error.message}`, {status: 400})
  }

  const session = event.data.object as Stripe.Checkout.Session
  const userId = session?.metadata?.userId
  const courseId = session?.metadata?.courseId

  if (event.type === 'checkout.session.completed') {
    if (!userId || !courseId) {
      return new Response(`Webhook Error: Missin metadata`, {status: 400})
    }

    await db.purchase.create({
      data: {
        courseId,
        userId,
      },
    })
  } else {
    return new Response(`Weebhook Error: Unhandled event type ${event.type}`, {
      status: 200,
    })
  }

  return new Response(null, {status: 200})
}
