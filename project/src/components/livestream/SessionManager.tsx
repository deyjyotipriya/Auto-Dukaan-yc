import React, { useState, useEffect } from 'react';
import { DatabaseService, SessionRecord, CapturedFrameRecord } from '../../services/DatabaseService';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { format } from 'date-fns';

interface SessionManagerProps {
  onSelectSession?: (sessionId: string) => void;
  onSelectFrame?: (frameId: string) => void;
  currentSessionId?: string;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  onSelectSession,
  onSelectFrame,
  currentSessionId
}) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(currentSessionId || null);
  const [frames, setFrames] = useState<CapturedFrameRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionName, setSessionName] = useState<string>('');
  
  // Load all sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const allSessions = await DatabaseService.getAllSessions();
        setSessions(allSessions.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ));
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSessions();
  }, []);
  
  // Load frames for selected session
  useEffect(() => {
    const loadFrames = async () => {
      if (!selectedSessionId) {
        setFrames([]);
        return;
      }
      
      try {
        setIsLoading(true);
        const sessionFrames = await DatabaseService.getFramesBySession(selectedSessionId);
        setFrames(sessionFrames.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } catch (error) {
        console.error('Error loading frames for session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFrames();
  }, [selectedSessionId]);
  
  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    if (onSelectSession) {
      onSelectSession(sessionId);
    }
  };
  
  const handleFrameSelect = (frameId: string) => {
    if (onSelectFrame) {
      onSelectFrame(frameId);
    }
  };
  
  const handleCreateSession = async () => {
    try {
      const name = sessionName.trim() || `Session ${new Date().toLocaleString()}`;
      
      const newSession: Omit<SessionRecord, 'id'> = {
        name,
        startTime: new Date(),
        endTime: null,
        status: 'ready',
        deviceInfo: navigator.userAgent,
        metadata: {
          browser: navigator.userAgent,
          createdFrom: 'SessionManager'
        }
      };
      
      const sessionId = await DatabaseService.createSession(newSession);
      
      // Refresh sessions list
      const allSessions = await DatabaseService.getAllSessions();
      setSessions(allSessions.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ));
      
      // Select the new session
      setSelectedSessionId(sessionId);
      if (onSelectSession) {
        onSelectSession(sessionId);
      }
      
      // Reset form
      setSessionName('');
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };
  
  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session and all its frames? This action cannot be undone.')) {
      try {
        // Delete all frames for this session
        const sessionFrames = await DatabaseService.getFramesBySession(sessionId);
        
        for (const frame of sessionFrames) {
          await DatabaseService.deleteCapturedFrame(frame.id);
        }
        
        // Delete the session
        await DatabaseService.deleteSession(sessionId);
        
        // Refresh sessions list
        const allSessions = await DatabaseService.getAllSessions();
        setSessions(allSessions.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ));
        
        // Clear selection if the deleted session was selected
        if (selectedSessionId === sessionId) {
          setSelectedSessionId(null);
          setFrames([]);
        }
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };
  
  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <Tabs defaultValue="sessions" className="p-4">
        <TabsList className="mb-4">
          <TabsTrigger value="sessions">Recording Sessions</TabsTrigger>
          <TabsTrigger value="new" className="bg-green-50">New Session</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sessions</h3>
            
            {isLoading && sessions.length === 0 ? (
              <div className="text-center p-4">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No recording sessions found. Create a new session to start recording.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sessions.map(session => (
                  <div 
                    key={session.id}
                    className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center ${
                      selectedSessionId === session.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <div>
                      <div className="font-medium">{session.name}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(session.startTime), 'PPP p')}
                        {session.endTime ? 
                          ` - ${format(new Date(session.endTime), 'p')}` : 
                          ' (In progress)'
                        }
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedSessionId && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Captured Frames</h3>
                
                {isLoading ? (
                  <div className="text-center p-4">Loading frames...</div>
                ) : frames.length === 0 ? (
                  <div className="text-center p-4 text-gray-500">
                    No frames captured in this session yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-80 overflow-y-auto p-2">
                    {frames.map(frame => (
                      <div 
                        key={frame.id}
                        className={`cursor-pointer rounded-md overflow-hidden border-2 hover:border-blue-500 transition-colors ${
                          frame.isEdited ? 'border-green-400' : 'border-gray-200'
                        } ${frame.productDetected ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => handleFrameSelect(frame.id)}
                        title={`Captured: ${new Date(frame.timestamp).toLocaleString()}${
                          frame.isEdited ? ' (Edited)' : ''
                        }${frame.productDetected ? ' (Product Created)' : ''}`}
                      >
                        <div className="aspect-square relative">
                          <img
                            src={frame.thumbnailUrl || frame.editedImageUrl || frame.imageUrl}
                            alt={`Frame from ${new Date(frame.timestamp).toLocaleString()}`}
                            className="w-full h-full object-cover"
                          />
                          {frame.productDetected && (
                            <div className="absolute bottom-0 right-0 bg-purple-500 text-white text-xs p-1">
                              ✓
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="new">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Create New Recording Session</h3>
            
            <div>
              <label htmlFor="sessionName" className="block text-sm font-medium mb-1">
                Session Name
              </label>
              <Input
                id="sessionName"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name (optional)"
              />
            </div>
            
            <Button onClick={handleCreateSession}>
              Create Session
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionManager;