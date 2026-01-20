import { z } from 'zod';


console.log("Defining jobRoleCompetencyTestFlow (ANY INPUT)");

export const jobRoleCompetencyTestFlow = (gk) =>
    gk.defineFlow(
        {
            name: 'jobRoleCompetencyTestFlow',
            inputSchema: z.any(),
        },
        async (input) => {
            console.log("🟢 TEST FLOW RECEIVED RAW INPUT:", input);

            return {
                received: true,
                timestamp: new Date().toISOString(),
                payload: input,
            };
        }
    );
