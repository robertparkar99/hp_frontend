// export async function POST(req: Request) {
//     const payload = await req.json();

//     const res = await fetch(
//         `${process.env.GENKIT_BASE_URL}/flows/jobRoleCompetencyFlow`,
//         {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//         }
//     );

//     if (!res.ok) {
//         return new Response('AI service error', { status: 500 });
//     }

//     const data = await res.json();
//     return Response.json(data);
// }




// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         console.log('🔵 GENKIT API REQUEST BODY:', body);

//         const genkitRes = await fetch(
//             'http://localhost:3400/jobRoleCompetencyFlow',
//             {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(body),
//             }
//         );

//         if (!genkitRes.ok) {
//             const errText = await genkitRes.text();
//             throw new Error(errText);
//         }

//         const data = await genkitRes.json();

//         return NextResponse.json(data.result);
//     } catch (err: any) {
//         console.error('🔴 GENKIT API ERROR:', err);

//         return NextResponse.json(
//             {
//                 message: 'Genkit execution failed',
//                 error: err.message,
//             },
//             { status: 500 }
//         );
//     }
// }




import { NextResponse } from 'next/server';

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('🔵 NEXT API REQUEST BODY:', body);

        // Genkit flow server expects the input wrapped in a "data" property
        const genkitRes = await fetch(
            'http://localhost:3400/jobRoleCompetencyTestFlow',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: body }),
            }
        );

        if (!genkitRes.ok) {
            const errText = await genkitRes.text();
            throw new Error(errText);
        }

        const data = await genkitRes.json();

        return NextResponse.json(data);
    } catch (err: any) {
        console.error('🔴 GENKIT TEST API ERROR:', err);

        return NextResponse.json(
            {
                message: 'Genkit test flow failed',
                error: err.message,
            },
            { status: 500 }
        );
    }
}



// import { NextResponse } from "next/server";
// import { jobRoleCompetencyFlow } from "../../../../apps/ai/src/flows/jobRoleCompetencyFlow";

// export async function POST(req: Request) {
//     const body = await req.json();

//     const result = await jobRoleCompetencyFlow(body);

//     return NextResponse.json(result);
// }
