import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';

interface ViewersListProps {
  viewerCount: number;
}

// Mock viewer for demonstration
interface MockViewer {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
  location?: string;
}

const ViewersList: React.FC<ViewersListProps> = ({ viewerCount }) => {
  const { t } = useTranslation();
  const [viewers, setViewers] = useState<MockViewer[]>([]);
  
  // Generate mock viewers based on viewer count
  useEffect(() => {
    const mockNames = [
      'Raj Kumar', 'Priya Singh', 'Amit Patel', 'Neha Sharma', 
      'Vikram Mehta', 'Anjali Desai', 'Arjun Nair', 'Meera Iyer',
      'Rajesh Gupta', 'Sunita Shah', 'Kiran Reddy', 'Divya Chauhan',
      'Sanjay Joshi', 'Rekha Mishra', 'Kunal Malhotra', 'Deepa Verma',
      'Vivek Singh', 'Pooja Patel', 'Aditya Shah', 'Ritu Khanna'
    ];
    
    const locations = [
      'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 
      'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
    ];
    
    const generateRandomViewer = (index: number): MockViewer => {
      const name = mockNames[Math.floor(Math.random() * mockNames.length)];
      const location = Math.random() > 0.3 ? locations[Math.floor(Math.random() * locations.length)] : undefined;
      const minutesAgo = Math.floor(Math.random() * 60);
      
      return {
        id: `viewer_${index}`,
        name,
        joinedAt: new Date(Date.now() - minutesAgo * 60000),
        location
      };
    };
    
    // Generate viewers up to the current count
    const mockViewers = Array.from({ length: Math.min(viewerCount, 20) }, (_, i) => 
      generateRandomViewer(i)
    );
    
    // Sort by most recent join time
    mockViewers.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());
    
    setViewers(mockViewers);
  }, [viewerCount]);
  
  // Format time elapsed since joining
  const formatTimeElapsed = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    
    if (minutes < 1) return t('livestream.viewers.justNow');
    if (minutes === 1) return t('livestream.viewers.minuteAgo');
    if (minutes < 60) return t('livestream.viewers.minutesAgo', { count: minutes });
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return t('livestream.viewers.hourAgo');
    return t('livestream.viewers.hoursAgo', { count: hours });
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">
        {t('livestream.viewers.title')} ({viewerCount})
      </h3>
      
      {viewers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('livestream.viewers.noViewers')}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-y-auto max-h-[400px]">
            {viewers.map(viewer => (
              <div key={viewer.id} className="flex items-center py-2 border-b last:border-b-0">
                <div className="flex-shrink-0 mr-3">
                  {viewer.avatar ? (
                    <img 
                      src={viewer.avatar} 
                      alt={viewer.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-sm">{viewer.name}</span>
                    {viewer.location && (
                      <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        {viewer.location}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatTimeElapsed(viewer.joinedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {viewerCount > viewers.length && (
            <div className="text-center text-sm text-gray-500 py-2 border-t">
              {t('livestream.viewers.andMore', { count: viewerCount - viewers.length })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewersList;