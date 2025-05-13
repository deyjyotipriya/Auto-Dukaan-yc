import React from 'react';
import { Heart, ThumbsUp, Star, Smile } from 'lucide-react';
import { StreamComment } from '../../services/LivestreamService';

interface LiveChatMessageProps {
  message: StreamComment;
}

const LiveChatMessage: React.FC<LiveChatMessageProps> = ({ message }) => {
  // Get avatar placeholder color based on user name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
    ];
    
    // Simple hash function
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // Get reaction icon
  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'heart':
        return <Heart className="h-3 w-3 text-red-500" />;
      case 'thumbsUp':
        return <ThumbsUp className="h-3 w-3 text-blue-500" />;
      case 'star':
        return <Star className="h-3 w-3 text-yellow-500" />;
      case 'smile':
        return <Smile className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Check if the message is from the current user
  const isOwnMessage = message.userId === 'self';
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isOwnMessage ? 'bg-blue-50 rounded-l-lg rounded-tr-lg' : 'bg-gray-50 rounded-r-lg rounded-tl-lg'} p-3`}>
        <div className="flex items-center mb-1">
          {!isOwnMessage && (
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs mr-2 ${getAvatarColor(message.userName)}`}
            >
              {message.userName.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="text-sm font-medium">
            {message.userName}
          </div>
          
          <div className="text-xs text-gray-500 ml-2">
            {formatTime(message.timestamp)}
          </div>
        </div>
        
        <div className="text-sm">
          {message.content}
        </div>
        
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <div key={index} className="flex items-center bg-white rounded-full px-1.5 py-0.5 text-xs">
                {getReactionIcon(reaction.type)}
                <span className="ml-1">{reaction.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChatMessage;