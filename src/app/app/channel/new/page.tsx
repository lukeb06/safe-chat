'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/hooks/use-store';
import { createChannel } from '@/lib/actions';
import { useCookies } from 'next-client-cookies';
import { useTransitionRouter } from 'next-view-transitions';
import { useEffect, useState } from 'react';

export default function NewChannelPage() {
    const cookies = useCookies();
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return null;

    const router = useTransitionRouter();

    const [store, modifyStore] = useStore();

    const [channelName, setChannelName] = useState('');
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const channelName = formData.get('channelName') as string;

        if (!channelName) return alert('Please fill in all fields');
        if (channelNameError !== '') return alert(channelNameError);

        if (channelName === 'new') return alert('Channel names cannot be "new"');
        if (channelName === 'edit') return alert('Channel names cannot be "edit"');

        const newChannel = await createChannel(channelName, accessToken);

        if (!newChannel) return alert('There was an error creating the channel');

        if (store.myChannels) modifyStore({ myChannels: [...store.myChannels, newChannel] });
        router.push(`/app/channel/${newChannel.name}`);
    };

    return (
        <div className="w-full h-full grid place-items-center">
            <div className="flex flex-col gap-8 items-center">
                <h1 className="text-2xl">Create a new channel</h1>
                <form className="flex flex-col gap-4 w-64" onSubmit={handleSubmit}>
                    <Label htmlFor="channelName">Channel Name</Label>
                    <Input
                        type="text"
                        id="channelName"
                        name="channelName"
                        pattern="[a-z0-9\-]{3,16}"
                        className="invalid:border-red-500 invalid:border-2"
                        value={channelName}
                        onChange={e => setChannelName(e.target.value)}
                    />
                    {channelNameError && <p className="text-red-500">{channelNameError}</p>}
                    <Button>Create</Button>
                </form>
            </div>
        </div>
    );
}
