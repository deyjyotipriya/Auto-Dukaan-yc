import React, { useState, useEffect, useRef } from 'react';

interface ChatInterfaceProps {
  buyerId: string;
}

// Message interface
interface Message {
  id: string;
  orderId?: string;
  senderId: string;
  senderType: 'buyer' | 'seller' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Chat conversation interface
interface ChatConversation {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  orderId?: string;
  productName?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ buyerId }) => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock data for conversations (in a real app, this would come from an API)
  const mockChats: ChatConversation[] = [
    {
      id: 'chat1',
      sellerId: 'seller1',
      sellerName: 'Ganesh Electronics',
      sellerAvatar: 'GE',
      lastMessage: 'Your order has been shipped',
      timestamp: '2023-05-12T10:30:00Z',
      unreadCount: 2,
      orderId: 'ORDER-12345',
      productName: 'Bluetooth Headphones'
    },
    {
      id: 'chat2',
      sellerId: 'seller2',
      sellerName: 'Ananya Fashion',
      sellerAvatar: 'AF',
      lastMessage: 'Thanks for your order!',
      timestamp: '2023-05-11T15:45:00Z',
      unreadCount: 0,
      orderId: 'ORDER-12346',
      productName: 'Cotton Saree'
    },
    {
      id: 'chat3',
      sellerId: 'seller3',
      sellerName: 'Mumbai Spices',
      sellerAvatar: 'MS',
      lastMessage: 'Do you have any questions about the product?',
      timestamp: '2023-05-10T09:15:00Z',
      unreadCount: 0,
      orderId: 'ORDER-12347',
      productName: 'Premium Spice Set'
    },
  ];

  // Mock data for messages (in a real app, this would come from an API)
  const mockMessages: Record<string, Message[]> = {
    chat1: [
      {
        id: 'msg1',
        senderId: 'system',
        senderType: 'system',
        senderName: 'System',
        content: 'Chat started for order ORDER-12345',
        timestamp: '2023-05-12T09:00:00Z',
        read: true
      },
      {
        id: 'msg2',
        senderId: buyerId,
        senderType: 'buyer',
        senderName: 'You',
        content: 'Hello, I wanted to ask about my order. When will it be shipped?',
        timestamp: '2023-05-12T09:05:00Z',
        read: true
      },
      {
        id: 'msg3',
        senderId: 'seller1',
        senderType: 'seller',
        senderName: 'Ganesh Electronics',
        content: 'Hi there! Your order is being processed and will be shipped today. You will receive a tracking number soon.',
        timestamp: '2023-05-12T09:15:00Z',
        read: true
      },
      {
        id: 'msg4',
        senderId: buyerId,
        senderType: 'buyer',
        senderName: 'You',
        content: 'Thank you! Do you know what time it will be delivered?',
        timestamp: '2023-05-12T09:20:00Z',
        read: true
      },
      {
        id: 'msg5',
        senderId: 'seller1',
        senderType: 'seller',
        senderName: 'Ganesh Electronics',
        content: 'The delivery usually takes 2-3 business days after shipping. You can track the package once it\'s shipped.',
        timestamp: '2023-05-12T09:30:00Z',
        read: true
      },
      {
        id: 'msg6',
        senderId: 'system',
        senderType: 'system',
        senderName: 'System',
        content: 'Order has been shipped. Tracking number: TRK123456789',
        timestamp: '2023-05-12T10:00:00Z',
        read: true
      },
      {
        id: 'msg7',
        senderId: 'seller1',
        senderType: 'seller',
        senderName: 'Ganesh Electronics',
        content: 'Your order has been shipped. You can track it with the tracking number above.',
        timestamp: '2023-05-12T10:30:00Z',
        read: false
      },
      {
        id: 'msg8',
        senderId: 'seller1',
        senderType: 'seller',
        senderName: 'Ganesh Electronics',
        content: 'Please let us know if you have any other questions.',
        timestamp: '2023-05-12T10:32:00Z',
        read: false
      }
    ],
    chat2: [
      {
        id: 'msg9',
        senderId: 'system',
        senderType: 'system',
        senderName: 'System',
        content: 'Chat started for order ORDER-12346',
        timestamp: '2023-05-11T14:30:00Z',
        read: true
      },
      {
        id: 'msg10',
        senderId: 'seller2',
        senderType: 'seller',
        senderName: 'Ananya Fashion',
        content: 'Thank you for choosing Ananya Fashion! Your order has been received.',
        timestamp: '2023-05-11T14:35:00Z',
        read: true
      },
      {
        id: 'msg11',
        senderId: buyerId,
        senderType: 'buyer',
        senderName: 'You',
        content: 'Thank you! I\'m excited to receive the saree.',
        timestamp: '2023-05-11T14:40:00Z',
        read: true
      },
      {
        id: 'msg12',
        senderId: 'seller2',
        senderType: 'seller',
        senderName: 'Ananya Fashion',
        content: 'We\'re sure you\'ll love it! We have some matching accessories too if you\'re interested.',
        timestamp: '2023-05-11T14:45:00Z',
        read: true
      },
      {
        id: 'msg13',
        senderId: 'seller2',
        senderType: 'seller',
        senderName: 'Ananya Fashion',
        content: 'Thanks for your order!',
        timestamp: '2023-05-11T15:45:00Z',
        read: true
      }
    ],
    chat3: [
      {
        id: 'msg14',
        senderId: 'system',
        senderType: 'system',
        senderName: 'System',
        content: 'Chat started for order ORDER-12347',
        timestamp: '2023-05-10T09:00:00Z',
        read: true
      },
      {
        id: 'msg15',
        senderId: 'seller3',
        senderType: 'seller',
        senderName: 'Mumbai Spices',
        content: 'Welcome to Mumbai Spices! Thank you for your order of our Premium Spice Set.',
        timestamp: '2023-05-10T09:05:00Z',
        read: true
      },
      {
        id: 'msg16',
        senderId: 'seller3',
        senderType: 'seller',
        senderName: 'Mumbai Spices',
        content: 'Do you have any questions about the product?',
        timestamp: '2023-05-10T09:15:00Z',
        read: true
      }
    ]
  };

  // Load chats and select the first one
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setChats(mockChats);
      setIsLoading(false);
      if (mockChats.length > 0) {
        setActiveChat(mockChats[0].id);
      }
    }, 1000);
  }, [buyerId]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      // In a real app, this would be an API call
      setMessages(mockMessages[activeChat] || []);
      
      // Mark messages as read
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === activeChat ? { ...chat, unreadCount: 0 } : chat
        )
      );
    }
  }, [activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format date to a friendly format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeChat) return;
    
    setIsSending(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      const newMsg: Message = {
        id: `new-${Date.now()}`,
        senderId: buyerId,
        senderType: 'buyer',
        senderName: 'You',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: true
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setIsSending(false);
      
      // Update last message in chat list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === activeChat 
            ? { 
                ...chat, 
                lastMessage: newMessage.trim(),
                timestamp: new Date().toISOString()
              } 
            : chat
        )
      );
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Chat list sidebar */}
      <div className="w-72 border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
          <p className="text-sm text-gray-500">Chat with sellers about your orders</p>
        </div>
        
        {chats.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={`w-full px-4 py-3 flex items-start hover:bg-gray-50 ${
                  activeChat === chat.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="flex-shrink-0 relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
                    {chat.sellerAvatar}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {chat.sellerName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(chat.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage}
                  </p>
                  {chat.orderId && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {chat.orderId} • {chat.productName}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-3 border-b border-gray-200 flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
                  {chats.find(c => c.id === activeChat)?.sellerAvatar}
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-900">
                    {chats.find(c => c.id === activeChat)?.sellerName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {chats.find(c => c.id === activeChat)?.orderId}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex space-x-2">
                <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" title="View Order">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
                <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" title="More Options">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    // Check if new date group is needed
                    const showDateSeparator = index === 0 || 
                      new Date(message.timestamp).toDateString() !== 
                      new Date(messages[index - 1].timestamp).toDateString();
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <div className="px-4 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                              {new Date(message.timestamp).toLocaleDateString([], {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                        
                        {message.senderType === 'system' ? (
                          <div className="flex justify-center">
                            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-100 rounded-full">
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          <div className={`flex ${message.senderType === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex items-end space-x-2">
                              {message.senderType === 'seller' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-medium">
                                  {chats.find(c => c.id === activeChat)?.sellerAvatar}
                                </div>
                              )}
                              
                              <div 
                                className={`max-w-md px-4 py-2 rounded-lg ${
                                  message.senderType === 'buyer' 
                                    ? 'bg-blue-500 text-white rounded-br-none' 
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div className={`text-xs mt-1 ${message.senderType === 'buyer' ? 'text-blue-200' : 'text-gray-500'}`}>
                                  {formatDate(message.timestamp)}
                                </div>
                              </div>
                              
                              {message.senderType === 'buyer' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                                  {message.senderName.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
                  title="Add Attachment"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  className={`p-2 rounded-full ${
                    newMessage.trim() && !isSending
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <p>Messages are end-to-end encrypted</p>
                <button className="text-blue-600 hover:text-blue-800">
                  Send quick response
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No chat selected</h3>
            <p className="mt-2 text-gray-500">
              Select a conversation from the list or start a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;