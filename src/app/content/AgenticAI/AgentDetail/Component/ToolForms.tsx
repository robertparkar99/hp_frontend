"use client";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function KnowledgeToolForm({ agentId }: { agentId: string}) {
   const [formData, setFormData] = useState({
     agent_id: agentId,
     query_text: '',
     source: '',
     response: '',
     confidence_score: 0,
   });
   const [isLoading, setIsLoading] = useState(false);
   const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://karan-01-agentic-tools.hf.space/api/knowledge/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully submitted');
        // onSubmit(data);
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + (err.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="agent_id">Agent ID</Label>
        <Input
          id="agent_id"
          value={formData.agent_id}
          readOnly
        />
      </div>
      <div>
        <Label htmlFor="query_text">Query Text</Label>
        <Input
          id="query_text"
          value={formData.query_text}
          onChange={(e) => setFormData({ ...formData, query_text: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="response">Response</Label>
        <Textarea
          id="response"
          value={formData.response}
          onChange={(e) => setFormData({ ...formData, response: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="confidence_score">Confidence Score</Label>
        <Input
          id="confidence_score"
          type="number"
          value={formData.confidence_score}
          onChange={(e) => setFormData({ ...formData, confidence_score: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}

export function EmailToolForm({ agentId }: { agentId: string }) {
   const [formData, setFormData] = useState({
     agent_id: agentId,
     to_email: '',
     subject: '',
     body: '',
   });
   const [isLoading, setIsLoading] = useState(false);
   const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://karan-01-agentic-tools.hf.space/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully submitted');
        setApiResponse(data);
        // onSubmit(data);
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
        setApiResponse(data);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + (err.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="to_email">To Email</Label>
        <Input
          id="to_email"
          type="email"
          value={formData.to_email}
          onChange={(e) => setFormData({ ...formData, to_email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </Button>
      {apiResponse && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">API Response:</h3>
          <pre className="text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}

export function VisualizationToolForm({ agentId}: { agentId: string }) {
   const [formData, setFormData] = useState({
     agent_id: agentId,
     chart_type: '',
     input_data: '',
     generated_config: '',
     output_url: '',
   });
   const [isLoading, setIsLoading] = useState(false);
   const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://karan-01-agentic-tools.hf.space/api/visualization/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          input_data: JSON.parse(formData.input_data || '{}'),
          generated_config: JSON.parse(formData.generated_config || '{}'),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully submitted');
        setApiResponse(data);
        // onSubmit(data);
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
        setApiResponse(data);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + (err.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="agent_id">Agent ID</Label>
        <Input
          id="agent_id"
          value={formData.agent_id}
          readOnly
        />
      </div>
      <div>
        <Label htmlFor="chart_type">Chart Type</Label>
        <Input
          id="chart_type"
          value={formData.chart_type}
          onChange={(e) => setFormData({ ...formData, chart_type: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="input_data">Input Data (JSON)</Label>
        <Textarea
          id="input_data"
          value={formData.input_data}
          onChange={(e) => setFormData({ ...formData, input_data: e.target.value })}
          placeholder='{"key": "value"}'
        />
      </div>
      <div>
        <Label htmlFor="generated_config">Generated Config (JSON)</Label>
        <Textarea
          id="generated_config"
          value={formData.generated_config}
          onChange={(e) => setFormData({ ...formData, generated_config: e.target.value })}
          placeholder='{"key": "value"}'
        />
      </div>
      <div>
        <Label htmlFor="output_url">Output URL</Label>
        <Input
          id="output_url"
          value={formData.output_url}
          onChange={(e) => setFormData({ ...formData, output_url: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </Button>
      {apiResponse && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">API Response:</h3>
          <pre className="text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}

export function WebSearchToolForm({ agentId }: { agentId: string }) {
   const [formData, setFormData] = useState({
     agent_id: agentId,
     query: '',
     results: '',
     source_engine: '',
   });
   const [isLoading, setIsLoading] = useState(false);
   const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://karan-01-agentic-tools.hf.space/api/web_search/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          results: JSON.parse(formData.results || '{}'),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully submitted');
        setApiResponse(data);
        // onSubmit(data);
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
        setApiResponse(data);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + (err.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="agent_id">Agent ID</Label>
        <Input
          id="agent_id"
          value={formData.agent_id}
          readOnly
        />
      </div>
      <div>
        <Label htmlFor="query">Query</Label>
        <Input
          id="query"
          value={formData.query}
          onChange={(e) => setFormData({ ...formData, query: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="results">Results (JSON)</Label>
        <Textarea
          id="results"
          value={formData.results}
          onChange={(e) => setFormData({ ...formData, results: e.target.value })}
          placeholder='{"key": "value"}'
        />
      </div>
      <div>
        <Label htmlFor="source_engine">Source Engine</Label>
        <Input
          id="source_engine"
          value={formData.source_engine}
          onChange={(e) => setFormData({ ...formData, source_engine: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </Button>
      {apiResponse && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">API Response:</h3>
          <pre className="text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}

export function SQLExecutionToolForm({ agentId}: { agentId: string }) {
   const [formData, setFormData] = useState({
     agent_id: agentId,
     query: '',
     execution_status: '',
     rows_affected: 0,
     error_message: '',
   });
   const [isLoading, setIsLoading] = useState(false);
   const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://karan-01-agentic-tools.hf.space/api/sql_exec/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully submitted');
        setApiResponse(data);
        // onSubmit(data);
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
        setApiResponse(data);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + (err.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="query">Query</Label>
        <Textarea
          id="query"
          value={formData.query}
          onChange={(e) => setFormData({ ...formData, query: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="execution_status">Execution Status</Label>
        <Input
          id="execution_status"
          value={formData.execution_status}
          onChange={(e) => setFormData({ ...formData, execution_status: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="rows_affected">Rows Affected</Label>
        <Input
          id="rows_affected"
          type="number"
          value={formData.rows_affected}
          onChange={(e) => setFormData({ ...formData, rows_affected: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div>
        <Label htmlFor="error_message">Error Message</Label>
        <Textarea
          id="error_message"
          value={formData.error_message}
          onChange={(e) => setFormData({ ...formData, error_message: e.target.value })}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}

export function FileToolForm({ agentId }: { agentId: string }) {
   const [formData, setFormData] = useState({
     agent_id: agentId,
     file_name: '',
     file_type: '',
     file_size: 0,
     storage_path: '',
     uploaded_by: '',
   });
   const [isLoading, setIsLoading] = useState(false);
   const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('https://karan-01-agentic-tools.hf.space/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully submitted');
        // onSubmit(data);
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + (err.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="file_name">File Name</Label>
        <Input
          id="file_name"
          value={formData.file_name}
          onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="file_type">File Type</Label>
        <Input
          id="file_type"
          value={formData.file_type}
          onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="file_size">File Size</Label>
        <Input
          id="file_size"
          type="number"
          value={formData.file_size}
          onChange={(e) => setFormData({ ...formData, file_size: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div>
        <Label htmlFor="storage_path">Storage Path</Label>
        <Input
          id="storage_path"
          value={formData.storage_path}
          onChange={(e) => setFormData({ ...formData, storage_path: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="uploaded_by">Uploaded By</Label>
        <Input
          id="uploaded_by"
          value={formData.uploaded_by}
          onChange={(e) => setFormData({ ...formData, uploaded_by: e.target.value })}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}

export function N8nToolForm({ agentId }: { agentId: string }) {
  const [formData, setFormData] = useState({
    agent_id: agentId,
    workflow_id: '',
    name: '',
    steps: '{"step1": {"type": "trigger", "event": ""}}',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let parsedSteps = {};
      if (formData.steps.trim()) {
        try {
          parsedSteps = JSON.parse(formData.steps);
        } catch (parseError) {
          alert('Error: Invalid JSON in steps field');
          setIsLoading(false);
          return;
        }
      }
      const res = await fetch('https://karan-01-agentic-tools.hf.space/api/n8n/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          steps: parsedSteps,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully submitted');
        setApiResponse(data);
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
        setApiResponse(data);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + (err.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="agent_id">Agent ID</Label>
        <Input
          id="agent_id"
          value={formData.agent_id}
          readOnly
        />
      </div>
      <div>
        <Label htmlFor="workflow_id">Workflow ID</Label>
        <Input
          id="workflow_id"
          value={formData.workflow_id}
          onChange={(e) => setFormData({ ...formData, workflow_id: e.target.value })}
          placeholder="e.g., wf_002"
        />
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Lead Automation"
        />
      </div>
      <div>
        <Label htmlFor="steps">Steps (JSON)</Label>
        <Textarea
          id="steps"
          value={formData.steps}
          onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
          placeholder='Enter JSON steps, e.g., {"step1": {"type": "trigger"}}'
          rows={5}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </Button>
      {apiResponse && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">API Response:</h3>
          <pre className="text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}
