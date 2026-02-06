import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, agent_name, tools } = body;

    // Validate the payload
    if (!agent_id || !agent_name || !tools) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store the tools data in a JSON file
    const filePath = path.join(process.cwd(), 'agent_tools.json');
    let toolsData: Record<string, any> = {};
    if (fs.existsSync(filePath)) {
      toolsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    toolsData[agent_id] = { agent_id, agent_name, tools };
    fs.writeFileSync(filePath, JSON.stringify(toolsData, null, 2));

    console.log('Agent tools created:', { agent_id, agent_name, tools });

    return NextResponse.json({ message: 'Tools associated successfully', agent_id, agent_name, tools }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/agentic_tools/create:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}