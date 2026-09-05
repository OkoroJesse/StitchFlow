import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanConfig, normalizePlanId } from '@/lib/plans'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
      return NextResponse.json({ success: false, error: 'Not authenticated. Please log in again.' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const rawPlan = body.planId
    const canonicalPlan = normalizePlanId(rawPlan)
    const planConfig = getPlanConfig(canonicalPlan)

    // Basic plan does not require payment initialization
    if (canonicalPlan === 'basic') {
      return NextResponse.json({ success: true, isFree: true, planId: canonicalPlan })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error('[Paystack Server] Error: PAYSTACK_SECRET_KEY environment variable is not configured.')
      return NextResponse.json({
        success: false,
        error: 'Paystack payment provider is not configured on the server. Please contact support.'
      }, { status: 500 })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const reference = `sf_sub_${user.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const paystackPayload = {
      email: user.email,
      amount: planConfig.koboAmount, // Always in kobo (e.g. 700,000 for ₦7,000)
      currency: 'NGN',
      reference,
      callback_url: `${origin}/dashboard/settings?verify_ref=${reference}`,
      metadata: {
        user_id: user.id,
        plan_id: canonicalPlan,
        custom_fields: [
          { display_name: 'Business User ID', variable_name: 'user_id', value: user.id },
          { display_name: 'Plan', variable_name: 'plan_id', value: canonicalPlan },
        ]
      }
    }

    console.log(`[Paystack Initialize] Initializing transaction for user ${user.id}, plan: ${canonicalPlan}, amount: ${planConfig.koboAmount} kobo (${planConfig.formattedPrice})`)

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    })

    const resData = await paystackRes.json()

    if (!paystackRes.ok || !resData.status) {
      console.error('[Paystack Initialize Error] Paystack API responded with failure:', {
        status: paystackRes.status,
        statusText: paystackRes.statusText,
        data: resData
      })
      return NextResponse.json({
        success: false,
        error: resData.message || 'Unable to initialize secure payment. Please try again.'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      access_code: resData.data.access_code,
      authorization_url: resData.data.authorization_url,
      reference,
      planId: canonicalPlan,
      amount: planConfig.koboAmount,
    })

  } catch (err: any) {
    console.error('[Paystack Initialize Exception]:', err)
    return NextResponse.json({
      success: false,
      error: 'An unexpected server error occurred while starting payment.'
    }, { status: 500 })
  }
}
