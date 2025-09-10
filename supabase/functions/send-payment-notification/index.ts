
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createLogger, getRequestIdFromHeaders } from "../_shared/logger.ts";
import { createServiceRoleSupabaseClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  clientEmail?: string;
  projectName?: string;
  projectId?: string;
  clientToken?: string;
  isApproved?: boolean;
  milestoneName?: string;
  userId?: string; // Add userId to get freelancer info
  
  // Subscription notification fields
  type?: 'payment_failed' | 'trial_ended' | 'subscription_cancelled' | 'trial_ending_soon' | 'subscription_expired' | 'payment_grace_ending';
  subscriptionId?: string;
  newStatus?: string;
  gracePeriodType?: string;
  daysLeft?: number;
}

interface SubscriptionNotificationData {
  userId: string;
  type: 'payment_failed' | 'trial_ended' | 'subscription_cancelled' | 'trial_ending_soon' | 'subscription_expired' | 'payment_grace_ending';
  subscriptionId?: string;
  newStatus?: string;
  gracePeriodType?: string;
  daysLeft?: number;
}

async function handleSubscriptionNotification(
  supabase: any, 
  resend: any, 
  data: SubscriptionNotificationData,
  logger: any
): Promise<Response> {
  const { userId, type, subscriptionId, newStatus, gracePeriodType, daysLeft } = data;

  // Get user profile and email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.email) {
    logger.error('Failed to get user profile for subscription notification', profileError);
    throw new Error('Failed to get user profile');
  }

  const userName = profile.full_name || 'there';
  const userEmail = profile.email;

  let subject: string;
  let htmlContent: string;

  switch (type) {
    case 'payment_failed':
      subject = 'Action Required: Payment Failed for Your Ruzma Subscription';
      htmlContent = `
        <h2>Payment Failed - Action Required</h2>
        <p>Hello ${userName},</p>
        <p>We were unable to process the payment for your Ruzma subscription. Your account is currently in a grace period, but to avoid service interruption, please update your payment method as soon as possible.</p>
        <p><a href="https://app.ruzma.co/plans" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Update Payment Method</a></p>
        <p>If you continue to experience issues, please contact our support team.</p>
        <p>Best regards,<br>The Ruzma Team</p>
      `;
      break;

    case 'trial_ended':
      subject = newStatus === 'active' ? 'Welcome to Ruzma Pro!' : 'Your Trial Has Ended';
      if (newStatus === 'active') {
        htmlContent = `
          <h2>Welcome to Ruzma Pro!</h2>
          <p>Hello ${userName},</p>
          <p>Your trial period has ended and your subscription is now active. Thank you for choosing Ruzma Pro!</p>
          <p>You now have full access to all premium features including unlimited projects, advanced analytics, and priority support.</p>
          <p><a href="https://app.ruzma.co/dashboard" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a></p>
          <p>Best regards,<br>The Ruzma Team</p>
        `;
      } else {
        htmlContent = `
          <h2>Your Trial Has Ended</h2>
          <p>Hello ${userName},</p>
          <p>Your trial period has ended. To continue using Ruzma Pro features, please upgrade your subscription.</p>
          <p><a href="https://app.ruzma.co/plans" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upgrade Now</a></p>
          <p>Thank you for trying Ruzma Pro!</p>
          <p>Best regards,<br>The Ruzma Team</p>
        `;
      }
      break;

    case 'subscription_cancelled':
      subject = 'Subscription Cancelled - Thank You for Using Ruzma';
      htmlContent = `
        <h2>Subscription Cancelled</h2>
        <p>Hello ${userName},</p>
        <p>Your Ruzma subscription has been successfully cancelled. Your account has been downgraded to the free plan.</p>
        <p>You can still access basic features with 1 project and limited storage. If you change your mind, you can upgrade again at any time.</p>
        <p><a href="https://app.ruzma.co/plans" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Plans</a></p>
        <p>Thank you for using Ruzma!</p>
        <p>Best regards,<br>The Ruzma Team</p>
      `;
      break;

    case 'trial_ending_soon':
      subject = 'Your Trial Ends Soon - Upgrade to Keep Your Features';
      htmlContent = `
        <h2>Your Trial Ends Soon</h2>
        <p>Hello ${userName},</p>
        <p>Your Ruzma Pro trial will end in 3 days. To continue enjoying unlimited projects, advanced analytics, and all premium features, upgrade your subscription now.</p>
        <p><a href="https://app.ruzma.co/plans" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upgrade Now</a></p>
        <p>Don't lose access to your premium features!</p>
        <p>Best regards,<br>The Ruzma Team</p>
      `;
      break;

    case 'subscription_expired':
      subject = gracePeriodType === 'trial' 
        ? 'Trial Period Ended - Account Downgraded' 
        : 'Subscription Expired - Account Downgraded';
      htmlContent = `
        <h2>Subscription Expired</h2>
        <p>Hello ${userName},</p>
        <p>${gracePeriodType === 'trial' 
          ? 'Your trial period and grace period have ended.' 
          : 'Your subscription payment grace period has ended.'
        }</p>
        <p>Your account has been downgraded to the free plan. You can still access basic features with 1 project and limited storage.</p>
        <p><a href="https://app.ruzma.co/plans" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upgrade Now</a></p>
        <p>Thank you for using Ruzma!</p>
        <p>Best regards,<br>The Ruzma Team</p>
      `;
      break;

    case 'payment_grace_ending':
      subject = 'Final Notice: Payment Required to Continue Service';
      const daysRemaining = daysLeft || 0;
      htmlContent = `
        <h2>Final Notice: Payment Required</h2>
        <p>Hello ${userName},</p>
        <p>Your Ruzma subscription payment has failed and your grace period ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}.</p>
        <p><strong>Action required immediately:</strong> Update your payment method to avoid service interruption.</p>
        <p><a href="https://app.ruzma.co/plans" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Update Payment Method</a></p>
        <p>If no action is taken, your account will be downgraded to the free plan.</p>
        <p>Best regards,<br>The Ruzma Team</p>
      `;
      break;

    default:
      throw new Error(`Unknown subscription notification type: ${type}`);
  }

  const emailResponse = await resend.emails.send({
    from: 'Ruzma <notifications@ruzma.co>',
    to: [userEmail],
    subject: subject,
    html: htmlContent,
  });

  logger.info('Subscription notification sent', { userId, type, emailResponse });

  return new Response(JSON.stringify(emailResponse), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = getRequestIdFromHeaders(req.headers);
  const logger = createLogger('send-payment-notification', requestId);
  
  logger.info('Payment notification request received', { method: req.method });

  if (req.method === "OPTIONS") {
    logger.debug('CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Resend and Supabase
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Email service not configured");
    }

    const resend = new Resend(resendApiKey);
    const supabase = createServiceRoleSupabaseClient();
    
    const { 
      clientEmail, 
      projectName, 
      projectId, 
      clientToken, 
      isApproved, 
      milestoneName, 
      userId,
      type,
      subscriptionId,
      newStatus,
      gracePeriodType,
      daysLeft
    }: EmailRequest = await req.json();

    // Handle subscription notifications
    if (type && userId) {
      return await handleSubscriptionNotification(supabase, resend, { 
        userId, 
        type, 
        subscriptionId, 
        newStatus,
        gracePeriodType,
        daysLeft
      }, logger);
    }

    // Get freelancer information
    let freelancerName = "Your freelancer";
    if (projectId) {
      try {
        // First get the project to get user_id if not provided
        let actualUserId = userId;
        if (!actualUserId) {
          const { data: project } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();
          actualUserId = project?.user_id;
        }

        if (actualUserId) {
          // Get freelancer branding and profile
          const [brandingResult, profileResult] = await Promise.all([
            supabase
              .from('freelancer_branding')
              .select('freelancer_name')
              .eq('user_id', actualUserId)
              .single(),
            supabase
              .from('profiles')
              .select('full_name')
              .eq('id', actualUserId)
              .single()
          ]);

          freelancerName = brandingResult.data?.freelancer_name || 
                          profileResult.data?.full_name || 
                          "Your freelancer";
        }
      } catch (error) {
        // Continue with default name
      }
    }

    // Generate the correct client project URL using the new domain
    const origin = req.headers.get('origin') || req.headers.get('referer');
    // Use app.ruzma.co as the base URL
    let baseUrl = 'https://app.ruzma.co';
    
    if (origin && origin.includes('lovable.app')) {
      // If the request comes from a lovable.app domain, still use app.ruzma.co
      baseUrl = 'https://app.ruzma.co';
    }
    
    const clientProjectUrl = `${baseUrl}/client/project/${clientToken}`;
    
    let subject: string;
    let htmlContent: string;

    if (isApproved) {
      subject = `Payment Approved - ${projectName}`;
      htmlContent = `
        <h2>Great news! Your payment has been approved</h2>
        <p>Hello,</p>
        <p>We're pleased to inform you that your payment for the milestone "<strong>${milestoneName}</strong>" in project "<strong>${projectName}</strong>" has been approved by the freelancer.</p>
        <p>You can now download the deliverables from your project page:</p>
        <p><a href="${clientProjectUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Project & Download Deliverables</a></p>
        <p>Thank you for using Ruzma!</p>
        <p>Best regards,<br>The Ruzma Team</p>
      `;
    } else {
      subject = `Payment Proof Rejected - ${projectName}`;
      htmlContent = `
        <h2>Payment proof requires attention</h2>
        <p>Hello,</p>
        <p>We need to inform you that the payment proof you submitted for the milestone "<strong>${milestoneName}</strong>" in project "<strong>${projectName}</strong>" has been rejected by the freelancer.</p>
        <p>Please review and upload a new payment proof on your project page:</p>
        <p><a href="${clientProjectUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upload New Payment Proof</a></p>
        <p>If you have any questions, please contact the freelancer directly.</p>
        <p>Best regards,<br>The Ruzma Team</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: `${freelancerName} <notifications@ruzma.co>`,
      to: [clientEmail],
      subject: subject,
      html: htmlContent,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
