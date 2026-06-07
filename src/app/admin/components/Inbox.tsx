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
  Loader2,
  CheckSquare,
  Square,
  MinusSquare,
  CheckCircle2
} from 'lucide-react';
import { 
  getMessages, 
  updateMessageStatus, 
  deleteMessage,
  adminBulkUpdateMessageStatus,
  adminBulkDeleteMessages,
  restoreMessage,
  bulkRestoreMessages
} from '@/app/actions/inbox';
import { useModal } from '@/components/ModalProvider';
import { useToast } from '@/components/ToastProvider';

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

function MessageCard({ 
  msg, 
  onUpdate, 
  isSelected, 
  onSelect 
}: { 
  msg: Message, 
  onUpdate: () => void, 
  isSelected: boolean,
  onSelect: () => void
}) {
  const modal = useModal();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status: Message['status']) => {
    // Only confirm for specific destructive-ish statuses
    if (status === 'archived' || status === 'trash' || status === 'spam') {
      const confirmed = await modal.confirm({
        type: status === 'spam' ? 'warning' : 'info',
        title: `Move to ${status}`,
        message: `Move this message to ${status}?`,
        confirmLabel: `Move to ${status}`,
      });
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      await updateMessageStatus(msg.id, status);
      onUpdate();
    } catch (err) {
      modal.alert({
        type: "danger",
        title: "Error",
        message: "Failed to update message status."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await modal.confirm({
      type: "danger",
      title: "Delete Message",
      message: "Are you sure you want to permanently delete this message? This action cannot be undone.",
      confirmLabel: "Delete Forever",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteMessage(msg.id);
      await onUpdate();
      toast.showUndo("Message record deleted", async () => {
        await restoreMessage(msg.id);
        await onUpdate();
      });
    } catch (err) {
      modal.alert({
        type: "danger",
        title: "Error",
        message: "Failed to delete message."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-6 transition-colors cursor-pointer relative group border-l-4 ${
        isSelected ? 'bg-skyblue/5 border-skyblue' : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-transparent'
      } ${msg.status === 'unread' ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''} ${loading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Selection Indicator */}
      <div className={`absolute top-6 right-6 transition-all ${isSelected ? 'text-skyblue scale-110' : 'text-gray-200 dark:text-gray-700 group-hover:text-gray-300'}`}>
        {isSelected ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 border-2 border-current rounded-full" />}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mr-8">
        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
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
          <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">
            {msg.body}
          </p>
          <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {new Date(msg.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:flex-col lg:flex-row" onClick={(e) => e.stopPropagation()}>
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

function InboxSection({ 
  title, 
  messages, 
  defaultOpen = false, 
  onUpdate,
  selectedIds,
  onSelectOne
}: { 
  title: string, 
  messages: Message[], 
  defaultOpen?: boolean, 
  onUpdate: () => void,
  selectedIds: string[],
  onSelectOne: (id: string) => void
}) {
  if (messages.length === 0) return null;

  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden" open={defaultOpen}>
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer bg-gray-50 dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700 select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full font-medium">
            {messages.length}
          </span>
        </div>
        <ChevronDown size={20} className="text-gray-500 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {messages.map((msg) => (
          <MessageCard 
            key={msg.id} 
            msg={msg} 
            onUpdate={onUpdate} 
            isSelected={selectedIds.includes(msg.id)}
            onSelect={() => onSelectOne(msg.id)}
          />
        ))}
      </div>
    </details>
  );
}

export default function Inbox() {
  const modal = useModal();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
      setSelectedIds([]); // Clear selection on refresh
    } catch (err) {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map(m => m.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (status: Message['status']) => {
    const confirmed = await modal.confirm({
      type: status === 'trash' ? 'warning' : 'info',
      title: `Bulk ${status}`,
      message: `Are you sure you want to move ${selectedIds.length} messages to ${status}?`,
      confirmLabel: `Move to ${status}`,
    });

    if (!confirmed) return;

    setBulkLoading(true);
    try {
      await adminBulkUpdateMessageStatus(selectedIds, status);
      await fetchMessages();
      modal.alert({
        type: "success",
        title: "Success",
        message: `${selectedIds.length} messages updated.`
      });
    } catch (err) {
      modal.alert({ type: "danger", title: "Error", message: "Bulk update failed." });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await modal.confirm({
      type: "danger",
      title: "Bulk Delete",
      message: `Are you sure you want to PERMANENTLY delete ${selectedIds.length} messages? This cannot be undone.`,
      confirmLabel: "Delete Forever",
    });

    if (!confirmed) return;

    setBulkLoading(true);
    try {
      const idsToRestore = [...selectedIds];
      await adminBulkDeleteMessages(selectedIds);
      await fetchMessages();
      toast.showUndo(`${idsToRestore.length} messages deleted`, async () => {
        await bulkRestoreMessages(idsToRestore);
        await fetchMessages();
      });
    } catch (err) {
      modal.alert({ type: "danger", title: "Error", message: "Bulk deletion failed." });
    } finally {
      setBulkLoading(false);
    }
  };

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
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Messages</h2>
          {messages.length > 0 && (
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              {selectedIds.length === messages.length ? <CheckSquare size={16} className="text-skyblue" /> : selectedIds.length > 0 ? <MinusSquare size={16} className="text-skyblue" /> : <Square size={16} />}
              <span>{selectedIds.length === messages.length ? "Deselect All" : "Select All"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
              <button
                onClick={() => handleBulkStatusUpdate('archived')}
                disabled={bulkLoading}
                className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
                title="Archive Selected"
              >
                <Archive size={20} />
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('trash')}
                disabled={bulkLoading}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Move Selected to Trash"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                title="Delete Selected Forever"
              >
                <Trash2 size={20} color="red" />
              </button>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1" />
            </div>
          )}
          <button 
            onClick={fetchMessages}
            className="text-xs font-bold text-skyblue uppercase tracking-wider hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No messages found.
          </div>
        ) : (
          <>
            <InboxSection 
              title="Unread" 
              messages={unreadMessages} 
              defaultOpen={true} 
              onUpdate={fetchMessages} 
              selectedIds={selectedIds}
              onSelectOne={toggleSelectOne}
            />
            <InboxSection 
              title="Read" 
              messages={readMessages} 
              onUpdate={fetchMessages} 
              selectedIds={selectedIds}
              onSelectOne={toggleSelectOne}
            />
            <InboxSection 
              title="Archived" 
              messages={archivedMessages} 
              onUpdate={fetchMessages} 
              selectedIds={selectedIds}
              onSelectOne={toggleSelectOne}
            />
            <InboxSection 
              title="Spam" 
              messages={spamMessages} 
              onUpdate={fetchMessages} 
              selectedIds={selectedIds}
              onSelectOne={toggleSelectOne}
            />
            <InboxSection 
              title="Trash" 
              messages={trashMessages} 
              onUpdate={fetchMessages} 
              selectedIds={selectedIds}
              onSelectOne={toggleSelectOne}
            />
          </>
        )}
      </div>
    </div>
  );
}
