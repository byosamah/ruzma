
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured in Supabase secrets');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          details: 'Please add your OpenAI API key to Supabase Edge Function Secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log API key status (first few characters only for security)
    console.log('OpenAI API Key status:', openAIApiKey ? `Configured (${openAIApiKey.substring(0, 8)}...)` : 'Not configured');

    const { brief, language = 'en' } = await req.json();

    if (!brief || brief.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Project brief is required and must be at least 10 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = language === 'ar' 
      ? `أنت مساعد ذكي متخصص في إدارة المشاريع. مهمتك هو تحليل موجز المشروع وإنشاء مراحل مفصلة ومنطقية للمشروع.

يجب أن تقوم بإرجاع استجابة JSON صحيحة تحتوي على:
- اسم مقترح للمشروع (اختصار من الموجز)
- قائمة من 3-5 مراحل، كل مرحلة تحتوي على:
  - title: عنوان المرحلة (باللغة العربية)
  - description: وصف مفصل لما سيتم تسليمه في هذه المرحلة (باللغة العربية)
  - price: سعر مقترح بالدولار الأمريكي (رقم)
  - duration_days: مدة تقديرية بالأيام (رقم)

تأكد من أن الأسعار واقعية ومناسبة لنوع المشروع والسوق.`
      : `You are an expert project management assistant. Your task is to analyze a project brief and create detailed, logical milestones for the project.

You must return a valid JSON response containing:
- A suggested project name (derived from the brief)
- A list of 3-5 milestones, each containing:
  - title: milestone title (in English)
  - description: detailed description of what will be delivered in this milestone (in English)
  - price: suggested price in USD (number)
  - duration_days: estimated duration in days (number)

Ensure prices are realistic and appropriate for the project type and market.`;

    const userPrompt = language === 'ar'
      ? `قم بتحليل موجز المشروع التالي وإنشاء مراحل مفصلة:\n\n${brief}\n\nأرجع فقط JSON صحيح بدون أي نص إضافي.`
      : `Analyze the following project brief and create detailed milestones:\n\n${brief}\n\nReturn only valid JSON without any additional text.`;

    console.log('Making request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'OpenAI API authentication failed',
            details: 'Your OpenAI API key is invalid or expired. Please check your API key in the OpenAI dashboard and update it in Supabase secrets.'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'OpenAI API rate limit exceeded',
            details: 'You have exceeded your OpenAI API rate limit. Please try again later or upgrade your OpenAI plan.'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response received, parsing JSON...');

    // Parse the AI response as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid response format from AI');
    }

    // Validate and format the response
    if (!parsedResponse.milestones || !Array.isArray(parsedResponse.milestones)) {
      throw new Error('Invalid milestone structure in AI response');
    }

    // Process milestones to ensure proper format
    const processedMilestones = parsedResponse.milestones.map((milestone: any, index: number) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (index * (milestone.duration_days || 7)));
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (milestone.duration_days || 7) - 1);

      return {
        title: milestone.title || '',
        description: milestone.description || '',
        price: Number(milestone.price) || 0,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };
    });

    console.log('Successfully processed milestones:', processedMilestones.length);

    return new Response(
      JSON.stringify({
        suggestedName: parsedResponse.suggestedName || parsedResponse.name || '',
        milestones: processedMilestones,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-project-milestones function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate milestones',
        details: 'Please try again with a more detailed project brief. If the issue persists, check your OpenAI API key configuration.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
