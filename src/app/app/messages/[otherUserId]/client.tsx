'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/hooks/use-store';
import { getUserFromAccessToken, type PublicUser } from '@/lib/actions';
import type { Message } from 'generated/prisma';
import { SendIcon } from 'lucide-react';
import { useCookies } from 'next-client-cookies';
import { Link } from 'next-view-transitions';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket;

export default function MessageClient({ otherUserId }: { otherUserId: number }) {
    const cookies = useCookies();
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return null;

    const [store, modifyStore] = useStore();

    useEffect(() => {
        if (!SOCKET_URL) return console.error('No socket URL found');

        socket = io(SOCKET_URL);

        socket.on('chat message', async (message: MessageWithAuthor) => {
            const myUser = await getUserFromAccessToken(accessToken);
            if (message.author?.id !== otherUserId && message.author?.id !== myUser?.id) return;
            modifyStore({ messages: [message, ...(store.messages as MessageWithAuthor[])] });
        });

        socket.on('connect', () => {
            socket.emit('authenticate', accessToken);
        });

        socket.on('error', err => alert(err));

        return () => {
            socket.disconnect();
        };
    }, [store]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const message = formData.get('content') as string;
        if (!message) return;
        socket.emit('chat message', { accessToken, message, userId: otherUserId });
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

export function MessagesClient({ messages }: { messages: MessageWithAuthor[] }) {
    const [store, modifyStore] = useStore();

    useEffect(() => {
        modifyStore({ messages });
    }, []);

    return (
        <div className="w-full h-full flex flex-col-reverse gap-1 overflow-y-auto p-4">
            {((store.messages as MessageWithAuthor[]) || []).map(m => (
                <Message key={m.id} message={m} />
            ))}
        </div>
    );
}

function Message({ message }: { message: MessageWithAuthor }) {
    return (
        <div className="flex items-center gap-4 py-2 px-4 hover:bg-foreground/5 rounded">
            <span>
                <span>
                    &lt;
                    <Link href={`/app/users/${message.author?.id}`} className="font-bold">
                        {message.author?.displayName || message.author?.username}
                    </Link>
                    &gt;&nbsp;&nbsp;
                </span>
                <span>{message.content}</span>
            </span>
            <div className="flex-1 flex justify-end items-center gap-4">
                <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
        </div>
    );
}
