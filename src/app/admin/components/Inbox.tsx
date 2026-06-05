import React from 'react';
import {
  Mail,
  MailOpen,
  Trash2,
  Archive,
  AlertOctagon,
  Reply,
} from 'lucide-react';

type Message = {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  createdAt: string;
  status: 'unread' | 'read';
};

const mockMessages: Message[] = [
  {
    id: 'msg_1',
    senderName: 'Jane Doe',
    senderEmail: 'jane.doe@example.com',
    subject: 'Question about the Uppababy Stroller',
    body: 'Hi there! I saw the Uppababy stroller on your site. Is it still available? I would love to come by and see it this weekend if possible. Let me know!',
    createdAt: '2026-06-04T14:30:00Z',
    status: 'unread',
  },
  {
    id: 'msg_2',
    senderName: 'John Smith',
    senderEmail: 'jsmith88@example.com',
    subject: 'Shipping Inquiry',
    body: 'Do you offer shipping to Boston? I am interested in a few of the toddler outfits but I am unable to drive to Worcester to pick them up.',
    createdAt: '2026-06-03T09:15:00Z',
    status: 'read',
  },
];

export default function Inbox() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inbox</h2>
        <span className="text-sm bg-skyblue text-white px-2.5 py-1 rounded-full font-medium">
          {mockMessages.filter((m) => m.status === 'unread').length} new
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
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
                    &lt;{msg.senderEmail}&gt;
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
                  title={msg.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                  className="p-2 text-gray-500 hover:text-skyblue hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  {msg.status === 'unread' ? <MailOpen size={18} /> : <Mail size={18} />}
                </button>
                <button
                  title="Reply"
                  className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <Reply size={18} />
                </button>
                <button
                  title="Archive"
                  className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <Archive size={18} />
                </button>
                <button
                  title="Mark as Spam"
                  className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <AlertOctagon size={18} />
                </button>
                <button
                  title="Delete"
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
