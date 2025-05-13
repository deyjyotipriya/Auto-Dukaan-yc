import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'customer';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isOrder?: boolean;
  orderId?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  phone: string;
  profilePic: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

interface ChatState {
  contacts: ChatContact[];
  activeContactId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  contacts: [
    {
      id: 'CUST1',
      name: 'Anjali Sharma',
      phone: '+91 98765 43210',
      profilePic: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
      lastMessage: 'Thank you for confirming my order!',
      lastMessageTime: '2023-06-16T12:30:00Z',
      unreadCount: 0,
      messages: [
        {
          id: 'm1',
          sender: 'customer',
          text: 'Hi, I saw your handwoven saree in your livestream yesterday.',
          timestamp: '2023-06-15T08:00:00Z',
          status: 'read'
        },
        {
          id: 'm2',
          sender: 'user',
          text: 'Hello! Yes, the red Handwoven Saree is one of our best selling items.',
          timestamp: '2023-06-15T08:05:00Z',
          status: 'read'
        },
        {
          id: 'm3',
          sender: 'customer',
          text: 'I\'d like to buy one. How much is it?',
          timestamp: '2023-06-15T08:07:00Z',
          status: 'read'
        },
        {
          id: 'm4',
          sender: 'user',
          text: 'It\'s priced at ₹1499. Would you like to place an order now?',
          timestamp: '2023-06-15T08:10:00Z',
          status: 'read'
        },
        {
          id: 'm5',
          sender: 'customer',
          text: 'Yes, please.',
          timestamp: '2023-06-15T08:12:00Z',
          status: 'read'
        },
        {
          id: 'm6',
          sender: 'user',
          text: 'sell 1499',
          timestamp: '2023-06-15T08:15:00Z',
          status: 'read',
          isOrder: true,
          orderId: 'ORD123456'
        },
        {
          id: 'm7',
          sender: 'user',
          text: 'I\'ve created an order for you. Please complete the payment using the link I just sent.',
          timestamp: '2023-06-15T08:16:00Z',
          status: 'read'
        },
        {
          id: 'm8',
          sender: 'customer',
          text: 'Payment done!',
          timestamp: '2023-06-15T08:20:00Z',
          status: 'read'
        },
        {
          id: 'm9',
          sender: 'user',
          text: 'Great! Your order has been confirmed. We\'ll ship it soon.',
          timestamp: '2023-06-15T08:22:00Z',
          status: 'read'
        },
        {
          id: 'm10',
          sender: 'customer',
          text: 'Thank you for confirming my order!',
          timestamp: '2023-06-16T12:30:00Z',
          status: 'read'
        }
      ]
    },
    {
      id: 'CUST2',
      name: 'Rahul Verma',
      phone: '+91 87654 32109',
      profilePic: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
      lastMessage: 'Is the Blue Kurti still available?',
      lastMessageTime: '2023-06-17T10:45:00Z',
      unreadCount: 2,
      messages: [
        {
          id: 'm1',
          sender: 'customer',
          text: 'Hello, do you have kurtis in stock?',
          timestamp: '2023-06-16T14:00:00Z',
          status: 'read'
        },
        {
          id: 'm2',
          sender: 'user',
          text: 'Hi Rahul! Yes, we have Cotton Kurtis available in multiple colors and sizes.',
          timestamp: '2023-06-16T14:05:00Z',
          status: 'read'
        },
        {
          id: 'm3',
          sender: 'customer',
          text: 'Great! I want to buy 2 blue kurtis in size M and also those jhumkas you showed yesterday.',
          timestamp: '2023-06-16T14:10:00Z',
          status: 'read'
        },
        {
          id: 'm4',
          sender: 'user',
          text: 'sell 1497',
          timestamp: '2023-06-16T14:15:00Z',
          status: 'read',
          isOrder: true,
          orderId: 'ORD123457'
        },
        {
          id: 'm5',
          sender: 'customer',
          text: 'Payment sent!',
          timestamp: '2023-06-16T14:20:00Z',
          status: 'read'
        },
        {
          id: 'm6',
          sender: 'user',
          text: 'Thanks! Your order is confirmed. We\'ll process it right away.',
          timestamp: '2023-06-16T14:22:00Z',
          status: 'read'
        },
        {
          id: 'm7',
          sender: 'customer',
          text: 'Is the Blue Kurti still available?',
          timestamp: '2023-06-17T10:45:00Z',
          status: 'delivered'
        }
      ]
    },
    {
      id: 'CUST3',
      name: 'Priya Patel',
      phone: '+91 76543 21098',
      profilePic: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
      lastMessage: 'I\'d like to order that silver anklet',
      lastMessageTime: '2023-06-17T09:40:00Z',
      unreadCount: 1,
      messages: [
        {
          id: 'm1',
          sender: 'customer',
          text: 'Hello, I saw your jewelry collection.',
          timestamp: '2023-06-17T09:30:00Z',
          status: 'read'
        },
        {
          id: 'm2',
          sender: 'user',
          text: 'Hi Priya! Thanks for your interest. Which piece caught your eye?',
          timestamp: '2023-06-17T09:35:00Z',
          status: 'read'
        },
        {
          id: 'm3',
          sender: 'customer',
          text: 'I\'d like to order that silver anklet',
          timestamp: '2023-06-17T09:40:00Z',
          status: 'delivered'
        }
      ]
    }
  ],
  activeContactId: null,
  loading: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveContact: (state, action: PayloadAction<string>) => {
      state.activeContactId = action.payload;
      const contact = state.contacts.find(c => c.id === action.payload);
      if (contact) {
        contact.unreadCount = 0;
      }
    },
    sendMessage: (state, action: PayloadAction<{ contactId: string; text: string; isOrder?: boolean; orderId?: string }>) => {
      const { contactId, text, isOrder, orderId } = action.payload;
      const contact = state.contacts.find(c => c.id === contactId);
      if (contact) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'user',
          text,
          timestamp: new Date().toISOString(),
          status: 'sent',
          isOrder,
          orderId
        };
        contact.messages.push(newMessage);
        contact.lastMessage = text;
        contact.lastMessageTime = newMessage.timestamp;
      }
    },
    receiveMessage: (state, action: PayloadAction<{ contactId: string; text: string }>) => {
      const { contactId, text } = action.payload;
      const contact = state.contacts.find(c => c.id === contactId);
      if (contact) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'customer',
          text,
          timestamp: new Date().toISOString(),
          status: 'delivered'
        };
        contact.messages.push(newMessage);
        contact.lastMessage = text;
        contact.lastMessageTime = newMessage.timestamp;
        
        if (state.activeContactId !== contactId) {
          contact.unreadCount += 1;
        }
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ contactId: string; messageId: string; status: 'sent' | 'delivered' | 'read' }>) => {
      const { contactId, messageId, status } = action.payload;
      const contact = state.contacts.find(c => c.id === contactId);
      if (contact) {
        const message = contact.messages.find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
  },
});

export const { setActiveContact, sendMessage, receiveMessage, updateMessageStatus } = chatSlice.actions;

export const selectAllContacts = (state: RootState) => state.chat.contacts;
export const selectActiveContactId = (state: RootState) => state.chat.activeContactId;
export const selectActiveContact = (state: RootState) => 
  state.chat.activeContactId 
    ? state.chat.contacts.find(c => c.id === state.chat.activeContactId) 
    : null;
export const selectContactById = (id: string) => (state: RootState) => 
  state.chat.contacts.find(c => c.id === id);
export const selectTotalUnreadCount = (state: RootState) => 
  state.chat.contacts.reduce((total, contact) => total + contact.unreadCount, 0);

export default chatSlice.reducer;