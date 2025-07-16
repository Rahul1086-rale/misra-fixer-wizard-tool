import React from 'react';
import { 
  Hash, 
  MessageSquare, 
  Wrench, 
  Download, 
  RefreshCw, 
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function WorkflowControls() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();

  const addLineNumbers = async () => {
    if (!state.uploadedFile || !state.projectId) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Simulate API call
      setTimeout(() => {
        dispatch({ type: 'SET_NUMBERED_FILE', payload: { name: `numbered_${state.uploadedFile!.name}`, path: '/path/to/numbered' }});
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'chat' });
        dispatch({ type: 'SET_LOADING', payload: false });
        toast({ title: "Success", description: "Line numbers added" });
      }, 1000);
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const sendFirstPrompt = async () => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      const message = { id: uuidv4(), type: 'assistant' as const, content: 'FILE RECEIVED. READY FOR VIOLATIONS.', timestamp: new Date() };
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      dispatch({ type: 'SET_PROCESSING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const selectedCount = state.violations.filter(v => v.selected).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <span className="text-sm font-medium">1. Add Line Numbers</span>
          <Button onClick={addLineNumbers} variant="outline" className="w-full" disabled={!state.uploadedFile || state.isLoading}>
            <Hash className="w-4 h-4 mr-2" />
            Add Line Numbers
          </Button>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">2. Initialize Gemini</span>
          <Button onClick={sendFirstPrompt} variant="outline" className="w-full" disabled={!state.numberedFile}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Send First Prompt
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">3. Fix Violations</span>
            <Badge variant="outline">{selectedCount} selected</Badge>
          </div>
          <Button variant="outline" className="w-full" disabled={selectedCount === 0}>
            <Wrench className="w-4 h-4 mr-2" />
            Fix Selected Violations
          </Button>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={() => dispatch({ type: 'RESET_STATE' })} variant="ghost" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}