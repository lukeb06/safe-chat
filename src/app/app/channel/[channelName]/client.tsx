'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/hooks/use-store';
import { deleteMessage, editMessage, getUserFromAccessToken, type PublicUser } from '@/lib/actions';
import type { Message, User } from 'generated/prisma';
import { DeleteIcon, EditIcon, SendIcon, TrashIcon } from 'lucide-react';
import { useCookies } from 'next-client-cookies';
import { Link } from 'next-view-transitions';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket;

export default function MessageClient({ channelName }: { channelName: string }) {
    const cookies = useCookies();
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return null;

    const [store, modifyStore] = useStore();

    useEffect(() => {
        if (!SOCKET_URL) return console.error('No socket URL found');
        if (!channelName) return console.error('No channel name found');

        socket = io(SOCKET_URL);

        socket.on('chat message', async (message: MessageWithAuthor) => {
            modifyStore({ messages: [message, ...(store.messages as MessageWithAuthor[])] });
        });

        socket.on('connect', () => {
            socket.emit('authenticate', { accessToken, channelName });
        });

        socket.on('edit message', data => {
            console.log('edit message', data);
            const { messageId, newContent } = data;
            modifyStore({
                messages: store.messages.map((m: MessageWithAuthor) => {
                    if (m.id === messageId) {
                        return {
                            ...m,
                            content: `${newContent} (edited)`,
                        };
                    }
                    return m;
                }),
            });
        });

        socket.on('delete message', messageId => {
            console.log('delete message', messageId);
            modifyStore({
                messages: store.messages.filter((m: MessageWithAuthor) => m.id !== messageId),
            });
        });

        socket.on('error', err => alert(err));

        return () => {
            socket.disconnect();
        };
    }, [store, channelName]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const message = formData.get('content') as string;
        if (!message) return;
        socket.emit('chat message', { accessToken, message, channelName });
        form.reset();
    };

    return (
        <form
            className="w-full flex gap-2 items-center p-4 bg-foreground/5 border-t"
            onSubmit={handleSubmit}
        >
            <Input placeholder="Type a message..." type="text" id="content" name="content" />
            <Button size="icon" variant="outline">
                <SendIcon />
            </Button>
        </form>
    );
}

export interface MessageWithAuthor extends Message {
    author: PublicUser | null;
}

export function MessagesClient({
    messages,
    myUser,
}: {
    messages: MessageWithAuthor[];
    myUser: User;
}) {
    const [store, modifyStore] = useStore();

    useEffect(() => {
        modifyStore({ messages: messages });
    }, []);

    return (
        <div className="w-full h-full flex flex-col-reverse gap-1 overflow-y-auto p-4">
            {((store.messages as MessageWithAuthor[]) || []).map(m => (
                <Message key={m.id} message={m} isMyMessage={m.authorId === myUser.id} />
            ))}
        </div>
    );
}

function Message({ message, isMyMessage }: { message: MessageWithAuthor; isMyMessage: boolean }) {
    const cookies = useCookies();
    const accessToken = cookies.get('accessToken');

    const [store, modifyStore] = useStore();

    const [isEditing, setIsEditing] = useState(false);

    const [hovered, setHovered] = useState(false);

    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    const handleDelete = async () => {
        if (!accessToken) return;
        modifyStore({
            messages: store.messages.filter((m: MessageWithAuthor) => m.id !== message.id),
        });
        // TODO: send websocket message to delete message. could also do this on the server action i suppose
        socket.emit('delete message', { accessToken, messageId: message.id });
    };

    const handleEdit = () => {
        setIsEditing(c => !c);
    };

    const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!accessToken) return;
        const form = e.currentTarget;
        const formData = new FormData(form);
        const newContent = formData.get('newContent') as string;
        if (!newContent) return;

        const newMessage = await editMessage(accessToken, message.id, newContent);
        if (!newMessage) return alert('Failed to edit message');

        // TODO: send websocket message to edit message
        modifyStore({
            messages: store.messages.map((m: MessageWithAuthor) => {
                if (m.id === message.id) {
                    return {
                        ...m,
                        content: `${newContent} (edited)`,
                    };
                }
                return m;
            }),
        });

        socket.emit('edit message', { accessToken, messageId: message.id, newContent });
        setIsEditing(false);
    };

    return (
        <div
            className="flex items-center gap-4 py-2 px-4 hover:bg-foreground/5 rounded"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span>
                <span>
                    &lt;
                    <span className="font-bold">
                        {message.author?.displayName || message.author?.username}
                    </span>
                    &gt;&nbsp;&nbsp;
                </span>
                {isEditing ? (
                    <form onSubmit={handleSubmitEdit}>
                        <Input
                            placeholder="Enter new message..."
                            type="text"
                            id="newContent"
                            name="newContent"
                        />
                        <button className="hidden" type="submit" />
                    </form>
                ) : (
                    <span>{message.content}</span>
                )}
            </span>
            <div className="flex-1 flex justify-end items-center gap-4">
                <div
                    className="flex flex-1 items-center justify-center gap-2"
                    style={{ visibility: isMyMessage && hovered ? 'visible' : 'hidden' }}
                >
                    <Button variant="outline" size="icon" onClick={handleEdit}>
                        <EditIcon />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleDelete}>
                        <TrashIcon />
                    </Button>
                </div>
                <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
        </div>
    );
}
