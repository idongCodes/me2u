import React from 'react';
import {
  Mail,
  MailOpen,
  Trash2,
  Archive,
  AlertOctagon,
  Reply,
  ChevronDown,
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

function MessageCard({ msg }: { msg: Message }) {
  return (
    <div
      className={`p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 ${
        msg.status === 'unread' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
      }`}
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
          <form action={updateMessageStatus.bind(null, msg.id, msg.status === 'unread' ? 'read' : 'unread')}>
            <button
              type="submit"
              title={msg.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
              className="p-2 text-gray-500 hover:text-skyblue hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              {msg.status === 'unread' ? <MailOpen size={18} /> : <Mail size={18} />}
            </button>
          </form>
          
          {/* Reply goes to mailto */}
          <a
            href={`mailto:${msg.senderEmail}?subject=Re: ${encodeURIComponent(msg.subject)}`}
            title="Reply"
            className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-gray-700 rounded-full transition-colors inline-block"
          >
            <Reply size={18} />
          </a>

          {msg.status !== 'archived' && msg.status !== 'trash' && (
            <form action={updateMessageStatus.bind(null, msg.id, 'archived')}>
              <button
                type="submit"
                title="Archive"
                className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Archive size={18} />
              </button>
            </form>
          )}

          {msg.status !== 'spam' && msg.status !== 'trash' && (
            <form action={updateMessageStatus.bind(null, msg.id, 'spam')}>
              <button
                type="submit"
                title="Mark as Spam"
                className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <AlertOctagon size={18} />
              </button>
            </form>
          )}

          {msg.status !== 'trash' ? (
            <form action={updateMessageStatus.bind(null, msg.id, 'trash')}>
              <button
                type="submit"
                title="Move to Trash"
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </form>
          ) : (
            <form action={deleteMessage.bind(null, msg.id)}>
              <button
                type="submit"
                title="Permanently Delete"
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Trash2 size={18} color="red" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InboxSection({ title, messages, defaultOpen = false }: { title: string, messages: Message[], defaultOpen?: boolean }) {
  if (messages.length === 0) return null;

  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden" open={defaultOpen}>
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer bg-gray-50 dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700 select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{title}</h2>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
            {messages.length}
          </span>
        </div>
        <ChevronDown size={20} className="text-gray-500 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {messages.map((msg) => (
          <MessageCard key={msg.id} msg={msg} />
        ))}
      </div>
    </details>
  );
}

export default async function Inbox() {
  const messages = await getMessages();

  const unreadMessages = messages.filter((m: Message) => m.status === 'unread');
  const readMessages = messages.filter((m: Message) => m.status === 'read');
  const archivedMessages = messages.filter((m: Message) => m.status === 'archived');
  const spamMessages = messages.filter((m: Message) => m.status === 'spam');
  const trashMessages = messages.filter((m: Message) => m.status === 'trash');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-100 dark:bg-gray-800/80">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h2>
        {unreadMessages.length > 0 && (
          <span className="text-sm bg-skyblue text-white px-2.5 py-1 rounded-full font-medium">
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
            <InboxSection title="Unread" messages={unreadMessages} defaultOpen={true} />
            <InboxSection title="Read" messages={readMessages} />
            <InboxSection title="Archived" messages={archivedMessages} />
            <InboxSection title="Spam" messages={spamMessages} />
            <InboxSection title="Trash" messages={trashMessages} />
          </>
        )}
      </div>
    </div>
  );
}
