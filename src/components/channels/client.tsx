'use client';

import { useStore } from '@/hooks/use-store';
import type { Channel } from 'generated/prisma';
import { Link } from 'next-view-transitions';
import { useEffect } from 'react';

export default function ChannelsClient({
    myChannels,
    otherChannels,
}: {
    myChannels: Channel[];
    otherChannels: Channel[];
}) {
    const [store, modifyStore] = useStore();

    useEffect(() => {
        const newStore: Record<string, any> = {};
        if (myChannels && !store.myChannels) newStore.myChannels = myChannels;
        if (otherChannels && !store.otherChannels) newStore.otherChannels = otherChannels;
        modifyStore(newStore);
    }, [myChannels, otherChannels]);

    return (
        <>
            <h2>My Channels</h2>
            {store.myChannels &&
                store.myChannels?.map((c: Channel) => (
                    <Link
                        href={`/app/channel/${c.name}`}
                        key={c.id}
                        className="flex items-center gap-4 py-2 px-4 hover:bg-foreground/5 rounded cursor-pointer"
                    >
                        <div className="flex flex-col gap-1">
                            <span>#{c.name}</span>
                        </div>
                    </Link>
                ))}
            <h2>Other Channels</h2>
            {store.otherChannels &&
                store.otherChannels?.map((c: Channel) => (
                    <Link
                        href={`/app/channel/${c.name}`}
                        key={c.id}
                        className="flex items-center gap-4 py-2 px-4 hover:bg-foreground/5 rounded cursor-pointer"
                    >
                        <div className="flex flex-col gap-1">
                            <span>#{c.name}</span>
                        </div>
                    </Link>
                ))}
        </>
    );
}
