'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/hooks/use-store';
import { deleteChannel, renameChannel } from '@/lib/actions';
import type { Channel } from 'generated/prisma';
import { useCookies } from 'next-client-cookies';
import { useEffect, useState } from 'react';

export default function EditChannelsClient({ myChannels }: { myChannels: Channel[] }) {
    return myChannels.map(c => <Entry key={c.id} channel={c} />);
}

function Entry({ channel }: { channel: Channel }) {
    const cookies = useCookies();
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return null;

    const [store, modifyStore] = useStore();

    const [channelName, setChannelName] = useState(channel.name);
    const [channelNameError, setChannelNameError] = useState('');

    useEffect(() => {
        if (!channelName) return;
        if (channelName.length < 3)
            return setChannelNameError('Channel name must be at least 3 characters');
        if (channelName.length > 16)
            return setChannelNameError('Channel name cannot be more than 16 characters');
        if (channelName.includes(' '))
            return setChannelNameError('Channel name cannot contain spaces');
        if (channelName.toLowerCase() !== channelName)
            return setChannelNameError('Channel name must be lowercase');
        if (!channelName.match(/^[a-z0-9\-]{3,16}$/))
            return setChannelNameError(
                'Channel name must only contain letters, numbers, and hyphens',
            );
        if (channelName === 'new') return setChannelNameError('Channel names cannot be "new"');
        if (channelName === 'edit') return setChannelNameError('Channel names cannot be "edit"');

        setChannelNameError('');
    }, [channelName]);

    const handleRename = async (e: any) => {
        e.preventDefault();

        if (!channelName) return alert('Please fill in all fields');
        if (channelNameError !== '') return alert(channelNameError);

        const newChannel = await renameChannel(accessToken, channel.id, channelName);

        if (!newChannel) return alert('There was an error renaming the channel');

        setChannelName(newChannel.name);

        if (store.myChannels)
            modifyStore({
                myChannels: store.myChannels.map((c: Channel) =>
                    c.id === channel.id ? newChannel : c,
                ),
            });
    };

    const handleDelete = async (e: any) => {
        e.preventDefault();
        if (!accessToken) return;

        const success = await deleteChannel(accessToken, channel.id);
        if (!success) return alert('Failed to delete channel');

        setChannelName('');
        if (store.myChannels)
            modifyStore({
                myChannels: store.myChannels.filter((c: Channel) => c.id !== channel.id),
            });
    };

    return (
        <div className="flex gap-8 items-center p-2 hover:bg-foreground/5 rounded">
            <div className="flex items-center gap-1">
                <span className="text-lg">#</span>
                <Input
                    placeholder="Channel name..."
                    type="text"
                    id="channelName"
                    name="channelName"
                    pattern="[a-z0-9\-]{3,16}"
                    className="invalid:border-red-500 invalid:border-2"
                    value={channelName}
                    onChange={e => setChannelName(e.target.value)}
                />
            </div>

            <div className="flex gap-4 items-center">
                <Button variant="outline" onClick={handleRename}>
                    Rename
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                    Delete
                </Button>
            </div>
        </div>
    );
}
