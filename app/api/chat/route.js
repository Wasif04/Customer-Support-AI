import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
**Welcome to HeadstarterAI Support!** 👋

**How can I assist you today? Please select the option that best describes your need:**

1. **🛠️ Interview Setup Assistance:**
   • Problems with interview software installation or setup.
   • Issues with audio or video settings.
   • Difficulty accessing interview portal or links.

2. **🌟 Interview Preparation Tips:**
   • Advice on how to prepare for coding challenges.
   • Tips for behavioral interview questions.
   • Best practices for virtual interviews.

3. **🔧 Technical Support:**
   • Troubleshooting errors during interviews.
   • Help with resetting passwords or account issues.
   • Guidance on how to use specific features on our platform.

4. **👔 Role-Specific Queries:**
   • Information about the skills required for different software engineering roles.
   • Insights into day-to-day responsibilities.
   • Clarification on job qualifications and experience requirements.

5. **📝 Feedback on Previous Interviews:**
   • Request detailed feedback for your last interview.
   • Discuss areas for improvement and strengths.
   • Guidance on how to improve performance in future interviews.

6. **📅 Rescheduling or Cancelling Interviews:**
   • Help with changing the date or time of your interview.
   • Instructions for cancelling an interview.
   • Confirmation of new interview schedules.

7. **📘 General Inquiries and Others:**
   • Questions about HeadstarterAI's programs and services.
   • Support with navigating and using the HeadstarterAI platform.
   • Other inquiries not listed above.

**Please type the number of your query or describe your issue, and I'll be happy to help!**
`;



// POST function to handle incoming requests
export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request
  
    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
      model: 'gpt-4o', // Specify the model to use
      stream: true, // Enable streaming responses
    })
  
    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
            if (content) {
              const text = encoder.encode(content) // Encode the content to Uint8Array
              controller.enqueue(text) // Enqueue the encoded text to the stream
            }
          }
        } catch (err) {
          controller.error(err) // Handle any errors that occur during streaming
        } finally {
          controller.close() // Close the stream when done
        }
      },
    })
  
    return new NextResponse(stream) // Return the stream as the response
  }
