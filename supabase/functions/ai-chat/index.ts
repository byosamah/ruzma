import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models';

const availableModels = {
  'meta-llama/Llama-2-7b-chat-hf': 'Llama 2 Chat (7B)',
  'microsoft/DialoGPT-large': 'DialoGPT Large',
  'mistralai/Mistral-7B-Instruct-v0.1': 'Mistral 7B Instruct',
  'HuggingFaceH4/zephyr-7b-beta': 'Zephyr 7B Beta',
  'google/flan-t5-large': 'FLAN-T5 Large'
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    
    if (!huggingFaceToken) {
      return new Response(
        JSON.stringify({ error: 'Hugging Face API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, model = 'meta-llama/Llama-2-7b-chat-hf', systemPrompt = '' } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the prompt based on the model
    let formattedPrompt = message;
    if (systemPrompt) {
      formattedPrompt = `System: ${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;
    }

    console.log(`Sending request to model: ${model}`);
    console.log(`Prompt: ${formattedPrompt}`);

    const response = await fetch(`${HUGGING_FACE_API_URL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_length: 512,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      
      // Handle model loading errors
      if (response.status === 503) {
        return new Response(
          JSON.stringify({ 
            error: 'Model is loading, please try again in a few moments',
            modelLoading: true 
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Hugging Face API error: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Hugging Face response:', data);

    // Handle different response formats
    let generatedText = '';
    if (Array.isArray(data) && data.length > 0) {
      generatedText = data[0].generated_text || data[0].text || '';
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      generatedText = 'No response generated';
    }

    // Clean up the response
    generatedText = generatedText.trim();
    
    return new Response(
      JSON.stringify({ 
        response: generatedText,
        model: model,
        availableModels: availableModels
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);