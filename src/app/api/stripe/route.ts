// /api/stripe

import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { userSubs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

const return_url = process.env.NEXT_BASE_URL + '/'

export async function GET(){
    try {
        const {userId} = await auth();
        const user = await currentUser();

        if (!userId){
            return new NextResponse('unauthorized', {status: 401})
        }

        const _userSubscriptions = await db.select().from(userSubs).where(eq(userSubs.userId, userId));
        if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId){
            // trying to cancel at billing portal
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: _userSubscriptions[0].stripeCustomerId,
                return_url
            })
            return NextResponse.json({url: stripeSession.url});
        }

        // User's first time trying to subscribe
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: return_url,
            cancel_url: return_url,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            customer_email: user?.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: 'USD',
                        product_data: {
                            name: "ContextuAI Pro",
                            description: "Unlimited access to ContextuAI!",
                        },
                        unit_amount: 1500,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                }
            ],
            metadata: {
                userId
            }
        });
        return NextResponse.json({url: stripeSession.url})
    } catch (error) {
        console.log("Stripe Error", error);
        return new NextResponse("Internal Server Error", {status: 500});
        
    }
}