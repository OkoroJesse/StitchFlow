import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanConfig, normalizePlanId } from '@/lib/plans'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated. Please log in again.' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const reference = body.reference
    const rawExpectedPlan = body.expectedPlanId

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Transaction reference is missing.' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error('[Paystack Verify Error]: PAYSTACK_SECRET_KEY is missing.')
      return NextResponse.json({ success: false, error: 'Server configuration error.' }, { status: 500 })
    }

    console.log(`[Paystack Verify] Verifying reference: ${reference} for user ${user.id}...`)

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    })

    const resData = await paystackRes.json()

    if (!paystackRes.ok || !resData.status || !resData.data) {
      console.error('[Paystack Verify Failed]: Paystack API returned failure:', resData)
      return NextResponse.json({
        success: false,
        error: resData.message || 'Payment verification failed.'
      }, { status: 400 })
    }

    const txData = resData.data
    const txStatus = txData.status
    const paidAmount = txData.amount // in kobo
    const paidCurrency = txData.currency
    const metadataPlan = txData.metadata?.plan_id
    const targetPlanId = normalizePlanId(metadataPlan || rawExpectedPlan)
    const expectedConfig = getPlanConfig(targetPlanId)

    // 1. Verify transaction status
    if (txStatus !== 'success') {
      console.warn(`[Paystack Verify Warning]: Transaction ${reference} status is "${txStatus}" (expected "success")`)
      return NextResponse.json({
        success: false,
        error: `Transaction was not successful (status: ${txStatus}).`
      }, { status: 400 })
    }

    // 2. Verify currency
    if (paidCurrency !== 'NGN') {
      console.error(`[Paystack Verify Error]: Currency mismatch: ${paidCurrency} vs NGN`)
      return NextResponse.json({ success: false, error: 'Payment currency mismatch.' }, { status: 400 })
    }

    // 3. Verify amount paid matches expected plan kobo amount
    if (paidAmount < expectedConfig.koboAmount) {
      console.error(`[Paystack Verify Error]: Amount mismatch: Paid ${paidAmount} kobo, expected ${expectedConfig.koboAmount} kobo`)
      return NextResponse.json({ success: false, error: 'Paid amount does not match plan price.' }, { status: 400 })
    }

    // 4. Update user profile subscription_tier in Supabase
    console.log(`[Paystack Verify Success]: Updating profile ${user.id} subscription_tier to "${targetPlanId}"`)

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_tier: targetPlanId })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[Paystack Verify DB Error]: Failed to update subscription_tier in profiles:', updateError)
      return NextResponse.json({
        success: false,
        error: `Payment succeeded, but workspace update failed: ${updateError.message}`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      planId: targetPlanId,
      planName: expectedConfig.name,
      message: `Your ${expectedConfig.name} subscription has been activated!`,
      profile: updatedProfile,
    })

  } catch (err: any) {
    console.error('[Paystack Verify Exception]:', err)
    return NextResponse.json({
      success: false,
      error: 'An unexpected server error occurred while verifying transaction.'
    }, { status: 500 })
  }
}
