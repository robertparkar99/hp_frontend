import { BuildWithAIInputSchema, BuildWithAIOutputSchema } from '../schemas/buildWithAISchemas.js';
import { buildWithAIPrompt } from '../prompts/buildWithAIPrompt.js';

// Define model directly to avoid import order issues
const gemini25FlashModel = 'googleai/gemini-2.5-flash';

/**
 * Build with AI Flow
 * Generates course outlines for Gamma API integration
 * Replaces OpenRouter/DeepSeek implementation with Genkit + Gemini 2.5 Flash
 */
export const buildWithAIFlow = (gk) =>
    gk.defineFlow(
        {
            name: 'buildWithAIFlow',
            inputSchema: BuildWithAIInputSchema,
            outputSchema: BuildWithAIOutputSchema,
            stream: false, // Synchronous response for API compatibility
        },
        async (input) => {
            const startTime = Date.now();

            console.log('🔵 buildWithAIFlow invoked:', {
                industry: input.industry,
                department: input.department,
                jobRole: input.jobRole,
                modality: input.modality,
                timestamp: new Date().toISOString(),
            });

            // Build the prompt using the input data
            const prompt = buildWithAIPrompt(input);

            // Retry logic for transient failures
            const maxRetries = 2;
            let lastError;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`🔄 Attempt ${attempt}/${maxRetries} - Calling Gemini 2.5 Flash`);

                    // Generate content using Gemini 2.5 Flash
                    // Configuration matches OpenRouter settings: temp 0.7, topP 0.9, max tokens 4000
                    // Generate content using Gemini 2.5 Flash
                    const response = await gk.generate({
                        model: gemini25FlashModel,
                        prompt,
                        config: {
                            temperature: 0.7,
                            topP: 0.9,
                            maxOutputTokens: 4000,
                            safetySettings: [
                                {
                                    category: 'HARM_CATEGORY_HATE_SPEECH',
                                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                                },
                                {
                                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                                },
                            ],
                        },
                        stream: false,
                    });

                    // Extract text content using multiple strategies
                    let generatedText = null;

                    // Strategy 1: Standard Genkit .text() method
                    if (typeof response.text === 'function') {
                        try { generatedText = response.text(); } catch (e) { /* ignore */ }
                    }

                    // Strategy 2: Direct text property (if POJO)
                    if (!generatedText && typeof response.text === 'string') {
                        generatedText = response.text;
                    }

                    // Strategy 3: Parse message content array (Genkit internals)
                    if (!generatedText && response.message && Array.isArray(response.message.content)) {
                        generatedText = response.message.content
                            .map(part => part.text || '')
                            .join('');
                    }

                    // Strategy 4: Fallback to output property (legacy/wrapper)
                    if (!generatedText && response.output) {
                        if (typeof response.output === 'string') {
                            generatedText = response.output;
                        } else if (typeof response.output === 'object') {
                            generatedText = response.output.content || response.output.text || JSON.stringify(response.output);
                        }
                    }

                    // Validate output
                    if (!generatedText || typeof generatedText !== 'string' || generatedText.length < 10) {
                        console.error('❌ Type mismatch troubleshooting:', {
                            responseKeys: Object.keys(response || {}),
                            messageKeys: response.message ? Object.keys(response.message) : 'N/A',
                            contentArray: response.message?.content ? JSON.stringify(response.message.content) : 'N/A',
                            finishReason: response.finishReason,
                        });
                        throw new Error(`Invalid output format: Could not extract text from response. FinishReason: ${response.finishReason}`);
                    }

                    if (generatedText.length < 50) {
                        throw new Error(`Generated content is too short (${generatedText.length} chars)`);
                    }

                    // Ensure we return the content property as expected by the schema
                    const finalOutput = generatedText;

                    const duration = Date.now() - startTime;

                    console.log('🟢 buildWithAIFlow completed successfully:', {
                        contentLength: finalOutput.length,
                        duration: `${duration}ms`,
                        attempt: attempt,
                        timestamp: new Date().toISOString(),
                    });

                    return { content: finalOutput };

                } catch (error) {
                    lastError = error;
                    console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, {
                        error: error.message,
                        attempt: attempt,
                        timestamp: new Date().toISOString(),
                    });

                    // Don't retry on the last attempt
                    if (attempt < maxRetries) {
                        // Exponential backoff: wait 1s, then 2s
                        const waitTime = attempt * 1000;
                        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
            }

            // All retries failed
            console.error('❌ buildWithAIFlow failed after all retries:', {
                error: lastError.message,
                duration: `${Date.now() - startTime}ms`,
                timestamp: new Date().toISOString(),
            });

            throw new Error(`Failed to generate course outline: ${lastError.message}`);
        }
    );
