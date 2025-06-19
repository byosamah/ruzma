
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, watermarkText, fileType } = await req.json()

    if (!fileUrl || !watermarkText) {
      return new Response(JSON.stringify({ error: 'File URL and watermark text are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch the original file
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch original file')
    }

    const fileBuffer = await response.arrayBuffer()
    
    let watermarkedBuffer: ArrayBuffer

    if (fileType.includes('image/')) {
      // For images, we'll create a canvas-based watermark
      watermarkedBuffer = await createWatermarkedImage(fileBuffer, watermarkText, fileType)
    } else if (fileType.includes('pdf')) {
      // For PDFs, we'll add text watermarks to each page
      watermarkedBuffer = await createWatermarkedPDF(fileBuffer, watermarkText)
    } else {
      throw new Error('Unsupported file type for watermarking')
    }

    // Generate a unique filename for the watermarked version
    const timestamp = Date.now()
    const fileName = `watermarked_${timestamp}`
    const fileExt = fileType.includes('image/') ? '.png' : '.pdf'
    
    // Upload watermarked file to a separate bucket
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('watermarked-previews')
      .upload(`${fileName}${fileExt}`, watermarkedBuffer, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('watermarked-previews')
      .getPublicUrl(uploadData.path)

    return new Response(JSON.stringify({ 
      success: true, 
      watermarkedUrl: urlData.publicUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Watermarking error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to create watermarked preview',
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function createWatermarkedImage(
  imageBuffer: ArrayBuffer, 
  watermarkText: string, 
  mimeType: string
): Promise<ArrayBuffer> {
  // Convert ArrayBuffer to Uint8Array for processing
  const imageData = new Uint8Array(imageBuffer)
  
  // Create a canvas to process the image
  const canvas = new OffscreenCanvas(800, 600) // Default size, will be adjusted
  const ctx = canvas.getContext('2d')!
  
  // Create image from buffer
  const blob = new Blob([imageData], { type: mimeType })
  const imageBitmap = await createImageBitmap(blob)
  
  // Adjust canvas size to match image
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  
  // Draw original image
  ctx.drawImage(imageBitmap, 0, 0)
  
  // Add repeating watermarks
  ctx.font = 'bold 48px Arial'
  ctx.fillStyle = 'rgba(128, 128, 128, 0.3)'
  ctx.textAlign = 'center'
  
  const spacing = 200
  for (let x = 0; x < canvas.width + spacing; x += spacing) {
    for (let y = 0; y < canvas.height + spacing; y += spacing) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-Math.PI / 6) // Rotate watermark
      ctx.fillText(watermarkText, 0, 0)
      ctx.restore()
    }
  }
  
  // Convert canvas back to blob
  const watermarkedBlob = await canvas.convertToBlob({ type: 'image/png' })
  return await watermarkedBlob.arrayBuffer()
}

async function createWatermarkedPDF(
  pdfBuffer: ArrayBuffer, 
  watermarkText: string
): Promise<ArrayBuffer> {
  // For PDF watermarking, we'd need a PDF library like PDF-lib
  // For now, return the original PDF with a note that PDF watermarking needs additional setup
  console.log('PDF watermarking not yet implemented - would need PDF-lib library')
  
  // This is a placeholder - in production you'd use a proper PDF library
  // to add watermarks to each page of the PDF
  return pdfBuffer
}
