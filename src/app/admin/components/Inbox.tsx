"use client";

import React, { useState, useEffect } from 'react';
import {
  Mail,
  MailOpen,
  Trash2,
  Archive,
  AlertOctagon,
  Reply,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { getMessages, updateMessageStatus, deleteMessage } from '@/app/actions/inbox';

type Message = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  body: string;
  createdAt: string;
  status: 'unread' | 'read' | 'archived' | 'spam' | 'trash';
};

function MessageCard({ msg, onUpdate }: { msg: Message, onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status: Message['status']) => {
    setLoading(true);
    try {
      await updateMessageStatus(msg.id, status);
      onUpdate();
    } catch (err) {
      alert("Failed to update message.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this message?")) return;
    setLoading(true);
    try {
      await deleteMessage(msg.id);
      onUpdate();
    } catch (err) {
      alert("Failed to delete message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 ${
        msg.status === 'unread' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
      } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3
              className={`text-lg ${
                msg.status === 'unread'
                  ? 'font-bold text-gray-900 dark:text-white'
                  : 'font-medium text-gray-800 dark:text-gray-200'
              }`}
            >
              {msg.senderName}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              &lt;{msg.senderEmail}&gt; {msg.senderPhone && ` | ${msg.senderPhone}`}
            </span>
          </div>
          <h4
            className={`text-md mb-2 ${
              msg.status === 'unread'
                ? 'font-semibold text-gray-800 dark:text-gray-100'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {msg.subject}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
            {msg.body}
          </p>
          <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {new Date(msg.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:flex-col lg:flex-row">
          <button
            onClick={() => handleStatusUpdate(msg.status === 'unread' ? 'read' : 'unread')}
            title={msg.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
            className="p-2 text-gray-500 hover:text-skyblue hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            {msg.status === 'unread' ? <MailOpen size={18} /> : <Mail size={18} />}
          </button>
          
          <a
            href={`mailto:${msg.senderEmail}?subject=Re: ${encodeURIComponent(msg.subject)}`}
            title="Reply"
            className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-gray-700 rounded-full transition-colors inline-block"
          >
            <Reply size={18} />
          </a>

          {msg.status !== 'archived' && msg.status !== 'trash' && (
            <button
              onClick={() => handleStatusUpdate('archived')}
              title="Archive"
              className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Archive size={18} />
            </button>
          )}

          {msg.status !== 'spam' && msg.status !== 'trash' && (
            <button
              onClick={() => handleStatusUpdate('spam')}
              title="Mark as Spam"
              className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <AlertOctagon size={18} />
            </button>
          )}

          {msg.status !== 'trash' ? (
            <button
              onClick={() => handleStatusUpdate('trash')}
              title="Move to Trash"
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <button
              onClick={handleDelete}
              title="Permanently Delete"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Trash2 size={18} color="red" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InboxSection({ title, messages, defaultOpen = false, onUpdate }: { title: string, messages: Message[], defaultOpen?: boolean, onUpdate: () => void }) {
  if (messages.length === 0) return null;

  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden" open={defaultOpen}>
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer bg-gray-50 dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700 select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white capitalize">{title}</h2>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
            {messages.length}
          </span>
        </div>
        <ChevronDown size={20} className="text-gray-500 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {messages.map((msg) => (
          <MessageCard key={msg.id} msg={msg} onUpdate={onUpdate} />
        ))}
      </div>
    </details>
  );
}

export default function Inbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (err) {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-skyblue" size={32} />
      </div>
    );
  }

  const unreadMessages = messages.filter((m: Message) => m.status === 'unread');
  const readMessages = messages.filter((m: Message) => m.status === 'read');
  const archivedMessages = messages.filter((m: Message) => m.status === 'archived');
  const spamMessages = messages.filter((m: Message) => m.status === 'spam');
  const trashMessages = messages.filter((m: Message) => m.status === 'trash');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
        {unreadMessages.length > 0 && (
          <span className="text-[10px] font-black uppercase bg-skyblue text-black px-2.5 py-1 rounded-full">
            {unreadMessages.length} new
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No messages found.
          </div>
        ) : (
          <>
            <InboxSection title="Unread" messages={unreadMessages} defaultOpen={true} onUpdate={fetchMessages} />
            <InboxSection title="Read" messages={readMessages} onUpdate={fetchMessages} />
            <InboxSection title="Archived" messages={archivedMessages} onUpdate={fetchMessages} />
            <InboxSection title="Spam" messages={spamMessages} onUpdate={fetchMessages} />
            <InboxSection title="Trash" messages={trashMessages} onUpdate={fetchMessages} />
          </>
        )}
      </div>
    </div>
  );
}
