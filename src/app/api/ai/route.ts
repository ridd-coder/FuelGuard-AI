import { NextResponse } from 'next/server'
import { simulateGeminiResponse, generateDemandForecast, detectAnomaly } from '@/lib/ai-engine'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini if key exists
const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function POST(request: Request) {
  const body = await request.json()
  const { action, message, zone, values, current } = body

  if (action === 'chat') {
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
        
        const systemPrompt = `You are the AI assistant for FuelGuard AI, a government-level Fuel Crisis Management System.
The user is asking about fuel stations, queues, shortages, or fuel credits.
Be professional, analytical, and highly structured in your response. 
Format using markdown. Highlight important terms in bold.`

        const result = await model.generateContent([systemPrompt, message])
        const responseText = result.response.text()

        return NextResponse.json({ response: responseText, model: 'Gemini 1.5 Pro (Live)' })
      } catch (error: any) {
        console.error("Gemini API Error:", error)
        // Fallback to simulation if network fails
        const response = simulateGeminiResponse(message)
        return NextResponse.json({ response, model: 'FuelGuard-AI-Gemini-Simulated (Fallback)' })
      }
    } else {
      // Use simulation if no code provided
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800))
      const response = simulateGeminiResponse(message)
      return NextResponse.json({ response, model: 'FuelGuard-AI-Gemini-Simulated' })
    }
  }

  if (action === 'forecast') {
    const forecast = await generateDemandForecast(zone || 'Zone-A')
    return NextResponse.json({ forecast, zone: zone || 'Zone-A' })
  }

  if (action === 'anomaly') {
    const result = await detectAnomaly(values || [], current || 0)
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
