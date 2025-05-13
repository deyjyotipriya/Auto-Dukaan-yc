import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Search, 
  X, 
  Send, 
  Package, 
  ShoppingBag, 
  ChevronRight, 
  Check, 
  CheckCheck, 
  Phone,
  Image as ImageIcon,
  Smile,
  MoreVertical
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { 
  selectAllContacts, 
  selectActiveContactId, 
  selectActiveContact,
  setActiveContact,
  sendMessage,
  receiveMessage,
  updateMessageStatus
} from '../store/slices/chatSlice';
import { 
  selectAllProducts,
  Product
} from '../store/slices/productsSlice';
import { addOrder } from '../store/slices/ordersSlice';
import { formatCurrency, formatDateTime, truncateText } from '../utils/helpers';

const Chat: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const contacts = useAppSelector(selectAllContacts);
  const activeContactId = useAppSelector(selectActiveContactId);
  const activeContact = useAppSelector(selectActiveContact);
  const products = useAppSelector(selectAllProducts);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Filter contacts based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm, contacts]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContact?.messages]);
  
  // Update message status to read when active contact changes
  useEffect(() => {
    if (activeContactId) {
      activeContact?.messages.forEach(message => {
        if (message.sender === 'customer' && message.status !== 'read') {
          dispatch(updateMessageStatus({
            contactId: activeContactId,
            messageId: message.id,
            status: 'read'
          }));
        }
      });
    }
  }, [activeContactId, activeContact, dispatch]);
  
  const handleSelectContact = (id: string) => {
    dispatch(setActiveContact(id));
  };
  
  const handleSendMessage = () => {
    if (messageText.trim() && activeContactId) {
      // Check if message is a sell command
      if (messageText.toLowerCase().startsWith('sell ')) {
        const priceMatch = messageText.match(/sell\s+(\d+)/i);
        if (priceMatch && priceMatch[1]) {
          const price = parseInt(priceMatch[1], 10);
          
          // Send the sell command message
          dispatch(sendMessage({
            contactId: activeContactId,
            text: messageText,
            isOrder: true,
            orderId: `ORD${Math.floor(Math.random() * 900000) + 100000}`
          }));
          
          // Get contact details
          const contact = contacts.find(c => c.id === activeContactId);
          if (contact) {
            // Create a mock order
            dispatch(addOrder({
              customerId: contact.id,
              customerName: contact.name,
              customerPhone: contact.phone,
              items: [
                {
                  productId: products[0].id,
                  productName: products[0].name,
                  productImage: products[0].images[0],
                  quantity: 1,
                  price: price
                }
              ],
              totalAmount: price,
              status: 'pending',
              paymentStatus: 'pending',
              paymentMethod: 'upi',
              shippingAddress: {
                name: contact.name,
                phone: contact.phone,
                street: '123 Main Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001'
              }
            }));
            
            // Send confirmation message
            setTimeout(() => {
              dispatch(sendMessage({
                contactId: activeContactId,
                text: "I've created an order for you. Please complete the payment using the link."
              }));
            }, 1000);
            
            // Simulate customer response
            setTimeout(() => {
              dispatch(receiveMessage({
                contactId: activeContactId,
                text: "Payment sent!"
              }));
            }, 3000);
            
            setTimeout(() => {
              dispatch(sendMessage({
                contactId: activeContactId,
                text: "Thank you! Your order has been confirmed and will be processed shortly."
              }));
            }, 4000);
          }
        }
      } else {
        // Regular message
        dispatch(sendMessage({
          contactId: activeContactId,
          text: messageText
        }));
        
        // Simulate typing for response
        setTimeout(() => {
          setIsTyping(true);
        }, 1000);
        
        // Simulate response
        setTimeout(() => {
          setIsTyping(false);
          dispatch(receiveMessage({
            contactId: activeContactId,
            text: getRandomResponse()
          }));
        }, 3000);
      }
      
      setMessageText('');
    }
  };
  
  const getRandomResponse = () => {
    const responses = [
      "Thank you for your message!",
      "I'll check and let you know.",
      "That sounds good!",
      "Do you have this in other colors?",
      "When will it be delivered?",
      "I'm interested in more products.",
      "Is there a discount available?",
      "Can you send more pictures?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendProduct = (product: Product) => {
    if (activeContactId) {
      dispatch(sendMessage({
        contactId: activeContactId,
        text: `Check out our ${product.name} for ${formatCurrency(product.price)}. Would you like to order this?`
      }));
      setShowSuggestions(false);
    }
  };
  
  const getMessageStatus = (status: 'sent' | 'delivered' | 'read') => {
    switch (status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-500" />;
      default:
        return null;
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };
  
  return (
    <div className="h-[calc(100vh-7rem)] flex overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col w-full h-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 h-full gap-0 bg-white rounded-xl shadow-card overflow-hidden">
          {/* Contact list */}
          <div className="md:col-span-1 border-r border-gray-200 flex flex-col max-h-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('chat.title')}</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('chat.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={16} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                  <p>{t('chat.noContacts')}</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <motion.button
                    key={contact.id}
                    variants={itemVariants}
                    className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      activeContactId === contact.id ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => handleSelectContact(contact.id)}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <img 
                          src={contact.profilePic} 
                          alt={contact.name} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {contact.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h3>
                          <span className="text-xs text-gray-500">
                            {new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
          
          {/* Chat window */}
          <div className="md:col-span-2 xl:col-span-3 flex flex-col h-full">
            {activeContact ? (
              <>
                {/* Chat header */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={activeContact.profilePic} 
                      alt={activeContact.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">{activeContact.name}</h3>
                      <p className="text-xs text-gray-500">{activeContact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                      <Phone size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
                  <div className="space-y-4">
                    {activeContact.messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`${
                            message.sender === 'user' 
                              ? 'chat-bubble-right' 
                              : 'chat-bubble-left'
                          }`}
                        >
                          {message.isOrder ? (
                            <div className="bg-primary-900 bg-opacity-10 p-2 rounded-md">
                              <div className="flex items-center">
                                <ShoppingBag size={16} className="mr-2 text-primary-600" />
                                <span className="text-primary-800">Order created</span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                <strong>Command:</strong> {message.text}
                              </div>
                              <button className="mt-2 text-xs bg-primary-600 text-white px-2 py-1 rounded">
                                View Order
                              </button>
                            </div>
                          ) : (
                            message.text
                          )}
                          <div className="text-right mt-1">
                            <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                              {formatDateTime(message.timestamp).split(' ')[1]}
                              {message.sender === 'user' && getMessageStatus(message.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="chat-bubble-left">
                          <div className="typing-indicator">
                            <span className="h-2 w-2 mr-1"></span>
                            <span className="h-2 w-2 mr-1"></span>
                            <span className="h-2 w-2"></span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messageEndRef} />
                  </div>
                </div>
                
                {/* Input area */}
                <div className="p-3 border-t border-gray-200">
                  {showSuggestions && (
                    <div className="mb-3 bg-gray-50 p-2 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">{t('chat.productSuggestions')}</h4>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {products.slice(0, 3).map((product) => (
                          <button
                            key={product.id}
                            className="bg-white rounded-lg p-2 hover:bg-gray-100 transition-colors border border-gray-200 flex flex-col items-center"
                            onClick={() => handleSendProduct(product)}
                          >
                            <div className="w-14 h-14 rounded-md overflow-hidden mb-1">
                              <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs font-medium text-gray-900 truncate w-full text-center">
                              {truncateText(product.name, 20)}
                            </p>
                            <p className="text-xs text-primary-600">
                              {formatCurrency(product.price)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex space-x-1">
                      <button 
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                        onClick={() => setShowSuggestions(!showSuggestions)}
                      >
                        <Package size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                        <ImageIcon size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                        <Smile size={18} />
                      </button>
                    </div>
                    <div className="ml-2 flex-grow">
                      <textarea
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={1}
                      />
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <button
                        className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Quick replies */}
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                    <button
                      className="whitespace-nowrap px-3 py-1 text-xs border border-gray-200 rounded-full hover:bg-gray-50"
                      onClick={() => setMessageText("Thanks for your order!")}
                    >
                      Thanks for your order!
                    </button>
                    <button
                      className="whitespace-nowrap px-3 py-1 text-xs border border-gray-200 rounded-full hover:bg-gray-50"
                      onClick={() => setMessageText("Your order has been shipped.")}
                    >
                      Your order has been shipped
                    </button>
                    <button
                      className="whitespace-nowrap px-3 py-1 text-xs border border-gray-200 rounded-full hover:bg-gray-50"
                      onClick={() => setMessageText("sell 599")}
                    >
                      sell 599
                    </button>
                    <button
                      className="whitespace-nowrap px-3 py-1 text-xs border border-gray-200 rounded-full hover:bg-gray-50"
                      onClick={() => setMessageText("I'll check and let you know.")}
                    >
                      I'll check and let you know
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Select a conversation</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Choose a customer from the list to view their conversation history and respond to their messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Chat;